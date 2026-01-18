-- Extract grass battlefield from FRLG battle backgrounds sprite sheet
-- The green grass background is in row 0, column 1 (second from left, top row)

local sprite = app.activeSprite
if not sprite then
    print("No sprite loaded")
    return
end

local width = sprite.width
local height = sprite.height
print("Sprite size: " .. width .. "x" .. height)

local img = sprite.cels[1].image

-- Find vertical red lines (x positions)
local function isRed(pixel)
    local r = app.pixelColor.rgbaR(pixel)
    local g = app.pixelColor.rgbaG(pixel)
    local b = app.pixelColor.rgbaB(pixel)
    return r > 150 and g < 50 and b < 50
end

local red_x = {}
local prev_red = -10
for x = 0, width - 1 do
    local pixel = img:getPixel(x, 50)
    if isRed(pixel) then
        if x > prev_red + 3 then
            table.insert(red_x, x)
            prev_red = x
        end
    end
end

print("Vertical red lines at:")
for i, x in ipairs(red_x) do
    print("  " .. x)
end

-- Find horizontal red lines (y positions)
local red_y = {}
prev_red = -10
for y = 0, height - 1 do
    local pixel = img:getPixel(50, y)
    if isRed(pixel) then
        if y > prev_red + 3 then
            table.insert(red_y, y)
            prev_red = y
        end
    end
end

print("Horizontal red lines at:")
for i, y in ipairs(red_y) do
    print("  " .. y)
end

-- Based on visual inspection of 737x466 image with 3x4 grid:
-- Red separators are ~1px thick at edges
-- Column 1 (grass) is from x=246 to x=490
-- Row 0 is from y=1 to y=114
-- Add extra margin to avoid red lines
local x1 = 248
local x2 = 488
local y1 = 2
local y2 = 112

local crop_width = x2 - x1 + 1
local crop_height = y2 - y1 + 1

print("Extracting region: (" .. x1 .. "," .. y1 .. ") size " .. crop_width .. "x" .. crop_height)

-- Create a new image for the cropped region
local new_img = Image(crop_width, crop_height, img.colorMode)

-- Copy pixels from source to new image
for y = 0, crop_height - 1 do
    for x = 0, crop_width - 1 do
        local pixel = img:getPixel(x1 + x, y1 + y)
        new_img:putPixel(x, y, pixel)
    end
end

-- Create a new sprite with the cropped image
local new_sprite = Sprite(crop_width, crop_height, img.colorMode)
new_sprite.cels[1].image = new_img

-- Save the extracted background
local output_path = "/home/cigo/Mon-Mon-Vpet-Project/software/simulator/public/sprites/battle/grass_battlefield.png"
new_sprite:saveCopyAs(output_path)

print("Saved grass battlefield to: " .. output_path)

-- Close the new sprite without saving changes to it
new_sprite:close()
