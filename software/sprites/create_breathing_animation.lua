-- Create breathing animation from static sprite
-- Export individual frame files by creating separate sprites

local sprite = app.activeSprite
if not sprite then
    print("No sprite loaded")
    return
end

-- Use Windows temp path
local outputDir = "D:/temp/gen5_breathing/"
os.execute("mkdir \"" .. outputDir:gsub("/", "\\") .. "\" 2>nul")

-- Animation parameters
local frameCount = 8
local bobAmount = 2

-- Get source dimensions
local w = sprite.width
local h = sprite.height

-- Create padded canvas size
local paddedH = h + bobAmount * 2 + 2

-- Get the source image data
local srcLayer = sprite.layers[1]
local srcCel = srcLayer:cel(1)
if not srcCel then
    print("No cel found")
    return
end

-- Store pixel data before any modifications
local pixelData = {}
local srcImg = srcCel.image
for y = 0, srcImg.height - 1 do
    for x = 0, srcImg.width - 1 do
        local px = srcImg:getPixel(x, y)
        if px ~= 0 then  -- Non-transparent
            table.insert(pixelData, {x = x, y = y, color = px})
        end
    end
end
print("Captured " .. #pixelData .. " non-transparent pixels")

-- Base Y position (centered in padded canvas)
local baseY = bobAmount + 1

-- Create each frame as a separate sprite
for i = 1, frameCount do
    local phase = ((i - 1) / frameCount) * 2 * math.pi
    local yOff = math.floor(-math.sin(phase) * bobAmount)

    -- Create new sprite for this frame
    local newSprite = Sprite(w, paddedH, sprite.colorMode)

    -- Copy palette
    if sprite.palettes[1] then
        newSprite:setPalette(sprite.palettes[1])
    end

    -- Get the destination image
    local destImg = newSprite.cels[1].image

    -- Copy pixels with offset
    for _, px in ipairs(pixelData) do
        local destY = px.y + baseY + yOff
        if destY >= 0 and destY < paddedH then
            destImg:drawPixel(px.x, destY, px.color)
        end
    end

    -- Save
    local filename = outputDir .. "frame_" .. string.format("%02d", i - 1) .. ".png"
    newSprite:saveCopyAs(filename)
    newSprite:close()

    print("Frame " .. i .. ": yOffset=" .. yOff .. " -> " .. filename)
end

print("Done! Created " .. frameCount .. " frames at " .. w .. "x" .. paddedH)
