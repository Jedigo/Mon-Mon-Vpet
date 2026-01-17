#!/bin/bash
INPUT="${1:-model.scad}"
OUTPUT="${2:-render.png}"
WIDTH="${3:-800}"
HEIGHT="${4:-600}"
CAMERA="${5:-0,0,0,55,0,25,200}"

xvfb-run openscad -o "$OUTPUT" \
    --imgsize="$WIDTH,$HEIGHT" \
    --camera="$CAMERA" \
    --colorscheme=Tomorrow \
    "$INPUT"

echo "Rendered $INPUT -> $OUTPUT"
