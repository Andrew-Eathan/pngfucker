
//  ______   __   __     ______     ______   __  __     ______     __  __     ______     ______    
// /\  == \ /\ "-.\ \   /\  ___\   /\  ___\ /\ \/\ \   /\  ___\   /\ \/ /    /\  ___\   /\  == \   
// \ \  _-/ \ \ \-.  \  \ \ \__ \  \ \  __\ \ \ \_\ \  \ \ \____  \ \  _"-.  \ \  __\   \ \  __<   
//  \ \_\    \ \_\\"\_\  \ \_____\  \ \_\    \ \_____\  \ \_____\  \ \_\ \_\  \ \_____\  \ \_\ \_\ 
//   \/_/     \/_/ \/_/   \/_____/   \/_/     \/_____/   \/_____/   \/_/\/_/   \/_____/   \/_/ /_/ 
//  ___      ___  _____     
// |\  \    /  /|/ __  \    
// \ \  \  /  / /\/_|\  \   
//  \ \  \/  / /\|/ \ \  \  
//   \ \    / /      \ \  \ 
//    \ \__/ /        \ \__\
//     \|__|/          \|__|
//
// by AndrewEathan (AndrewEathan#8783)
/*
---- USAGE ----
All of the parameters below are optional. If no parameters are specified, it will convert an "input.png" into an "output.png" with the specified default values.
node main.js
	-input (path)			= Input path relative to script. If a folder is specified, it will batch convert all of the images in that folder.
							  (COMING SOON) If the format parameter is "gif" and the -fps parameter is specified, it will create a GIF using the frames in the folder. 
							  (COMING SOON) If the input is a GIF and the format parameter is "gif", it will glitch the GIF, otherwise it picks the first frame in the GIF and glitches that.
	
	-output (path)			= Output path relative to script. If a folder is specified, batch conversions will be written to it.
							  If an output path is a folder but an input is a file, the output will be written in the output folder as "output.png".
							  If the output is a folder, the input is a GIF and the format is not a GIF, the GIF's frames will be glitched and written to the folder.
							  If the output isn't a folder in that case, the default output is ignored, and output will be in "(gif_name)/(frame).(format)"
							  If the output is a folder, but does not exist, images will be written to "(input_folder)_out/(frame).(format)"
	
	-shift (def. 3)			= Bitshift the image buffer to the right by this amount, negative amounts shift to the left.
	
	-regions (def. 4)		= Glitching regions. This bitshifts the image buffer in a localised area and writes random data to some pixels.
		-rmin (def. -8)			= Minimum region size in height pixels.
		-rmax (def. -5)			= Maximum region size in height pixels.
		Note, the above subparameters aren't proportional to the image size unless it's a negative number!
		If you pass negative values, the value will be set to: (image height) / (positive value of rmin or rmax)
	
	-splits (def. 0)		= An older alternative to -regions, where the image buffer is crunched and expanded to give the effect of the image being sliced in half horizontally.
							  This also performs a bitshift, however it doesn't reverse it afterwards, leaving the image glitched after a split.
			
	-format (png/jpg/gif)	= Output image format. GIF support will come later when someone can actually comprehend the clusterfuck that is the GIF file format and make it easy for the rest of us to use it
		-iquality (0-100, def. 80)	= If the format is JPG, this will be its input JPG quality
		-oquality (0-100, def. 80)	= If the format is JPG, this will be its output JPG quality
		Currently there are 3 accepted values for -format: "png", "jpg", and "bmp".
	
	-contrast (-1 to 1, def 0)	= Image contrast pre-processing. 0 is no change, -1 is the lowest contrast, 1 is the highest.
	
	-mul (def. 1)			= Multiply output image size by this value.
	-div (def. 3)			= Divide output image size by this value.
	Both of the above parameters are applied, in order of multiplication and then division, but preferably you should just use one.
	
	-crunch (def. 100, 1-100)	= Resizes image to this percentage, and resizes them back to normal after, to crunch the pixels.
								  NOTE: Don't add a percent sign! Resizing and crunching is nearest-neighbor, so you can enjoy crispy glitching.
	-seed (def. random int between 0 and 65535 inclusive) 
		  = Lets you reuse the same corruption style!
			It's not guaranteed you will get the exact same image with each corruption.
			Due to the way this entire corruption algorithm works
*/

const pngfuck = require('./pngfuck.js');
const util = require('./util.js')
const jimp = require("jimp")
const fs = require("fs")

// helper
function check(key, param) {
	argv_template[key] = (argv_template[key] != undefined) ? argv_template[key] : param;
}

// go through and set defaults to the command line arguments
// we'll make this a template so that we can keep dynamic parameters the same
let argv_template = util.processArgs(process.argv)
{
	check("input", "input.png")
	check("shift", 3)
	check("regions", 4)
	check("rmin", -20)
	check("rmax", -10)
	check("splits", 0)
	check("format", "png")
	check("iquality", 80)
	check("oquality", 80)
	check("contrast", 0)
	check("mul", 1)
	check("div", 3)
	check("crunch", 100)
	check("seed", (Math.round(Math.random() * 65535)))
}


// handle input/output being folders
let input = argv_template.input
let input_isfolder = input.split(".").length == 1
let inputfiles = []
if (input_isfolder) {
	if (!fs.existsSync(input)) return console.log("ERR: Input folder does not exist!")
	inputfiles = fs.readdirSync(input)
}
else {
	inputfiles = [input]
}

// self explanatory
let output_isfolder = argv_template.output ? (argv_template.output.split(".").length == 1) : false
if (argv_template.output) {
	if (input_isfolder && !output_isfolder) // would make no sense
	{
		console.log("WARN: Input is a folder, but output is a file. Ignoring output parameter!")
		argv_template.output = argv_template.input
	}
}
else
{
	if (input_isfolder) argv_template.output = argv_template.input + "_out"; else argv_template.output = "output";
}

let format_lookup = {
	"png": jimp.MIME_PNG,
	"jpg": jimp.MIME_JPEG,
	"bmp": jimp.MIME_BMP
}

console.log(argv_template) // log for user to see
console.log("Seed: " + argv_template.seed)

let export_format = format_lookup[argv_template.format] || jimp.MIME_PNG
let image_idx = 0
let rand = util.srand(argv_template.seed)

// main processing
inputfiles.forEach(argv_input => {
	let argv = JSON.parse(JSON.stringify(argv_template)) // clone from template
	
	// remove extension from input
	let argv_output = argv_input.split(".")
	argv_output.pop()
	argv_output = argv_output.join(" ")
	
	argv.input = input_isfolder ? (argv.input + "/" + argv_input) : argv.input
	argv.output = output_isfolder ? (argv.output + "/" + argv_output + "." + argv.format) : argv.output + "." + argv.format
	
	jimp.read(argv.input, (err, image) => {
		if (err) return console.log(err);
		image_idx++
		console.log(image_idx + ": [" + argv.input + "] -> [" + argv.output + "]")
		rand.resetseed()
		
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
			.rgba(true) // for some reason if you disable this it breaks the shit out of the image, it's not even in an enjoyable way
		
		if (argv.crunch) image.resize(image.bitmap.width * (crunch / 100), image.bitmap.height * (crunch / 100), jimp.RESIZE_NEAREST_NEIGHBOR);
		
		if (argv.shift) {
			pngfuck.shiftAll(image.bitmap, argv.shift, rand)
		}
		
		if (argv.regions) {
			pngfuck.regionalCorrupt(image.bitmap, argv, rand)
		}
		
		if (argv.splits) {
			pngfuck.bufferSplits(image.bitmap, argv.splits, rand);
		}
		
		// because png.background is useless
		// png shift corruption tends to make a lot of pixels transparent (and black also looks cool as a background for them)
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
		image.write(argv.output)
	})
})