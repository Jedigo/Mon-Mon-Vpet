-- Water attack sprite - water bubble/splash projectile
-- 16x16 with 4 animation frames

local sprite = Sprite(16, 16, ColorMode.RGB)
sprite.filename = "water_attack"

-- Colors
local transparent = Color{ r=0, g=0, b=0, a=0 }
local black = Color{ r=0, g=0, b=0, a=255 }
local darkBlue = Color{ r=30, g=80, b=180, a=255 }
local blue = Color{ r=60, g=140, b=220, a=255 }
local lightBlue = Color{ r=100, g=180, b=255, a=255 }
local white = Color{ r=220, g=240, b=255, a=255 }
local splash = Color{ r=180, g=220, b=255, a=200 }

local function putPixel(img, x, y, color)
    if x >= 0 and x < img.width and y >= 0 and y < img.height then
        img:drawPixel(x, y, color)
    end
end

local function clearImage(img)
    for y = 0, img.height - 1 do
        for x = 0, img.width - 1 do
            img:drawPixel(x, y, transparent)
        end
    end
end

-- Add 3 more frames
for i = 1, 3 do
    sprite:newEmptyFrame()
end

local layer = sprite.layers[1]

-- Frame 1: Water bubble forming
app.activeFrame = sprite.frames[1]
local cel1 = sprite:newCel(layer, sprite.frames[1])
local img1 = cel1.image
clearImage(img1)
-- Small bubble core
putPixel(img1, 7, 7, white)
putPixel(img1, 8, 7, lightBlue)
putPixel(img1, 7, 8, lightBlue)
putPixel(img1, 8, 8, blue)
-- Inner ring
putPixel(img1, 6, 7, lightBlue)
putPixel(img1, 9, 7, blue)
putPixel(img1, 7, 6, lightBlue)
putPixel(img1, 8, 6, blue)
putPixel(img1, 6, 8, blue)
putPixel(img1, 9, 8, darkBlue)
putPixel(img1, 7, 9, blue)
putPixel(img1, 8, 9, darkBlue)
-- Outer hints
putPixel(img1, 5, 7, blue)
putPixel(img1, 10, 7, darkBlue)
-- Outline
putPixel(img1, 6, 5, black)
putPixel(img1, 9, 5, black)
putPixel(img1, 5, 6, black)
putPixel(img1, 10, 6, black)
putPixel(img1, 10, 9, black)
putPixel(img1, 9, 10, black)

-- Frame 2: Water bubble larger with motion trail
app.activeFrame = sprite.frames[2]
local cel2 = sprite:newCel(layer, sprite.frames[2])
local img2 = cel2.image
clearImage(img2)
-- Bright core (shifted right for motion)
putPixel(img2, 9, 7, white)
putPixel(img2, 10, 7, white)
putPixel(img2, 9, 8, lightBlue)
putPixel(img2, 10, 8, lightBlue)
-- Inner bubble
putPixel(img2, 8, 7, lightBlue)
putPixel(img2, 11, 7, lightBlue)
putPixel(img2, 8, 8, blue)
putPixel(img2, 11, 8, blue)
putPixel(img2, 9, 6, lightBlue)
putPixel(img2, 10, 6, lightBlue)
putPixel(img2, 9, 9, blue)
putPixel(img2, 10, 9, blue)
-- Outer bubble
putPixel(img2, 7, 7, blue)
putPixel(img2, 7, 8, blue)
putPixel(img2, 12, 7, blue)
putPixel(img2, 12, 8, darkBlue)
putPixel(img2, 8, 5, blue)
putPixel(img2, 11, 5, blue)
putPixel(img2, 8, 10, darkBlue)
putPixel(img2, 11, 10, darkBlue)
-- Water trail
putPixel(img2, 6, 7, splash)
putPixel(img2, 5, 8, splash)
putPixel(img2, 4, 7, splash)
putPixel(img2, 6, 8, blue)
-- Droplets behind
putPixel(img2, 3, 6, lightBlue)
putPixel(img2, 4, 9, lightBlue)
-- Outline
putPixel(img2, 8, 4, black)
putPixel(img2, 11, 4, black)
putPixel(img2, 13, 7, black)
putPixel(img2, 13, 8, black)
putPixel(img2, 12, 10, black)
putPixel(img2, 9, 11, black)

-- Frame 3: Full water blast
app.activeFrame = sprite.frames[3]
local cel3 = sprite:newCel(layer, sprite.frames[3])
local img3 = cel3.image
clearImage(img3)
-- Core
putPixel(img3, 10, 7, white)
putPixel(img3, 11, 7, white)
putPixel(img3, 10, 8, lightBlue)
putPixel(img3, 11, 8, lightBlue)
-- Inner
putPixel(img3, 9, 7, lightBlue)
putPixel(img3, 12, 7, lightBlue)
putPixel(img3, 9, 8, blue)
putPixel(img3, 12, 8, blue)
putPixel(img3, 10, 6, lightBlue)
putPixel(img3, 11, 6, lightBlue)
putPixel(img3, 10, 9, blue)
putPixel(img3, 11, 9, blue)
-- Outer
putPixel(img3, 8, 7, blue)
putPixel(img3, 8, 8, blue)
putPixel(img3, 13, 7, blue)
putPixel(img3, 9, 5, blue)
putPixel(img3, 12, 5, blue)
putPixel(img3, 9, 10, darkBlue)
putPixel(img3, 12, 10, darkBlue)
-- Long trail
putPixel(img3, 7, 7, splash)
putPixel(img3, 6, 7, splash)
putPixel(img3, 5, 8, splash)
putPixel(img3, 7, 8, blue)
putPixel(img3, 6, 8, blue)
putPixel(img3, 4, 7, lightBlue)
putPixel(img3, 3, 8, lightBlue)
-- Droplets
putPixel(img3, 2, 6, lightBlue)
putPixel(img3, 3, 9, lightBlue)
putPixel(img3, 5, 5, splash)
putPixel(img3, 4, 10, splash)
-- Outline
putPixel(img3, 9, 4, black)
putPixel(img3, 12, 4, black)
putPixel(img3, 14, 7, black)
putPixel(img3, 14, 8, black)
putPixel(img3, 13, 10, black)
putPixel(img3, 10, 11, black)

-- Frame 4: Impact splash
app.activeFrame = sprite.frames[4]
local cel4 = sprite:newCel(layer, sprite.frames[4])
local img4 = cel4.image
clearImage(img4)
-- Splash center
putPixel(img4, 8, 7, white)
putPixel(img4, 9, 7, white)
putPixel(img4, 8, 8, white)
putPixel(img4, 9, 8, lightBlue)
-- Splash ring
putPixel(img4, 7, 6, lightBlue)
putPixel(img4, 10, 6, lightBlue)
putPixel(img4, 7, 9, lightBlue)
putPixel(img4, 10, 9, lightBlue)
putPixel(img4, 6, 7, lightBlue)
putPixel(img4, 11, 7, lightBlue)
putPixel(img4, 6, 8, blue)
putPixel(img4, 11, 8, blue)
-- Droplets flying outward
putPixel(img4, 5, 5, lightBlue)
putPixel(img4, 12, 5, lightBlue)
putPixel(img4, 5, 10, blue)
putPixel(img4, 12, 10, blue)
putPixel(img4, 4, 7, blue)
putPixel(img4, 13, 7, blue)
putPixel(img4, 4, 8, splash)
putPixel(img4, 13, 8, splash)
putPixel(img4, 8, 4, lightBlue)
putPixel(img4, 9, 4, lightBlue)
putPixel(img4, 8, 11, blue)
putPixel(img4, 9, 11, blue)
-- Outer droplets
putPixel(img4, 3, 6, splash)
putPixel(img4, 14, 6, splash)
putPixel(img4, 3, 9, splash)
putPixel(img4, 14, 9, splash)
putPixel(img4, 6, 3, splash)
putPixel(img4, 11, 3, splash)
putPixel(img4, 6, 12, splash)
putPixel(img4, 11, 12, splash)

-- Set frame durations (100ms each)
for i = 1, 4 do
    sprite.frames[i].duration = 0.1
end

-- Save as Aseprite file
sprite:saveAs("/home/cigo/Mon-Mon-Vpet-Project/software/sprites/effects/water_attack.aseprite")

-- Export as sprite sheet PNG
app.command.ExportSpriteSheet {
    ui = false,
    askOverwrite = false,
    type = SpriteSheetType.HORIZONTAL,
    textureFilename = "/home/cigo/Mon-Mon-Vpet-Project/software/simulator/public/sprites/attacks/water_attack.png",
}

print("Water attack sprite created!")
