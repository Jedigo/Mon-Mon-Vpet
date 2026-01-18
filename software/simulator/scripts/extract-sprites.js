/**
 * Extract all 8 complete Charmander walking sprites with transparent backgrounds
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SPRITE_SHEET = './public/sprites/pokemon/charmander_custom.png';
const OUTPUT_DIR = './public/sprites/pokemon/charmander';

async function main() {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Custom sprite sheet is 347x199
  // Walking sprites in bottom section
  // Need to capture full height including head - start Y earlier

  const frameW = 36;
  const frameH = 36;

  // Row 1: DOWN and LEFT sprites - move Y up to capture heads
  const row1Y = 127;
  const xPositions = [0, 34, 68, 104];

  // DOWN stand (frame 1)
  await sharp(SPRITE_SHEET)
    .extract({ left: xPositions[0], top: row1Y, width: frameW, height: frameH })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'down_1.png'));

  // DOWN walk (frame 2)
  await sharp(SPRITE_SHEET)
    .extract({ left: xPositions[1], top: row1Y, width: frameW, height: frameH })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'down_2.png'));

  // LEFT stand (frame 1)
  await sharp(SPRITE_SHEET)
    .extract({ left: xPositions[2], top: row1Y, width: frameW, height: frameH })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'left_1.png'));

  // LEFT walk (frame 2)
  await sharp(SPRITE_SHEET)
    .extract({ left: xPositions[3], top: row1Y, width: frameW, height: frameH })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'left_2.png'));

  // Row 2: UP and RIGHT sprites
  const row2Y = 161;

  // UP stand (frame 1)
  await sharp(SPRITE_SHEET)
    .extract({ left: xPositions[0], top: row2Y, width: frameW, height: frameH })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'up_1.png'));

  // UP walk (frame 2)
  await sharp(SPRITE_SHEET)
    .extract({ left: xPositions[1], top: row2Y, width: frameW, height: frameH })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'up_2.png'));

  // RIGHT stand (frame 1)
  await sharp(SPRITE_SHEET)
    .extract({ left: xPositions[2], top: row2Y, width: frameW, height: frameH })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'right_1.png'));

  // RIGHT walk (frame 2)
  await sharp(SPRITE_SHEET)
    .extract({ left: xPositions[3], top: row2Y, width: frameW, height: frameH })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'right_2.png'));

  console.log('Extracted all 8 complete Charmander sprites!');
}

main().catch(console.error);
