@echo off
set /p input="Input Filename > "
set /p seed="Seed > "
node pngfucker.js -input %input% -seed %seed% -regions 2 -shift -1 -crunch 40 -iquality 1 -splits 2 -div 1 -oquality 20 -contrast 1
echo Done :D
pause