// =============================================================================
// Mon-Mon Gen 3 - Main Assembly
// Virtual Pet Device - DMG Game Boy Style
// =============================================================================
//
// USAGE:
//   - Open this file in OpenSCAD
//   - Toggle visualization options below
//   - Use render_part to export individual STLs
//
// =============================================================================

include <parameters.scad>
use <front_shell.scad>
use <back_shell.scad>
use <buttons.scad>
use <components/esp32_feather.scad>
use <components/ili9225_display.scad>
use <components/battery_500mah.scad>
use <components/piezo_buzzer.scad>
use <components/tact_switch.scad>

// -----------------------------------------------------------------------------
// RENDER OPTIONS - Change these to control what's displayed
// -----------------------------------------------------------------------------

// Which part to render for STL export (set to "none" for full assembly)
// Options: "none", "front_shell", "back_shell", "dpad", "button_a", "button_b",
//          "text_inlay", "dot_inlay"
render_part = "none";

// Visualization toggles (only apply when render_part = "none")
show_exploded = false;        // Exploded view
show_cross_section = false;   // Cross-section view
show_internal_components = true;  // Show ESP32, battery, display, etc.
show_buttons = true;          // Show button plungers

// Explode distance
explode_z = show_exploded ? 25 : 0;
explode_buttons = show_exploded ? 10 : 0;

// -----------------------------------------------------------------------------
// ASSEMBLY
// -----------------------------------------------------------------------------

module full_assembly() {

    // ----- BACK SHELL -----
    color(color_shell_back)
    back_shell();

    // ----- FRONT SHELL -----
    // Positioned on top with exterior (flat side) facing UP
    // Interior faces down toward back shell
    translate([0, 0, shell_depth_back + explode_z])
    color(color_shell_front)
    front_shell();

    // ----- INTERNAL COMPONENTS -----
    if (show_internal_components) {
        // Battery
        translate([battery_x, battery_y, shell_wall + 0.5])
            battery_500mah();

        // ESP32 Feather - HORIZONTAL orientation (rotated 90°)
        // Positioned at bottom of shell, below all buttons
        esp32_horiz_x = (shell_width - esp32_length) / 2;  // ~6.5mm centered
        esp32_horiz_y = 4;
        translate([esp32_horiz_x + esp32_length, esp32_horiz_y, shell_wall + esp32_standoff_height])
        rotate([0, 0, 90])
            esp32_feather();

        // Display (in front shell, screen facing up through window)
        translate([screen_center_x - 25,
                   screen_center_y - 19,
                   shell_depth_back + shell_depth_front - shell_wall - 4 + explode_z])
            ili9225_display();

        // Piezo (behind speaker grille in front shell)
        translate([speaker_grille_x,
                   speaker_grille_y,
                   shell_depth_back + shell_depth_front - shell_wall - piezo_height + explode_z])
            piezo_buzzer();

        // D-pad tact switch
        translate([dpad_center_x - tact_switch_size/2,
                   dpad_center_y - tact_switch_size/2,
                   shell_wall + 1])
            tact_switch_6x6();

        // A button tact switch (direct mount in back shell)
        translate([button_a_x - tact_switch_size/2,
                   button_a_y - tact_switch_size/2,
                   shell_wall + 1])
            tact_switch_6x6();

        // B button tact switch (direct mount in back shell)
        translate([button_b_x - tact_switch_size/2,
                   button_b_y - tact_switch_size/2,
                   shell_wall + 1])
            tact_switch_6x6();
    }

    // ----- BUTTONS -----
    if (show_buttons) {
        // D-pad (sits in front shell opening, cap faces up)
        translate([dpad_center_x,
                   dpad_center_y,
                   shell_depth_back + shell_depth_front - shell_wall + explode_z + explode_buttons])
            dpad();

        // A button (cap faces up)
        translate([button_a_x,
                   button_a_y,
                   shell_depth_back + shell_depth_front - shell_wall + explode_z + explode_buttons])
            button_a();

        // B button (cap faces up)
        translate([button_b_x,
                   button_b_y,
                   shell_depth_back + shell_depth_front - shell_wall + explode_z + explode_buttons])
            button_b();
    }
}

// -----------------------------------------------------------------------------
// CROSS SECTION VIEW
// -----------------------------------------------------------------------------

module cross_section_view() {
    difference() {
        full_assembly();

        // Cut plane (cuts away front half)
        translate([-1, shell_height/2, -1])
            cube([shell_width + 2, shell_height, shell_depth_total + 50]);
    }
}

// -----------------------------------------------------------------------------
// RENDER LOGIC
// -----------------------------------------------------------------------------

if (render_part == "front_shell") {
    // Export front shell - print face down
    front_shell();
}
else if (render_part == "back_shell") {
    // Export back shell - print inside face up
    back_shell();
}
else if (render_part == "dpad") {
    // Export D-pad - print flat
    dpad();
}
else if (render_part == "button_a") {
    // Export A button - print cap down
    rotate([180, 0, 0])
    translate([0, 0, -button_cap_height])
        button_a();
}
else if (render_part == "button_b") {
    // Export B button - print cap down
    rotate([180, 0, 0])
    translate([0, 0, -button_cap_height])
        button_b();
}
else if (render_part == "text_inlay") {
    // Export text inlay - print in BLACK filament
    brand_text_inlay();
}
else if (render_part == "dot_inlay") {
    // Export dot inlay - print in RED filament
    brand_dot_inlay();
}
else {
    // Full assembly view
    if (show_cross_section) {
        cross_section_view();
    } else {
        full_assembly();
    }
}

// -----------------------------------------------------------------------------
// INFO
// -----------------------------------------------------------------------------
echo("===========================================");
echo("Mon-Mon Gen 3 - Virtual Pet Device");
echo("===========================================");
echo(str("Shell size: ", shell_width, " x ", shell_height, " x ", shell_depth_total, " mm"));
echo(str("Render part: ", render_part));
echo(str("Exploded view: ", show_exploded));
echo(str("Cross section: ", show_cross_section));
echo("===========================================");
echo("To export STL, set render_part to one of:");
echo("  front_shell, back_shell, dpad, button_a, button_b");
echo("  text_inlay (BLACK), dot_inlay (RED)");
echo("Then: Design > Render (F6), File > Export > STL");
echo("===========================================");
