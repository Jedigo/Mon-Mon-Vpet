// =============================================================================
// Mon-Mon Gen 3 - Front Shell
// DMG Game Boy inspired design at 71% scale
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
module dmg_shell_outline(h) {
    // Main body with standard corners, then add the distinctive DMG curve
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
// DMG-style interior cavity (matches shell outline)
// -----------------------------------------------------------------------------
module dmg_interior_cavity(h) {
    inset = shell_wall;
    hull() {
        // Top-left
        translate([shell_corner_radius, shell_height - shell_corner_radius, 0])
            cylinder(h=h, r=shell_corner_radius - inset, $fn=32);
        // Top-right
        translate([shell_width - shell_corner_radius, shell_height - shell_corner_radius, 0])
            cylinder(h=h, r=shell_corner_radius - inset, $fn=32);
        // Bottom-left
        translate([shell_corner_radius, shell_corner_radius, 0])
            cylinder(h=h, r=shell_corner_radius - inset, $fn=32);
        // Bottom-right - larger radius curve
        translate([shell_width - 12, 12, 0])
            cylinder(h=h, r=12 - inset, $fn=48);
    }
}

// -----------------------------------------------------------------------------
// Speaker Grille Slots (DMG-style diagonal)
// Original Game Boy has 6 diagonal slots visible, but only 5 cut through!
// Slots are pill-shaped (rounded ends) and arranged diagonally
// -----------------------------------------------------------------------------
module speaker_grille_slots() {
    // DMG-style: 6 slots total, only 5 cut through (slot index 0 is decorative)
    slot_w = 1.0;      // Slot width
    slot_len = 5.5;    // Slot length
    slot_spacing_x = 2.0;  // Horizontal spacing between slots
    slot_spacing_y = 1.0;  // Vertical stagger per slot (creates diagonal line)

    for (i = [0 : 5]) {
        x_pos = i * slot_spacing_x;
        y_pos = i * slot_spacing_y;

        // Only slots 1-5 cut through (i > 0), slot 0 is decorative (shallow)
        cut_depth = (i > 0) ? shell_depth_front + 1 : 1.0;

        translate([x_pos, y_pos, 0])
        rotate([0, 0, speaker_slot_angle])
        // Pill-shaped slot
        hull() {
            translate([0, 0, 0])
                cylinder(h=cut_depth, d=slot_w, $fn=12);
            translate([0, slot_len, 0])
                cylinder(h=cut_depth, d=slot_w, $fn=12);
        }
    }
}

// -----------------------------------------------------------------------------
// D-Pad Opening (cross shape)
// -----------------------------------------------------------------------------
module dpad_opening() {
    clearance = dpad_hole_clearance;
    arm = dpad_arm_width + clearance * 2;
    size = dpad_size + clearance * 2;

    // Horizontal arm
    translate([-size/2, -arm/2, 0])
        cube([size, arm, shell_depth_front + 1]);

    // Vertical arm
    translate([-arm/2, -size/2, 0])
        cube([arm, size, shell_depth_front + 1]);
}

// -----------------------------------------------------------------------------
// Select/Start Decorative Bumps
// -----------------------------------------------------------------------------
module select_start_bumps() {
    // SELECT (left)
    translate([-select_start_spacing/2, 0, 0])
    hull() {
        translate([-select_start_width/2 + select_start_height/2, 0, 0])
            cylinder(h=select_start_depth, d=select_start_height, $fn=16);
        translate([select_start_width/2 - select_start_height/2, 0, 0])
            cylinder(h=select_start_depth, d=select_start_height, $fn=16);
    }

    // START (right)
    translate([select_start_spacing/2, 0, 0])
    hull() {
        translate([-select_start_width/2 + select_start_height/2, 0, 0])
            cylinder(h=select_start_depth, d=select_start_height, $fn=16);
        translate([select_start_width/2 - select_start_height/2, 0, 0])
            cylinder(h=select_start_depth, d=select_start_height, $fn=16);
    }
}

// -----------------------------------------------------------------------------
// Mon-Mon Branding - Inlay system for multi-color printing
// Positioned upper-left of screen like reference image
// -----------------------------------------------------------------------------

// Shared parameters for inlay system
inlay_depth = 0.4;  // 2 layers at 0.2mm
inlay_tolerance = 0.1;  // Slight undersize for press fit
brand_dot_x = 7;  // Dot comes first (left side)
brand_text_x = brand_dot_x + 4;  // Text after dot
brand_text_y = screen_center_y + screen_window_height/2 + 4;

// Pocket cut into front shell (slightly oversized)
module brand_inlay_pocket() {
    // Red dot pocket (left side)
    translate([brand_dot_x, brand_text_y, shell_depth_front - inlay_depth + 0.01])
        cylinder(h=inlay_depth, d=2, $fn=16);

    // "Mon-Mon" text pocket (right of dot)
    translate([brand_text_x, brand_text_y, shell_depth_front - inlay_depth + 0.01])
    linear_extrude(height=inlay_depth)
    text("Mon-Mon", size=3.5, halign="left", valign="center",
         font="Liberation Sans:style=Bold");
}

// Text inlay piece - print in BLACK, glue into pocket
module brand_text_inlay() {
    linear_extrude(height=inlay_depth - 0.05)
    offset(r=-inlay_tolerance)  // Slightly smaller for fit
    text("Mon-Mon", size=3.5, halign="left", valign="center",
         font="Liberation Sans:style=Bold");
}

// Dot inlay piece - print in RED, glue into pocket
module brand_dot_inlay() {
    cylinder(h=inlay_depth - 0.05, d=2 - inlay_tolerance*2, $fn=16);
}

// -----------------------------------------------------------------------------
// Front Shell Main Module
// DMG-accurate design: clean front face, screws enter from back
// -----------------------------------------------------------------------------
module front_shell() {
    difference() {
        // Outer shell body - DMG style with curved bottom-right
        // Flat front for easy face-down printing
        dmg_shell_outline(shell_depth_front);

        // ----- Cutouts -----

        // Mon-Mon branding inlay pocket (for AMS multi-color)
        brand_inlay_pocket();

        // Interior cavity - DMG style
        translate([0, 0, -0.01])
            dmg_interior_cavity(shell_depth_front - shell_wall + 0.02);

        // Overlap pocket (receives lip from back shell)
        translate([0, 0, -0.01])
        hull() {
            // Match DMG outline but slightly larger for overlap clearance
            translate([shell_corner_radius, shell_height - shell_corner_radius, 0])
                cylinder(h=shell_overlap + 0.02, r=shell_corner_radius - shell_wall + shell_overlap_clearance, $fn=32);
            translate([shell_width - shell_corner_radius, shell_height - shell_corner_radius, 0])
                cylinder(h=shell_overlap + 0.02, r=shell_corner_radius - shell_wall + shell_overlap_clearance, $fn=32);
            translate([shell_corner_radius, shell_corner_radius, 0])
                cylinder(h=shell_overlap + 0.02, r=shell_corner_radius - shell_wall + shell_overlap_clearance, $fn=32);
            translate([shell_width - 12, 12, 0])
                cylinder(h=shell_overlap + 0.02, r=12 - shell_wall + shell_overlap_clearance, $fn=48);
        }

        // Screen window opening (clean rectangular cut)
        translate([screen_center_x - screen_window_width/2,
                   screen_center_y - screen_window_height/2,
                   -0.1])
            cube([screen_window_width, screen_window_height, shell_depth_front + 1]);

        // D-pad opening
        translate([dpad_center_x, dpad_center_y, -0.1])
            dpad_opening();

        // A button hole
        translate([button_a_x, button_a_y, -0.1])
            cylinder(h=shell_depth_front + 1,
                    d=button_diameter + button_hole_clearance*2,
                    $fn=32);

        // B button hole
        translate([button_b_x, button_b_y, -0.1])
            cylinder(h=shell_depth_front + 1,
                    d=button_diameter + button_hole_clearance*2,
                    $fn=32);

        // Speaker grille (DMG style: 6 slots, only 5 cut through)
        translate([speaker_grille_x - 6,
                   speaker_grille_y - 4,
                   -0.1])
            speaker_grille_slots();

        // Select/Start indents (DMG has subtle pill-shaped indents, not bumps)
        translate([shell_width/2 - select_start_spacing/2, select_start_y, shell_depth_front - 0.5])
        hull() {
            translate([0, 0, 0]) cylinder(h=0.6, d=3, $fn=16);
            translate([select_start_width - 3, 0, 0]) cylinder(h=0.6, d=3, $fn=16);
        }
        translate([shell_width/2 + select_start_spacing/2 - select_start_width + 3, select_start_y, shell_depth_front - 0.5])
        hull() {
            translate([0, 0, 0]) cylinder(h=0.6, d=3, $fn=16);
            translate([select_start_width - 3, 0, 0]) cylinder(h=0.6, d=3, $fn=16);
        }
    }

    // ----- Internal Features -----
    // Note: Interior ceiling is at Z = shell_depth_front - shell_wall
    // Features hang down from there into the cavity

    interior_z = shell_depth_front - shell_wall;  // 9.5mm - inside of exterior face

    // Screw bosses (receive screws from back shell - keeps front face clean!)
    // Bottom screws moved up to Y=28 to clear horizontal ESP32
    screw_positions = [
        [screw_inset_x, 28],                                         // Bottom-left (above ESP32)
        [shell_width - screw_inset_x, 28],                           // Bottom-right (above ESP32)
        [screw_inset_x, shell_height - screw_inset_y],               // Top-left
        [shell_width - screw_inset_x, shell_height - screw_inset_y]  // Top-right
    ];

    screw_boss_height = 6;  // Height of boss extending into cavity

    for (pos = screw_positions) {
        translate([pos[0], pos[1], interior_z - screw_boss_height])
        difference() {
            cylinder(h=screw_boss_height, d=screw_post_outer_diameter, $fn=24);
            translate([0, 0, -0.1])
                cylinder(h=screw_boss_height + 0.2, d=screw_post_inner_diameter, $fn=16);
        }
    }

    // Display mounting ledges (adjustable slots)
    // Bottom ledge
    translate([screen_center_x - display_pcb_width_max/2 - 2,
               screen_center_y - screen_window_height/2 - display_ledge_depth - 3,
               interior_z - display_ledge_height]) {
        cube([display_pcb_width_max + 4, display_ledge_depth, display_ledge_height]);
    }

    // Top ledge
    translate([screen_center_x - display_pcb_width_max/2 - 2,
               screen_center_y + screen_window_height/2 + 3,
               interior_z - display_ledge_height]) {
        cube([display_pcb_width_max + 4, display_ledge_depth, display_ledge_height]);
    }

    // Side ledges (shorter, allow variance)
    // Left
    translate([screen_center_x - display_pcb_width_max/2 - display_ledge_depth - 2,
               screen_center_y - display_pcb_height_min/2,
               interior_z - display_ledge_height]) {
        cube([display_ledge_depth, display_pcb_height_min, display_ledge_height]);
    }

    // Right
    translate([screen_center_x + display_pcb_width_max/2 + 2,
               screen_center_y - display_pcb_height_min/2,
               interior_z - display_ledge_height]) {
        cube([display_ledge_depth, display_pcb_height_min, display_ledge_height]);
    }

    // Button guide walls (keep A/B buttons aligned)
    button_guide_height = 4;

    // A button guide
    translate([button_a_x, button_a_y, interior_z - button_guide_height])
    difference() {
        cylinder(h=button_guide_height, d=button_diameter + 3, $fn=32);
        translate([0, 0, -0.1])
            cylinder(h=button_guide_height + 0.2, d=button_diameter + button_hole_clearance*2 + 0.5, $fn=32);
    }

    // B button guide
    translate([button_b_x, button_b_y, interior_z - button_guide_height])
    difference() {
        cylinder(h=button_guide_height, d=button_diameter + 3, $fn=32);
        translate([0, 0, -0.1])
            cylinder(h=button_guide_height + 0.2, d=button_diameter + button_hole_clearance*2 + 0.5, $fn=32);
    }

    // D-pad guide walls
    dpad_guide_height = 3;
    translate([dpad_center_x - (dpad_size + 4)/2,
               dpad_center_y - (dpad_size + 4)/2,
               interior_z - dpad_guide_height]) {
        difference() {
            // Outer wall
            cube([dpad_size + 4, dpad_size + 4, dpad_guide_height]);
            // Inner cutout (cross shape)
            translate([(dpad_size + 4)/2 - (dpad_size + 1)/2,
                       (dpad_size + 4)/2 - (dpad_arm_width + 1)/2,
                       -0.1])
                cube([dpad_size + 1, dpad_arm_width + 1, dpad_guide_height + 0.2]);
            translate([(dpad_size + 4)/2 - (dpad_arm_width + 1)/2,
                       (dpad_size + 4)/2 - (dpad_size + 1)/2,
                       -0.1])
                cube([dpad_arm_width + 1, dpad_size + 1, dpad_guide_height + 0.2]);
        }
    }

    // Piezo mount ring (behind speaker grille)
    translate([speaker_grille_x, speaker_grille_y, interior_z - piezo_height])
    difference() {
        cylinder(h=piezo_height, d=piezo_diameter + piezo_mount_ring_thickness*2, $fn=32);
        translate([0, 0, -0.1])
            cylinder(h=piezo_height + 0.2, d=piezo_diameter + tolerance_tight*2, $fn=32);
    }
}

// Preview (renders when opening this file directly)
color(color_shell_front) front_shell();
