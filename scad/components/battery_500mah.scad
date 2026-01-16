// =============================================================================
// 500mAh LiPo Battery - Reference Model
// Adafruit product 1578 or equivalent
// For fitment verification only - not for printing
// =============================================================================

// Include parameters (safe to include multiple times)
include <../parameters.scad>

module battery_500mah() {
    color(color_battery) {
        // Main battery pouch
        cube([battery_width, battery_length, battery_height]);

        // JST connector and wires (one end)
        translate([battery_width/2 - 3, -5, battery_height/2 - 1])
            cube([6, 7, 2]);

        // Wires
        color([1, 0, 0])
        translate([battery_width/2 - 2, -8, battery_height/2])
            cylinder(h=1, d=1.5, $fn=12);

        color([0, 0, 0])
        translate([battery_width/2 + 2, -8, battery_height/2])
            cylinder(h=1, d=1.5, $fn=12);
    }
}

// Preview (renders when opening this file directly)
battery_500mah();
