-- Extract the bottom-left quadrant of the Igglybuff Plain map
local sprite = app.open("/home/cigo/Mon-Mon-Vpet-Project/software/Maps - Igglybuff Plain.png")

-- The image is 1446 x 578
-- Bottom-left quadrant starts at y=289
local quadW = 723
local quadH = 289

-- Crop to bottom-left
sprite.selection:selectAll()
app.command.CanvasSize {
  ui = false,
  left = 0,
  top = -289,
  right = -(sprite.width - quadW),
  bottom = 0
}

-- Save
sprite:saveCopyAs("/home/cigo/Mon-Mon-Vpet-Project/software/simulator/public/sprites/backgrounds/igglybuff_plain.png")

-- Close without saving original
app.command.CloseFile { ui = false }
print("Map extracted!")
