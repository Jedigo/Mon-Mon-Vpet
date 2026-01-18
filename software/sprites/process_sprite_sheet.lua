-- HGSS Gen 1 Sprite Sheet Processor v2
-- Uses blue separator lines to split sprites accurately

-- Pokemon names for Gen 1 (Pokedex order)
local pokemon_names = {
    "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon",
    "Charizard", "Squirtle", "Wartortle", "Blastoise", "Caterpie",
    "Metapod", "Butterfree", "Weedle", "Kakuna", "Beedrill",
    "Pidgey", "Pidgeotto", "Pidgeot", "Rattata", "Raticate",
    "Spearow", "Fearow", "Ekans", "Arbok", "Pikachu",
    "Raichu", "Sandshrew", "Sandslash", "Nidoran_F", "Nidorina",
    "Nidoqueen", "Nidoran_M", "Nidorino", "Nidoking", "Clefairy",
    "Clefable", "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff",
    "Zubat", "Golbat", "Oddish", "Gloom", "Vileplume",
    "Paras", "Parasect", "Venonat", "Venomoth", "Diglett",
    "Dugtrio", "Meowth", "Persian", "Psyduck", "Golduck",
    "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag",
    "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam",
    "Machop", "Machoke", "Machamp", "Bellsprout", "Weepinbell",
    "Victreebel", "Tentacool", "Tentacruel", "Geodude", "Graveler",
    "Golem", "Ponyta", "Rapidash", "Slowpoke", "Slowbro",
    "Magnemite", "Magneton", "Farfetchd", "Doduo", "Dodrio",
    "Seel", "Dewgong", "Grimer", "Muk", "Shellder",
    "Cloyster", "Gastly", "Haunter", "Gengar", "Onix",
    "Drowzee", "Hypno", "Krabby", "Kingler", "Voltorb",
    "Electrode", "Exeggcute", "Exeggutor", "Cubone", "Marowak",
    "Hitmonlee", "Hitmonchan", "Lickitung", "Koffing", "Weezing",
    "Rhyhorn", "Rhydon", "Chansey", "Tangela", "Kangaskhan",
    "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu",
    "Starmie", "Mr_Mime", "Scyther", "Jynx", "Electabuzz",
    "Magmar", "Pinsir", "Tauros", "Magikarp", "Gyarados",
    "Lapras", "Ditto", "Eevee", "Vaporeon", "Jolteon",
    "Flareon", "Porygon", "Omanyte", "Omastar", "Kabuto",
    "Kabutops", "Aerodactyl", "Snorlax", "Articuno", "Zapdos",
    "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo",
    "Mew"
}

-- Grid positions to skip (duplicates: Venusaur at 4, female Pikachu at 27)
local SKIP_POSITIONS = {4, 27}

-- Blue line detection threshold
local BLUE_THRESHOLD = 30  -- How close to pure blue (0,0,255) to detect

local OUTPUT_DIR = app.fs.joinPath(app.fs.filePath(app.activeSprite.filename), "..", "Processed Sprites")

-- Check if a pixel is a separator line (dark teal: RGB 0, 64, 128)
local function is_separator_line(r, g, b)
    -- Separator is RGB(0, 64, 128) - dark teal
    return r < 20 and g > 50 and g < 80 and b > 110 and b < 145
end

-- Check if a color is a background color (for flood fill)
local function is_background_color(r, g, b, tolerance)
    tolerance = tolerance or 20
    -- Common HGSS background colors
    local bg_colors = {
        -- Greens/Sage
        {161, 176, 123}, {153, 176, 143}, {168, 184, 128}, {152, 168, 136},
        {144, 168, 120}, {160, 176, 128}, {168, 192, 136}, {176, 192, 144},
        -- Tans/Beiges
        {200, 184, 152}, {192, 176, 144}, {208, 192, 160}, {184, 168, 136},
        {216, 200, 168},
        -- Purples/Lavenders (Nidoqueen, Zubat, etc.)
        {176, 168, 200}, {184, 176, 208}, {168, 160, 192}, {192, 184, 216},
        {200, 176, 200}, {192, 168, 200}, {184, 160, 192}, {176, 152, 184},
        {208, 184, 208}, {200, 168, 192}, {216, 192, 216},
        {160, 128, 176}, {168, 136, 184}, {152, 120, 168},  -- Zubat lavender
        {176, 128, 128}, {184, 136, 136}, {168, 120, 120},  -- Nidoqueen dusty rose
        -- Pinks/Magentas (Slowbro, etc.)
        {200, 168, 176}, {208, 176, 184}, {192, 160, 168}, {216, 184, 192},
        {200, 160, 168}, {208, 168, 176}, {224, 184, 192}, {216, 176, 184},
        {200, 152, 160}, {192, 144, 152}, {184, 136, 144},
        {208, 160, 168}, {200, 152, 160}, {216, 168, 176},  -- More pink variants
        -- Blues
        {152, 176, 200}, {160, 184, 208}, {144, 168, 192}, {168, 192, 216},
        -- Grays
        {168, 168, 168}, {176, 176, 176}, {184, 184, 184},
        {160, 160, 160}, {192, 192, 192}, {248, 248, 248}, {240, 240, 240},
    }
    for _, bg in ipairs(bg_colors) do
        if math.abs(r - bg[1]) <= tolerance and
           math.abs(g - bg[2]) <= tolerance and
           math.abs(b - bg[3]) <= tolerance then
            return true
        end
    end
    return false
end

-- Find horizontal blue lines (row separators)
local function find_horizontal_lines(img, width, height)
    local lines = {}
    -- Sample from middle of image (more reliable than edges)
    local sample_start = math.floor(width / 3)
    local sample_end = math.floor(width * 2 / 3)
    local sample_width = sample_end - sample_start

    for y = 0, height - 1 do
        local teal_count = 0
        for x = sample_start, sample_end do
            local pixel = img:getPixel(x, y)
            local r = app.pixelColor.rgbaR(pixel)
            local g = app.pixelColor.rgbaG(pixel)
            local b = app.pixelColor.rgbaB(pixel)
            if is_separator_line(r, g, b) then
                teal_count = teal_count + 1
            end
        end
        -- Need majority of sampled pixels to be separator color
        if teal_count > sample_width * 0.7 then
            table.insert(lines, y)
        end
    end
    return lines
end

-- Find vertical blue lines in a row (column separators)
local function find_vertical_lines(img, startY, endY, width)
    local lines = {}
    for x = 0, width - 1 do
        local blue_count = 0
        local sample_height = math.min(20, endY - startY)
        for y = startY, startY + sample_height - 1 do
            local pixel = img:getPixel(x, y)
            local r = app.pixelColor.rgbaR(pixel)
            local g = app.pixelColor.rgbaG(pixel)
            local b = app.pixelColor.rgbaB(pixel)
            if is_separator_line(r, g, b) then
                blue_count = blue_count + 1
            end
        end
        if blue_count > sample_height / 2 then
            table.insert(lines, x)
        end
    end
    return lines
end

-- Consolidate consecutive line positions into single boundaries
local function consolidate_lines(lines)
    if #lines == 0 then return {} end
    local result = {lines[1]}
    for i = 2, #lines do
        if lines[i] - lines[i-1] > 2 then  -- Gap of more than 2 pixels = new line
            table.insert(result, lines[i])
        end
    end
    return result
end

-- Flood fill to remove background from corners
local function remove_background_flood(newImg, width, height)
    local visited = {}
    local function key(px, py) return py * width + px end

    local function flood_fill(startX, startY)
        local stack = {{x = startX, y = startY}}

        while #stack > 0 do
            local pos = table.remove(stack)
            local px, py = pos.x, pos.y
            local k = key(px, py)

            if px >= 0 and px < width and py >= 0 and py < height and not visited[k] then
                visited[k] = true
                local pixel = newImg:getPixel(px, py)
                local r = app.pixelColor.rgbaR(pixel)
                local g = app.pixelColor.rgbaG(pixel)
                local b = app.pixelColor.rgbaB(pixel)

                if is_background_color(r, g, b, 25) or is_separator_line(r, g, b) then
                    newImg:drawPixel(px, py, app.pixelColor.rgba(0, 0, 0, 0))
                    table.insert(stack, {x = px + 1, y = py})
                    table.insert(stack, {x = px - 1, y = py})
                    table.insert(stack, {x = px, y = py + 1})
                    table.insert(stack, {x = px, y = py - 1})
                end
            end
        end
    end

    -- Flood fill from all four corners
    flood_fill(0, 0)
    flood_fill(width - 1, 0)
    flood_fill(0, height - 1)
    flood_fill(width - 1, height - 1)

    -- Also flood fill from edges
    for x = 0, width - 1, 8 do
        flood_fill(x, 0)
        flood_fill(x, height - 1)
    end
    for y = 0, height - 1, 8 do
        flood_fill(0, y)
        flood_fill(width - 1, y)
    end
end

-- Main processing function
local function process_sprite_sheet()
    local sprite = app.activeSprite
    if not sprite then
        app.alert("No sprite open!")
        return
    end

    app.fs.makeDirectory(OUTPUT_DIR)

    local img = sprite.cels[1].image
    local spec = sprite.spec
    local width, height = spec.width, spec.height

    print("Image size: " .. width .. "x" .. height)
    print("Finding row separators...")

    -- Find horizontal lines (row separators)
    local h_lines = find_horizontal_lines(img, width, height)
    h_lines = consolidate_lines(h_lines)

    print("Found " .. #h_lines .. " horizontal separators")

    -- Build row boundaries
    local rows = {}
    local prev_y = 0
    for _, line_y in ipairs(h_lines) do
        if line_y - prev_y > 10 then  -- Minimum row height
            table.insert(rows, {start = prev_y, finish = line_y - 1})
        end
        prev_y = line_y + 1
    end
    -- Add last row
    if height - prev_y > 10 then
        table.insert(rows, {start = prev_y, finish = height - 1})
    end

    -- Ensure all rows are at least 128 pixels tall (standard sprite height)
    -- This fixes the last row being cut short by credits area
    for i, row in ipairs(rows) do
        local row_height = row.finish - row.start + 1
        if row_height < 128 then
            local new_finish = math.min(row.start + 127, height - 1)
            rows[i].finish = new_finish
            print("Extended row " .. i .. " from " .. row_height .. "px to " .. (new_finish - row.start + 1) .. "px")
        end
    end

    print("Found " .. #rows .. " rows")

    local pokemon_index = 1
    local grid_position = 0

    for row_num, row in ipairs(rows) do
        print("Processing row " .. row_num .. " (y: " .. row.start .. " to " .. row.finish .. ")")

        -- Find vertical lines in this row
        local v_lines = find_vertical_lines(img, row.start, row.finish, width)
        v_lines = consolidate_lines(v_lines)

        -- Build column boundaries
        local cols = {}
        local prev_x = 0
        for _, line_x in ipairs(v_lines) do
            if line_x - prev_x > 10 then  -- Minimum column width
                table.insert(cols, {start = prev_x, finish = line_x - 1})
            end
            prev_x = line_x + 1
        end
        -- Add last column
        if width - prev_x > 10 then
            table.insert(cols, {start = prev_x, finish = width - 1})
        end

        print("  Found " .. #cols .. " columns in row " .. row_num)

        for col_num, col in ipairs(cols) do
            grid_position = grid_position + 1

            -- Check if this position should be skipped (duplicate)
            local skip = false
            for _, skip_pos in ipairs(SKIP_POSITIONS) do
                if grid_position == skip_pos then
                    skip = true
                    print("  Skipping grid position " .. grid_position .. " (duplicate)")
                    break
                end
            end

            if not skip then
                if pokemon_index > #pokemon_names then
                    print("  All Pokemon processed!")
                    break
                end

                local name = pokemon_names[pokemon_index]
                local block_width = col.finish - col.start + 1
                local block_height = row.finish - row.start + 1

                -- Create new sprite
                local newSpec = ImageSpec{
                    width = block_width,
                    height = block_height,
                    colorMode = ColorMode.RGB,
                    transparentColor = 0
                }
                local newSprite = Sprite(newSpec)
                local newImg = newSprite.cels[1].image

                -- Copy pixels
                for py = 0, block_height - 1 do
                    for px = 0, block_width - 1 do
                        local srcX = col.start + px
                        local srcY = row.start + py
                        if srcX < width and srcY < height then
                            local pixel = img:getPixel(srcX, srcY)
                            newImg:drawPixel(px, py, pixel)
                        end
                    end
                end

                -- Remove background using flood fill
                remove_background_flood(newImg, block_width, block_height)

                -- Save
                local num = string.format("%03d", pokemon_index)
                local filename = num .. "_" .. name .. ".png"
                local filepath = app.fs.joinPath(OUTPUT_DIR, filename)
                newSprite:saveCopyAs(filepath)
                newSprite:close()

                print("  Exported: " .. filename .. " (" .. block_width .. "x" .. block_height .. ")")
                pokemon_index = pokemon_index + 1
            end
        end

        if pokemon_index > #pokemon_names then
            break
        end
    end

    print("Done! Processed " .. (pokemon_index - 1) .. " Pokemon")
    app.alert("Done! Processed " .. (pokemon_index - 1) .. " Pokemon to:\n" .. OUTPUT_DIR)
end

process_sprite_sheet()
