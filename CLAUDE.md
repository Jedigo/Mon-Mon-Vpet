# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mon-Mon Gen 3 is a 3D-printable virtual pet device enclosure designed in OpenSCAD, styled after the Nintendo DMG Game Boy at ~71% scale (64×97×22mm). The device uses an ESP32 Feather, ILI9225 display, and only 3 buttons (D-pad + A + B) - intentionally simplified for a virtual pet interface.

## Current Status

**Last Updated:** 2026-01-17

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
