
//  ______   __   __     ______     ______   __  __     ______     __  __     
// /\  == \ /\ "-.\ \   /\  ___\   /\  ___\ /\ \/\ \   /\  ___\   /\ \/ /     
// \ \  _-/ \ \ \-.  \  \ \ \__ \  \ \  __\ \ \ \_\ \  \ \ \____  \ \  _"-. 
//  \ \_\    \ \_\\"\_\  \ \_____\  \ \_\    \ \_____\  \ \_____\  \ \_\ \_\
//   \/_/     \/_/ \/_/   \/_____/   \/_/     \/_____/   \/_____/   \/_/\/_/
//

//by andreweathan (andreweathan#8783)

const { shl, shr } = require('buffershift');
const { writeBuffer, randFloor, randCeil, debuglog } = require('./util.js');
const jimp = require("jimp")

// performs local shifting and byte swaps
module.exports.regionalCorrupt = (bitmap /*JIMP image data, or {width, height, image buffer} object*/, settings /*:object*/, srand /*rand object*/) => {
	//settings object structure used here:
	// regions: number, mrsize: number, rsize: number
	
	let regionarray = []
	
	for(let i = 0; i < settings.regions; i++) {
		let offset = randFloor(0, (bitmap.width * bitmap.height * 4), srand)
		let end = offset + randFloor(offset + bitmap.width * settings.rmin, offset + bitmap.width * settings.rmax, srand)
		regionarray.push([offset, end])
	}
	
	regionarray.forEach(region => {
		let buff = bitmap.data.slice(region[0], region[1]) 
		shl(buff,randFloor(1, 32, srand))
		writeBuffer(bitmap.data, buff, region[0], -10)
		
		for(let i = region[0] + randFloor(0, region[1] - region[0], srand) / 1.5; i < region[1]; i++){
			let tmp = bitmap.data[i]
			let i1 = randFloor(-6, 6, srand)
			bitmap.data[i] = bitmap.data[i + i1]
			bitmap.data[i + i1] = tmp
		}
	})
}

module.exports.shiftAll = (bitmap /*JIMP image data, or {width, height, image buffer} object*/, amount /* number */) => {
	if (amount < 0) shl(bitmap.data, Math.abs(amount)); else shr(bitmap.data, amount);
}

module.exports.bufferSplits = (bitmap /*JIMP bitmap data, or {width, height, image buffer} object*/, splitamount /* number */, srand /*rand object*/) => {
	//split buffer into buffers
	if (splitamount > 0) {
		let buffers = []
		for(let i = 0; i < splitamount; i++) {
			let lim = randFloor(0, bitmap.width * bitmap.height * 4, srand)
			buffers.push(bitmap.data.slice(0, lim + randFloor(-bitmap.width, bitmap.width, srand)))
			let buffer2 = bitmap.data.slice(lim, bitmap.data.length)
			shr(buffer2, randFloor(-40, 40, srand))
			buffers.push(buffer2)
		}
		
		bitmap.data = Buffer.concat(buffers)
	}
}

let { regionalCorrupt, shiftAll, bufferSplits } = module.exports;

// needed to properly deal with library conflicts
module.exports.calcWH = (width, height, argv) => {
	let fmul = argv.mul / argv.div;
	
	return {
		w: width * fmul, 
		h: height * fmul
	}
}

module.exports.corruptImage = (image /*JIMP image data (NOT BITMAP)*/, rand /*RNG object*/, argv /*corruption arguments*/) => {
	let width = image.bitmap.width
	let height = image.bitmap.height
	let crunch = argv.crunch
	let final_multiplier = argv.mul / argv.div;
	
	// look in Usage for explanation
	if (argv.rmin < 0) argv.rmin = Math.round(height / Math.abs(argv.rmin));
	if (argv.rmax < 0) argv.rmax = Math.round(height / Math.abs(argv.rmax));
	
	image.resize(width * final_multiplier, height * final_multiplier)
		.contrast(argv.contrast)
		.quality(argv.iquality)
		.rgba(true) // for some reason if you disable this it breaks the shit out of the image, it's not even in an enjoyable waywrite("testi.png")
	
	let fmul = crunch / 100
	if (argv.crunch) image.resize(width * fmul, height * fmul, jimp.RESIZE_NEAREST_NEIGHBOR);
	
	// to clamp the corruption to the image's "area"
	let og_copy
	if (argv.clamp == 1) {
		og_copy = Buffer.alloc(image.bitmap.data.length)
		image.bitmap.data.copy(og_copy)
	}
	
	// main corruption
	if (argv.shift) {
		shiftAll(image.bitmap, argv.shift, rand)
	}
	
	if (argv.regions) {
		regionalCorrupt(image.bitmap, argv, rand)
	}
	
	if (argv.splits) {
		bufferSplits(image.bitmap, argv.splits, rand);
	}
	
	// because png.background is useless
	// png shift corruption tends to make a lot of pixels transparent (and black also looks cool as a background for them)
	if (argv.clamp == 1 && argv.blackbg == 0)
		for (let i = 0; i < image.bitmap.data.length; i += 4) {
			let r = image.bitmap.data[i    ];
			let g = image.bitmap.data[i + 1];
			let b = image.bitmap.data[i + 2];
			let a = image.bitmap.data[i + 3];
			
			let r1 = og_copy[i    ];
			let g1 = og_copy[i + 1];
			let b1 = og_copy[i + 2];
			let a1 = og_copy[i + 3];
			
			let delta = (r1 - r) / 3 + (g1 - g) / 3 + (b1 - b) / 3
			
			// if the pixel isn't corrupted enough, back to normal it goes
			if (a != a1 && delta < 64) {
				a = a1
			
				image.bitmap.data[i    ] = r;
				image.bitmap.data[i + 1] = g;
				image.bitmap.data[i + 2] = b;
				image.bitmap.data[i + 3] = a;
			}
		}
	else if (argv.blackbg == 1)
		for (let i = 0; i < image.bitmap.data.length; i += 4) {
			let r = image.bitmap.data[i    ];
			let g = image.bitmap.data[i + 1];
			let b = image.bitmap.data[i + 2];
			let a = image.bitmap.data[i + 3];
			
			r = r * (a / 255)
			g = g * (a / 255)
			b = b * (a / 255)
			a = 255
			
			image.bitmap.data[i    ] = r;
			image.bitmap.data[i + 1] = g;
			image.bitmap.data[i + 2] = b;
			image.bitmap.data[i + 3] = a;
		}
	
	// resize to normal after crunching
	if (argv.crunch) image.resize(width * final_multiplier, height * final_multiplier, jimp.RESIZE_NEAREST_NEIGHBOR);
	
	// apply postprocessing outputquality
	image.quality(argv.oquality)
	return image
}