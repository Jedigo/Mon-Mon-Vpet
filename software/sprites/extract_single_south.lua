-- Extract south-facing sprite from the active sprite
-- Run with: aseprite -b input.png --script extract_single_south.lua --script-param output=/path/to/output

local sprite = app.activeSprite
if not sprite then
    print("ERROR: No sprite loaded")
    return
end

-- Get output path from script params or use default
local outputPath = app.params["output"]
if not outputPath then
    print("ERROR: No output path specified")
    return
end

local img = sprite.cels[1].image
local width = sprite.width
local height = sprite.height

-- HGSS sprites have 2 columns, 4 rows
-- Each frame is width/2 x height/4
local frameW = math.floor(width / 2)
local frameH = math.floor(height / 4)

-- HGSS layout: Row 1=North, Row 2=West, Row 3=East, Row 4=South
-- South-facing is bottom-left (row 4, first frame)
local southImg = Image(frameW, frameH, img.colorMode)
local startY = frameH * 3  -- Start of row 4 (bottom row)

-- Copy pixels from source
for y = 0, frameH - 1 do
    for x = 0, frameW - 1 do
        local pixel = img:getPixel(x, startY + y)
        southImg:putPixel(x, y, pixel)
    end
end

-- Create new sprite with just the south frame
local newSprite = Sprite(frameW, frameH, img.colorMode)
newSprite.cels[1].image = southImg

-- Save the south-facing sprite
newSprite:saveCopyAs(outputPath)
newSprite:close()

print("Saved: " .. outputPath)
