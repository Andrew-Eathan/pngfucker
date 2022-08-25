![pngfucker](https://user-images.githubusercontent.com/42521608/166221876-85ced79b-7069-4e0a-ab1b-0d06eb057887.png)
# pngfucker v1.3
### What is this?
pngfucker is a tool that purposefully distorts and glitches images to create an unique effect that has never been implemented before.  
It's very configurable and the output is randomized with each iteration, plus, now you can specify a numeric seed value!  
pngfucker also has APNG support, and there's several examples of it after the documentation!  

### Quick story of how this was made
Have you ever gotten tired of seeing this generic [JPEG glitch effect](https://cdn.discordapp.com/attachments/701973402973634681/916383906243178496/glitch.jpeg) and wanted something else?  
That's also what happened to me. But then, a bright metaphorical lightbulb appeared above my head.  
More than a year ago, i was playing with a program i was working on that controlled the game Garry's Mod from my phone in the browser, however, the colors looked off.  
I tried to bitshift the view, and i got this [peculiar glitching effect](https://cdn.discordapp.com/attachments/868443505045962783/915652437837242398/unknown.png) that looked cool, but i abandoned the controller project at that point because it was super slow.  
Later, i separated that effect into its own tool called "pngfucker", it stayed like that for 2 months, and then i rewrote it! (So technically, this is a v2, not v1 like the pngfucker.js script file implies) 
  
### Setup
This project uses node.js, so you need it to run pngfucker!  
pngfucker uses three NPM packages to do its magic:  
[`buffershift`](https://www.npmjs.com/package/buffershift)  
[`jimp`](https://www.npmjs.com/package/jimp)  
[`upng-js`](https://www.npmjs.com/package/upng-js)  
Install them all with `npm i` before running pngfucker!
  
### Usage
The script has its own commandline argument handler, although it doesn't like arguments with spaces.  
All of the parameters below are optional. If no parameters are specified, it will convert an "input.png" into an "output.png" with the specified default values.  
Generally, the trick to getting a good-looking corrupted image is to know how each of the options affects the image, and to experiment around a little until you get something that looks nice!  
  
`node pngfucker.js (args)`  

The complete list of parameters is in the [wiki](https://github.com/Andrew-Eathan/pngfucker/wiki)!
# 
# 
## *\[epilepsy warning just in case, especially at the animated examples (11-20)\]*
# 
#
  
  
### Examples of Usage
##### #1: Original Image
!["noooooo"'s profile picture from the Eathan's Realm Discord server](https://cdn.discordapp.com/attachments/868443505045962783/916389615882076190/input.png)  
  
##### #2: `-input input.png -regions 2 -shift -1 -crunch 40 -iquality 1 -splits 2 -div 1 -oquality 20 -contrast 0.4`
![xd](https://cdn.discordapp.com/attachments/868443505045962783/916381825625108520/output.png)  
  
##### #3: Same as #2
![e](https://cdn.discordapp.com/attachments/868443505045962783/916390652349120532/output.png)  
  
##### #4: Same as #2, but `-contrast 1`
![Looks like an SCP](https://cdn.discordapp.com/attachments/868443505045962783/916382052117540925/output.png)  
  
##### #5: Same as #4
![RGB?](https://cdn.discordapp.com/attachments/868443505045962783/916382005770461224/output.png)  
  
##### #6: Same as #4
![SCP with comically bad camera](https://cdn.discordapp.com/attachments/868443505045962783/916067562465398784/output-3.jpg)  
  
##### #7: Same as #2
![uhh](https://cdn.discordapp.com/attachments/626313822113759232/915689527199293540/output.png)  
  
##### #8: #1 with `-seed 2 -regions 2 -shift -1 -crunch 40 -iquality 1 -splits 2 -div 1 -oquality 20 -contrast 1`
![the](https://cdn.discordapp.com/attachments/868443505045962783/946441990369849344/output.png)   
  
##### #10: Wobbuffet, `-seed 4 -regions 2 -shift 0 -splits 2 -crunch 50 -clamp 1 -blackbg 1`
![burh](https://cdn.discordapp.com/attachments/832522685824499762/946846105826643978/output.png)  
  
##### #11: Original Image #2
![cube](https://cdn.discordapp.com/attachments/832522685824499762/946846625253425182/cube.png)
  
##### #12: #11 with `-seed 4 -regions 3 -shift 0 -splits 2 -div 1 -crunch 75 -clamp 1 -staticseed 0`
![glitchycube](https://cdn.discordapp.com/attachments/832522685824499762/946847191404798022/output.png)
  
##### #13: #12 with `-staticseed 1`
![glitchycube](https://cdn.discordapp.com/attachments/832522685824499762/946847675523948564/output.png)

##### #14: #12 with `-clamp 0 -staticseed 1`
![glitchyycube](https://cdn.discordapp.com/attachments/832522685824499762/946848483430785124/output.png)

##### #15: #12 with `-clamp 0`
![glitchiercube](https://cdn.discordapp.com/attachments/832522685824499762/946847941178589214/output.png)

##### #16: Original Image #3
![circley](https://cdn.discordapp.com/attachments/832522685824499762/946848905851731978/splash_3.png)

##### #17: #16 with `-seed 4 -regions 3 -shift 0 -splits 2 -div 1 -crunch 50 -clamp 1 -staticseed 0`
![angry circle](https://cdn.discordapp.com/attachments/832522685824499762/946849061452013630/output.png)

##### #18: #16 with `-seed 4 -regions 4 -shift 0 -splits 3 -div 1 -crunch 50 -clamp 0 -staticseed 1`
![circle](https://cdn.discordapp.com/attachments/832522685824499762/946852126246703234/output.png)

##### #19: Original Image #4
![balz](https://cdn.discordapp.com/attachments/832522685824499762/946867931617308672/apngtest.png)

##### #20: #19 with `-seed 4 -regions 3 -shift 0 -splits 2 -div 1 -crunch 70 -clamp 1 -staticseed 0 -mul 1.9`
![ballz](https://cdn.discordapp.com/attachments/832522685824499762/946867303855820870/output.png)

###### if pngfucker is cool for you pls star kthx
###### by andreweathan (if you're confused no that's not my real name
