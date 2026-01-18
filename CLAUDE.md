# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mon-Mon Gen 3 is a 3D-printable virtual pet device enclosure designed in OpenSCAD, styled after the Nintendo DMG Game Boy at ~71% scale (64×97×22mm). The device uses an ESP32 Feather, ILI9225 display, and only 3 buttons (D-pad + A + B) - intentionally simplified for a virtual pet interface.

## Current Status

**Last Updated:** 2026-01-18

The shell design has been updated to be more DMG-accurate:
- ✅ DMG-style curved bottom-right corner on both shells
- ✅ Clean front face (screws enter from back)
- ✅ Authentic speaker grille (6 diagonal slots, only 5 cut through)
- ✅ Screen bezel with raised area
- ✅ Horizontal groove line between screen and controls
- ✅ Select/Start as subtle pill indents
- ✅ **AMS multi-color support** - flush inlay system for text and pills
- 🔲 Additional DMG details still needed (see TODO below)

## Project Structure

```
Mon-Mon-Vpet-Project/
├── hardware/           # 3D printable enclosure
│   ├── scad/           # OpenSCAD source files
│   ├── stl/            # Exported STL files for printing
│   ├── docs/           # Assembly guide
│   ├── reference/      # DMG Game Boy reference images
│   └── render.sh       # OpenSCAD rendering script
├── software/           # ESP32 firmware (in development)
│   ├── simulator/      # Web-based simulator (Vite + vanilla JS)
│   │   ├── src/
│   │   │   ├── main.js       # Main game loop, sprite switching, input
│   │   │   ├── display.js    # Canvas display wrapper (176x220)
│   │   │   ├── input.js      # Button input handling
│   │   │   ├── sprites.js    # Sprite loading and entity classes
│   │   │   └── battle.js     # Battle system with particle effects
│   │   └── public/sprites/pokemon/  # Sprite assets
│   │       ├── charmander_pixellab/  # PixelLab 8-dir sprites
│   │       ├── charmander_battle/    # Gen 4/5 battle sprites
│   │       └── battle_test/          # Battle system test sprites
│   └── sprites/        # Sprite processing scripts and sources
│       ├── Sprite Sheets/      # Source sprite sheets
│       ├── Processed Sprites/  # Extracted individual sprites
│       ├── Charmander_Reference/  # Direction reference images
│       └── *.lua               # Aseprite processing scripts
├── CLAUDE.md
└── SESSION_SUMMARY.md
```

## OpenSCAD Architecture

### Hardware File Structure
- `hardware/scad/mon-mon.scad` - Main assembly file with render options and STL export logic
- `hardware/scad/parameters.scad` - Central parameters file (all dimensions as variables)
- `hardware/scad/front_shell.scad` - Front shell with screen window, buttons, speaker grille (DMG-style)
- `hardware/scad/back_shell.scad` - Back shell with component mounts, countersunk screw holes
- `hardware/scad/buttons.scad` - D-pad and A/B button plungers
- `hardware/scad/screen_bezel.scad` - Separate bezel piece for multi-color printing
- `hardware/scad/components/` - Reference models for fitment verification (not for printing)

### Critical: include vs use
- **`include`** imports both modules AND variables - use for `parameters.scad`
- **`use`** imports only modules - use for all other `.scad` files
- Each sub-file must have `include <parameters.scad>` (or `include <../parameters.scad>` in components/) to work standalone

### Render Options
In `mon-mon.scad`, set `render_part` to export individual STLs:
```
render_part = "front_shell_combined"; // RECOMMENDED: Shell + bezel + pills for AMS
render_part = "front_shell";          // Shell only
render_part = "back_shell";
render_part = "screen_bezel";
render_part = "dpad";
render_part = "button_a";
render_part = "button_b";
```
Then F6 to render, File > Export > STL.

### AMS Multi-Color Printing (Bambu)
The front shell uses a **combined STL with Split to Parts** workflow:
- Shell, bezel, and pills exported as one STL with separate disconnected meshes
- Pills protrude 0.1mm above shell surface so Bambu recognizes them as separate parts
- Use "Split to Parts" in Bambu Studio to separate and assign colors

**Recommended STL:** `front_shell_combined.stl`

**Bambu Studio Workflow:**
1. In OpenSCAD: set `render_part = "front_shell_combined"`, press F6, then File → Export → STL
2. In Bambu Studio: **File → Import** → `front_shell_combined.stl`
3. Right-click the model → **Split to Parts**
4. In Objects panel, assign filaments:
   - Shell → Light grey
   - Bezel + Pills → Dark grey/black
5. Slice and print

**Note:** Text labels removed (SELECT, START, Mon-Mon) - too small for legible FDM printing. Only the pill shapes remain.

**Alternative exports** (if Split to Parts doesn't work):
- `front_shell.stl` - Shell only
- `inlay_dark_combined.stl` - Pills only
- `bezel_ams.stl` - Bezel only

## Key Design Decisions

- **Single-switch D-pad**: Uses one center tact switch (rocker style) - intentional for 3-button virtual pet
- **Direct switch mounting**: A/B switches mount directly in back shell (no separate plate)
- **ESP32 rails**: Simple rail mounting instead of corner standoffs
- **Adjustable display mount**: Accommodates ILI9225 PCB size variance (48-54mm width)
- **Screws from back**: Front face is clean, 4x M2 countersunk screws enter from back shell into bosses in front shell
- **DMG curved corner**: Bottom-right has 12mm radius curve matching original Game Boy aesthetic
- **AMS anchored inlays**: Text and SELECT/START pills use deep pocket cutouts (2.1mm) with anchored inlay pieces that print together with the shell for reliable multi-color printing

## TODO / Remaining Work

- [ ] Verify internal features don't interfere with component fitment
- [ ] Test print and adjust tolerances
- [ ] Add battery door or access panel (if needed)
- [ ] Consider adding grip texture on back (DMG has ridged grip area)
- [ ] Add "Nintendo" style vent slots on top edge (optional)
- [ ] Refine button feel and travel distance

## DMG Game Boy Reference

Original Nintendo DMG-01 specifications (for reference):
- **Dimensions**: 148mm × 90mm × 32mm (Mon-Mon is ~71% scale)
- **Screen**: 2.6" diagonal, 160×144 pixels
- **Speaker grille**: 6 diagonal pill-shaped slots, only 5 cut through (1 decorative)
- **Buttons**: A/B ~10-10.8mm diameter, domed, magenta color
- **D-pad**: Black hard plastic, matte grip areas, center indent
- **Design**: Two-tone grey ABS, softly rounded corners, curved bottom-right edge

Reference sources:
- https://www.dimensions.com/element/game-boy
- https://www.ifixit.com/Teardown/Nintendo+Game+Boy+Teardown/122657
- https://b13rg.icecdn.tech/Gameboy_DMG/

## Tolerances (in parameters.scad)

Adjust these for your FDM printer:
- `tolerance_tight = 0.15` - Press-fit
- `tolerance_sliding = 0.25` - Buttons, moving parts
- `tolerance_loose = 0.35` - Drop-in components

## Hardware BOM

| Qty | Part |
|-----|------|
| 1 | ESP32 Feather HUZZAH32 |
| 1 | 2.0" ILI9225 TFT display |
| 1 | 500mAh LiPo battery |
| 1 | PS1240 piezo buzzer |
| 3 | 6x6mm tact switches |
| 4 | M2×6mm self-tapping screws |

## Rendering SCAD Files
To preview OpenSCAD models, use the render script:
```bash
./hardware/render.sh hardware/scad/filename.scad output.png
```

You can view the resulting PNG to see what the model looks like and iterate on the design.

Optional parameters: width, height, camera
```bash
./hardware/render.sh hardware/scad/file.scad output.png 800 600 0,0,0,55,0,25,200
```

**IMPORTANT:** Delete render PNG files after viewing them. Do not accumulate renders in the project - the `.scad` source files are the source of truth and renders can always be regenerated.

## Sprite Processing with Aseprite

Aseprite is installed at: `D:\Steam\steamapps\common\Aseprite\Aseprite.exe`
(WSL path: `/mnt/d/Steam/steamapps/common/Aseprite/Aseprite.exe`)

### Processing Sprite Sheets

The `process_sprite_sheet.lua` script extracts individual Pokemon from sprite sheets:

```bash
"/mnt/d/Steam/steamapps/common/Aseprite/Aseprite.exe" -b "path/to/spritesheet.png" --script "software/sprites/process_sprite_sheet.lua"
```

**What the script does:**
1. Detects row/column separators (teal lines: RGB 0, 64, 128)
2. Splits sprite sheet into individual Pokemon blocks
3. Removes background colors via flood fill from edges
4. Exports as `001_Bulbasaur.png`, `002_Ivysaur.png`, etc.

**Configuration (in script):**
- `SKIP_POSITIONS` - Grid positions to skip (for duplicates like Venusaur, female Pikachu)
- `pokemon_names` - List of Pokemon names in Pokedex order
- Background colors list for flood fill removal

**Output:** `software/sprites/Processed Sprites/`

## PixelLab AI Integration

PixelLab MCP server is installed for AI-powered sprite generation.

**Capabilities:**
- Generate new sprite angles (8-directional movement)
- Create animations (idle, walk, attack, etc.)
- "Create from Reference" (Pro feature, web UI only) - generates matching sprites from single reference image
- Inpainting and editing

**Current Sprite Status:**
- ✅ 151 Gen 1 Pokemon extracted from HGSS sprite sheet
- ✅ 151 Pokemon organized in individual folders with south-facing sprites
- ✅ PixelLab Charmander with 8 directions + walk/idle animations (48x48)
- ✅ Gen 5 B/W static battle sprites for Charmander/Bulbasaur

**Final Sprite Style Decision:**
- **Overworld**: PixelLab isometric 8-direction (48×48)
- **Battle**: Gen 5 B/W static sprites (96×96)

## Web Simulator

The simulator (`software/simulator/`) is a Vite + vanilla JS app that emulates the 176×220 ILI9225 display.

**Running the simulator:**
```bash
cd software/simulator
npm run dev
```

**Controls:**
- **1-5**: Switch sprite styles (PixelLab, Gen4, Gen5 static, Gen5 breathing, Gen5 animated)
- **6 or B**: Toggle battle mode
- **A or Space**: Attack (in battle mode)
- **D-pad**: Move character (in overworld)

**Key Classes:**
- `Display` - Canvas wrapper with pixel-art rendering
- `AnimatedSprite` - Frame-based animation
- `PokemonEntityAI` - Autonomous 8-directional movement with walk/idle behavior
- `PokemonEntitySimple` - Static front-facing sprites
- `BattleScreen` - FRLG-style battle system with particle effects

## Session Management

When the user types `/close-session` or asks to close/end the session:
1. Summarize what was accomplished during the session
2. Append the summary to the "Session Log" section below with the current date
3. Update any relevant sections of CLAUDE.md (project structure, status, TODOs)

---

## Session Log

### 2026-01-18: AMS Multi-Color Printing Fix

**Problem:** Front shell test prints were failing. Bambu Studio's "Add Part" feature wasn't aligning the bezel and pill inlays correctly with the shell.

**Attempts that didn't work:**
- Separate STL files with "Add Part" - alignment issues
- Anchor points to match bounding boxes - still misaligned
- Combined STL with overlapping parts - couldn't Split to Parts (meshes merged)
- Color painting - too tedious

**Solution that worked:**
- Combined STL (`front_shell_combined`) with shell, bezel, and pills as **disconnected meshes**
- Pills protrude 0.1mm above shell surface so Bambu recognizes them as separate
- Use "Split to Parts" in Bambu Studio to separate and assign colors

**Other changes:**
- Removed text labels (SELECT, START, Mon-Mon) - too small for legible FDM printing
- Updated bezel to have 1.6mm depth for better print reliability
- Added `front_shell_combined` render option as recommended export

### 2026-01-18: Sprite Processing & PixelLab Setup

**Accomplished:**
- Reorganized project folders (created `hardware/reference/`, `software/sprites/`)
- Created Aseprite Lua script to process HGSS Pokemon sprite sheets
- Extracted all 151 Gen 1 Pokemon sprites with transparent backgrounds
- Named by Pokedex number (001_Bulbasaur.png - 151_Mew.png)
- Handled edge cases: duplicate Venusaur/Pikachu skips, row 11 height, various background colors
- Fixed specific Pokemon manually: Wigglytuff, Slowbro, Lickitung, Aerodactyl, Mew
- Installed PixelLab MCP server for AI sprite generation

**Next steps:**
- Use PixelLab to generate 8-directional sprites for Charmander (test)
- Create idle and walk animations
- Apply workflow to other Pokemon once tested

### 2026-01-18: Sprite Comparison & Battle System Prototype

**Sprite Research:**
- Discovered Gen 5 sprites only have idle/breathing animations - NO separate attack/faint animations exist
- Attack effects in official games are particle overlays + sprite transformations (shake, flash, scale)
- ROM hacks (Unbound, Radical Red, etc.) use same approach - no custom attack sprite frames
- Available sprite resources: [DS-style 64x64 Sprite Resource](https://www.pokecommunity.com/threads/the-ds-style-64x64-pok%C3%A9mon-sprite-resource-completed.267728/), [Gen VII+ Repository](https://www.pokecommunity.com/threads/ds-style-gen-vii-and-beyond-pok%C3%A9mon-sprite-repository-in-64x64.368703/)

**Simulator Sprite Comparison:**
- Added 5 sprite styles switchable with keys 1-5:
  1. PixelLab isometric (8-dir, autonomous AI)
  2. Gen 4 HGSS battle (80x80)
  3. Gen 5 B/W static (96x96)
  4. Gen 5 breathing (Aseprite-generated, had issues)
  5. Gen 5 animated (55-frame original)
- Downloaded Charmander back sprite and Bulbasaur front sprite for battle testing

**Battle System (Option 3: One attacker at a time):**
- Created `battle.js` with FRLG-style battle screen
- Particle system with effects: ember (fire), hit (white burst), tackle (dust)
- GBA-style grass background (programmatic - sky gradient, hills, grass field)
- FRLG-style UI elements:
  - HP bars (green/yellow/red based on health)
  - Info boxes (tan background, double border)
  - Text boxes (white with FRLG-style border)
- Battle flow: Show attacker → Attack text → Particle effect → Show defender → Hit effect → Damage text
- Controls: 6/B to toggle battle mode, A/Space to attack

**Technical Notes:**
- Screen size constraint: 176×220 with 96×96 sprites is tight
- Option 3 (one attacker at a time) chosen for more room for effects
- Spriters Resource has download protection - manual download required for official backgrounds

### 2026-01-18: Sprite System Finalization & Pokemon Organization

**Sprite Style Decision:**
- ✅ **Overworld**: PixelLab isometric 8-direction sprites (48×48)
- ✅ **Battle**: Gen 5 B/W static sprites (96×96)
- Removed other sprite styles (Gen 4, Gen 5 animated, Charmander 2D) to simplify codebase

**New PixelLab Character Downloaded:**
- "Charmander 2D" (84×84, side-view) - downloaded via API for testing
- Has walk animations (east/west) and breathing-idle
- Kept in sprites folder but not used in final implementation

**Battle Background:**
- Extracted authentic FRLG grass battlefield from sprite sheet
- Saved to `simulator/public/sprites/battle/grass_battlefield.png` (241×111)
- Battle screen now uses real FRLG background instead of programmatic gradient

**Pokemon Sprite Organization:**
- Created `software/sprites/Pokemon/` folder structure
- Each of 151 Pokemon has its own folder containing:
  - Original HGSS sprite sheet (all directions)
  - `south.png` - extracted front-facing sprite
- Aseprite Lua script: `extract_single_south.lua`

**Simulator Simplification:**
- `sprites.js`: Only loadCharmanderPixelLab() and PokemonEntityAI class
- `main.js`: Single overworld sprite, no style switching
- Controls: 6/B for battle mode, A/Space to attack
