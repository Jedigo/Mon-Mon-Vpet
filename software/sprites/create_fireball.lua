-- Digimon V-pet style fireball attack sprite
-- Creates a simple 16x16 fireball with 4 animation frames

-- Create new sprite: 16x16, indexed color mode
local sprite = Sprite(16, 16, ColorMode.RGB)
sprite.filename = "fireball_attack"

-- Colors
local transparent = Color{ r=0, g=0, b=0, a=0 }
local black = Color{ r=0, g=0, b=0, a=255 }
local darkOrange = Color{ r=255, g=80, b=0, a=255 }
local orange = Color{ r=255, g=160, b=0, a=255 }
local yellow = Color{ r=255, g=220, b=0, a=255 }
local brightCore = Color{ r=255, g=255, b=200, a=255 }

-- Helper function to draw a pixel on an image
local function putPixel(img, x, y, color)
    if x >= 0 and x < img.width and y >= 0 and y < img.height then
        img:drawPixel(x, y, color)
    end
end

-- Helper to clear image to transparent
local function clearImage(img)
    for y = 0, img.height - 1 do
        for x = 0, img.width - 1 do
            img:drawPixel(x, y, transparent)
        end
    end
end

-- Add 3 more frames (we start with 1)
for i = 1, 3 do
    sprite:newEmptyFrame()
end

-- Get the layer
local layer = sprite.layers[1]

-- Frame 1: Small fireball forming
app.activeFrame = sprite.frames[1]
local cel1 = sprite:newCel(layer, sprite.frames[1])
local img1 = cel1.image
clearImage(img1)
-- Core
putPixel(img1, 7, 7, brightCore)
putPixel(img1, 8, 7, brightCore)
putPixel(img1, 7, 8, yellow)
putPixel(img1, 8, 8, yellow)
-- Inner flame
putPixel(img1, 6, 7, yellow)
putPixel(img1, 9, 7, yellow)
putPixel(img1, 7, 6, yellow)
putPixel(img1, 8, 6, orange)
putPixel(img1, 6, 8, orange)
putPixel(img1, 9, 8, orange)
-- Outer
putPixel(img1, 5, 7, orange)
putPixel(img1, 10, 7, darkOrange)
putPixel(img1, 7, 5, orange)
putPixel(img1, 8, 9, darkOrange)
-- Outline hints
putPixel(img1, 5, 6, black)
putPixel(img1, 6, 5, black)
putPixel(img1, 10, 6, black)
putPixel(img1, 11, 7, black)

-- Frame 2: Fireball expanding with tail
app.activeFrame = sprite.frames[2]
local cel2 = sprite:newCel(layer, sprite.frames[2])
local img2 = cel2.image
clearImage(img2)
-- Bright core (shifted right, showing motion)
putPixel(img2, 9, 7, brightCore)
putPixel(img2, 10, 7, brightCore)
putPixel(img2, 9, 8, brightCore)
putPixel(img2, 10, 8, yellow)
-- Inner yellow
putPixel(img2, 8, 7, yellow)
putPixel(img2, 11, 7, yellow)
putPixel(img2, 8, 8, yellow)
putPixel(img2, 11, 8, orange)
putPixel(img2, 9, 6, yellow)
putPixel(img2, 10, 6, yellow)
putPixel(img2, 9, 9, orange)
putPixel(img2, 10, 9, orange)
-- Orange mid
putPixel(img2, 7, 7, orange)
putPixel(img2, 7, 8, orange)
putPixel(img2, 12, 7, orange)
putPixel(img2, 8, 6, orange)
putPixel(img2, 11, 6, orange)
putPixel(img2, 8, 9, darkOrange)
-- Tail (trailing behind)
putPixel(img2, 6, 7, darkOrange)
putPixel(img2, 5, 7, darkOrange)
putPixel(img2, 6, 8, darkOrange)
putPixel(img2, 4, 8, black)
-- Dark orange outer
putPixel(img2, 7, 6, darkOrange)
putPixel(img2, 12, 8, darkOrange)
putPixel(img2, 11, 9, darkOrange)
-- Outline
putPixel(img2, 8, 5, black)
putPixel(img2, 9, 5, black)
putPixel(img2, 12, 6, black)
putPixel(img2, 13, 7, black)
putPixel(img2, 13, 8, black)
putPixel(img2, 12, 9, black)
putPixel(img2, 10, 10, black)

-- Frame 3: Full fireball flying
app.activeFrame = sprite.frames[3]
local cel3 = sprite:newCel(layer, sprite.frames[3])
local img3 = cel3.image
clearImage(img3)
-- Bright core
putPixel(img3, 10, 7, brightCore)
putPixel(img3, 11, 7, brightCore)
putPixel(img3, 10, 8, brightCore)
putPixel(img3, 11, 8, yellow)
-- Inner
putPixel(img3, 9, 7, yellow)
putPixel(img3, 12, 7, yellow)
putPixel(img3, 9, 8, yellow)
putPixel(img3, 12, 8, orange)
putPixel(img3, 10, 6, yellow)
putPixel(img3, 11, 6, yellow)
putPixel(img3, 10, 9, orange)
putPixel(img3, 11, 9, orange)
-- Orange
putPixel(img3, 8, 7, orange)
putPixel(img3, 8, 8, orange)
putPixel(img3, 13, 7, orange)
putPixel(img3, 9, 6, orange)
putPixel(img3, 12, 6, orange)
-- Long tail
putPixel(img3, 7, 7, darkOrange)
putPixel(img3, 6, 7, darkOrange)
putPixel(img3, 5, 8, darkOrange)
putPixel(img3, 7, 8, darkOrange)
putPixel(img3, 4, 8, black)
putPixel(img3, 3, 9, black)
putPixel(img3, 6, 8, darkOrange)
-- Wisps
putPixel(img3, 5, 6, black)
putPixel(img3, 4, 7, black)
-- Outline
putPixel(img3, 9, 5, black)
putPixel(img3, 10, 5, black)
putPixel(img3, 12, 5, black)
putPixel(img3, 13, 6, black)
putPixel(img3, 14, 7, black)
putPixel(img3, 14, 8, black)
putPixel(img3, 13, 9, black)
putPixel(img3, 11, 10, black)

-- Frame 4: Impact/dissipating
app.activeFrame = sprite.frames[4]
local cel4 = sprite:newCel(layer, sprite.frames[4])
local img4 = cel4.image
clearImage(img4)
-- Explosion burst center
putPixel(img4, 8, 7, brightCore)
putPixel(img4, 9, 7, brightCore)
putPixel(img4, 8, 8, brightCore)
putPixel(img4, 9, 8, brightCore)
-- Rays outward
putPixel(img4, 7, 6, yellow)
putPixel(img4, 10, 6, yellow)
putPixel(img4, 7, 9, yellow)
putPixel(img4, 10, 9, yellow)
putPixel(img4, 6, 7, yellow)
putPixel(img4, 11, 7, yellow)
putPixel(img4, 6, 8, yellow)
putPixel(img4, 11, 8, yellow)
-- Outer burst
putPixel(img4, 5, 5, orange)
putPixel(img4, 12, 5, orange)
putPixel(img4, 5, 10, orange)
putPixel(img4, 12, 10, orange)
putPixel(img4, 4, 7, orange)
putPixel(img4, 13, 7, darkOrange)
putPixel(img4, 4, 8, darkOrange)
putPixel(img4, 13, 8, darkOrange)
putPixel(img4, 8, 4, orange)
putPixel(img4, 9, 4, orange)
putPixel(img4, 8, 11, darkOrange)
putPixel(img4, 9, 11, darkOrange)
-- Sparks
putPixel(img4, 3, 6, darkOrange)
putPixel(img4, 14, 6, black)
putPixel(img4, 3, 9, black)
putPixel(img4, 14, 9, black)
putPixel(img4, 6, 3, darkOrange)
putPixel(img4, 11, 3, black)
putPixel(img4, 6, 12, black)
putPixel(img4, 11, 12, black)

-- Set frame durations (100ms each = 10fps animation)
for i = 1, 4 do
    sprite.frames[i].duration = 0.1
end

-- Save as Aseprite file
sprite:saveAs("/home/cigo/Mon-Mon-Vpet-Project/software/sprites/effects/fireball_attack.aseprite")

-- Export as sprite sheet PNG
app.command.ExportSpriteSheet {
    ui = false,
    askOverwrite = false,
    type = SpriteSheetType.HORIZONTAL,
    textureFilename = "/home/cigo/Mon-Mon-Vpet-Project/software/simulator/public/sprites/effects/fireball_attack.png",
}

print("Fireball sprite created!")
