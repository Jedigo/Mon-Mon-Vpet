// =============================================================================
// Mon-Mon Gen 3 - Button Plungers
// D-Pad and A/B buttons
// =============================================================================

// Include parameters (safe to include multiple times)
include <parameters.scad>

// -----------------------------------------------------------------------------
// D-Pad Cross - DMG Game Boy Style
// Flat arms with SUNKEN center indent for thumb positioning
// -----------------------------------------------------------------------------
module dpad() {
    arm_w = dpad_arm_width;
    size = dpad_size;
    thick = dpad_thickness;

    // DMG style parameters
    center_indent_d = 5;        // Diameter of center indent
    center_indent_depth = 0.8;  // Depth of center indent (half-sphere)
    edge_chamfer = 0.4;         // Top edge chamfer

    color(color_dpad)
    union() {
        // Main cross shape with flat top, chamfered edges, and center indent
        difference() {
            union() {
                // Horizontal arm
                translate([-size/2, -arm_w/2, 0])
                hull() {
                    translate([1, 1, 0]) cylinder(h=thick, r=1, $fn=16);
                    translate([size-1, 1, 0]) cylinder(h=thick, r=1, $fn=16);
                    translate([1, arm_w-1, 0]) cylinder(h=thick, r=1, $fn=16);
                    translate([size-1, arm_w-1, 0]) cylinder(h=thick, r=1, $fn=16);
                }

                // Vertical arm
                translate([-arm_w/2, -size/2, 0])
                hull() {
                    translate([1, 1, 0]) cylinder(h=thick, r=1, $fn=16);
                    translate([arm_w-1, 1, 0]) cylinder(h=thick, r=1, $fn=16);
                    translate([1, size-1, 0]) cylinder(h=thick, r=1, $fn=16);
                    translate([arm_w-1, size-1, 0]) cylinder(h=thick, r=1, $fn=16);
                }
            }

            // Center indent - half sphere sunken into surface (DMG style)
            translate([0, 0, thick - center_indent_depth + center_indent_d/2])
                sphere(d=center_indent_d, $fn=32);

            // Chamfer top edges - horizontal arm ends
            translate([-size/2 - 0.1, 0, thick])
            rotate([0, 45, 0])
                cube([edge_chamfer * 1.5, arm_w + 2, edge_chamfer * 1.5], center=true);
            translate([size/2 + 0.1, 0, thick])
            rotate([0, 45, 0])
                cube([edge_chamfer * 1.5, arm_w + 2, edge_chamfer * 1.5], center=true);

            // Chamfer top edges - vertical arm ends
            translate([0, -size/2 - 0.1, thick])
            rotate([45, 0, 0])
                cube([arm_w + 2, edge_chamfer * 1.5, edge_chamfer * 1.5], center=true);
            translate([0, size/2 + 0.1, thick])
            rotate([45, 0, 0])
                cube([arm_w + 2, edge_chamfer * 1.5, edge_chamfer * 1.5], center=true);
        }

        // Center nub (presses the tact switch)
        translate([0, 0, -dpad_nub_height])
            cylinder(h=dpad_nub_height + 0.5, d=dpad_nub_diameter, $fn=16);
    }
}

// -----------------------------------------------------------------------------
// A/B Button - DMG Game Boy Style
// Circular button with DOMED (convex) top surface
// -----------------------------------------------------------------------------
module ab_button() {
    dome_height = 1.0;  // How much the dome rises above the cylinder
    dome_radius = 12;   // Radius of sphere used to create dome (larger = flatter)

    color(color_buttons)
    union() {
        // Cap (visible part) - cylinder with domed top
        // Create dome by intersecting sphere with cylinder space
        intersection() {
            // Bounding cylinder
            cylinder(h=button_cap_height + dome_height, d=button_diameter, $fn=32);

            union() {
                // Main cylinder body
                cylinder(h=button_cap_height, d=button_diameter, $fn=32);

                // Spherical dome on top
                translate([0, 0, button_cap_height - dome_radius + dome_height])
                    sphere(r=dome_radius, $fn=48);
            }
        }

        // Stem (goes through hole in shell)
        translate([0, 0, -button_stem_height])
            cylinder(h=button_stem_height + 0.1, d=button_stem_diameter, $fn=24);
    }
}

// -----------------------------------------------------------------------------
// A Button (with letter indicator)
// -----------------------------------------------------------------------------
module button_a() {
    dome_height = 1.0;  // Must match ab_button()

    difference() {
        ab_button();

        // "A" letter - debossed (cut into domed surface)
        translate([0, 0, button_cap_height + dome_height - 0.6])
        linear_extrude(height=0.8)
        text("A", size=4, halign="center", valign="center",
             font="Liberation Sans:style=Bold");
    }
}

// -----------------------------------------------------------------------------
// B Button (with letter indicator)
// -----------------------------------------------------------------------------
module button_b() {
    dome_height = 1.0;  // Must match ab_button()

    difference() {
        ab_button();

        // "B" letter - debossed (cut into domed surface)
        translate([0, 0, button_cap_height + dome_height - 0.6])
        linear_extrude(height=0.8)
        text("B", size=4, halign="center", valign="center",
             font="Liberation Sans:style=Bold");
    }
}

// Preview (renders when opening this file directly)
dpad();
translate([30, 5, 0]) button_a();
translate([30, -10, 0]) button_b();
