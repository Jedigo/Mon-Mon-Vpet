# Mon-Mon Gen 3 Assembly Guide

## Print Settings (FDM)

| Setting | Front/Back Shell | Buttons | A/B Plate |
|---------|-----------------|---------|-----------|
| Layer Height | 0.2mm | 0.16mm | 0.2mm |
| Nozzle | 0.4mm | 0.4mm | 0.4mm |
| Walls | 3 perimeters | 4 perimeters | 3 perimeters |
| Infill | 20% | 100% | 40% |
| Supports | Yes (front shell) | No | No |
| Material | PLA/PETG | PLA | PLA |

## Print Orientation

- **Front Shell**: Face down (inside cavity facing up). Supports needed for display ledges.
- **Back Shell**: Inside face up (no supports needed)
- **D-Pad**: Flat on bed
- **A/B Buttons**: Cap face down (stem pointing up)
- **A/B Switch Plate**: Flat, switch pockets facing up

## STL Export

Open `scad/mon-mon.scad` in OpenSCAD:

1. Set `render_part = "front_shell";`
2. Press F6 to render
3. File > Export > Export as STL
4. Repeat for each part: `back_shell`, `dpad`, `button_a`, `button_b`, `ab_plate`

## Bill of Materials

| Qty | Component | Notes |
|-----|-----------|-------|
| 1 | ESP32 Feather HUZZAH32 | Adafruit #3405 |
| 1 | 2.0" ILI9225 TFT | Generic SPI module |
| 1 | 500mAh LiPo | Adafruit #1578 or similar |
| 1 | Piezo Buzzer PS1240 | Adafruit #160 |
| 3 | 6x6mm Tact Switches | Through-hole |
| 4 | M2x6mm Screws | Self-tapping into plastic |
| - | 26-28 AWG Wire | Various colors |

## Assembly Order

### 1. Prepare A/B Switch Plate
1. Press-fit two 6x6mm tact switches into the plate pockets
2. Solder wires (use different colors for A vs B)
3. Route wires through the channels on the bottom

### 2. Prepare D-Pad Switch
1. Solder wires to a single 6x6mm tact switch
2. Leave ~80mm wire length

### 3. Back Shell Assembly
1. Place battery in top-left pocket (wires toward center)
2. Connect battery JST to ESP32
3. Place ESP32 in bottom pocket (USB port toward bottom edge)
4. Drop A/B switch plate into its pocket (wires toward ESP32)
5. Place D-pad switch on its platform (center of device, left side)
6. Route and solder all wires to ESP32

### 4. Front Shell Preparation
1. Press piezo buzzer into mount ring (behind speaker grille)
2. Insert D-pad plunger into opening
3. Insert A and B buttons into their holes

### 5. Close Assembly
1. Position display on front shell ledges (screen visible through window)
2. Flip front shell and align with back shell
3. Press together gently
4. Insert 4x M2 screws through front shell into back shell posts

## Wiring Reference

| Component | ESP32 Pin |
|-----------|-----------|
| Display VCC | 3V |
| Display GND | GND |
| Display SCK | GPIO18 |
| Display MOSI | GPIO23 |
| Display CS | GPIO5 |
| Display DC | GPIO16 |
| Display RST | GPIO17 |
| Display BL | GPIO4 |
| Piezo + | GPIO27 |
| Piezo - | GND |
| Button A | GPIO25 |
| Button B | GPIO33 |
| D-Pad | GPIO26 |

All buttons use internal pull-ups (active LOW).

## Troubleshooting

**Buttons feel sticky:**
- Increase `tolerance_sliding` in parameters.scad (try 0.3 or 0.35)
- Sand button stems lightly

**Display doesn't fit:**
- Adjust `display_pcb_width_max` in parameters.scad
- The side ledges are intentionally shorter for variance

**Shells don't align:**
- Check for warping on print bed
- Verify overlap lip clearance

**Screw posts strip:**
- Use slightly smaller pilot hole: reduce `screw_post_inner_diameter` to 1.5
- Or switch to M2 heat-set inserts
