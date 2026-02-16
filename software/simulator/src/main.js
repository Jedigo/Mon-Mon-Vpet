import './style.css'
import { Display, Colors } from './display.js'
import { Input, Button } from './input.js'
import { loadPMDPokemon, PMDEntity } from './sprites.js'
import { BattleScreen } from './battle.js'

// Initialize display (176x220 native resolution)
const display = new Display('display');

// Initialize input handler
const input = new Input();

// Debug info element
const debugInfo = document.getElementById('debug-info');

// Game state
let pokemon = null;  // PMDEntity
let lastTime = 0;

// Frame rate limiting (30fps)
const TARGET_FPS = 30;
const FRAME_TIME = 1000 / TARGET_FPS;
let accumulator = 0;

// Battle mode
let battleScreen = null;
let battleMode = false;

// Fireball test
let fireballSprite = null;
let fireballTest = null;  // { x, y, frame, timer }

// Pet screen background
let petBackground = null;

// Debug collision zones (press C to toggle)
let debugCollision = false;

/**
 * Draw the pet screen background (Igglybuff Plain)
 */
function drawBackground() {
  if (petBackground) {
    // Background is pre-cropped to 320x240
    display.ctx.drawImage(petBackground, 0, 0);
  } else {
    // Fallback solid color
    display.clear('#78C850');
  }
}

/**
 * Initialize sprites and game
 */
async function init() {
  try {
    console.log('Loading PMD sprites...');

    // Load PMD Charmander with core animations
    const charmanderData = await loadPMDPokemon('charmander', [
      'Idle', 'Walk', 'Sleep', 'Hurt', 'Attack', 'Strike', 'Charge', 'Faint', 'Eat', 'Hop',
      'LostBalance', 'TumbleBack', 'Laying', 'Wake'
    ]);

    // Create the Pokemon entity with AI behavior
    pokemon = new PMDEntity(charmanderData, {
      width: display.width,
      height: display.height
    });
    pokemon.scale = 2;  // Display scale
    pokemon.x = display.width / 2 - 16;
    pokemon.y = display.height / 2 - 20;

    // Set up collision zones for Igglybuff Plain map
    pokemon.setCollisionZones([
      // House area (covers house structure and base)
      { x: 0, y: 0, width: 185, height: 95 },
      // Sky/mountains right side (matched height for even grass line)
      { x: 185, y: 0, width: 135, height: 95 },
    ]);

    console.log('PMD sprites loaded!');

    // Initialize battle screen
    battleScreen = new BattleScreen(display);
    await battleScreen.loadSprites();
    console.log('Battle screen loaded!');

    // Load fireball sprite
    fireballSprite = new Image();
    fireballSprite.src = '/sprites/attacks/fireball_attack.png';
    await new Promise(resolve => fireballSprite.onload = resolve);
    console.log('Fireball sprite loaded!');

    // Load pet screen background
    petBackground = new Image();
    petBackground.src = '/sprites/backgrounds/igglybuff_plain_notrees.png';
    await new Promise(resolve => petBackground.onload = resolve);
    console.log('Pet background loaded!');

    // Start game loop
    requestAnimationFrame(gameLoop);
  } catch (err) {
    console.error('Failed to load sprites:', err);
    display.clear(Colors.BLACK);
    display.drawText('Error loading', 40, 100, Colors.RED, 12);
    display.drawText('sprites!', 55, 115, Colors.RED, 12);
  }
}

/**
 * Update debug panel
 */
function updateDebug() {
  const pos = pokemon ? `(${Math.floor(pokemon.x)}, ${Math.floor(pokemon.y)})` : 'loading...';
  const dir = pokemon ? pokemon.direction : '-';
  const state = pokemon ? pokemon.state : '-';
  const anim = pokemon ? pokemon.currentAnim : '-';
  const mode = battleMode ? 'BATTLE' : 'Overworld';

  debugInfo.textContent = `Mode: ${mode}
Position: ${pos}
Direction: ${dir}
State: ${state}
Anim: ${anim}`;
}

/**
 * Main game loop (capped at 30fps)
 */
function gameLoop(currentTime) {
  if (lastTime === 0) {
    lastTime = currentTime;
  }

  const elapsed = currentTime - lastTime;
  lastTime = currentTime;
  accumulator += elapsed;

  // Only update at 30fps
  if (accumulator < FRAME_TIME) {
    requestAnimationFrame(gameLoop);
    return;
  }

  // Use fixed timestep for consistency
  const dt = FRAME_TIME / 1000;
  accumulator -= FRAME_TIME;

  // Prevent spiral of death if tab was inactive
  if (accumulator > FRAME_TIME * 3) {
    accumulator = 0;
  }

  // Battle mode
  if (battleMode && battleScreen) {
    battleScreen.update(dt);
    battleScreen.draw(display.ctx);
    requestAnimationFrame(gameLoop);
    return;
  }

  // Draw background
  drawBackground();

  // Update and draw Pokemon (autonomous AI behavior)
  if (pokemon) {
    pokemon.update(dt);
    pokemon.draw(display.ctx, pokemon.scale);

    // Debug: draw collision zones
    if (debugCollision) {
      display.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      for (const zone of pokemon.collisionZones) {
        display.ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
      }
    }
  } else {
    display.drawText('Loading...', 60, 100, Colors.WHITE, 12);
  }

  // Update and draw fireball test
  if (fireballTest && fireballSprite) {
    fireballTest.timer += dt;
    // 100ms per frame
    if (fireballTest.timer >= 0.1) {
      fireballTest.timer = 0;
      fireballTest.frame++;
      if (fireballTest.frame >= 4) {
        fireballTest.frame = 0;  // Loop
      }
    }
    // Move right
    fireballTest.x += 120 * dt;
    // Remove when off screen
    if (fireballTest.x > display.width + 20) {
      fireballTest = null;
    } else {
      // Draw scaled up (4x)
      const scale = 4;
      const frameX = fireballTest.frame * 16;
      display.ctx.imageSmoothingEnabled = false;
      display.ctx.drawImage(
        fireballSprite,
        frameX, 0, 16, 16,  // Source
        fireballTest.x, fireballTest.y, 16 * scale, 16 * scale  // Dest
      );
    }
  }

  // Update debug every ~200ms (6 frames at 30fps)
  updateDebug();

  requestAnimationFrame(gameLoop);
}

// Start the game
init();

// Keyboard listener for battle mode
document.addEventListener('keydown', (e) => {
  // Toggle collision debug (press C)
  if (e.key === 'c' || e.key === 'C') {
    debugCollision = !debugCollision;
    console.log('Collision debug:', debugCollision);
    return;
  }

  // Fireball test (press F or 4)
  if ((e.key === 'f' || e.key === 'F' || e.key === '4') && !battleMode) {
    fireballTest = {
      x: -20,
      y: display.height / 2 - 32,
      frame: 0,
      timer: 0
    };
    console.log('Fireball launched!');
    return;
  }

  // Battle mode toggle
  if (e.key === '6' || e.key === 'b' || e.key === 'B') {
    if (!battleMode) {
      // Enter battle mode
      battleMode = true;
      battleScreen.reset();
      console.log('Entered battle mode');
    } else if (battleScreen.phase === 'idle' || battleScreen.phase === 'done') {
      // Exit battle mode
      battleMode = false;
      console.log('Exited battle mode');
    }
    updateDebug();
    return;
  }

  // Battle mode inputs
  if (battleMode && battleScreen) {
    if (battleScreen.phase === 'idle' || battleScreen.phase === 'done') {
      // Attack type selection (effects from GAMEPLAY_DESIGN.md)
      if (e.key === '1' || e.key === 'a' || e.key === 'A' || e.key === ' ') {
        // Basic attack - white flash
        battleScreen.startAttack('SCRATCH', 'normal', 'whiteFlash', 15);
      } else if (e.key === '2') {
        // Speed attack - blue streak
        battleScreen.startAttack('FLAME DASH', 'quick', 'blueStreak', 20);
      } else if (e.key === '3') {
        // Power attack - red burst (fireball)
        battleScreen.startAttack('FIRE FANG', 'power', 'redBurst', 30);
      } else if (e.key === '4') {
        // Bubble barrage attack
        battleScreen.startAttack('BUBBLE', 'bubble', 'waterSplash', 20);
      } else if (e.key === '5') {
        // Water stream attack
        battleScreen.startAttack('HYDRO PUMP', 'stream', 'waterSplash', 35);
      } else if (e.key === '7') {
        // Electric attack - thunder
        battleScreen.startAttack('THUNDER', 'electric', 'hit', 40);
      }
    }
    return;
  }
});

// Export for console access
window.display = display;
window.input = input;
window.pokemon = () => pokemon;
window.battleScreen = () => battleScreen;
window.toggleBattle = () => { battleMode = !battleMode; if (battleMode) battleScreen.reset(); updateDebug(); };
window.loopStumble = (enable = true) => {
  if (pokemon) {
    pokemon.loopStumble = enable;
    if (enable) pokemon.startLostBalance();
  }
};

console.log('Mon-Mon Simulator (PMD Sprites)');
console.log('Controls:');
console.log('  F = Launch fireball (overworld)');
console.log('  6 or B = Toggle battle mode');
console.log('  C = Toggle collision debug');
console.log('Battle controls:');
console.log('  1 or A = Normal attack (Scratch)');
console.log('  2 = Quick attack (Flame Dash)');
console.log('  3 = Power attack (Fire Fang)');
console.log('  4 = Bubble attack (Bubble)');
console.log('  5 = Stream attack (Hydro Pump)');
console.log('  7 = Electric attack (Thunder)');
