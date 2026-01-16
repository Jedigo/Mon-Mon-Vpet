// =============================================================================
// 6x6mm Tactile Switch - Reference Model
// For fitment verification only - not for printing
// =============================================================================

// Include parameters (safe to include multiple times)
include <../parameters.scad>

module tact_switch_6x6() {
    // Base body
    color([0.1, 0.1, 0.1])
    cube([tact_switch_size, tact_switch_size, tact_switch_height - tact_switch_button_height]);

    // Clickable button on top
    color([0.9, 0.9, 0.85])
    translate([tact_switch_size/2, tact_switch_size/2, tact_switch_height - tact_switch_button_height])
        cylinder(h=tact_switch_button_height, d=3.5, $fn=16);

    // Legs (simplified)
    color([0.8, 0.8, 0.8])
    for (x = [0.5, tact_switch_size - 0.5])
        for (y = [0, tact_switch_size]) {
            translate([x, y - 0.25, -2])
                cube([0.5, 0.5, 2]);
        }
}

// Preview (renders when opening this file directly)
tact_switch_6x6();
