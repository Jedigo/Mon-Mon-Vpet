// =============================================================================
// Mon-Mon Gen 3 - Front Shell
// DMG Game Boy inspired design at 71% scale
// =============================================================================

// Include parameters (safe to include multiple times)
include <parameters.scad>
use <screen_bezel.scad>

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
// DMG-style shell outline with filleted/rounded exterior edges for comfort
// Only rounds the TOP edge (exterior face), keeps bottom edge sharp for shell seam
// -----------------------------------------------------------------------------
module dmg_shell_outline_filleted(h) {
    fillet = shell_fillet_radius;

    // Main body with sharp edges (up to fillet height from top)
    dmg_shell_outline(h - fillet);

    // Rounded top cap
    translate([0, 0, h - fillet])
    minkowski() {
        // Flat disc version of the outline
        linear_extrude(height=0.01)
        hull() {
            translate([shell_corner_radius, shell_height - shell_corner_radius])
                circle(r=shell_corner_radius - fillet, $fn=32);
            translate([shell_width - shell_corner_radius, shell_height - shell_corner_radius])
                circle(r=shell_corner_radius - fillet, $fn=32);
            translate([shell_corner_radius, shell_corner_radius])
                circle(r=shell_corner_radius - fillet, $fn=32);
            translate([shell_width - 12, 12])
                circle(r=12 - fillet, $fn=48);
        }
        // Half-sphere for top rounding only
        difference() {
            sphere(r=fillet, $fn=16);
            translate([0, 0, -fillet])
                cube([fillet*2, fillet*2, fillet*2], center=true);
        }
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
// AMS Multi-Color Inlay System
// Inlays with anchors that print together with shell for proper adhesion
// -----------------------------------------------------------------------------

// Inlay parameters - surface depth + anchor for reliable AMS printing
inlay_surface_depth = 0.6;  // Visible surface portion (3 layers at 0.2mm)
inlay_anchor_depth = 1.5;   // Anchor extending into shell body
inlay_total_depth = inlay_surface_depth + inlay_anchor_depth;  // 2.1mm total

// AMS clearances - gap keeps parts as separate meshes for Split to Parts
inlay_cutout_clearance = 0.1;   // Shell cutouts slightly larger than base shape
inlay_overlap = -0.05;          // Negative = inlays smaller than cutouts = gap for Split to Parts

// Legacy compatibility
inlay_depth = inlay_surface_depth;
inlay_clearance = inlay_cutout_clearance;

// -----------------------------------------------------------------------------
// AMS Cutouts (pockets in front shell for inlays with anchors)
// These create space for the full inlay depth (surface + anchor)
// -----------------------------------------------------------------------------

// VIRTUAL PET SYSTEM text cutout (full depth for inlay + anchor)
module virtual_pet_text_cutout() {
    translate([screen_center_x,
               screen_center_y - screen_window_height/2 - bezel_margin - 2,
               shell_depth_front - inlay_total_depth])
    linear_extrude(height=inlay_total_depth + 0.1)
    offset(r=inlay_clearance)
    text(bezel_text, size=bezel_text_size, halign="center", valign="top",
         font="Liberation Sans:style=Bold");
}

// SELECT text cutout
module select_text_cutout() {
    translate([shell_width/2 - select_start_spacing/2 + 1.5,
               select_start_y - 3,
               shell_depth_front - inlay_total_depth])
    rotate([0, 0, select_start_angle])
    linear_extrude(height=inlay_total_depth + 0.1)
    offset(r=inlay_clearance)
    text("SELECT", size=select_start_label_size, halign="center", valign="top",
         font="Liberation Sans:style=Bold");
}

// START text cutout
module start_text_cutout() {
    translate([shell_width/2 + select_start_spacing/2 + 1.5,
               select_start_y - 3,
               shell_depth_front - inlay_total_depth])
    rotate([0, 0, select_start_angle])
    linear_extrude(height=inlay_total_depth + 0.1)
    offset(r=inlay_clearance)
    text("START", size=select_start_label_size, halign="center", valign="top",
         font="Liberation Sans:style=Bold");
}

// SELECT pill cutout
module select_pill_cutout() {
    translate([shell_width/2 - select_start_spacing/2, select_start_y, shell_depth_front - inlay_total_depth])
    rotate([0, 0, select_start_angle])
    linear_extrude(height=inlay_total_depth + 0.1)
    offset(r=inlay_clearance)
    hull() {
        translate([-select_start_width/2 + 1.5, 0]) circle(d=3, $fn=24);
        translate([select_start_width/2 - 1.5, 0]) circle(d=3, $fn=24);
    }
}

// START pill cutout
module start_pill_cutout() {
    translate([shell_width/2 + select_start_spacing/2, select_start_y, shell_depth_front - inlay_total_depth])
    rotate([0, 0, select_start_angle])
    linear_extrude(height=inlay_total_depth + 0.1)
    offset(r=inlay_clearance)
    hull() {
        translate([-select_start_width/2 + 1.5, 0]) circle(d=3, $fn=24);
        translate([select_start_width/2 - 1.5, 0]) circle(d=3, $fn=24);
    }
}

// -----------------------------------------------------------------------------
// AMS Inlay Pieces (with anchors for reliable printing)
// These fill the cutouts with:
//   - Surface portion: flush with shell exterior
//   - Anchor portion: extends into shell body for adhesion during printing
// Positioned to match cutouts - mon-mon.scad flips them for face-down printing
// -----------------------------------------------------------------------------

// Z position for inlays - starts at bottom of pocket
inlay_z = shell_depth_front - inlay_total_depth;

// VIRTUAL PET SYSTEM text inlay - print in dark color
// Uses offset to OVERLAP with shell walls for proper AMS slicing
module virtual_pet_text_inlay() {
    translate([screen_center_x,
               screen_center_y - screen_window_height/2 - bezel_margin - 2,
               inlay_z])
    linear_extrude(height=inlay_total_depth)
    offset(r=inlay_overlap)
    text(bezel_text, size=bezel_text_size, halign="center", valign="top",
         font="Liberation Sans:style=Bold");
}

// SELECT text inlay
module select_text_inlay() {
    translate([shell_width/2 - select_start_spacing/2 + 1.5,
               select_start_y - 3,
               inlay_z])
    rotate([0, 0, select_start_angle])
    linear_extrude(height=inlay_total_depth)
    offset(r=inlay_overlap)
    text("SELECT", size=select_start_label_size, halign="center", valign="top",
         font="Liberation Sans:style=Bold");
}

// START text inlay
module start_text_inlay() {
    translate([shell_width/2 + select_start_spacing/2 + 1.5,
               select_start_y - 3,
               inlay_z])
    rotate([0, 0, select_start_angle])
    linear_extrude(height=inlay_total_depth)
    offset(r=inlay_overlap)
    text("START", size=select_start_label_size, halign="center", valign="top",
         font="Liberation Sans:style=Bold");
}

// SELECT pill inlay
// Protrudes 0.1mm ABOVE shell surface so Split to Parts recognizes it as separate
module select_pill_inlay() {
    translate([shell_width/2 - select_start_spacing/2, select_start_y, shell_depth_front - 0.5])
    rotate([0, 0, select_start_angle])
    linear_extrude(height=0.6)  // 0.5mm below surface + 0.1mm above
    offset(r=inlay_overlap)
    hull() {
        translate([-select_start_width/2 + 1.5, 0]) circle(d=3, $fn=24);
        translate([select_start_width/2 - 1.5, 0]) circle(d=3, $fn=24);
    }
}

// START pill inlay
module start_pill_inlay() {
    translate([shell_width/2 + select_start_spacing/2, select_start_y, shell_depth_front - 0.5])
    rotate([0, 0, select_start_angle])
    linear_extrude(height=0.6)  // 0.5mm below surface + 0.1mm above
    offset(r=inlay_overlap)
    hull() {
        translate([-select_start_width/2 + 1.5, 0]) circle(d=3, $fn=24);
        translate([select_start_width/2 - 1.5, 0]) circle(d=3, $fn=24);
    }
}

// Combined inlay for all dark-colored pieces (standalone STL export)
// Export this separately, then Add Part in Bambu Studio
// Text removed - too small for legible FDM printing
module dark_inlays_combined() {
    select_pill_inlay();
    start_pill_inlay();
}

// -----------------------------------------------------------------------------
// Branding Text Below Bezel - REMOVED (now using AMS inlay system above)
// -----------------------------------------------------------------------------
// Old recessed approach replaced by through-hole cutouts for flush AMS printing

// -----------------------------------------------------------------------------
// Bezel Relief Pocket (deep pocket for AMS bezel with anchor)
// -----------------------------------------------------------------------------
module bezel_relief_pocket() {
    // Bezel dimensions (must match screen_bezel module)
    bezel_outer_w = screen_window_width + bezel_margin * 2;
    bezel_outer_h = screen_window_height + bezel_margin * 2;
    relief_depth = 1.6;       // Deep pocket for AMS bezel (0.6 surface + 1.0 anchor)
    relief_clearance = 0.05;  // Minimal clearance - bezel overlaps for AMS

    // Corner radii - must match screen_bezel
    corner_r = bezel_corner_radius;
    corner_r_br = 6;  // Bottom-right slightly larger radius

    // Create pocket slightly larger than bezel footprint
    translate([screen_center_x - bezel_outer_w/2 - relief_clearance,
               screen_center_y - screen_window_height/2 - bezel_margin - relief_clearance,
               shell_depth_front - relief_depth])
    hull() {
        // Top-left corner
        translate([corner_r, bezel_outer_h - corner_r + relief_clearance*2, 0])
            cylinder(h=relief_depth + 0.1, r=corner_r + relief_clearance, $fn=24);
        // Top-right corner
        translate([bezel_outer_w - corner_r + relief_clearance*2, bezel_outer_h - corner_r + relief_clearance*2, 0])
            cylinder(h=relief_depth + 0.1, r=corner_r + relief_clearance, $fn=24);
        // Bottom-left corner
        translate([corner_r, corner_r, 0])
            cylinder(h=relief_depth + 0.1, r=corner_r + relief_clearance, $fn=24);
        // Bottom-right corner (slightly larger radius)
        translate([bezel_outer_w - corner_r_br + relief_clearance*2, corner_r_br, 0])
            cylinder(h=relief_depth + 0.1, r=corner_r_br + relief_clearance, $fn=32);
    }
}

// -----------------------------------------------------------------------------
// A/B Button Labels (raised text)
// -----------------------------------------------------------------------------
module button_labels() {
    // "A" label - positioned above-right of A button
    translate([button_a_x + button_diameter/2 + 2, button_a_y + button_diameter/2 + 1, shell_depth_front])
    linear_extrude(height=button_label_depth)
    text("A", size=button_label_size, halign="center", valign="center",
         font="Liberation Sans:style=Bold");

    // "B" label - positioned above-right of B button
    translate([button_b_x + button_diameter/2 + 2, button_b_y + button_diameter/2 + 1, shell_depth_front])
    linear_extrude(height=button_label_depth)
    text("B", size=button_label_size, halign="center", valign="center",
         font="Liberation Sans:style=Bold");
}

// -----------------------------------------------------------------------------
// SELECT/START Labels - REMOVED (now using AMS inlay system)
// -----------------------------------------------------------------------------
// Old recessed approach replaced by through-hole cutouts for flush AMS printing

// -----------------------------------------------------------------------------
// Front Top Grooves (DMG-style wrap-around decorative grooves)
// One horizontal groove across top front that wraps to sides,
// plus vertical corner grooves that wrap over the top edge
// -----------------------------------------------------------------------------
module front_top_grooves() {
    // Horizontal groove across top front face
    translate([0, front_trim_y, shell_depth_front - front_trim_height])
        cube([shell_width, front_trim_width, front_trim_height + 0.1]);

    // Continue horizontal groove down left side (from front face to shell seam)
    translate([-0.1, front_trim_y, -0.1])
        cube([front_trim_height + 0.2, front_trim_width, shell_depth_front + 0.2]);

    // Continue horizontal groove down right side (from front face to shell seam)
    translate([shell_width - front_trim_height - 0.1, front_trim_y, -0.1])
        cube([front_trim_height + 0.2, front_trim_width, shell_depth_front + 0.2]);

    // Vertical groove at top-left corner (on front face)
    translate([shell_corner_radius, front_trim_y, shell_depth_front - front_trim_height])
        cube([front_trim_width, shell_height - front_trim_y + 0.1, front_trim_height + 0.1]);

    // Wrap top-left vertical groove over the top edge
    translate([shell_corner_radius, shell_height - front_trim_height - 0.1, -0.1])
        cube([front_trim_width, front_trim_height + 0.2, shell_depth_front + 0.2]);

    // Vertical groove at top-right corner (on front face)
    translate([shell_width - shell_corner_radius - front_trim_width, front_trim_y, shell_depth_front - front_trim_height])
        cube([front_trim_width, shell_height - front_trim_y + 0.1, front_trim_height + 0.1]);

    // Wrap top-right vertical groove over the top edge
    translate([shell_width - shell_corner_radius - front_trim_width, shell_height - front_trim_height - 0.1, -0.1])
        cube([front_trim_width, front_trim_height + 0.2, shell_depth_front + 0.2]);
}

// -----------------------------------------------------------------------------
// Decorative Slashes (above speaker grille, like DMG)
// -----------------------------------------------------------------------------
module decorative_slashes() {
    // Position above speaker grille
    slash_base_x = speaker_grille_x - 8;
    slash_base_y = speaker_grille_y + 8;

    for (i = [0 : slash_count - 1]) {
        translate([slash_base_x + i * slash_spacing, slash_base_y + i * (slash_spacing * 0.4), shell_depth_front - slash_depth])
        rotate([0, 0, slash_angle])
        hull() {
            cylinder(h=slash_depth + 0.1, d=slash_width, $fn=12);
            translate([0, slash_length, 0])
                cylinder(h=slash_depth + 0.1, d=slash_width, $fn=12);
        }
    }
}

// -----------------------------------------------------------------------------
// Front Shell Main Module
// DMG-accurate design: clean front face, screws enter from back
// -----------------------------------------------------------------------------
module front_shell() {
    difference() {
        // Outer shell body - DMG style with curved bottom-right
        // Filleted edges for comfort (rounded exterior)
        dmg_shell_outline_filleted(shell_depth_front);

        // ----- Cutouts -----

        // DMG-style wrap-around decorative grooves at top
        front_top_grooves();

        // ----- AMS Multi-Color Cutouts -----
        // SELECT/START pill shapes only (text removed - too small for FDM)
        select_pill_cutout();
        start_pill_cutout();

        // Bezel relief pocket (for bezel to sit flush and easy gluing)
        bezel_relief_pocket();

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

        // Note: SELECT/START pills and labels now use through-hole AMS cutouts above
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
