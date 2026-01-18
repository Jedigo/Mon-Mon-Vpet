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
use <screen_bezel.scad>
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
// Options: "none", "front_shell", "back_shell", "screen_bezel", "dpad",
//          "button_a", "button_b"
//
// === AMS MULTI-COLOR PRINTING (Bambu) ===
// RECOMMENDED: Use "front_shell_combined" and color painting:
//   1. Export "front_shell_combined" (shell + bezel + pills as one STL)
//   2. Import into Bambu Studio
//   3. Use color painting to paint bezel and pills a different color
//   4. Slice and print
//
// Alternative (separate parts - may have alignment issues):
//   "front_shell", "inlay_dark_combined", "bezel_ams"
render_part = "none";

// Visualization toggles (only apply when render_part = "none")
show_exploded = false;        // Exploded view
show_cross_section = false;   // Cross-section view
show_internal_components = true;  // Show ESP32, battery, display, etc.
show_buttons = true;          // Show button plungers

// Explode distance
explode_z = show_exploded ? 25 : 0;
explode_buttons = show_exploded ? 10 : 0;
explode_bezel = show_exploded ? 15 : 0;

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

    // ----- SCREEN BEZEL -----
    // Separate piece for multi-color printing (dark gray/black)
    translate([0, 0, shell_depth_back + explode_bezel])
    color([0.3, 0.3, 0.35])
    screen_bezel_positioned();

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

if (render_part == "front_shell_combined") {
    // AMS: Shell + bezel + pills as SEPARATE meshes in one STL
    // FLIPPED for face-down printing (exterior at Z=0)
    // In Bambu Studio: Right-click → Split to Parts → assign colors
    translate([0, shell_height, shell_depth_front])
    rotate([180, 0, 0]) {
        front_shell();
        // Bezel and pills slightly inset (no overlap) so they stay separate meshes
        screen_bezel_ams_positioned();
        dark_inlays_combined();
    }
}
else if (render_part == "front_shell") {
    // Export front shell only (without bezel/pills) - FLIPPED for face-down printing
    translate([0, shell_height, shell_depth_front])
    rotate([180, 0, 0])
    front_shell();
}
else if (render_part == "back_shell") {
    // Export back shell - print inside face up
    back_shell();
}
else if (render_part == "screen_bezel") {
    // Export standalone screen bezel (for gluing, not AMS)
    screen_bezel();
}
else if (render_part == "bezel_ams") {
    // Export screen bezel for AMS - FLIPPED to match front_shell
    // Includes anchor points at shell corners so bounding box matches front_shell
    // This ensures Bambu Studio aligns them correctly when using Add Part
    translate([0, shell_height, shell_depth_front])
    rotate([180, 0, 0]) {
        screen_bezel_ams_positioned();
        // Tiny anchor points at shell corners (invisible but set bounding box)
        for (pos = [[0.1, 0.1], [shell_width-0.1, 0.1],
                    [0.1, shell_height-0.1], [shell_width-0.1, shell_height-0.1]]) {
            translate([pos[0], pos[1], shell_depth_front - 0.05])
                cube([0.1, 0.1, 0.05]);
        }
    }
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
// ----- AMS Flush Inlays -----
// All inlays are FLIPPED to match the flipped front_shell for face-down AMS printing
// Both shell exterior and inlays end up at Z=0
else if (render_part == "inlay_virtual_pet") {
    // VIRTUAL PET SYSTEM text - print in dark color
    translate([0, shell_height, shell_depth_front])
    rotate([180, 0, 0])
    virtual_pet_text_inlay();
}
else if (render_part == "inlay_select_text") {
    // SELECT text - print in dark color
    translate([0, shell_height, shell_depth_front])
    rotate([180, 0, 0])
    select_text_inlay();
}
else if (render_part == "inlay_start_text") {
    // START text - print in dark color
    translate([0, shell_height, shell_depth_front])
    rotate([180, 0, 0])
    start_text_inlay();
}
else if (render_part == "inlay_select_pill") {
    // SELECT pill shape - print in dark color
    translate([0, shell_height, shell_depth_front])
    rotate([180, 0, 0])
    select_pill_inlay();
}
else if (render_part == "inlay_start_pill") {
    // START pill shape - print in dark color
    translate([0, shell_height, shell_depth_front])
    rotate([180, 0, 0])
    start_pill_inlay();
}
else if (render_part == "inlay_dark_combined") {
    // All dark-colored inlays combined into one STL
    // FLIPPED to match front_shell for face-down AMS printing
    // Includes anchor points at shell corners so bounding box matches front_shell
    translate([0, shell_height, shell_depth_front])
    rotate([180, 0, 0]) {
        dark_inlays_combined();
        // Tiny anchor points at shell corners (invisible but set bounding box)
        for (pos = [[0.1, 0.1], [shell_width-0.1, 0.1],
                    [0.1, shell_height-0.1], [shell_width-0.1, shell_height-0.1]]) {
            translate([pos[0], pos[1], shell_depth_front - 0.05])
                cube([0.1, 0.1, 0.05]);
        }
    }
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
echo("STL EXPORT OPTIONS:");
echo("");
echo("=== AMS MULTI-COLOR (Bambu) ===");
echo("  1. Export: front_shell");
echo("  2. Export: inlay_dark_combined (pills)");
echo("  3. Export: bezel_ams (screen frame)");
echo("  4. Bambu: Import shell, Add Parts");
echo("");
echo("=== SINGLE COLOR PARTS ===");
echo("  front_shell, back_shell, screen_bezel");
echo("  dpad, button_a, button_b");
echo("");
echo("WORKFLOW: Design > Render (F6), File > Export > STL");
echo("===========================================");
