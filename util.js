
// UTIL
// too lazy to make cool text for this file
// by AndrewEathan (AndrewEathan#8783)

module.exports.debuglog = (str) => {
	//if (argv["verbose"] == "yes") {
	//	console.log(str)
	//}
}

// taken from here
// https://github.com/micro-js/srand/blob/master/lib/index.js
// modified to return an object of functions for my needs
module.exports.srand = (seed) => {
	// If we're passed a string, condense it down
	// into a number

	if (typeof seed === 'string') {
		str = seed
		seed = 0xFF
		for (var i = 0; i < str.length; i++) {
			seed ^= str.charCodeAt(i)
		}
	}

	let originalseed = seed

	return {
		gen: (min, max) => {
			max = max || 1
			min = min || 0
			seed = (seed * 9301 + 49297) % 233280

			let ret = min + (seed / 233280) * (max - min)
			return ret
		},

		setseed: sd => seed = sd,
		resetseed: sd => seed = originalseed
	}
}

module.exports.writeBuffer = (target, data, offset, add) => {
	for(let i = 0; i < data.length; i++){
		target[i + offset] = data[i] + (add ? add : 0)
	}
}

module.exports.randFloor = (min, max, rand) => {
	return Math.floor(rand.gen(min, max))
}

module.exports.randCeil = (min, max, rand) => {
	return Math.ceil(rand.gen(min, max))
}

module.exports.processArgs = (args) => {
	// shift extra data
	args.shift()
	args.shift()
	
	let ret = {}
	let preceded = false
	let precede = ""
	
	for(let i = 0; i < args.length; i++) {
		let data = args[i];
		if (!isNaN(Number(data))) data = Number(data); // convert to number if it's numeric
	
		if (!preceded && args[i][0] == "-" && isNaN(Number(args[i]))) {
			preceded = true; 
			precede = args[i].slice(1, args[i].length); 
			continue
		}
		
		if (preceded && (args[i][0] != "-" || !isNaN(Number(args[i])))) {
			preceded = false; 
			ret[precede] = data; 
			continue
		}
		
		if (!preceded && args[i][0] != "-") {
			if (!ret["uncategorised"]) ret["uncategorised"] = []
			ret["uncategorised"].push(data)
		}
	}
	
	return ret
}