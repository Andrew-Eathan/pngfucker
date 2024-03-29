
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
const upng = require("upng-js");
const { argv } = require('process');

// helper to set a default value if there is no value specified
function check(key, param) {
	argv_template[key] = (argv_template[key] != undefined) ? argv_template[key] : param;
}

// go through and set defaults to the command line arguments
// we'll make this a template so that we can keep dynamic parameters the same
let argv_template = util.processArgs(process.argv); if (argv_template.config) {
	try {
		// load cfg file if one is specified
		let cfg = JSON.parse(fs.readFileSync(argv_template.config));
		for (let k in cfg)
			argv_template[k] = cfg[k];
	}
	catch (e) {
		console.error("ERR: Failed to load or parse JSON config: " + e);
		console.error("Using default configs instead!")
	}
} { // dodgy syntax but whatever
	check("input", "input.png")

	// bitshifts the entire image buffer by this value, negative values go backwards
	check("shift", 0)

	// splits the image into corrupted subsections and swaps their bytes around
	check("regions", 4)
	check("rmin", -20)
	check("rmax", -10)
	
	// simulates chunks of data vanishing from the image down to the bits, creating a horizontal corrupted "shift" effect
	check("splits", 2)

	// a percentage 0-100 that controls the minimum and maximum image area the split corruption can begin from
	check("splitmin", 0)
	check("splitmax", 100)

	// export format
	check("format", "png")

	// changes jpg input/output quality, but i haven't actually tested and proven this works, so...
	check("iquality", 80)
	check("oquality", 80)

	// applies contrast to images, -1 to 1 where 0 is neutral
	check("contrast", 0)

	// multiplies/divides the image size by these amounts
	check("mul", 1)
	check("div", 1)

	// downscales image by this percentage in pre-processing, and rescales it back to the original size in post-processing
	// this gives a neat chunky effect to the image while also boosting corruption speed
	check("crunch", 80)

	// corruption seed
	check("seed", (Math.round(Math.random() * 65535)))

	// does some math on transparent images to keep corruption only to opaque pixels
	check("clamp", 0)

	// usually animated corruption shuffles the seed every frame, this prevents that
	check("staticseed", 0)

	// whether to underlay a black background under corrupted images
	// corruption tends to mangle alpha component of pixels, switching random pixels between on/off
	check("blackbg", 0)

	// given a single-frame png, this turns it into an animated corrupted png
	check("frames", 0)
	check("fps", 0)

	// chance for animated corruption frames to be left uncorrupted, 0-100
	check("breaks", 0)

	// because shift alone can look ugly, this is how much randomness shift can have
	check("randshift", 0)
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
	if (input_isfolder && !output_isfolder) // would make no sense --- FUTURE ME: this would absolutely make sense for pngs -> apng but i'm too lazy to do that, go figure
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
		let turnAnimated = pngdata.frames.length < 2 && argv.frames > 0; // if user wants to turn a single frame png into an animated corruption

		if (pngdata.frames.length < 2) 
			if (argv.frames <= 0) 
				break exitpng; // this is a regular one-frame png, work on it normally
		
		image_idx++;
		console.log(image_idx + " (APNG): [" + argv.input + "] -> [" + argv.output + "]")
		
		let frames = upng.toRGBA8(pngdata) // get all the frame data we need from the apng
		let cframes = [] // this stores all the corrupted frames to later be stitched in encoding
		let delays = [] // this stores the frame delays in numbers, used when encoding

		if (turnAnimated) {
			let frame = frames[0];
			let delay = 1 / argv.fps * 1000;

			delays.push(delay);
			for (let i = 0; i < argv.frames - 1; i++) {
				frames.push(frame);
				delays.push(delay);
			}
		}
		
		// populate delays
		if (!turnAnimated)
			pngdata.frames.forEach(frame => delays.push(frame.delay))
		
		// calculate final width and height to pass to encoding, we can't comfortably find this in encoding when all we get is a pile of RGBA
		let { w, h } = pngfuck.calcWH(pngdata.width, pngdata.height, argv)
		let i = 0 // frame counter, used in progress logging
		
		// process each frame
		frames.forEach(frame => {
			let normalchance = rand.gen(0.0000000001, 100) <= argv.breaks;

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
			let corrupt = pngfuck.corruptImage(image, rand, argv, normalchance)
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