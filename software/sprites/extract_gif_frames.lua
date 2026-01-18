-- Extract frames from animated GIF
local sprite = app.activeSprite
if not sprite then
    print("No sprite loaded")
    return
end

local outputDir = "/home/cigo/Mon-Mon-Vpet-Project/software/simulator/public/sprites/pokemon/charmander_battle/gen5_animated/"

-- Create output directory
os.execute("mkdir -p \"" .. outputDir .. "\"")

-- Export each frame
for i = 1, #sprite.frames do
    local filename = outputDir .. "frame_" .. string.format("%03d", i - 1) .. ".png"
    app.command.ExportSpriteSheet {
        ui = false,
        askOverwrite = false,
        type = SpriteSheetType.HORIZONTAL,
        textureFilename = "",
        dataFilename = "",
    }
    -- Save individual frame
    sprite:saveCopyAs(filename)
end

-- Actually let's just save each frame individually
for i, frame in ipairs(sprite.frames) do
    app.activeFrame = frame
    local filename = outputDir .. "frame_" .. string.format("%03d", i - 1) .. ".png"
    sprite:saveCopyAs(filename)
end

print("Extracted " .. #sprite.frames .. " frames")
