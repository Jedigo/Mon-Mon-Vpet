// =============================================================================
// Piezo Buzzer PS1240 - Reference Model
// For fitment verification only - not for printing
// =============================================================================

// Include parameters (safe to include multiple times)
include <../parameters.scad>

module piezo_buzzer() {
    color([0.1, 0.1, 0.1]) {
        // Main cylindrical body
        cylinder(h=piezo_height, d=piezo_diameter, $fn=36);

        // Sound emission hole pattern on top
        translate([0, 0, piezo_height - 0.1])
        difference() {
            cylinder(h=0.2, d=piezo_diameter, $fn=36);
            for (i = [0:5]) {
                rotate([0, 0, i * 60])
                translate([piezo_diameter/4, 0, -0.1])
                    cylinder(h=0.4, d=1.5, $fn=12);
            }
        }
    }

    // Wire leads
    color([1, 0, 0])
    translate([-2, 0, 0])
        cylinder(h=0.5, d=0.8, $fn=8);

    color([0, 0, 0])
    translate([2, 0, 0])
        cylinder(h=0.5, d=0.8, $fn=8);
}

// Preview (renders when opening this file directly)
piezo_buzzer();
