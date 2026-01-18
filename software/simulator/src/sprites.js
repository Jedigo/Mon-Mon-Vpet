/**
 * Sprite System for Mon-Mon Simulator
 * Loads individual sprite image files for animation
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
