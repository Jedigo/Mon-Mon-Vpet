-- Extract south-facing sprite from each Pokemon in Processed Sprites
-- Creates a folder for each Pokemon with original and south-facing sprite

local fs = app.fs
local inputDir = "/home/cigo/Mon-Mon-Vpet-Project/software/sprites/Processed Sprites"
local outputDir = "/home/cigo/Mon-Mon-Vpet-Project/software/sprites/Pokemon"

-- Create output directory if it doesn't exist
os.execute('mkdir -p "' .. outputDir .. '"')

-- Get list of PNG files
local files = {}
for file in io.popen('ls "' .. inputDir .. '"/*.png 2>/dev/null'):lines() do
    table.insert(files, file)
end

print("Found " .. #files .. " Pokemon sprites")

for i, filepath in ipairs(files) do
    -- Extract filename without path
    local filename = filepath:match("([^/]+)$")
    -- Extract Pokemon name (e.g., "001_Bulbasaur" from "001_Bulbasaur.png")
    local pokemonName = filename:match("(.+)%.png$")

    if pokemonName then
        print("Processing: " .. pokemonName)

        -- Create Pokemon folder
        local pokemonDir = outputDir .. "/" .. pokemonName
        os.execute('mkdir -p "' .. pokemonDir .. '"')

        -- Copy original file
        os.execute('cp "' .. filepath .. '" "' .. pokemonDir .. '/' .. filename .. '"')

        -- Open the sprite
        local sprite = app.open(filepath)
        if sprite then
            local img = sprite.cels[1].image
            local width = sprite.width
            local height = sprite.height

            -- HGSS sprites have 2 columns, 4 rows
            -- Each frame is width/2 x height/4
            local frameW = math.floor(width / 2)
            local frameH = math.floor(height / 4)

            -- South-facing is top-left (first frame)
            local southImg = Image(frameW, frameH, img.colorMode)

            -- Copy pixels from source
            for y = 0, frameH - 1 do
                for x = 0, frameW - 1 do
                    local pixel = img:getPixel(x, y)
                    southImg:putPixel(x, y, pixel)
                end
            end

            -- Create new sprite with just the south frame
            local newSprite = Sprite(frameW, frameH, img.colorMode)
            newSprite.cels[1].image = southImg

            -- Save the south-facing sprite
            local southPath = pokemonDir .. "/south.png"
            newSprite:saveCopyAs(southPath)

            -- Close sprites
            newSprite:close()
            sprite:close()

            print("  Saved: " .. southPath)
        else
            print("  ERROR: Could not open sprite")
        end
    end
end

print("Done! Processed " .. #files .. " Pokemon")
