-- Split Charmander sprite sheet into individual direction frames
-- Layout: 2 columns x 4 rows
-- Row 0: north (col 0), west (col 1)
-- Row 1: north walk, west walk
-- Row 2: south (col 0), east (col 1)
-- Row 3: south walk, east walk

local sprite = app.activeSprite
if not sprite then
    print("No sprite loaded")
    return
end

local w = sprite.width
local h = sprite.height

-- Calculate frame size (2 columns, 4 rows)
local frameW = w / 2
local frameH = h / 4

-- Define which frames to extract (first frame of each direction)
local frames = {
    {name = "north", row = 0, col = 0},
    {name = "west",  row = 0, col = 1},
    {name = "south", row = 2, col = 0},
    {name = "east",  row = 2, col = 1},
}

local outputDir = "/home/cigo/Mon-Mon-Vpet-Project/software/sprites/Charmander_Reference/"

for _, frame in ipairs(frames) do
    local x = frame.col * frameW
    local y = frame.row * frameH

    -- Create a new sprite for this frame
    local newSprite = Sprite(frameW, frameH, sprite.colorMode)

    -- Copy the pixels
    local srcImg = Image(sprite.cels[1].image)
    local destImg = newSprite.cels[1].image

    for px = 0, frameW - 1 do
        for py = 0, frameH - 1 do
            local srcX = x + px
            local srcY = y + py
            if srcX < w and srcY < h then
                destImg:drawPixel(px, py, srcImg:getPixel(srcX, srcY))
            end
        end
    end

    -- Save the new sprite
    local filename = outputDir .. "charmander_" .. frame.name .. ".png"
    newSprite:saveCopyAs(filename)
    newSprite:close()

    print("Saved: charmander_" .. frame.name .. ".png")
end

print("Done splitting Charmander sprites!")
