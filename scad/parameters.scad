// =============================================================================
// Mon-Mon Gen 3 - Parameters Module
// All dimensions in millimeters
// =============================================================================

// -----------------------------------------------------------------------------
// MANUFACTURING TOLERANCES (adjust for your printer)
// -----------------------------------------------------------------------------
tolerance_tight = 0.15;      // Press-fit (interference fit)
tolerance_sliding = 0.25;    // Sliding fit (buttons, parts that move)
tolerance_loose = 0.35;      // Loose fit (drop-in components)

// -----------------------------------------------------------------------------
// OVERALL SHELL DIMENSIONS
// -----------------------------------------------------------------------------
shell_width = 64;            // X dimension
shell_height = 97;           // Y dimension
shell_depth_total = 22;      // Z dimension (both halves combined)
shell_depth_front = 12;      // Front shell depth
shell_depth_back = 10;       // Back shell depth
shell_wall = 2.5;            // Wall thickness
shell_corner_radius = 8;     // Corner rounding

// Shell overlap (how far front shell lip extends into back)
shell_overlap = 2.0;
shell_overlap_clearance = 0.2;

// -----------------------------------------------------------------------------
// SCREEN WINDOW
// -----------------------------------------------------------------------------
screen_window_width = 43;    // Visible opening width
screen_window_height = 35;   // Visible opening height
screen_bezel_width = 6;      // Bezel around visible area

// Screen position (center of window from shell origin at bottom-left)
screen_center_x = shell_width / 2;
screen_center_y = shell_height - 28;  // ~28mm from top edge to center

// Display PCB dimensions (adjustable mounting - these are estimates)
display_pcb_width_min = 48;
display_pcb_width_max = 54;
display_pcb_height_min = 36;
display_pcb_height_max = 42;
display_pcb_thickness = 3.5;

// Display mounting ledge
display_ledge_depth = 2.0;   // How far ledge extends under PCB
display_ledge_height = 1.5;  // Ledge thickness

// -----------------------------------------------------------------------------
// D-PAD
// -----------------------------------------------------------------------------
dpad_size = 18;              // Overall cross size
dpad_arm_width = 6;          // Width of each arm
dpad_thickness = 4;          // Total height of D-pad piece
dpad_nub_diameter = 4;       // Center nub that presses switch
dpad_nub_height = 2;         // How far nub extends below

// D-pad position (center from shell origin)
dpad_center_x = 16;          // From left edge
dpad_center_y = shell_height - 62;  // Below screen (moved down to match buttons)

// D-pad hole clearance
dpad_hole_clearance = tolerance_sliding;

// -----------------------------------------------------------------------------
// A/B BUTTONS
// -----------------------------------------------------------------------------
button_diameter = 9;         // Button cap diameter
button_stem_diameter = 5;    // Stem that goes through hole
button_cap_height = 2;       // Height of cap above shell
button_stem_height = 4;      // Stem length below cap
button_total_height = button_cap_height + button_stem_height;

// A/B button positions (A is upper-right, B is lower-left)
// Measured from shell origin, angled layout like DMG
button_a_x = shell_width - 14;    // A button X
button_a_y = shell_height - 58;   // A button Y (moved down to clear bezel)
button_b_x = shell_width - 24;    // B button X
button_b_y = shell_height - 66;   // B button Y
button_spacing = 13;              // Center-to-center (diagonal)

// Button hole clearance
button_hole_clearance = tolerance_sliding;

// -----------------------------------------------------------------------------
// SELECT/START (Decorative)
// -----------------------------------------------------------------------------
select_start_width = 8;      // Pill width
select_start_height = 3;     // Pill height
select_start_depth = 0.8;    // How much they protrude
select_start_spacing = 14;   // Space between centers
select_start_y = 18;         // Distance from bottom edge

// -----------------------------------------------------------------------------
// SPEAKER GRILLE
// -----------------------------------------------------------------------------
speaker_grille_width = 10;
speaker_grille_height = 8;
speaker_slot_width = 1.2;    // Width of each slot
speaker_slot_spacing = 2.5;  // Spacing between slots
speaker_slot_angle = 25;     // Degrees from horizontal (DMG style: lower-left to upper-right)
speaker_num_slots = 6;

// Speaker grille position (bottom-right area)
speaker_grille_x = shell_width - 12;
speaker_grille_y = 10;

// -----------------------------------------------------------------------------
// PIEZO BUZZER
// -----------------------------------------------------------------------------
piezo_diameter = 11.9;
piezo_height = 6.5;
piezo_mount_ring_thickness = 1.5;

// -----------------------------------------------------------------------------
// ESP32 FEATHER
// -----------------------------------------------------------------------------
esp32_width = 22.7;
esp32_length = 51.0;
esp32_height = 7.3;
esp32_usb_width = 9;         // USB-C port width
esp32_usb_height = 3.5;      // USB-C port height
esp32_usb_protrusion = 2;    // How far USB sticks out

// ESP32 position in back shell (bottom area)
esp32_x = (shell_width - esp32_width) / 2;  // Centered
esp32_y = 5;  // From bottom edge
esp32_standoff_height = 2;   // Raise PCB off floor

// -----------------------------------------------------------------------------
// BATTERY
// -----------------------------------------------------------------------------
battery_width = 30;
battery_length = 36;
battery_height = 5;

// Battery position (top-left of back shell interior)
battery_x = 4;
battery_y = shell_height - battery_length - 8;

// Battery retention lip height
battery_lip_height = 2;
battery_lip_width = 1.5;

// -----------------------------------------------------------------------------
// TACT SWITCHES (6x6mm)
// -----------------------------------------------------------------------------
tact_switch_size = 6.0;
tact_switch_height = 4.3;    // Including button
tact_switch_button_height = 2.5;  // Just the clickable part
tact_switch_travel = 0.25;   // Click travel distance

// -----------------------------------------------------------------------------
// A/B SWITCH PLATE
// -----------------------------------------------------------------------------
ab_plate_width = 22;
ab_plate_length = 18;
ab_plate_thickness = 3;
ab_plate_switch_spacing = 13;  // Match button spacing

// A/B plate position in back shell
ab_plate_x = button_b_x - ab_plate_width/2 + (button_a_x - button_b_x)/2;
ab_plate_y = button_b_y - ab_plate_length/2 + (button_a_y - button_b_y)/2;

// -----------------------------------------------------------------------------
// SCREW POSTS
// -----------------------------------------------------------------------------
screw_post_outer_diameter = 4.5;
screw_post_inner_diameter = 1.6;  // For M2 self-tap
screw_post_height = 8;
screw_head_diameter = 4;
screw_head_depth = 1.5;      // Countersink depth

// Screw post positions (inset from corners)
screw_inset_x = 6;
screw_inset_y = 6;

// -----------------------------------------------------------------------------
// USB CUTOUT
// -----------------------------------------------------------------------------
usb_cutout_width = 12;
usb_cutout_height = 7;
usb_cutout_x = shell_width / 2;  // Centered

// -----------------------------------------------------------------------------
// BRANDING TEXT
// -----------------------------------------------------------------------------
brand_text = "Mon-Mon";
brand_text_size = 6;
brand_text_depth = 0.6;      // Emboss/deboss depth
brand_text_y = shell_height - 75;  // Position below screen

// -----------------------------------------------------------------------------
// ASSEMBLY / VISUALIZATION
// -----------------------------------------------------------------------------
explode_distance = 20;       // Distance for exploded view
show_components = true;      // Toggle component visibility
cross_section = false;       // Toggle cross-section view

// -----------------------------------------------------------------------------
// COLORS (for visualization)
// -----------------------------------------------------------------------------
color_shell_front = [0.85, 0.85, 0.82];  // DMG grey
color_shell_back = [0.80, 0.80, 0.78];
color_buttons = [0.15, 0.12, 0.18];      // Dark purple/grey
color_dpad = [0.12, 0.12, 0.12];         // Near black
color_screen_bezel = [0.25, 0.28, 0.30]; // Dark grey
color_pcb = [0.1, 0.4, 0.1];             // PCB green
color_battery = [0.2, 0.2, 0.2];
