
//  ______   __   __     ______     ______   __  __     ______     __  __     
// /\  == \ /\ "-.\ \   /\  ___\   /\  ___\ /\ \/\ \   /\  ___\   /\ \/ /     
// \ \  _-/ \ \ \-.  \  \ \ \__ \  \ \  __\ \ \ \_\ \  \ \ \____  \ \  _"-. 
//  \ \_\    \ \_\\"\_\  \ \_____\  \ \_\    \ \_____\  \ \_____\  \ \_\ \_\
//   \/_/     \/_/ \/_/   \/_____/   \/_/     \/_____/   \/_____/   \/_/\/_/
//

//by andreweathan (andreweathan#8783)

const { shl, shr } = require('buffershift');
const { writeBuffer, randFloor, randCeil, debuglog } = require('./util.js');

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

module.exports.bufferSplits = (bitmap /*JIMP image data, or {width, height, image buffer} object*/, splitamount /* number */, srand /*rand object*/) => {
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
