/**
 * Sprite System for Mon-Mon Simulator
 * Supports PMD Collab sprite sheets with AnimData.xml metadata
 */

/**
 * Load an image and return a promise
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * PMD direction order (8 directions, matching sprite sheet rows)
 */
export const PMD_DIRECTIONS = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];

/**
 * Parse PMD AnimData.xml and return animation metadata
 */
export async function parseAnimData(xmlPath) {
  const response = await fetch(xmlPath);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');

  const anims = {};
  const animElements = doc.querySelectorAll('Anim');

  for (const anim of animElements) {
    const name = anim.querySelector('Name')?.textContent;
    if (!name) continue;

    // Check if this is a copy reference
    const copyOf = anim.querySelector('CopyOf')?.textContent;
    if (copyOf) {
      anims[name] = { copyOf };
      continue;
    }

    const frameWidth = parseInt(anim.querySelector('FrameWidth')?.textContent) || 32;
    const frameHeight = parseInt(anim.querySelector('FrameHeight')?.textContent) || 32;

    const durations = [];
    const durationElements = anim.querySelectorAll('Duration');
    for (const d of durationElements) {
      durations.push(parseInt(d.textContent) || 1);
    }

    anims[name] = {
      frameWidth,
      frameHeight,
      durations,
      frameCount: durations.length,
      // Optional battle timing
      rushFrame: parseInt(anim.querySelector('RushFrame')?.textContent) || null,
      hitFrame: parseInt(anim.querySelector('HitFrame')?.textContent) || null,
      returnFrame: parseInt(anim.querySelector('ReturnFrame')?.textContent) || null,
    };
  }

  // Resolve copy references
  for (const [name, data] of Object.entries(anims)) {
    if (data.copyOf && anims[data.copyOf]) {
      anims[name] = { ...anims[data.copyOf] };
    }
  }

  return anims;
}

/**
 * PMD Sprite Sheet - handles a single animation's sprite sheet
 * Most sheets have 8 rows (directions) and N columns (frames)
 * Some sheets only have 1 row (non-directional animations)
 */
export class PMDSpriteSheet {
  constructor(image, frameWidth, frameHeight, durations) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.durations = durations;
    this.frameCount = durations.length;

    // Pre-calculate total duration for looping
    this.totalDuration = durations.reduce((a, b) => a + b, 0);

    // Detect if this is a single-direction sprite (only 1 row)
    this.numDirections = Math.floor(image.height / frameHeight);
    this.singleDirection = this.numDirections === 1;
  }

  /**
   * Get frame index for a given time (in ticks, ~60fps) - loops
   */
  getFrameAtTime(ticks) {
    const loopedTicks = ticks % this.totalDuration;
    let accumulated = 0;
    for (let i = 0; i < this.durations.length; i++) {
      accumulated += this.durations[i];
      if (loopedTicks < accumulated) {
        return i;
      }
    }
    return 0;
  }

  /**
   * Get frame index for a given time - plays once, holds on last frame
   */
  getFrameAtTimeOnce(ticks) {
    // If past total duration, return last frame
    if (ticks >= this.totalDuration) {
      return this.frameCount - 1;
    }
    let accumulated = 0;
    for (let i = 0; i < this.durations.length; i++) {
      accumulated += this.durations[i];
      if (ticks < accumulated) {
        return i;
      }
    }
    return this.frameCount - 1;
  }

  /**
   * Draw a specific frame and direction
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - destination x
   * @param {number} y - destination y
   * @param {number} dirIndex - direction index (0-7)
   * @param {number} frameIndex - frame index
   * @param {number} scale - scale factor (default 1)
   */
  drawFrame(ctx, x, y, dirIndex, frameIndex, scale = 1) {
    const srcX = frameIndex * this.frameWidth;
    // Use row 0 for single-direction sprites, otherwise use dirIndex
    const srcY = this.singleDirection ? 0 : dirIndex * this.frameHeight;

    ctx.drawImage(
      this.image,
      srcX, srcY, this.frameWidth, this.frameHeight,
      Math.floor(x), Math.floor(y),
      Math.floor(this.frameWidth * scale), Math.floor(this.frameHeight * scale)
    );
  }
}

/**
 * PMD Pokemon - manages all animations for a single Pokemon
 */
export class PMDPokemon {
  constructor(basePath) {
    this.basePath = basePath;
    this.animData = null;
    this.sheets = {};  // Animation name -> PMDSpriteSheet
    this.loaded = false;
  }

  /**
   * Load animation data and sprite sheets
   * @param {string[]} animNames - which animations to load (e.g., ['Idle', 'Walk', 'Attack'])
   */
  async load(animNames = ['Idle', 'Walk', 'Sleep', 'Hurt', 'Attack', 'Faint', 'Eat']) {
    // Parse animation metadata
    this.animData = await parseAnimData(`${this.basePath}/AnimData.xml`);

    // Load requested sprite sheets
    const loadPromises = animNames.map(async (name) => {
      const meta = this.animData[name];
      if (!meta) {
        console.warn(`Animation '${name}' not found in AnimData.xml`);
        return;
      }

      try {
        const image = await loadImage(`${this.basePath}/${name}-Anim.png`);
        this.sheets[name] = new PMDSpriteSheet(
          image,
          meta.frameWidth,
          meta.frameHeight,
          meta.durations
        );
      } catch (err) {
        console.warn(`Failed to load ${name}-Anim.png:`, err);
      }
    });

    await Promise.all(loadPromises);
    this.loaded = true;
    console.log(`Loaded PMD Pokemon from ${this.basePath}:`, Object.keys(this.sheets));
  }

  /**
   * Get a sprite sheet by animation name
   */
  getSheet(animName) {
    return this.sheets[animName] || this.sheets['Idle'];
  }

  /**
   * Check if an animation exists
   */
  hasAnimation(animName) {
    return animName in this.sheets;
  }
}

/**
 * PMD Entity - a Pokemon instance with position, direction, and animation state
 */
export class PMDEntity {
  constructor(pokemon, bounds) {
    this.pokemon = pokemon;
    this.bounds = bounds;  // { width, height }

    this.x = 0;
    this.y = 0;
    this.direction = 'south';
    this.currentAnim = 'Idle';
    this.animTicks = 0;

    // AI state
    this.state = 'idle';  // 'idle', 'walking', 'sleeping', etc.
    this.targetX = null;
    this.targetY = null;
    this.speed = 25;  // pixels per second

    // AI timing
    this.stateTimer = 0;
    this.nextStateChange = this.randomTime(1, 3);

    // Collision zones - array of { x, y, width, height } rectangles
    this.collisionZones = [];

    // Display scale (affects bounds calculations)
    this.scale = 1;
  }

  /**
   * Set collision zones for the map
   * @param {Array} zones - Array of { x, y, width, height } objects
   */
  setCollisionZones(zones) {
    this.collisionZones = zones;
  }

  /**
   * Check if a point collides with any collision zone
   * Uses the entity's sprite size for bounds checking
   */
  collidesWithZones(x, y) {
    const spriteW = this.width;
    const spriteH = this.height;
    // Use bottom center of sprite as collision point (feet area)
    const footX = x + spriteW / 2;
    const footY = y + spriteH - 8;  // Bottom area of sprite

    for (const zone of this.collisionZones) {
      if (footX >= zone.x && footX <= zone.x + zone.width &&
          footY >= zone.y && footY <= zone.y + zone.height) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a rectangle collides with any collision zone
   */
  rectCollidesWithZones(x, y, w, h) {
    for (const zone of this.collisionZones) {
      // AABB collision
      if (x < zone.x + zone.width && x + w > zone.x &&
          y < zone.y + zone.height && y + h > zone.y) {
        return true;
      }
    }
    return false;
  }

  get dirIndex() {
    return PMD_DIRECTIONS.indexOf(this.direction);
  }

  get currentSheet() {
    return this.pokemon.getSheet(this.currentAnim);
  }

  get width() {
    return this.currentSheet?.frameWidth || 32;
  }

  get height() {
    return this.currentSheet?.frameHeight || 32;
  }

  get scaledWidth() {
    return this.width * this.scale;
  }

  get scaledHeight() {
    return this.height * this.scale;
  }

  randomTime(min, max) {
    return min + Math.random() * (max - min);
  }

  randomDirection() {
    return PMD_DIRECTIONS[Math.floor(Math.random() * PMD_DIRECTIONS.length)];
  }

  setAnimation(name) {
    if (this.currentAnim !== name && this.pokemon.hasAnimation(name)) {
      this.currentAnim = name;
      this.animTicks = 0;
    }
  }

  startWalking() {
    this.state = 'walking';
    this.setAnimation('Walk');

    // Try up to 8 random directions to find a valid target
    const directions = PMD_DIRECTIONS.slice();
    let validTargetFound = false;

    for (let attempt = 0; attempt < 8 && !validTargetFound; attempt++) {
      // Pick a random direction from remaining options
      const dirIndex = Math.floor(Math.random() * directions.length);
      this.direction = directions[dirIndex];
      directions.splice(dirIndex, 1);  // Remove to avoid repeats

      // Calculate movement vector
      const distance = 15 + Math.random() * 40;
      let dx = 0, dy = 0;

      switch (this.direction) {
        case 'north': dy = -1; break;
        case 'south': dy = 1; break;
        case 'east': dx = 1; break;
        case 'west': dx = -1; break;
        case 'north-east': dx = 0.707; dy = -0.707; break;
        case 'north-west': dx = -0.707; dy = -0.707; break;
        case 'south-east': dx = 0.707; dy = 0.707; break;
        case 'south-west': dx = -0.707; dy = 0.707; break;
      }

      let targetX = this.x + dx * distance;
      let targetY = this.y + dy * distance;

      // Clamp to bounds (using scaled dimensions)
      const margin = 4;
      targetX = Math.max(margin, Math.min(this.bounds.width - this.scaledWidth - margin, targetX));
      targetY = Math.max(margin, Math.min(this.bounds.height - this.scaledHeight - margin, targetY));

      // Check if target is in a collision zone
      if (!this.collidesWithZones(targetX, targetY)) {
        this.targetX = targetX;
        this.targetY = targetY;
        validTargetFound = true;
      }
    }

    // If no valid target found, just idle instead
    if (!validTargetFound) {
      this.startIdling();
      return;
    }

    this.nextStateChange = this.randomTime(2, 4);
    this.stateTimer = 0;
  }

  startIdling() {
    this.state = 'idle';
    this.setAnimation('Idle');
    this.animTicks = 0;  // Reset to frame 0 for static idle
    this.targetX = null;
    this.targetY = null;
    this.nextStateChange = this.randomTime(1, 3);
    this.stateTimer = 0;
  }

  startHopping() {
    if (!this.pokemon.hasAnimation('Hop')) {
      this.startIdling();
      return;
    }
    this.state = 'hopping';
    this.setAnimation('Hop');
    this.animTicks = 0;
    // Hop plays once then returns to idle
    const hopSheet = this.pokemon.getSheet('Hop');
    this.hopDuration = hopSheet.totalDuration / 30;  // Convert ticks to seconds (30fps)
    this.stateTimer = 0;
  }

  startLostBalance() {
    if (!this.pokemon.hasAnimation('LostBalance') || !this.pokemon.hasAnimation('TumbleBack')) {
      this.startIdling();
      return;
    }
    this.state = 'lostBalance';
    this.setAnimation('LostBalance');
    this.animTicks = 0;
    const sheet = this.pokemon.getSheet('LostBalance');
    this.animDuration = sheet.totalDuration / 30;  // 30fps
    this.stateTimer = 0;
  }

  startTumbleBack() {
    this.state = 'tumbleBack';
    this.setAnimation('TumbleBack');
    this.animTicks = 0;
    const sheet = this.pokemon.getSheet('TumbleBack');
    this.animDuration = sheet.totalDuration / 30;  // 30fps
    this.stateTimer = 0;
  }

  startLaying() {
    this.state = 'laying';
    this.setAnimation('Laying');
    this.animTicks = 0;
    // Lay on ground for 2-4 seconds
    this.layingDuration = 2 + Math.random() * 2;
    this.stateTimer = 0;
  }

  startWaking() {
    this.state = 'waking';
    this.setAnimation('Wake');
    this.animTicks = 0;
    const sheet = this.pokemon.getSheet('Wake');
    this.animDuration = sheet.totalDuration / 30;  // 30fps
    this.stateTimer = 0;
  }

  update(dt) {
    this.stateTimer += dt;

    // Animate when not idle (idle = frozen on frame 0)
    // PMD animations use ~30fps tick rate for smoother playback
    if (this.state !== 'idle') {
      this.animTicks += dt * 30;  // Convert to ~30fps ticks (slower, smoother)
    }

    if (this.state === 'walking') {
      // Move toward target
      if (this.targetX !== null) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
          this.x = this.targetX;
          this.y = this.targetY;
          this.startIdling();
        } else {
          // Calculate new position
          const newX = this.x + (dx / dist) * this.speed * dt;
          const newY = this.y + (dy / dist) * this.speed * dt;

          // Check collision before moving
          if (this.collidesWithZones(newX, newY)) {
            // Stop and idle if we'd enter a collision zone
            this.startIdling();
          } else {
            this.x = newX;
            this.y = newY;
          }
        }
      }

      if (this.stateTimer >= this.nextStateChange) {
        this.startIdling();
      }
    } else if (this.state === 'hopping') {
      // Hop animation plays once then returns to idle
      if (this.stateTimer >= this.hopDuration) {
        this.startIdling();
      }
    } else if (this.state === 'lostBalance') {
      // LostBalance plays once then immediately goes to TumbleBack
      if (this.stateTimer >= this.animDuration) {
        this.startTumbleBack();
      }
    } else if (this.state === 'tumbleBack') {
      // TumbleBack plays once then goes to Laying
      if (this.stateTimer >= this.animDuration) {
        this.startLaying();
      }
    } else if (this.state === 'laying') {
      // Lay on ground for 2-4 seconds, then wake up
      if (this.stateTimer >= this.layingDuration) {
        this.startWaking();
      }
    } else if (this.state === 'waking') {
      // Wake plays once then returns to idle (or loop if testing)
      if (this.stateTimer >= this.animDuration) {
        if (this.loopStumble) {
          this.startLostBalance();  // Loop for testing
        } else {
          this.startIdling();
        }
      }
    } else {
      // Idle - stand still, occasionally walk, very rarely stumble
      if (this.stateTimer >= this.nextStateChange) {
        const roll = Math.random();
        if (roll < 0.03) {
          // 3% chance to lose balance (then tumble)
          this.startLostBalance();
        } else {
          // 97% chance to walk
          this.startWalking();
        }
      }
    }
  }

  draw(ctx, scale = 1) {
    const sheet = this.currentSheet;
    if (!sheet) return;

    const frameIndex = sheet.getFrameAtTime(Math.floor(this.animTicks));
    sheet.drawFrame(ctx, this.x, this.y, this.dirIndex, frameIndex, scale);
  }
}

/**
 * Load a PMD Pokemon from the sprites folder
 */
export async function loadPMDPokemon(name, animNames) {
  const pokemon = new PMDPokemon(`/sprites/pokemon/${name}`);
  await pokemon.load(animNames);
  return pokemon;
}

/**
 * Animated sprite using individual frame images
 */
export class AnimatedSprite {
  constructor(frames, frameRate = 4) {
    this.frames = frames;
    this.frameRate = frameRate;
    this.currentFrame = 0;
    this.elapsed = 0;
    this.playing = true;
    this.loop = true;
  }

  update(dt) {
    if (!this.playing || this.frames.length <= 1) return;

    this.elapsed += dt;
    const frameDuration = 1 / this.frameRate;

    while (this.elapsed >= frameDuration) {
      this.elapsed -= frameDuration;
      this.currentFrame++;

      if (this.currentFrame >= this.frames.length) {
        if (this.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.frames.length - 1;
          this.playing = false;
        }
      }
    }
  }

  getCurrentFrame() {
    return this.frames[this.currentFrame];
  }

  draw(ctx, x, y, scale = 1) {
    const frame = this.getCurrentFrame();
    if (!frame) return;

    ctx.drawImage(
      frame,
      Math.floor(x),
      Math.floor(y),
      Math.floor(frame.width * scale),
      Math.floor(frame.height * scale)
    );
  }

  play() { this.playing = true; }
  pause() { this.playing = false; }
  reset() { this.currentFrame = 0; this.elapsed = 0; }
}

/**
 * Load PixelLab Charmander sprites - 8 directions with walk and idle animations
 * Used for overworld/main screen
 */
export async function loadCharmanderPixelLab() {
  const basePath = '/sprites/pokemon/charmander_pixellab';
  const directions = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];

  const sprites = {
    walk: {},
    idle: {}
  };

  // Load walk animations (6 frames per direction)
  for (const dir of directions) {
    const frames = await Promise.all([
      loadImage(`${basePath}/walk/${dir}/frame_000.png`),
      loadImage(`${basePath}/walk/${dir}/frame_001.png`),
      loadImage(`${basePath}/walk/${dir}/frame_002.png`),
      loadImage(`${basePath}/walk/${dir}/frame_003.png`),
      loadImage(`${basePath}/walk/${dir}/frame_004.png`),
      loadImage(`${basePath}/walk/${dir}/frame_005.png`),
    ]);
    sprites.walk[dir] = new AnimatedSprite(frames, 8);
  }

  // Load idle animations (4 frames per direction)
  for (const dir of directions) {
    const frames = await Promise.all([
      loadImage(`${basePath}/breathing-idle/${dir}/frame_000.png`),
      loadImage(`${basePath}/breathing-idle/${dir}/frame_001.png`),
      loadImage(`${basePath}/breathing-idle/${dir}/frame_002.png`),
      loadImage(`${basePath}/breathing-idle/${dir}/frame_003.png`),
    ]);
    sprites.idle[dir] = new AnimatedSprite(frames, 4);
  }

  return sprites;
}

/**
 * Pokemon entity with autonomous AI behavior (walks and idles randomly)
 * Used for overworld/main screen
 */
export class PokemonEntityAI {
  constructor(sprites, bounds) {
    this.sprites = sprites;
    this.bounds = bounds; // { width, height } of play area
    this.x = 0;
    this.y = 0;
    this.direction = 'south';
    this.state = 'idle'; // 'idle' or 'walking'
    this.speed = 30; // Pixels per second

    this.targetX = null;
    this.targetY = null;

    // AI timing
    this.stateTimer = 0;
    this.nextStateChange = this.randomTime(1, 3); // Random time before first action
  }

  randomTime(min, max) {
    return min + Math.random() * (max - min);
  }

  randomDirection() {
    const dirs = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
    return dirs[Math.floor(Math.random() * dirs.length)];
  }

  getCurrentAnim() {
    const animSet = this.state === 'walking' ? this.sprites.walk : this.sprites.idle;
    return animSet[this.direction];
  }

  startWalking() {
    this.state = 'walking';
    this.direction = this.randomDirection();

    // Calculate target based on direction
    const distance = 20 + Math.random() * 60; // 20-80 pixels
    let dx = 0, dy = 0;

    switch (this.direction) {
      case 'north': dy = -1; break;
      case 'south': dy = 1; break;
      case 'east': dx = 1; break;
      case 'west': dx = -1; break;
      case 'north-east': dx = 0.707; dy = -0.707; break;
      case 'north-west': dx = -0.707; dy = -0.707; break;
      case 'south-east': dx = 0.707; dy = 0.707; break;
      case 'south-west': dx = -0.707; dy = 0.707; break;
    }

    this.targetX = this.x + dx * distance;
    this.targetY = this.y + dy * distance;

    // Clamp to bounds (accounting for sprite size)
    const spriteSize = 48; // PixelLab sprites are 48x48
    this.targetX = Math.max(0, Math.min(this.bounds.width - spriteSize, this.targetX));
    this.targetY = Math.max(0, Math.min(this.bounds.height - spriteSize, this.targetY));

    this.nextStateChange = this.randomTime(2, 5); // Walk for 2-5 seconds max
    this.stateTimer = 0;
  }

  startIdling() {
    this.state = 'idle';
    this.targetX = null;
    this.targetY = null;
    this.nextStateChange = this.randomTime(1, 4); // Idle for 1-4 seconds
    this.stateTimer = 0;
    this.getCurrentAnim().reset();
  }

  update(dt) {
    this.stateTimer += dt;
    const anim = this.getCurrentAnim();

    if (this.state === 'walking') {
      // Move toward target
      if (this.targetX !== null) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
          // Reached target
          this.x = this.targetX;
          this.y = this.targetY;
          this.startIdling();
        } else {
          // Move toward target
          this.x += (dx / dist) * this.speed * dt;
          this.y += (dy / dist) * this.speed * dt;
        }
      }

      // Check if we should stop walking (timeout)
      if (this.stateTimer >= this.nextStateChange) {
        this.startIdling();
      }

      anim.update(dt);
    } else {
      // Idle state
      anim.update(dt);

      // Check if we should start walking
      if (this.stateTimer >= this.nextStateChange) {
        // 70% chance to walk, 30% to just change direction and keep idling
        if (Math.random() < 0.7) {
          this.startWalking();
        } else {
          this.direction = this.randomDirection();
          this.nextStateChange = this.randomTime(1, 3);
          this.stateTimer = 0;
        }
      }
    }
  }

  draw(ctx, scale = 1) {
    this.getCurrentAnim().draw(ctx, this.x, this.y, scale);
  }

  get width() {
    return 48; // PixelLab sprites are 48x48
  }

  get height() {
    return 48;
  }
}
