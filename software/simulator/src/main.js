import './style.css'
import { Display, Colors } from './display.js'
import { Input, Button } from './input.js'
import { loadCharmanderPixelLab, PokemonEntityAI } from './sprites.js'
import { BattleScreen } from './battle.js'

// Initialize display (176x220 native resolution)
const display = new Display('display');

// Initialize input handler
const input = new Input();

// Debug info element
const debugInfo = document.getElementById('debug-info');

// Game state
let charmander = null;
let lastTime = 0;

// Battle mode
let battleScreen = null;
let battleMode = false;

// Background colors
const GRASS_LIGHT = '#78C850';
const GRASS_DARK = '#68B840';
const PATH_COLOR = '#D8B898';

/**
 * Draw a pixel-art grass background
 */
function drawBackground() {
  display.clear(GRASS_LIGHT);

  // Grass checkerboard pattern
  for (let y = 0; y < display.height; y += 16) {
    for (let x = 0; x < display.width; x += 16) {
      if ((Math.floor(x / 16) + Math.floor(y / 16)) % 2 === 0) {
        display.fillRect(x, y, 16, 16, GRASS_DARK);
      }
    }
  }

  // Dirt path at bottom
  display.fillRect(0, display.height - 50, display.width, 50, PATH_COLOR);

  // Path texture
  for (let i = 0; i < 15; i++) {
    const x = (i * 37 + 5) % display.width;
    const y = display.height - 45 + (i % 5) * 8;
    display.fillRect(x, y, 3, 2, '#C8A888');
  }
}

/**
 * Initialize sprites and game
 */
async function init() {
  try {
    console.log('Loading sprites...');

    // Load overworld sprites
    const sprites = await loadCharmanderPixelLab();

    // Create the Charmander entity with AI behavior
    charmander = new PokemonEntityAI(sprites, {
      width: display.width,
      height: display.height
    });
    charmander.x = display.width / 2 - 24;
    charmander.y = display.height / 2 - 24;

    console.log('Overworld sprites loaded!');

    // Initialize battle screen
    battleScreen = new BattleScreen(display);
    await battleScreen.loadSprites();
    console.log('Battle screen loaded!');

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
  const pressed = Object.entries(input.state)
    .filter(([_, v]) => v)
    .map(([k]) => k.toUpperCase())
    .join(', ') || 'none';

  const pos = charmander ? `(${Math.floor(charmander.x)}, ${Math.floor(charmander.y)})` : 'loading...';
  const dir = charmander ? charmander.direction : '-';
  const state = charmander ? charmander.state : '-';
  const mode = battleMode ? 'BATTLE' : 'Overworld';

  debugInfo.textContent = `Mode: ${mode}
Position: ${pos}
Direction: ${dir}
State: ${state}`;
}

/**
 * Main game loop
 */
function gameLoop(currentTime) {
  const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
  lastTime = currentTime;

  // Battle mode
  if (battleMode && battleScreen) {
    battleScreen.update(dt);
    battleScreen.draw(display.ctx);
    requestAnimationFrame(gameLoop);
    return;
  }

  // Draw background
  drawBackground();

  // Update and draw Charmander (autonomous AI behavior)
  if (charmander) {
    charmander.update(dt);
    charmander.draw(display.ctx, 1);  // 48x48
  } else {
    display.drawText('Loading...', 60, 100, Colors.WHITE, 12);
  }

  // Update debug every 200ms
  if (Math.floor(currentTime / 200) !== Math.floor((currentTime - dt * 1000) / 200)) {
    updateDebug();
  }

  requestAnimationFrame(gameLoop);
}

// Start the game
init();

// Keyboard listener for battle mode
document.addEventListener('keydown', (e) => {
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
    if (e.key === 'a' || e.key === 'A' || e.key === ' ') {
      if (battleScreen.phase === 'idle' || battleScreen.phase === 'done') {
        battleScreen.startAttack('EMBER', 'ember', 24);
      }
    }
    return;
  }
});

// Export for console access
window.display = display;
window.input = input;
window.charmander = () => charmander;
window.battleScreen = () => battleScreen;
window.toggleBattle = () => { battleMode = !battleMode; if (battleMode) battleScreen.reset(); updateDebug(); };

console.log('Mon-Mon Simulator');
console.log('Controls:');
console.log('  6 or B = Toggle battle mode');
console.log('  A or Space = Attack (in battle)');
