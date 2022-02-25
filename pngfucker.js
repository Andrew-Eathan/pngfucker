
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
// by andreweathan (andreweathan#8783)
/*
---- USAGE ----
The usage text has been moved to the GitHub description, please check that instead!
*/

// requiresss
const pngfuck = require('./pngfuck.js');
const util = require('./util.js')
const jimp = require("jimp")
const fs = require("fs")
const upng = require("upng-js")

// helper to set a default value if there is no value specified
function check(key, param) {
	argv_template[key] = (argv_template[key] != undefined) ? argv_template[key] : param;
}

// go through and set defaults to the command line arguments
// we'll make this a template so that we can keep dynamic parameters the same
let argv_template = util.processArgs(process.argv)
{
	check("input", "input.png")
	check("shift", 0)
	check("regions", 4)
	check("rmin", -20)
	check("rmax", -10)
	check("splits", 2)
	check("format", "png")
	check("iquality", 80)
	check("oquality", 80)
	check("contrast", 0)
	check("mul", 1)
	check("div", 1)
	check("crunch", 80)
	check("seed", (Math.round(Math.random() * 65535)))
	check("clamp", 1)
	check("staticseed", 0)
	check("blackbg", 0)
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

// for jimp
let format_lookup = {
	"png": jimp.MIME_PNG,
	"jpg": jimp.MIME_JPEG,
	"bmp": jimp.MIME_BMP
}

// log for user to see these
console.log(argv_template)
console.log("Seed: " + argv_template.seed)

// find the format to use or a replacement, just not nothing
let export_format = format_lookup[argv_template.format] || jimp.MIME_PNG
let image_idx = 0; // used to track image count in debug logging
let rand = util.srand(argv_template.seed) // instantiate seeded random

// main processing, iterates over all input files
inputfiles.forEach(argv_input => {
	let argv = JSON.parse(JSON.stringify(argv_template)) // clone from template
	
	// remove extension from input
	let argv_output = argv_input.split(".")
	let argv_ext = argv_output.pop()
	argv_output = argv_output.join(" ")
	
	argv.input = input_isfolder ? (argv.input + "/" + argv_input) : argv.input
	argv.output = output_isfolder ? (argv.output + "/" + argv_output + "." + argv.format) : argv.output + "." + argv.format
	
	// central APNG processing, define label to escape out of the if statement when we want to
	let pngdata
	exitpng: if (argv_ext == "png" || argv_ext == "apng") {
		pngdata = upng.decode(fs.readFileSync(argv.input))
		if (pngdata.frames.length < 2) break exitpng; // this is a regular one-frame png, work on it normally
		
		image_idx++;
		console.log(image_idx + " (APNG): [" + argv.input + "] -> [" + argv.output + "]")
		
		let frames = upng.toRGBA8(pngdata) // get all the frame data we need from the apng
		let cframes = [] // this stores all the corrupted frames to later be stitched in encoding
		let delays = [] // this stores the frame delays in numbers, used when encoding
		
		// populate delays
		pngdata.frames.forEach(frame => delays.push(frame.delay))
		
		// calculate final width and height to pass to encoding, we can't comfortably find this in encoding when all we get is a pile of RGBA
		let { w, h } = pngfuck.calcWH(pngdata.width, pngdata.height, argv)
		let i = 0 // frame counter, used in progress logging
		
		// process each frame
		frames.forEach(frame => {
			// create image and populate it with the frame's RGBA pixel values
			let image = new jimp({
				data: Buffer.from(frame), 
				width: pngdata.width, 
				height: pngdata.height
			}, _ => {}) // empty callback, we don't need it (but it complains if i don't add it)
			
			// if staticseed is 0, it makes a really jittery effect to the corruption, which looks nice 
			// (not so nice for epileptic people tho)
			if (argv.staticseed == 1) rand.resetseed();
			
			// pass image to my corruption function plus corruption arguments and the random object
			let corrupt = pngfuck.corruptImage(image, rand, argv)
			cframes.push(corrupt.bitmap.data) // add corrupted frame to list
			
			i++; // advance, only used in logging
			
			// fancy logs
			let size = corrupt.bitmap.data.length;
			process.stdout.write("   [=] Frame " + i + "/" + frames.length + ": " + size + " bytes (" + Math.round(i / frames.length * 100) + "%)      \r");
		})
		
		// more fancy logs
		process.stdout.write("\nEncoding APNG...      \r");
			// encode corrupted frames at the worst quality because it looks pretty good
			let encoded = upng.encode(cframes, w, h, 256, delays);
			fs.writeFileSync(argv.output, Buffer.from(encoded)); // write apng buffer
		process.stdout.write("Encoding APNG... Done!     \n");
		
		return
	}
	
	// standard png/jpg/bmp processor, read file and work on the image
	jimp.read(argv.input, (err, image) => {
		if (err) return console.log("ERROR on file " + argv.input + ": " + err);
		
		// advance
		image_idx++;
		
		// and log
		console.log(image_idx + ": [" + argv.input + "] -> [" + argv.output + "]")
		
		// reset changes to the seed after randomisations, despite the name this doesn't actually change the input seed
		rand.resetseed();
		
		// corrupt and write the image, then if there's any more it will do them too (the foreach)
		image = pngfuck.corruptImage(image, rand, argv)
		image.write(argv.output)
	})
})