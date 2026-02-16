// =============================================================================
// Mon-Mon Gen 3 - Screen Bezel
// DMG Game Boy inspired design - separate piece for multi-color printing
// =============================================================================

// Include parameters (safe to include multiple times)
include <parameters.scad>

// -----------------------------------------------------------------------------
// DMG-Style Screen Bezel (raised frame with larger bottom-right corner radius)
// For printing: flat on build plate, screen opening facing up
// -----------------------------------------------------------------------------
module screen_bezel() {
    // Bezel outer dimensions
    bezel_outer_w = screen_window_width + bezel_margin * 2;
    bezel_outer_h = screen_window_height + bezel_margin * 2;
    bezel_inner_w = screen_window_width;
    bezel_inner_h = screen_window_height;

    // Corner radii - bottom-right is slightly larger like DMG
    corner_r = bezel_corner_radius;  // Normal corners (3mm)
    corner_r_br = 6;  // Bottom-right corner - slightly larger radius

    difference() {
        // Outer bezel shape
        hull() {
            // Top-left corner
            translate([corner_r, bezel_outer_h - corner_r, 0])
                cylinder(h=bezel_height, r=corner_r, $fn=24);
            // Top-right corner
            translate([bezel_outer_w - corner_r, bezel_outer_h - corner_r, 0])
                cylinder(h=bezel_height, r=corner_r, $fn=24);
            // Bottom-left corner
            translate([corner_r, corner_r, 0])
                cylinder(h=bezel_height, r=corner_r, $fn=24);
            // Bottom-right corner (slightly larger radius like DMG)
            translate([bezel_outer_w - corner_r_br, corner_r_br, 0])
                cylinder(h=bezel_height, r=corner_r_br, $fn=32);
        }

        // Inner cutout for screen (positioned with margin offset)
        translate([bezel_margin, bezel_margin, -0.1])
            cube([bezel_inner_w, bezel_inner_h, bezel_height + 0.2]);
    }
}

// -----------------------------------------------------------------------------
// Module for assembly positioning (used by mon-mon.scad)
// -----------------------------------------------------------------------------
module screen_bezel_positioned() {
    // Bezel dimensions for positioning
    bezel_outer_w = screen_window_width + bezel_margin * 2;
    bezel_outer_h = screen_window_height + bezel_margin * 2;

    translate([screen_center_x - bezel_outer_w/2,
               screen_center_y - screen_window_height/2 - bezel_margin,
               shell_depth_front - bezel_height])
        screen_bezel();
}

// -----------------------------------------------------------------------------
// AMS Version - Bezel with anchor for multi-color printing
// Flush with shell surface - stays separate mesh for Split to Parts
// -----------------------------------------------------------------------------

// AMS bezel parameters
bezel_ams_surface = 0.6;    // Visible surface (3 layers at 0.2mm)
bezel_ams_anchor = 1.0;     // Anchor into shell body
bezel_ams_protrusion = 0;   // Flush with shell surface (no protrusion below Z=0 after flip)
bezel_ams_total = bezel_ams_surface + bezel_ams_anchor;  // 1.6mm total
bezel_ams_overlap = 0;      // No overlap - stays separate mesh for Split to Parts

module screen_bezel_ams() {
    // Bezel outer dimensions
    bezel_outer_w = screen_window_width + bezel_margin * 2;
    bezel_outer_h = screen_window_height + bezel_margin * 2;
    bezel_inner_w = screen_window_width;
    bezel_inner_h = screen_window_height;

    // Corner radii - bottom-right is slightly larger like DMG
    corner_r = bezel_corner_radius;
    corner_r_br = 6;

    difference() {
        // Outer bezel shape - extends 0.1mm past shell surface
        hull() {
            translate([corner_r, bezel_outer_h - corner_r, 0])
                cylinder(h=bezel_ams_total, r=corner_r, $fn=24);
            translate([bezel_outer_w - corner_r, bezel_outer_h - corner_r, 0])
                cylinder(h=bezel_ams_total, r=corner_r, $fn=24);
            translate([corner_r, corner_r, 0])
                cylinder(h=bezel_ams_total, r=corner_r, $fn=24);
            translate([bezel_outer_w - corner_r_br, corner_r_br, 0])
                cylinder(h=bezel_ams_total, r=corner_r_br, $fn=32);
        }

        // Inner cutout for screen
        translate([bezel_margin, bezel_margin, -0.1])
            cube([bezel_inner_w, bezel_inner_h, bezel_ams_total + 0.2]);
    }
}

// AMS bezel positioned in shell coordinate system
// Positioned flush with shell surface (bezel top at Z=shell_depth_front)
module screen_bezel_ams_positioned() {
    bezel_outer_w = screen_window_width + bezel_margin * 2;
    // Start 1.6mm below surface, extend 1.6mm total (flush with surface)
    bezel_start_z = shell_depth_front - bezel_ams_total;

    translate([screen_center_x - bezel_outer_w/2,
               screen_center_y - screen_window_height/2 - bezel_margin,
               bezel_start_z])
        screen_bezel_ams();
}

// Preview (renders when opening this file directly)
color([0.3, 0.3, 0.35]) screen_bezel();
