// =============================================================================
// ESP32 Feather HUZZAH32 - Reference Model
// For fitment verification only - not for printing
// =============================================================================

// Include parameters (safe to include multiple times)
include <../parameters.scad>

module esp32_feather() {
    color(color_pcb) {
        // Main PCB
        cube([esp32_width, esp32_length, 1.6]);

        // Components on top (simplified block)
        translate([1, 5, 1.6])
            cube([esp32_width - 2, esp32_length - 10, esp32_height - 1.6]);

        // USB-C port (extending from one end)
        translate([(esp32_width - esp32_usb_width) / 2, -esp32_usb_protrusion, 1.6])
            cube([esp32_usb_width, esp32_usb_protrusion + 2, esp32_usb_height]);

        // JST battery connector (opposite end from USB)
        translate([esp32_width - 8, esp32_length - 3, 1.6])
            cube([6, 3, 3]);
    }
}

// Preview (renders when opening this file directly)
esp32_feather();
