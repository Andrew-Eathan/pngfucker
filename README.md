# pngfucker
### What is this?
pngfucker is a tool that purposefully distorts and glitches images to create an unique effect that has never been implemented before.  
It's very configurable and the output is randomized with each iteration, although i do plan to add seed-based glitching soon.
### Quick story of how this was made
Have you ever gotten tired of seeing this generic [JPEG glitch effect](https://cdn.discordapp.com/attachments/701973402973634681/916383906243178496/glitch.jpeg) and wanted something else?  
That's also what happened to me. But then, a bright metaphorical lightbulb appeared above my head.  
More than a year ago, i was playing with a program i was working on that controlled the game Garry's Mod from my phone in the browser, however, the colors looked off.  
I tried to bitshift the view, and i got this [peculiar glitching effect](https://cdn.discordapp.com/attachments/868443505045962783/915652437837242398/unknown.png) that looked cool, but i abandoned the controller project at that point because it was super slow.  
Later, i separated that effect into its own tool called "pngfucker", it stayed like that for 2 months, and then i rewrote it! (So technically, this is a v2, not v1 like the pngfucker.js script file implies)
  
### Usage
The script has its own commandline argument handler, although it doesn't like arguments with spaces.  
All of the parameters below are optional. If no parameters are specified, it will convert an "input.png" into an "output.png" with the specified default values.
  
`node pngfucker.js (args)`  
#### -input (path)
Input path relative to script. If a folder is specified, it will batch convert all of the images in that folder.  
(COMING SOON) If the format parameter is "gif" and the -fps parameter is specified, it will create a GIF using the frames in the folder.  
(COMING SOON) If the input is a GIF and the format parameter is "gif", it will glitch the GIF, otherwise it picks the first frame in the GIF and glitches that.  
  
#### -output (path)  
Output path relative to script. If a folder is specified, batch conversions will be written to it.  
If an output path is a folder but an input is a file, the output will be written in the output folder as "output.png".  
If the output is a folder, the input is a GIF and the format is not a GIF, the GIF's frames will be glitched and written to the folder.  
If the output isn't a folder in that case, the default output is ignored, and output will be in "(gif_name)/(frame).(format)"  
If the output is a folder, but does not exist, images will be written to "(input_folder)_out/(frame).(format)"  
  
#### -shift (def. 3)  
Bitshift the image buffer to the right by this amount, negative amounts shift to the left.  
  
#### -regions (def. 4)  
Glitching regions. This bitshifts the image buffer in a localised area and writes random data to some pixels.  
-rmin (def. -8)			= Minimum region size in height pixels.  
-rmax (def. -5)			= Maximum region size in height pixels.  
Note, the above subparameters aren't proportional to the image size unless it's a negative number!  
If you pass negative values, the value will be set to: (image height) / (positive value of rmin or rmax)  
  
#### -splits (def. 0)  
An older alternative to -regions, where the image buffer is crunched and expanded to give the effect of the image being sliced in half horizontally.  
This gives the effect of a bunch of pixels and bits missing from an image.  
NOTE: This also performs a bitshift, but it doesn't reverse it afterwards, leaving the image glitched after a split.  
This means that everything in your image will be glitched after a split. Might be good or bad depending on what you want!  
  
#### -format (png/jpg/bmp)
Output image format. GIF support will come later when someone can actually comprehend the clusterfuck that is the GIF file format and make it easy for the rest of us to use it.  
Currently there are 3 accepted values for -format: "png", "jpg", and "bmp".  
  
#### -iquality (0-100, def. 80)
If the format is JPG, this will be its input JPG quality.  
  
#### -oquality (0-100, def. 80)
If the format is JPG, this will be its output JPG quality.  
  
#### -contrast (-1 to 1, def 0)
Image contrast pre-processing. 0 is no change, -1 is the lowest contrast, 1 is the highest.  
  
#### -mul (def. 1)
Multiply output image size by this value.  
  
#### -div (def. 3)
Divide output image size by this value.  
Both -mul and -div are applied, in order of multiplication and then division, but preferably you should just use one, whatever fits your case.  
  
#### -seed (def. random number between 0 and 65535)
Lets you reuse corruption randomisation!  
  
#### -crunch (def. 100, 1-100)
Resizes image to this percentage in pre-processing, and resizes them back to normal in post-processing, to "crunch" the pixels.  
This gives a nice, pixel-like effect to the glitching, and it mostly works well with small images (256x256, 512x512, you get the idea)  
This parameter is a good alternative to -div, because you won't have to resize it back to normal size afterwards.  
NOTE: Don't add a percent sign! Resizing and crunching is nearest-neighbor, so you can enjoy crispy glitching.  
  
### Setup
This project uses two NPM packages to do its magic:  
[`buffershift`](https://www.npmjs.com/package/buffershift)  
[`jimp`](https://www.npmjs.com/package/jimp)  
  
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
  
##### #8: Obliterated avatar of an old enemy, uses -crunch
![scummius](https://media.discordapp.net/attachments/626313822113759232/915683554250342441/output.png)  
  
##### #9: Same as #8, but less crunch
![scummius but more detail](https://cdn.discordapp.com/attachments/626313822113759232/915683608478502922/output.png)  
  
##### #10: Obliterated avatar of Fasteroid
![dead](https://cdn.discordapp.com/attachments/626313822113759232/915683427712389151/output.png)  
  
##### #11: Diagram showing the role of -crunch
![cronch](https://media.discordapp.net/attachments/419150279137820673/915685316436852796/unknown.png?width=538&height=360)  
  
##### #12: Wobbuffet
![burh](https://cdn.discordapp.com/attachments/419150279137820673/915682846037921823/output.png)  
  
##### #13: Original Image 2
![hl2](https://media.discordapp.net/attachments/876672769490821123/916607510729859092/input.jpg?width=320&height=256)  
  
##### #14: #13 with `-input input.jpg -format jpg -iquality 10 -oquality 80 -regions 4 -splits 2 -shift 0 -rmin -8 -rmax -6 -contrast 0.5 -div 1 -crunch 20`
![hl3](https://media.discordapp.net/attachments/876672769490821123/916607184547250187/output.jpg?width=320&height=256)  
  
##### #15: Same as #14 but with `-contrast -0.5 -crunch 30 -shift 3`
![hl4](https://media.discordapp.net/attachments/876672769490821123/916606609638182962/output.jpg?width=320&height=256)  
  
##### #16: `-input input.jpg -format jpg -iquality 10 -oquality 10 -regions 4 -splits 2 -shift 0 -rmin -8 -rmax -6 -contrast 0.2 -div 1 -crunch 20`
![hl5](https://media.discordapp.net/attachments/876672769490821123/916606384236269588/output.jpg?width=320&height=256)  
  
###### if pngfucker is cool for you pls star kthx
###### by andreweathan (if you're confused no that's not my real name
