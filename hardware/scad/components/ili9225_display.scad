// =============================================================================
// ILI9225 2.0" TFT Display - Reference Model
// For fitment verification only - not for printing
// Dimensions are estimates - actual module may vary
// =============================================================================

// Include parameters (safe to include multiple times)
include <../parameters.scad>

// Typical ILI9225 module dimensions (may vary by manufacturer)
display_module_width = 50;    // PCB width
display_module_height = 38;   // PCB height
display_module_pcb_thick = 1.6;

// Active display area
display_active_width = 40;    // Visible screen width (landscape)
display_active_height = 32;   // Visible screen height
display_glass_thick = 2.5;    // Glass + components above PCB

// Backlight/driver board below
display_back_thick = 2.0;

module ili9225_display() {
    // PCB
    color(color_pcb)
    cube([display_module_width, display_module_height, display_module_pcb_thick]);

    // Display assembly on top
    translate([(display_module_width - display_active_width) / 2,
               (display_module_height - display_active_height) / 2,
               display_module_pcb_thick]) {

        // Metal frame around display
        color([0.7, 0.7, 0.7])
        difference() {
            cube([display_active_width + 2, display_active_height + 2, display_glass_thick]);
            translate([1, 1, 0.5])
                cube([display_active_width, display_active_height, display_glass_thick]);
        }

        // Display glass (dark when off)
        translate([1, 1, 0.3])
        color([0.1, 0.1, 0.12])
            cube([display_active_width, display_active_height, 0.5]);
    }

    // Header pins (bottom edge, typical)
    color([0.2, 0.2, 0.2])
    translate([5, -2.5, -2.5])
        cube([display_module_width - 10, 2.5, 2.5 + display_module_pcb_thick]);
}

// Preview (renders when opening this file directly)
ili9225_display();
