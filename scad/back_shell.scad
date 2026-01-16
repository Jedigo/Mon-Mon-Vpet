// =============================================================================
// Mon-Mon Gen 3 - Back Shell
// DMG Game Boy inspired design - screws enter from back
// =============================================================================

// Include parameters (safe to include multiple times)
include <parameters.scad>

// -----------------------------------------------------------------------------
// Helper: Rounded rectangle
// -----------------------------------------------------------------------------
module rounded_rect(width, height, radius, h) {
    hull() {
        translate([radius, radius, 0])
            cylinder(h=h, r=radius, $fn=32);
        translate([width - radius, radius, 0])
            cylinder(h=h, r=radius, $fn=32);
        translate([radius, height - radius, 0])
            cylinder(h=h, r=radius, $fn=32);
        translate([width - radius, height - radius, 0])
            cylinder(h=h, r=radius, $fn=32);
    }
}

// -----------------------------------------------------------------------------
// DMG-style shell outline with curved bottom-right corner
// -----------------------------------------------------------------------------
module dmg_shell_outline_back(h) {
    hull() {
        // Top-left corner
        translate([shell_corner_radius, shell_height - shell_corner_radius, 0])
            cylinder(h=h, r=shell_corner_radius, $fn=32);
        // Top-right corner
        translate([shell_width - shell_corner_radius, shell_height - shell_corner_radius, 0])
            cylinder(h=h, r=shell_corner_radius, $fn=32);
        // Bottom-left corner
        translate([shell_corner_radius, shell_corner_radius, 0])
            cylinder(h=h, r=shell_corner_radius, $fn=32);
        // Bottom-right corner - larger radius for DMG style curve
        translate([shell_width - 12, 12, 0])
            cylinder(h=h, r=12, $fn=48);
    }
}

// -----------------------------------------------------------------------------
// DMG-style interior cavity
// -----------------------------------------------------------------------------
module dmg_interior_cavity_back(h) {
    inset = shell_wall;
    hull() {
        translate([shell_corner_radius, shell_height - shell_corner_radius, 0])
            cylinder(h=h, r=shell_corner_radius - inset, $fn=32);
        translate([shell_width - shell_corner_radius, shell_height - shell_corner_radius, 0])
            cylinder(h=h, r=shell_corner_radius - inset, $fn=32);
        translate([shell_corner_radius, shell_corner_radius, 0])
            cylinder(h=h, r=shell_corner_radius - inset, $fn=32);
        translate([shell_width - 12, 12, 0])
            cylinder(h=h, r=12 - inset, $fn=48);
    }
}

// -----------------------------------------------------------------------------
// Back Shell Main Module
// Screws enter from outside back, thread into bosses in front shell
// -----------------------------------------------------------------------------
module back_shell() {
    difference() {
        union() {
            // Outer shell body - DMG style
            dmg_shell_outline_back(shell_depth_back);

            // Overlap lip (extends up to mate with front shell)
            translate([0, 0, shell_depth_back - 0.01])
            hull() {
                translate([shell_corner_radius, shell_height - shell_corner_radius, 0])
                    cylinder(h=shell_overlap, r=shell_corner_radius - shell_wall - shell_overlap_clearance, $fn=32);
                translate([shell_width - shell_corner_radius, shell_height - shell_corner_radius, 0])
                    cylinder(h=shell_overlap, r=shell_corner_radius - shell_wall - shell_overlap_clearance, $fn=32);
                translate([shell_corner_radius, shell_corner_radius, 0])
                    cylinder(h=shell_overlap, r=shell_corner_radius - shell_wall - shell_overlap_clearance, $fn=32);
                translate([shell_width - 12, 12, 0])
                    cylinder(h=shell_overlap, r=12 - shell_wall - shell_overlap_clearance, $fn=48);
            }
        }

        // Interior cavity - DMG style
        translate([0, 0, shell_wall])
            dmg_interior_cavity_back(shell_depth_back + shell_overlap);

        // USB cutout (left edge - for horizontal ESP32)
        // ESP32 horizontal: y = 4 to 4+22.7 = 26.7, center at y ≈ 15.35
        usb_cutout_y = 4 + esp32_width/2;  // Centered on ESP32 height
        translate([-0.1, usb_cutout_y - usb_cutout_width/2, shell_wall])
            cube([shell_wall + 0.2, usb_cutout_width, usb_cutout_height]);

        // Screw holes with countersinks (screws go through back into front shell bosses)
        // Bottom screws moved up to Y=28 to clear horizontal ESP32 (ends at Y=26.7)
        screw_positions = [
            [screw_inset_x, 28],                                         // Bottom-left (above ESP32)
            [shell_width - screw_inset_x, 28],                           // Bottom-right (above ESP32)
            [screw_inset_x, shell_height - screw_inset_y],               // Top-left
            [shell_width - screw_inset_x, shell_height - screw_inset_y]  // Top-right
        ];

        for (pos = screw_positions) {
            // Through hole for screw shaft
            translate([pos[0], pos[1], -0.1])
                cylinder(h=shell_depth_back + shell_overlap + 0.2, d=2.4, $fn=16);
            // Countersink on outside of back shell
            translate([pos[0], pos[1], -0.1])
                cylinder(h=screw_head_depth + 0.1, d=screw_head_diameter, $fn=16);
        }
    }

    // ----- Internal Features -----

    // ESP32 mounted HORIZONTALLY at bottom (rotated 90°)
    // This places it below all button switches
    // Board: 51mm wide x 22.7mm tall when rotated
    esp32_rot_width = esp32_length;   // 51mm (now horizontal)
    esp32_rot_height = esp32_width;   // 22.7mm (now vertical)
    esp32_rot_x = (shell_width - esp32_rot_width) / 2;  // Centered: ~6.5mm
    esp32_rot_y = 4;  // Near bottom edge

    esp32_standoff_d = 3;

    // Four corner standoffs for horizontal ESP32
    // Bottom-left
    translate([esp32_rot_x + 3, esp32_rot_y + 3, shell_wall])
        cylinder(h=esp32_standoff_height, d=esp32_standoff_d, $fn=16);
    // Bottom-right
    translate([esp32_rot_x + esp32_rot_width - 3, esp32_rot_y + 3, shell_wall])
        cylinder(h=esp32_standoff_height, d=esp32_standoff_d, $fn=16);
    // Top-left
    translate([esp32_rot_x + 3, esp32_rot_y + esp32_rot_height - 3, shell_wall])
        cylinder(h=esp32_standoff_height, d=esp32_standoff_d, $fn=16);
    // Top-right
    translate([esp32_rot_x + esp32_rot_width - 3, esp32_rot_y + esp32_rot_height - 3, shell_wall])
        cylinder(h=esp32_standoff_height, d=esp32_standoff_d, $fn=16);

    // Battery pocket retaining lips
    // Left lip
    translate([battery_x - battery_lip_width, battery_y + 5, shell_wall])
        cube([battery_lip_width, battery_length - 10, battery_height + battery_lip_height]);
    // Right lip
    translate([battery_x + battery_width, battery_y + 5, shell_wall])
        cube([battery_lip_width, battery_length - 10, battery_height + battery_lip_height]);
    // Top lip
    translate([battery_x + 5, battery_y + battery_length, shell_wall])
        cube([battery_width - 10, battery_lip_width, battery_height + battery_lip_height]);

    // D-pad switch platform
    translate([dpad_center_x - tact_switch_size/2 - 1,
               dpad_center_y - tact_switch_size/2 - 1,
               shell_wall]) {
        difference() {
            cube([tact_switch_size + 2, tact_switch_size + 2, 3]);
            // Switch pocket
            translate([1, 1, 1])
                cube([tact_switch_size + tolerance_tight,
                      tact_switch_size + tolerance_tight,
                      3]);
        }
    }

    // A button switch mount (direct mount - no separate plate needed)
    translate([button_a_x - tact_switch_size/2 - 1,
               button_a_y - tact_switch_size/2 - 1,
               shell_wall]) {
        difference() {
            cube([tact_switch_size + 2, tact_switch_size + 2, 3]);
            // Switch pocket
            translate([1, 1, 1])
                cube([tact_switch_size + tolerance_tight,
                      tact_switch_size + tolerance_tight,
                      3]);
        }
    }

    // B button switch mount (direct mount)
    translate([button_b_x - tact_switch_size/2 - 1,
               button_b_y - tact_switch_size/2 - 1,
               shell_wall]) {
        difference() {
            cube([tact_switch_size + 2, tact_switch_size + 2, 3]);
            // Switch pocket
            translate([1, 1, 1])
                cube([tact_switch_size + tolerance_tight,
                      tact_switch_size + tolerance_tight,
                      3]);
        }
    }

    // Wire routing channel (connects battery area to ESP32)
    translate([battery_x + battery_width - 5, esp32_y + esp32_length, shell_wall])
        cube([8, battery_y - esp32_y - esp32_length, 2]);
}

// Preview (renders when opening this file directly)
color(color_shell_back) back_shell();
