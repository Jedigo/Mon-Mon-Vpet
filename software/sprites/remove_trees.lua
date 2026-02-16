-- Remove tree parts from the bottom of the Igglybuff Plain background
-- and replace with grass cloned from nearby areas

local sprite = app.open("/home/cigo/Mon-Mon-Vpet-Project/software/simulator/public/sprites/backgrounds/igglybuff_plain.png")

-- The background is 723x289, but we display 320x240 starting from left edge
-- So we only need to edit the visible portion (x: 0-320, y: ~25-265 based on centering)

-- The visible y range is: srcY = (289 - 240) / 2 = 24.5, so y: 24 to 264
-- Trees to remove (coordinates relative to the full 723x289 image):
-- 1. Bottom-left tree area (the big leafy tree) - keep the main one, remove edge parts
-- 2. Far bottom-right foliage

local img = sprite.cels[1].image

-- Helper function to copy a rectangle from one area to another
local function cloneArea(srcX, srcY, destX, destY, width, height)
    for y = 0, height - 1 do
        for x = 0, width - 1 do
            local sx = srcX + x
            local sy = srcY + y
            local dx = destX + x
            local dy = destY + y
            if sx >= 0 and sx < img.width and sy >= 0 and sy < img.height and
               dx >= 0 and dx < img.width and dy >= 0 and dy < img.height then
                local color = img:getPixel(sx, sy)
                img:drawPixel(dx, dy, color)
            end
        end
    end
end

-- Based on the visible area (320x240 viewport, srcX=0, srcY=24):
-- The bottom tree foliage appears around screen y=200-240 which is image y=224-264
-- The far bottom-right tree parts around screen x=280-320, y=200-240

-- Clone grass from a clean area to cover the bottom-right foliage
-- Clean grass area: around x=200, y=180 (screen coords) = x=200, y=204 (image coords)

-- Remove bottom-right tree/foliage (screen ~x:260-320, y:180-240 = image x:260-320, y:204-264)
cloneArea(180, 180, 270, 210, 50, 50)  -- Clone grass to bottom-right area
cloneArea(150, 190, 280, 230, 40, 35)  -- More grass coverage

-- Remove the small plants/rocks at very bottom edge if any
cloneArea(200, 200, 290, 250, 30, 30)

-- Save the modified image
sprite:saveAs("/home/cigo/Mon-Mon-Vpet-Project/software/simulator/public/sprites/backgrounds/igglybuff_plain_clean.png")

-- Close
app.command.CloseFile { ui = false }
print("Trees removed and saved to igglybuff_plain_clean.png")
