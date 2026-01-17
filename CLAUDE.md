# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mon-Mon Gen 3 is a 3D-printable virtual pet device enclosure designed in OpenSCAD, styled after the Nintendo DMG Game Boy at ~71% scale (64×97×22mm). The device uses an ESP32 Feather, ILI9225 display, and only 3 buttons (D-pad + A + B) - intentionally simplified for a virtual pet interface.

## Current Status

**Last Updated:** 2026-01-16

The shell design has been updated to be more DMG-accurate:
- ✅ DMG-style curved bottom-right corner on both shells
- ✅ Clean front face (screws enter from back)
- ✅ Authentic speaker grille (6 diagonal slots, only 5 cut through)
- ✅ Screen bezel with raised area
- ✅ Horizontal groove line between screen and controls
- ✅ Select/Start as subtle pill indents
- 🔲 Additional DMG details still needed (see TODO below)

## Project Structure

```
Mon-Mon-Vpet-Project/
├── hardware/           # 3D printable enclosure
│   ├── scad/           # OpenSCAD source files
│   ├── stl/            # Exported STL files for printing
│   ├── docs/           # Assembly guide, renders
│   ├── reference/      # DMG Game Boy reference images
│   └── render.sh       # OpenSCAD rendering script
├── software/           # ESP32 firmware (in development)
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
render_part = "front_shell";  // or "back_shell", "dpad", "button_a", "button_b"
```
Then F6 to render, File > Export > STL.

## Key Design Decisions

- **Single-switch D-pad**: Uses one center tact switch (rocker style) - intentional for 3-button virtual pet
- **Direct switch mounting**: A/B switches mount directly in back shell (no separate plate)
- **ESP32 rails**: Simple rail mounting instead of corner standoffs
- **Adjustable display mount**: Accommodates ILI9225 PCB size variance (48-54mm width)
- **Screws from back**: Front face is clean, 4x M2 countersunk screws enter from back shell into bosses in front shell
- **DMG curved corner**: Bottom-right has 12mm radius curve matching original Game Boy aesthetic

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
