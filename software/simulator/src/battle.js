/**
 * Battle System - Option 3: One attacker at a time
 * Shows attacker with effect, then defender taking hit
 * Uses PMD sprites for Charmander (facing east, scaled up)
 */

import { loadImage, loadPMDPokemon, PMD_DIRECTIONS } from './sprites.js';

// Background image (loaded asynchronously)
let battleBackground = null;

/**
 * Load the battle background image
 */
export async function loadBattleBackground() {
  battleBackground = await loadImage('/sprites/battle/grass_battlefield.png');
}

/**
 * Attack types mapped to PMD animations
 */
const ATTACK_ANIMS = {
  normal: 'Attack',   // Basic attack - uses Attack animation
  quick: 'Strike',    // Speed move - uses Strike animation
  power: 'Charge',    // Power move - uses Charge animation
  bubble: 'Attack',   // Bubble barrage - uses Attack animation
  stream: 'Charge',   // Water stream - uses Charge animation (building up power)
  electric: 'Charge'  // Electric attack - uses Charge animation
};

/**
 * Draw FRLG grass battle background
 */
function drawBattleBackground(ctx, w, h) {
  if (battleBackground) {
    // Draw the authentic FRLG background, scaled to fill screen
    // The background is 241x111, we need to scale it to fit 176x220
    // Scale to width and position in upper portion of screen
    const scale = w / battleBackground.width;
    const scaledH = battleBackground.height * scale;

    // Draw background in upper portion (like FRLG battle layout)
    ctx.drawImage(battleBackground, 0, 0, w, scaledH);

    // Fill remaining area below with grass color (for text boxes)
    ctx.fillStyle = '#88CC88';
    ctx.fillRect(0, scaledH, w, h - scaledH);
  } else {
    // Fallback: simple gradient if image not loaded
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#C8E8C0');
    grad.addColorStop(1, '#88CC88');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

/**
 * Simple particle for effects
 */
class Particle {
  constructor(x, y, vx, vy, color, life, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = size;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    // Gravity for some effects
    this.vy += 50 * dt;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  get dead() {
    return this.life <= 0;
  }
}

/**
 * Particle emitter for attack effects
 */
class ParticleEmitter {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count, config) {
    for (let i = 0; i < count; i++) {
      const angle = config.angle + (Math.random() - 0.5) * config.spread;
      const speed = config.speed * (0.5 + Math.random() * 0.5);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const color = config.colors[Math.floor(Math.random() * config.colors.length)];
      const life = config.life * (0.7 + Math.random() * 0.3);
      const size = config.size * (0.5 + Math.random() * 0.5);
      this.particles.push(new Particle(x, y, vx, vy, color, life, size));
    }
  }

  update(dt) {
    this.particles = this.particles.filter(p => {
      p.update(dt);
      return !p.dead;
    });
  }

  draw(ctx) {
    this.particles.forEach(p => p.draw(ctx));
  }

  get active() {
    return this.particles.length > 0;
  }
}

/**
 * Effect presets (matching GAMEPLAY_DESIGN.md)
 */
const EFFECTS = {
  // Basic attack - white flash
  whiteFlash: {
    colors: ['#FFFFFF', '#EEEEEE', '#DDDDDD'],
    speed: 100,
    angle: 0,
    spread: Math.PI * 2, // All directions
    life: 0.25,
    size: 5,
    count: 12,
    interval: 0,
    duration: 0.15
  },
  // Power attack - red particles / impact burst
  redBurst: {
    colors: ['#FF0000', '#FF3300', '#FF6600', '#CC0000'],
    speed: 140,
    angle: 0,
    spread: Math.PI * 2, // All directions
    life: 0.6,
    size: 5,
    count: 20,
    interval: 0.03,
    duration: 0.4
  },
  // Speed attack - blue streak / motion blur
  blueStreak: {
    colors: ['#0088FF', '#00AAFF', '#00CCFF', '#0066CC'],
    speed: 200,
    angle: 0, // Right (toward enemy)
    spread: Math.PI / 6, // Narrow spread for streak effect
    life: 0.35,
    size: 4,
    count: 15,
    interval: 0.02,
    duration: 0.3
  },
  // Hit effect (used when defender takes damage)
  hit: {
    colors: ['#FFFFFF', '#FFFF00', '#FFAA00'],
    speed: 80,
    angle: 0,
    spread: Math.PI * 2, // All directions
    life: 0.3,
    size: 3,
    count: 20,
    interval: 0,
    duration: 0.1
  },
  // Water attack - blue splash
  waterSplash: {
    colors: ['#00AAFF', '#00CCFF', '#0088FF', '#FFFFFF'],
    speed: 120,
    angle: 0,
    spread: Math.PI * 2, // All directions
    life: 0.5,
    size: 5,
    count: 18,
    interval: 0.02,
    duration: 0.35
  }
};

/**
 * Battle phases
 */
const PHASE = {
  IDLE: 'idle',
  SHOW_ATTACKER: 'show_attacker',
  PORTRAIT_FLASH: 'portrait_flash',  // New phase for special attack portrait
  ATTACK_TEXT: 'attack_text',
  ATTACK_EFFECT: 'attack_effect',
  FIREBALL_TRAVEL: 'fireball_travel',  // Fireball flies across attacker screen
  FIREBALL_IMPACT: 'fireball_impact',  // Fireball enters defender screen and hits
  BUBBLE_BARRAGE: 'bubble_barrage',    // Bubbles shooting across attacker screen
  BUBBLE_IMPACT: 'bubble_impact',      // Bubbles hitting defender
  STREAM_TRAVEL: 'stream_travel',      // Water stream extending across attacker screen
  STREAM_IMPACT: 'stream_impact',      // Water stream hitting defender
  ELECTRIC_CHARGE: 'electric_charge',  // Lightning building up
  ELECTRIC_STRIKE: 'electric_strike',  // Lightning striking defender
  SLASH_EFFECT: 'slash_effect',        // Slash marks appearing on defender
  SHOW_DEFENDER: 'show_defender',
  HIT_EFFECT: 'hit_effect',
  DAMAGE_TEXT: 'damage_text',
  DONE: 'done'
};

/**
 * Portrait grid layout (40x40 portraits in a 5x8 grid)
 */
const PORTRAIT_WIDTH = 40;
const PORTRAIT_HEIGHT = 40;
const PORTRAIT_COLS = 5;

/**
 * Sprite-based effect animation
 */
class SpriteEffect {
  constructor(image, frameWidth, frameHeight, frameCount, fps = 12) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameCount = frameCount;
    this.fps = fps;
    this.currentFrame = 0;
    this.elapsed = 0;
    this.playing = false;
    this.done = false;
  }

  start() {
    this.currentFrame = 0;
    this.elapsed = 0;
    this.playing = true;
    this.done = false;
  }

  update(dt) {
    if (!this.playing || this.done) return;

    this.elapsed += dt;
    const frameDuration = 1 / this.fps;

    if (this.elapsed >= frameDuration) {
      this.elapsed -= frameDuration;
      this.currentFrame++;

      if (this.currentFrame >= this.frameCount) {
        this.done = true;
        this.playing = false;
      }
    }
  }

  draw(ctx, x, y, scale = 1, rotation = 0) {
    if (!this.image || this.done) return;

    const srcX = this.currentFrame * this.frameWidth;
    const srcY = 0;
    const destW = this.frameWidth * scale;
    const destH = this.frameHeight * scale;

    ctx.imageSmoothingEnabled = false;

    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.drawImage(
        this.image,
        srcX, srcY, this.frameWidth, this.frameHeight,
        -destW / 2, -destH / 2, destW, destH
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        this.image,
        srcX, srcY, this.frameWidth, this.frameHeight,
        x - destW / 2, y - destH / 2, destW, destH
      );
    }
  }
}

/**
 * Battle Screen Manager
 */
export class BattleScreen {
  constructor(display) {
    this.display = display;
    this.emitter = new ParticleEmitter();

    // PMD Pokemon for attacker and defender
    this.attackerPokemon = null;
    this.defenderPokemon = null;  // PMD sprites for defender
    this.portraitSheet = null;   // Portrait sprite sheet
    this.attackerName = '';
    this.defenderName = '';

    // PMD animation state - attacker
    this.currentAnim = 'Idle';
    this.animTicks = 0;
    this.attackType = 'normal';  // 'normal', 'quick', or 'power'
    this.direction = 'east';     // Charmander faces right
    this.portraitIndex = 0;      // Which portrait to show (0 = normal, others = emotions)

    // PMD animation state - defender
    this.defenderAnim = 'Idle';
    this.defenderAnimTicks = 0;
    this.defenderDirection = 'west';  // Bulbasaur faces left

    // State
    this.phase = PHASE.IDLE;
    this.phaseTimer = 0;
    this.effectTimer = 0;
    this.currentEffect = null;
    this.moveName = '';
    this.damage = 0;

    // Animation
    this.spriteX = 0;
    this.spriteY = 0;
    this.spriteShake = 0;
    this.flashAlpha = 0;

    // Fireball projectile state
    this.fireballSprite = null;
    this.fireball = null;  // { x, y, frame, timer, active }

    // Bubble barrage state (multiple bubbles shooting out)
    this.bubbles = [];  // Array of { x, y, vx, vy, size, wobble, life }

    // Water stream state (continuous beam extending across screen)
    this.waterStream = null;  // { startX, currentX, y, width, segments: [], active }

    // Electric attack state (lightning bolts)
    this.lightning = null;  // { bolts: [], sparks: [], timer, active }

    // Slash attack state (claw marks)
    this.slash = null;  // { marks: [], timer, alpha }
  }

  async loadSprites() {
    // Load battle background and PMD sprites in parallel
    await Promise.all([
      loadBattleBackground(),
      // Load PMD Charmander with battle animations
      loadPMDPokemon('charmander', ['Idle', 'Attack', 'Strike', 'Charge']).then(p => this.attackerPokemon = p),
      // Load PMD Bulbasaur with battle animations
      loadPMDPokemon('bulbasaur', ['Idle', 'Pain', 'Hurt']).then(p => this.defenderPokemon = p),
      // Load portrait sheet
      loadImage('/sprites/pokemon/charmander/portraits/portraits.png').then(img => this.portraitSheet = img),
      // Load fireball projectile sprite (64x16, 4 frames of 16x16)
      loadImage('/sprites/attacks/fireball_attack.png').then(img => {
        this.fireballSprite = img;
      })
    ]);
    this.attackerName = 'CHARMANDER';
    this.defenderName = 'BULBASAUR';
  }

  get dirIndex() {
    return PMD_DIRECTIONS.indexOf(this.direction);
  }

  /**
   * Start an attack sequence
   * @param {string} moveName - Display name of the move
   * @param {string} attackType - 'normal', 'quick', or 'power'
   * @param {string} effect - Particle effect type
   * @param {number} damage - Damage amount
   */
  startAttack(moveName, attackType = 'normal', effect = 'ember', damage = 24) {
    this.moveName = moveName;
    this.attackType = attackType;
    this.damage = damage;
    this.currentEffect = EFFECTS[effect] || EFFECTS.ember;

    // Stay on Idle during intro, attack anim starts in ATTACK_EFFECT phase
    this.currentAnim = 'Idle';
    this.animTicks = 0;

    // Power attack gets portrait flash first
    if (attackType === 'power') {
      this.portraitIndex = 14;  // Row 3, col 5 in 5x8 grid
      this.phase = PHASE.PORTRAIT_FLASH;
    } else {
      this.phase = PHASE.SHOW_ATTACKER;
    }
    this.phaseTimer = 0;
    this.effectTimer = 0;
  }

  update(dt) {
    this.phaseTimer += dt;
    this.emitter.update(dt);

    // Advance animation ticks (30fps)
    this.animTicks += dt * 30;
    this.defenderAnimTicks += dt * 30;

    // Decay shake and flash
    this.spriteShake *= 0.9;
    this.flashAlpha *= 0.9;

    switch (this.phase) {
      case PHASE.PORTRAIT_FLASH:
        // Show portrait for 1.2s then proceed to normal attack flow
        if (this.phaseTimer > 1.2) {
          this.phase = PHASE.SHOW_ATTACKER;
          this.phaseTimer = 0;
        }
        break;

      case PHASE.SHOW_ATTACKER:
        // Show attacker briefly before attack text
        if (this.phaseTimer > 0.3) {
          this.phase = PHASE.ATTACK_TEXT;
          this.phaseTimer = 0;
          this.animTicks = 0;  // Reset animation for attack
        }
        break;

      case PHASE.ATTACK_TEXT:
        // Show attack text for 0.5s then start animation
        if (this.phaseTimer > 0.5) {
          this.phase = PHASE.ATTACK_EFFECT;
          this.phaseTimer = 0;
          // NOW switch to attack animation
          this.currentAnim = ATTACK_ANIMS[this.attackType] || 'Attack';
          this.animTicks = 0;  // Start attack animation from beginning
          this.effectTimer = 0;
        }
        break;

      case PHASE.ATTACK_EFFECT:
        // Check if attack animation completed one cycle
        if (this.attackerPokemon) {
          const sheet = this.attackerPokemon.getSheet(this.currentAnim);
          // For power attacks, launch fireball after Charge animation completes
          if (this.attackType === 'power') {
            if (sheet && this.animTicks >= sheet.totalDuration) {
              // Launch fireball and transition to fireball travel phase
              this.fireball = {
                x: 80,  // Start from Charmander's position (left side)
                y: this.display.height / 2 - 55,  // Higher up, from mouth area
                frame: 0,
                timer: 0,
                active: true
              };
              this.phase = PHASE.FIREBALL_TRAVEL;
              this.phaseTimer = 0;
            }
          } else if (this.attackType === 'bubble') {
            // Bubble barrage - spawn wave of bubbles after Attack animation
            if (sheet && this.animTicks >= sheet.totalDuration) {
              // Spawn initial wave of bubbles
              this.bubbles = [];
              for (let i = 0; i < 8; i++) {
                this.bubbles.push({
                  x: 90,  // Start from Charmander's mouth
                  y: this.display.height / 2 - 20 + (Math.random() - 0.5) * 20,
                  vx: 150 + Math.random() * 80,  // Move right with some variation
                  vy: (Math.random() - 0.5) * 60,  // Slight vertical spread
                  size: 8 + Math.random() * 8,  // Various sizes
                  wobble: Math.random() * Math.PI * 2,  // Phase for wobble animation
                  life: 1.5
                });
              }
              this.phase = PHASE.BUBBLE_BARRAGE;
              this.phaseTimer = 0;
            }
          } else if (this.attackType === 'stream') {
            // Water stream - continuous beam after Charge animation
            if (sheet && this.animTicks >= sheet.totalDuration) {
              this.waterStream = {
                startX: 85,
                currentX: 85,
                y: this.display.height / 2 - 15,
                width: 12,
                segments: [],  // Wavy segments for visual effect
                timer: 0,
                active: true
              };
              this.phase = PHASE.STREAM_TRAVEL;
              this.phaseTimer = 0;
            }
          } else if (this.attackType === 'electric') {
            // Electric attack - lightning after Charge animation
            if (sheet && this.animTicks >= sheet.totalDuration) {
              this.lightning = {
                bolts: [],
                sparks: [],
                timer: 0,
                flickerTimer: 0,
                active: true
              };
              this.phase = PHASE.ELECTRIC_CHARGE;
              this.phaseTimer = 0;
            }
          } else if (this.attackType === 'normal') {
            // Normal/Slash attack - show slash marks on defender
            if (sheet && this.animTicks >= sheet.totalDuration) {
              this.slash = {
                marks: [],
                timer: 0,
                alpha: 1.0,
                stage: 0  // 0, 1, 2 for each slash mark appearing
              };
              this.phase = PHASE.SLASH_EFFECT;
              this.phaseTimer = 0;
            }
          } else if (sheet && this.animTicks >= sheet.totalDuration) {
            // Animation complete, switch to defender
            this.phase = PHASE.SHOW_DEFENDER;
            this.phaseTimer = 0;
          }
        }

        // Emit particles during effect (for non-projectile attacks)
        if (this.attackType !== 'power' && this.attackType !== 'bubble' && this.attackType !== 'stream' && this.attackType !== 'electric' && this.attackType !== 'normal') {
          this.effectTimer += dt;
          if (this.effectTimer < this.currentEffect.duration) {
            if (this.phaseTimer > this.currentEffect.interval) {
              const cx = this.display.width / 2;
              const cy = this.display.height / 2 - 10;
              this.emitter.emit(cx, cy, this.currentEffect.count, this.currentEffect);
              this.phaseTimer = 0;
            }
          }
        }
        break;

      case PHASE.FIREBALL_TRAVEL:
        // Update fireball animation and position
        if (this.fireball && this.fireball.active) {
          this.fireball.timer += dt;
          // 100ms per frame
          if (this.fireball.timer >= 0.1) {
            this.fireball.timer = 0;
            this.fireball.frame = (this.fireball.frame + 1) % 4;
          }
          // Move right
          this.fireball.x += 200 * dt;
          // When fireball exits screen, switch to defender screen with fireball incoming
          if (this.fireball.x > this.display.width + 20) {
            // Reset fireball to enter from left on defender screen
            this.fireball.x = -64;
            this.fireball.y = this.display.height / 2 - 32;
            this.phase = PHASE.FIREBALL_IMPACT;
            this.phaseTimer = 0;
          }
        }
        break;

      case PHASE.FIREBALL_IMPACT:
        // Update fireball animation and position on defender screen
        if (this.fireball && this.fireball.active) {
          this.fireball.timer += dt;
          if (this.fireball.timer >= 0.1) {
            this.fireball.timer = 0;
            this.fireball.frame = (this.fireball.frame + 1) % 4;
          }
          // Move right toward Bulbasaur (center of screen)
          this.fireball.x += 250 * dt;
          // When fireball reaches center (where Bulbasaur is), trigger impact
          const impactX = this.display.width / 2 - 32;
          if (this.fireball.x >= impactX) {
            this.fireball.active = false;
            this.phase = PHASE.HIT_EFFECT;
            this.phaseTimer = 0;
            // Switch defender to Pain animation
            this.defenderAnim = 'Pain';
            this.defenderAnimTicks = 0;
            // Trigger big hit effect
            const cx = this.display.width / 2;
            const cy = this.display.height / 2;
            this.emitter.emit(cx, cy, 30, EFFECTS.redBurst);
            this.emitter.emit(cx, cy, 20, EFFECTS.hit);
            this.spriteShake = 12;
            this.flashAlpha = 1;
          }
        }
        break;

      case PHASE.BUBBLE_BARRAGE:
        // Update bubbles flying across screen
        // Update each bubble
        this.bubbles = this.bubbles.filter(b => {
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.wobble += dt * 8;  // Wobble animation
          b.y += Math.sin(b.wobble) * 0.5;  // Slight vertical wobble
          b.life -= dt;
          return b.life > 0 && b.x < this.display.width + 30;
        });

        // Spawn more bubbles periodically (only during first 0.6 seconds)
        if (this.phaseTimer < 0.6) {
          this.effectTimer += dt;
          if (this.effectTimer >= 0.08) {
            this.effectTimer = 0;
            this.bubbles.push({
              x: 90,
              y: this.display.height / 2 - 20 + (Math.random() - 0.5) * 30,
              vx: 140 + Math.random() * 100,
              vy: (Math.random() - 0.5) * 50,
              size: 6 + Math.random() * 10,
              wobble: Math.random() * Math.PI * 2,
              life: 1.2
            });
          }
        }

        // When all bubbles are off screen or enough time passed, switch to defender
        const bubblesOnScreen = this.bubbles.filter(b => b.x < this.display.width).length;
        if ((bubblesOnScreen === 0 && this.phaseTimer > 0.8) || this.phaseTimer > 2.0) {
          // Reset bubbles for impact screen
          this.bubbles = [];
          for (let i = 0; i < 6; i++) {
            this.bubbles.push({
              x: -20 - i * 15,
              y: this.display.height / 2 - 10 + (Math.random() - 0.5) * 30,
              vx: 180 + Math.random() * 60,
              vy: (Math.random() - 0.5) * 40,
              size: 8 + Math.random() * 8,
              wobble: Math.random() * Math.PI * 2,
              life: 2.0
            });
          }
          this.phase = PHASE.BUBBLE_IMPACT;
          this.phaseTimer = 0;
        }
        break;

      case PHASE.BUBBLE_IMPACT:
        // Bubbles approaching and hitting defender
        const targetX = this.display.width / 2 - 10;

        this.bubbles = this.bubbles.filter(b => {
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.wobble += dt * 8;
          b.y += Math.sin(b.wobble) * 0.5;

          // Check if bubble hits target
          if (b.x >= targetX && b.life > 0.5) {
            // Pop! Create splash particles
            this.emitter.emit(b.x, b.y, 5, {
              colors: ['#00CCFF', '#00AAFF', '#FFFFFF'],
              speed: 60, angle: 0, spread: Math.PI * 2,
              life: 0.3, size: 3, count: 5, interval: 0, duration: 0.1
            });
            b.life = 0;  // Remove this bubble
            this.spriteShake = Math.max(this.spriteShake, 4);
          }

          b.life -= dt;
          return b.life > 0;
        });

        // When all bubbles are gone or timeout, trigger full hit effect
        if (this.bubbles.length === 0 || this.phaseTimer > 2.0) {
          this.phase = PHASE.HIT_EFFECT;
          this.phaseTimer = 0;
          this.defenderAnim = 'Pain';
          this.defenderAnimTicks = 0;
          const cx = this.display.width / 2;
          const cy = this.display.height / 2;
          this.emitter.emit(cx, cy, 20, EFFECTS.waterSplash);
          this.spriteShake = 10;
          this.flashAlpha = 0.6;
        }
        break;

      case PHASE.STREAM_TRAVEL:
        // Water stream extending across screen
        if (this.waterStream && this.waterStream.active) {
          this.waterStream.timer += dt;

          // Extend stream forward
          const streamSpeed = 350;
          this.waterStream.currentX += streamSpeed * dt;

          // Add wavy segment
          if (this.waterStream.timer >= 0.03) {
            this.waterStream.timer = 0;
            this.waterStream.segments.push({
              x: this.waterStream.currentX,
              yOffset: Math.sin(this.waterStream.currentX * 0.1) * 6
            });
            // Keep only recent segments
            if (this.waterStream.segments.length > 50) {
              this.waterStream.segments.shift();
            }
          }

          // When stream extends off screen, switch to defender
          if (this.waterStream.currentX > this.display.width + 20) {
            this.waterStream.startX = -20;
            this.waterStream.currentX = -20;
            this.waterStream.y = this.display.height / 2 - 10;
            this.waterStream.segments = [];
            this.phase = PHASE.STREAM_IMPACT;
            this.phaseTimer = 0;
          }
        }
        break;

      case PHASE.STREAM_IMPACT:
        // Water stream hitting defender
        if (this.waterStream && this.waterStream.active) {
          this.waterStream.timer += dt;
          const streamSpeed = 400;
          this.waterStream.currentX += streamSpeed * dt;

          // Add wavy segment
          if (this.waterStream.timer >= 0.025) {
            this.waterStream.timer = 0;
            this.waterStream.segments.push({
              x: this.waterStream.currentX,
              yOffset: Math.sin(this.waterStream.currentX * 0.12) * 5
            });
            if (this.waterStream.segments.length > 60) {
              this.waterStream.segments.shift();
            }
          }

          // Continuous splash particles at impact point
          const impactX = this.display.width / 2;
          if (this.waterStream.currentX >= impactX) {
            // Emit splash particles
            this.emitter.emit(impactX, this.waterStream.y, 3, {
              colors: ['#00CCFF', '#00AAFF', '#0088FF', '#FFFFFF'],
              speed: 80, angle: Math.PI, spread: Math.PI * 0.8,
              life: 0.25, size: 4, count: 3, interval: 0, duration: 0.1
            });
            this.spriteShake = Math.max(this.spriteShake, 3);
          }

          // After stream has been hitting for a while, end the attack
          if (this.waterStream.currentX > this.display.width + 100) {
            this.waterStream.active = false;
            this.phase = PHASE.HIT_EFFECT;
            this.phaseTimer = 0;
            this.defenderAnim = 'Pain';
            this.defenderAnimTicks = 0;
            const cx = this.display.width / 2;
            const cy = this.display.height / 2;
            this.emitter.emit(cx, cy, 25, EFFECTS.waterSplash);
            this.spriteShake = 12;
            this.flashAlpha = 0.7;
          }
        }
        break;

      case PHASE.ELECTRIC_CHARGE:
        // Lightning shooting UP from attacker
        if (this.lightning && this.lightning.active) {
          this.lightning.timer += dt;
          this.lightning.flickerTimer += dt;

          // Bolt shoots upward from Charmander
          if (this.lightning.flickerTimer >= 0.06) {
            this.lightning.flickerTimer = 0;
            // Generate upward bolt from Charmander to top of screen
            this.lightning.bolts = [];
            this.generateLightningBolt(
              this.display.width / 2,      // Start at center (Charmander)
              this.display.height / 2 - 20, // Start y
              this.display.width / 2 + (Math.random() - 0.5) * 40,  // End x (slight variation)
              -20  // End at top of screen
            );
            // Sparks around Charmander
            this.lightning.sparks.push({
              x: this.display.width / 2 - 30 + Math.random() * 60,
              y: this.display.height / 2 - 30 + Math.random() * 40,
              life: 0.15
            });
          }

          // Update sparks
          this.lightning.sparks = this.lightning.sparks.filter(s => {
            s.life -= dt;
            return s.life > 0;
          });

          // After charging up, switch to strike phase
          if (this.lightning.timer > 0.7) {
            this.lightning.bolts = [];
            this.lightning.sparks = [];
            this.phase = PHASE.ELECTRIC_STRIKE;
            this.phaseTimer = 0;
            this.flashAlpha = 1.0;  // Big flash on transition
          }
        }
        break;

      case PHASE.ELECTRIC_STRIKE:
        // Lightning striking DOWN onto defender from above
        if (this.lightning && this.lightning.active) {
          this.lightning.flickerTimer += dt;

          // Flicker effect - regenerate bolt striking down
          if (this.lightning.flickerTimer >= 0.07) {
            this.lightning.flickerTimer = 0;
            // Generate bolt from top of screen down to defender
            this.lightning.bolts = [];
            this.generateLightningBolt(
              this.display.width / 2 + (Math.random() - 0.5) * 30,  // Start x (slight variation)
              -10,  // Start at top
              this.display.width / 2 + (Math.random() - 0.5) * 15,  // End x
              this.display.height / 2 - 10  // End at defender
            );
            // Add impact sparks around defender
            for (let i = 0; i < 4; i++) {
              this.lightning.sparks.push({
                x: this.display.width / 2 + (Math.random() - 0.5) * 50,
                y: this.display.height / 2 - 20 + (Math.random() - 0.5) * 40,
                life: 0.12 + Math.random() * 0.1
              });
            }
            this.spriteShake = 8;
          }

          // Update sparks
          this.lightning.sparks = this.lightning.sparks.filter(s => {
            s.life -= dt;
            return s.life > 0;
          });

          // End after strike duration
          if (this.phaseTimer > 0.9) {
            this.lightning.active = false;
            this.phase = PHASE.HIT_EFFECT;
            this.phaseTimer = 0;
            this.defenderAnim = 'Pain';
            this.defenderAnimTicks = 0;
            this.spriteShake = 15;
            this.flashAlpha = 1.0;
          }
        }
        break;

      case PHASE.SLASH_EFFECT:
        // Slash marks appearing on defender
        if (this.slash) {
          this.slash.timer += dt;

          // Add slash marks one at a time
          if (this.slash.stage === 0 && this.slash.timer >= 0.0) {
            // First slash mark
            this.slash.marks.push({ offsetX: -20, offsetY: -15 });
            this.slash.stage = 1;
            this.spriteShake = 6;
            this.flashAlpha = 0.5;
          }
          if (this.slash.stage === 1 && this.slash.timer >= 0.12) {
            // Second slash mark
            this.slash.marks.push({ offsetX: 0, offsetY: 0 });
            this.slash.stage = 2;
            this.spriteShake = 8;
            this.flashAlpha = 0.6;
          }
          if (this.slash.stage === 2 && this.slash.timer >= 0.24) {
            // Third slash mark
            this.slash.marks.push({ offsetX: 20, offsetY: 15 });
            this.slash.stage = 3;
            this.spriteShake = 10;
            this.flashAlpha = 0.7;
            this.defenderAnim = 'Pain';
            this.defenderAnimTicks = 0;
          }

          // Fade out slash marks
          if (this.slash.timer > 0.4) {
            this.slash.alpha = Math.max(0, 1.0 - (this.slash.timer - 0.4) / 0.3);
          }

          // End slash effect
          if (this.slash.timer > 0.7) {
            this.slash = null;
            this.phase = PHASE.HIT_EFFECT;
            this.phaseTimer = 0;
          }
        }
        break;

      case PHASE.SHOW_DEFENDER:
        // Brief pause showing defender
        if (this.phaseTimer > 0.3) {
          this.phase = PHASE.HIT_EFFECT;
          this.phaseTimer = 0;
          // Switch defender to Pain animation
          this.defenderAnim = 'Pain';
          this.defenderAnimTicks = 0;
          // Trigger hit effect
          const cx = this.display.width / 2 + 40;
          const cy = this.display.height / 2;
          this.emitter.emit(cx, cy, EFFECTS.hit.count, EFFECTS.hit);
          this.spriteShake = 8;
          this.flashAlpha = 1;
        }
        break;

      case PHASE.HIT_EFFECT:
        // Show hit for 0.5s
        if (this.phaseTimer > 0.5) {
          this.phase = PHASE.DAMAGE_TEXT;
          this.phaseTimer = 0;
        }
        break;

      case PHASE.DAMAGE_TEXT:
        // Show damage for 1s
        if (this.phaseTimer > 1.5) {
          this.phase = PHASE.DONE;
          this.phaseTimer = 0;
        }
        break;
    }
  }

  draw(ctx) {
    const w = this.display.width;
    const h = this.display.height;

    // Draw GBA-style battle background
    drawBattleBackground(ctx, w, h);

    // Draw based on phase
    switch (this.phase) {
      case PHASE.IDLE:
        this.drawIdleScreen(ctx, w, h);
        break;

      case PHASE.PORTRAIT_FLASH:
        this.drawPortraitFlash(ctx, w, h);
        break;

      case PHASE.SHOW_ATTACKER:
      case PHASE.ATTACK_TEXT:
      case PHASE.ATTACK_EFFECT:
        this.drawAttackerScreen(ctx, w, h);
        break;

      case PHASE.FIREBALL_TRAVEL:
        this.drawFireballScreen(ctx, w, h);
        break;

      case PHASE.FIREBALL_IMPACT:
        this.drawFireballImpactScreen(ctx, w, h);
        break;

      case PHASE.BUBBLE_BARRAGE:
        this.drawBubbleScreen(ctx, w, h);
        break;

      case PHASE.BUBBLE_IMPACT:
        this.drawBubbleImpactScreen(ctx, w, h);
        break;

      case PHASE.STREAM_TRAVEL:
        this.drawStreamScreen(ctx, w, h);
        break;

      case PHASE.STREAM_IMPACT:
        this.drawStreamImpactScreen(ctx, w, h);
        break;

      case PHASE.ELECTRIC_CHARGE:
        this.drawElectricChargeScreen(ctx, w, h);
        break;

      case PHASE.ELECTRIC_STRIKE:
        this.drawElectricStrikeScreen(ctx, w, h);
        break;

      case PHASE.SLASH_EFFECT:
        this.drawSlashScreen(ctx, w, h);
        break;

      case PHASE.SHOW_DEFENDER:
      case PHASE.HIT_EFFECT:
      case PHASE.DAMAGE_TEXT:
        this.drawDefenderScreen(ctx, w, h);
        break;

      case PHASE.DONE:
        this.drawResultScreen(ctx, w, h);
        break;
    }

    // Draw particles on top
    this.emitter.draw(ctx);

    // Flash overlay
    if (this.flashAlpha > 0.01) {
      ctx.globalAlpha = this.flashAlpha;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
  }

  drawTextBox(ctx, w, h, lines) {
    // FRLG-style text box at bottom
    const boxHeight = 50;
    const boxY = h - boxHeight - 5;

    // Box background
    ctx.fillStyle = '#F8F8F8';
    ctx.fillRect(5, boxY, w - 10, boxHeight);

    // Box border (double line like FRLG)
    ctx.strokeStyle = '#484848';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, boxY, w - 10, boxHeight);
    ctx.strokeStyle = '#A8A8A8';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, boxY + 3, w - 16, boxHeight - 6);

    // Text
    ctx.fillStyle = '#383838';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    lines.forEach((line, i) => {
      ctx.fillText(line, 15, boxY + 18 + i * 14);
    });
  }

  drawIdleScreen(ctx, w, h) {
    // Player info box only
    this.drawPlayerInfoBox(ctx, w, h);

    // Attacker PMD sprite - centered and larger, standing still
    if (this.attackerPokemon) {
      const sheet = this.attackerPokemon.getSheet('Idle');
      const scale = 3;
      const sw = sheet.frameWidth * scale;
      const sh = sheet.frameHeight * scale;
      const sx = (w - sw) / 2;
      const sy = (h - sh) / 2 - 10;
      // Draw static frame 0 (no animation)
      sheet.drawFrame(ctx, sx, sy, this.dirIndex, 0, scale);
    }

    this.drawTextBox(ctx, w, h, ['BATTLE MODE', '1-5=Attacks 7=Thunder']);
  }

  /**
   * Draw portrait flash - fullscreen portrait for special attacks
   */
  drawPortraitFlash(ctx, w, h) {
    if (!this.portraitSheet) return;

    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    // Calculate portrait source position from index
    const col = this.portraitIndex % PORTRAIT_COLS;
    const row = Math.floor(this.portraitIndex / PORTRAIT_COLS);
    const srcX = col * PORTRAIT_WIDTH;
    const srcY = row * PORTRAIT_HEIGHT;

    // Scale portrait to fill most of the screen (maintain aspect ratio)
    const scaleW = (w - 20) / PORTRAIT_WIDTH;
    const scaleH = (h - 80) / PORTRAIT_HEIGHT;  // Leave room for text
    const scale = Math.min(scaleW, scaleH);
    const destW = PORTRAIT_WIDTH * scale;
    const destH = PORTRAIT_HEIGHT * scale;
    const destX = (w - destW) / 2;
    const destY = (h - destH - 50) / 2;

    // Rumble effect - slight random shake
    const rumbleX = (Math.random() - 0.5) * 4;
    const rumbleY = (Math.random() - 0.5) * 4;

    // Draw the portrait scaled up with rumble
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      this.portraitSheet,
      srcX, srcY, PORTRAIT_WIDTH, PORTRAIT_HEIGHT,
      destX + rumbleX, destY + rumbleY, destW, destH
    );

    // Draw move name at bottom
    this.drawTextBox(ctx, w, h, [`${this.attackerName} uses`, `${this.moveName}!`]);
  }

  drawHPBar(ctx, x, y, w, percent, showLabel = true) {
    // HP bar background (FRLG style)
    ctx.fillStyle = '#484848';
    ctx.fillRect(x, y, w, 8);
    ctx.fillStyle = '#F8F8F8';
    ctx.fillRect(x + 1, y + 1, w - 2, 6);

    // HP bar fill
    const barWidth = (w - 4) * percent;
    const hpColor = percent > 0.5 ? '#48B048' : percent > 0.25 ? '#E8C838' : '#E03838';
    ctx.fillStyle = hpColor;
    ctx.fillRect(x + 2, y + 2, barWidth, 4);

    // HP label
    if (showLabel) {
      ctx.fillStyle = '#F8A800';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('HP', x - 2, y + 7);
    }
  }

  drawPlayerInfoBox(ctx, w, h) {
    // Player Pokemon info box (bottom right like FRLG)
    const boxW = 100;
    const boxH = 35;
    const boxX = w - boxW - 5;
    const boxY = h - 70;

    ctx.fillStyle = '#F8E8C8';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#484848';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Name
    ctx.fillStyle = '#383838';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(this.attackerName, boxX + 5, boxY + 12);

    // HP bar
    this.drawHPBar(ctx, boxX + 25, boxY + 18, 65, 1.0);
  }

  drawEnemyInfoBox(ctx, w, h, hpPercent = 1.0) {
    // Enemy Pokemon info box (top left like FRLG)
    const boxW = 100;
    const boxH = 35;
    const boxX = 5;
    const boxY = 10;

    ctx.fillStyle = '#F8E8C8';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#484848';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Name
    ctx.fillStyle = '#383838';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(this.defenderName, boxX + 5, boxY + 12);

    // HP bar
    this.drawHPBar(ctx, boxX + 25, boxY + 18, 65, hpPercent);
  }

  /**
   * Draw PMD sprite for attacker (Charmander facing east)
   * @param {boolean} loop - Whether to loop the animation (false for attacks)
   */
  drawAttackerSprite(ctx, x, y, scale = 2, loop = true) {
    if (!this.attackerPokemon) return;

    const sheet = this.attackerPokemon.getSheet(this.currentAnim);
    if (!sheet) return;

    const frameIndex = loop
      ? sheet.getFrameAtTime(Math.floor(this.animTicks))
      : sheet.getFrameAtTimeOnce(Math.floor(this.animTicks));
    sheet.drawFrame(ctx, x, y, this.dirIndex, frameIndex, scale);
  }

  drawAttackerScreen(ctx, w, h) {
    // Player info box only (no defender on attacker screen)
    this.drawPlayerInfoBox(ctx, w, h);

    // PMD Sprite positioning depends on attack type
    if (this.attackerPokemon) {
      const sheet = this.attackerPokemon.getSheet(this.currentAnim);
      const scale = 3;  // Larger scale
      const sw = sheet.frameWidth * scale;
      const sh = sheet.frameHeight * scale;

      let sx, sy;
      if (this.attackType === 'power' && this.phase === PHASE.ATTACK_EFFECT) {
        // Power attack: position on LEFT side
        sx = 20;
        sy = (h - sh) / 2 - 10;
      } else {
        // Normal/Quick attacks: center horizontally
        sx = (w - sw) / 2;
        sy = (h - sh) / 2 - 10;
      }

      // Don't loop during attack animation (play once)
      const loop = this.phase !== PHASE.ATTACK_EFFECT;
      this.drawAttackerSprite(ctx, sx, sy, scale, loop);
    }

    // Attack text box
    if (this.phase === PHASE.ATTACK_TEXT || this.phase === PHASE.ATTACK_EFFECT) {
      this.drawTextBox(ctx, w, h, [`${this.attackerName} used`, `${this.moveName}!`]);
    }
  }

  /**
   * Draw fireball traveling across screen
   */
  drawFireballScreen(ctx, w, h) {
    // Player info box
    this.drawPlayerInfoBox(ctx, w, h);

    // Draw Charmander on left side (stay in Charge stance)
    if (this.attackerPokemon) {
      const sheet = this.attackerPokemon.getSheet('Charge');
      const scale = 3;
      const sw = sheet.frameWidth * scale;
      const sh = sheet.frameHeight * scale;
      const sx = 20;
      const sy = (h - sh) / 2 - 10;
      // Keep Charge animation (frozen on last frame)
      this.currentAnim = 'Charge';
      // Draw last frame of Charge animation (frozen pose)
      const lastFrame = sheet.durations.length - 1;
      sheet.drawFrame(ctx, sx, sy, this.dirIndex, lastFrame, scale);
    }

    // Draw fireball
    if (this.fireball && this.fireball.active && this.fireballSprite) {
      const scale = 4;  // Scale up the 16x16 sprite
      const frameX = this.fireball.frame * 16;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        this.fireballSprite,
        frameX, 0, 16, 16,  // Source
        this.fireball.x, this.fireball.y, 16 * scale, 16 * scale  // Dest
      );
    }

    // Text box
    this.drawTextBox(ctx, w, h, [`${this.attackerName} used`, `${this.moveName}!`]);
  }

  /**
   * Draw fireball approaching Bulbasaur on defender screen
   */
  drawFireballImpactScreen(ctx, w, h) {
    // Enemy info box
    this.drawEnemyInfoBox(ctx, w, h, 1.0);

    // Draw Bulbasaur in Idle, centered
    if (this.defenderPokemon) {
      const sheet = this.defenderPokemon.getSheet('Idle');
      if (sheet) {
        const scale = 3;
        const sw = sheet.frameWidth * scale;
        const sh = sheet.frameHeight * scale;
        const sx = (w - sw) / 2;
        const sy = (h - sh) / 2 - 10;
        const dirIndex = PMD_DIRECTIONS.indexOf(this.defenderDirection);
        const frameIndex = sheet.getFrameAtTime(Math.floor(this.defenderAnimTicks));
        sheet.drawFrame(ctx, sx, sy, dirIndex, frameIndex, scale);
      }
    }

    // Draw fireball
    if (this.fireball && this.fireball.active && this.fireballSprite) {
      const scale = 4;
      const frameX = this.fireball.frame * 16;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        this.fireballSprite,
        frameX, 0, 16, 16,
        this.fireball.x, this.fireball.y, 16 * scale, 16 * scale
      );
    }

    // Text box
    this.drawTextBox(ctx, w, h, [`${this.attackerName} used`, `${this.moveName}!`]);
  }

  /**
   * Draw a single pixel block
   */
  drawPixel(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
  }

  /**
   * Draw pixelated water splash effect
   */
  drawPixelSplash(ctx, x, y, intensity = 1) {
    const px = 4;
    const cx = Math.floor(x / px) * px;
    const cy = Math.floor(y / px) * px;
    const colors = ['#AAEEFF', '#00CCFF', '#0099DD', '#FFFFFF'];

    // Splash pattern - pixels radiating outward
    const splashPixels = [
      // Inner ring
      { dx: 0, dy: -px * 2, c: '#AAEEFF' },
      { dx: px * 2, dy: 0, c: '#00CCFF' },
      { dx: 0, dy: px * 2, c: '#0099DD' },
      { dx: -px * 2, dy: 0, c: '#00CCFF' },
      // Outer ring (with some randomness based on intensity)
      { dx: px, dy: -px * 3, c: '#88EEFF' },
      { dx: px * 3, dy: -px, c: '#00BBFF' },
      { dx: px * 3, dy: px, c: '#0088AA' },
      { dx: px, dy: px * 3, c: '#0077AA' },
      { dx: -px, dy: px * 3, c: '#0099DD' },
      { dx: -px * 3, dy: px, c: '#00AADD' },
      { dx: -px * 3, dy: -px, c: '#00CCFF' },
      { dx: -px, dy: -px * 3, c: '#AAEEFF' },
      // Highlight
      { dx: -px, dy: -px * 2, c: '#FFFFFF' },
    ];

    for (const p of splashPixels) {
      // Add some randomness based on timer
      if (Math.random() < intensity) {
        this.drawPixel(ctx, cx + p.dx, cy + p.dy, px, p.c);
      }
    }
  }

  /**
   * Draw a pixelated bubble (Digimon style)
   */
  drawBubble(ctx, x, y, size) {
    const px = 4;  // Pixel size for chunky look
    const cx = Math.floor(x / px) * px;
    const cy = Math.floor(y / px) * px;

    // Small bubble (size < 10)
    if (size < 10) {
      // 2x2 pixel bubble
      this.drawPixel(ctx, cx, cy, px, '#00CCFF');
      this.drawPixel(ctx, cx + px, cy, px, '#0088DD');
      this.drawPixel(ctx, cx, cy + px, px, '#0088DD');
      this.drawPixel(ctx, cx + px, cy + px, px, '#006699');
      // Highlight
      this.drawPixel(ctx, cx, cy, px, '#FFFFFF');
    }
    // Medium bubble (size 10-14)
    else if (size < 14) {
      // 3x3 pixel bubble with hollow center look
      //   T
      //  TLT
      //   T
      this.drawPixel(ctx, cx, cy - px, px, '#00CCFF');  // Top
      this.drawPixel(ctx, cx - px, cy, px, '#00CCFF');  // Left
      this.drawPixel(ctx, cx, cy, px, '#88EEFF');       // Center (light)
      this.drawPixel(ctx, cx + px, cy, px, '#0088DD');  // Right
      this.drawPixel(ctx, cx, cy + px, px, '#0088DD');  // Bottom
      // Highlight
      this.drawPixel(ctx, cx - px, cy - px, px, '#FFFFFF');
    }
    // Large bubble (size >= 14)
    else {
      // 4x4 pixel bubble
      //  TT
      // TLLT
      // TDDT
      //  DD
      // Top row
      this.drawPixel(ctx, cx, cy - px * 2, px, '#00CCFF');
      this.drawPixel(ctx, cx + px, cy - px * 2, px, '#00CCFF');
      // Upper middle
      this.drawPixel(ctx, cx - px, cy - px, px, '#00CCFF');
      this.drawPixel(ctx, cx, cy - px, px, '#AAEEFF');      // Light
      this.drawPixel(ctx, cx + px, cy - px, px, '#88DDFF'); // Light
      this.drawPixel(ctx, cx + px * 2, cy - px, px, '#0088DD');
      // Lower middle
      this.drawPixel(ctx, cx - px, cy, px, '#00AADD');
      this.drawPixel(ctx, cx, cy, px, '#66DDFF');           // Center light
      this.drawPixel(ctx, cx + px, cy, px, '#44CCEE');
      this.drawPixel(ctx, cx + px * 2, cy, px, '#006699');
      // Bottom row
      this.drawPixel(ctx, cx, cy + px, px, '#0077AA');
      this.drawPixel(ctx, cx + px, cy + px, px, '#005588');
      // Highlight spark
      this.drawPixel(ctx, cx - px, cy - px * 2, px, '#FFFFFF');
    }
  }

  /**
   * Draw bubble barrage on attacker screen
   */
  drawBubbleScreen(ctx, w, h) {
    // Player info box
    this.drawPlayerInfoBox(ctx, w, h);

    // Attacker in Attack pose (frozen on last frame)
    if (this.attackerPokemon) {
      const sheet = this.attackerPokemon.getSheet('Attack');
      const scale = 3;
      const sw = sheet.frameWidth * scale;
      const sh = sheet.frameHeight * scale;
      const sx = 20;  // Left side for projectile attacks
      const sy = (h - sh) / 2 - 10;
      this.currentAnim = 'Attack';
      const lastFrame = sheet.durations.length - 1;
      sheet.drawFrame(ctx, sx, sy, this.dirIndex, lastFrame, scale);
    }

    // Draw bubbles
    for (const b of this.bubbles) {
      this.drawBubble(ctx, b.x, b.y, b.size);
    }

    // Text box
    this.drawTextBox(ctx, w, h, [`${this.attackerName} used`, `${this.moveName}!`]);
  }

  /**
   * Draw bubbles hitting defender
   */
  drawBubbleImpactScreen(ctx, w, h) {
    // Enemy info box
    this.drawEnemyInfoBox(ctx, w, h, 1.0);

    // Draw Bulbasaur with shake
    if (this.defenderPokemon) {
      const sheet = this.defenderPokemon.getSheet('Idle');
      if (sheet) {
        const scale = 3;
        const sw = sheet.frameWidth * scale;
        const sh = sheet.frameHeight * scale;
        const shakeX = (Math.random() - 0.5) * this.spriteShake;
        const shakeY = (Math.random() - 0.5) * this.spriteShake;
        const sx = (w - sw) / 2 + shakeX;
        const sy = (h - sh) / 2 - 10 + shakeY;
        const dirIndex = PMD_DIRECTIONS.indexOf(this.defenderDirection);
        const frameIndex = sheet.getFrameAtTime(Math.floor(this.defenderAnimTicks));
        sheet.drawFrame(ctx, sx, sy, dirIndex, frameIndex, scale);
      }
    }

    // Draw bubbles
    for (const b of this.bubbles) {
      this.drawBubble(ctx, b.x, b.y, b.size);
    }

    // Draw pixel splash at impact point when bubbles are hitting
    if (this.spriteShake > 2) {
      this.drawPixelSplash(ctx, w / 2, h / 2 - 10, 0.8);
    }

    // Text box
    this.drawTextBox(ctx, w, h, [`${this.attackerName} used`, `${this.moveName}!`]);
  }

  /**
   * Draw pixelated water stream (Digimon style) - straight and thick
   */
  drawWaterStream(ctx, startX, endX, y, width) {
    if (endX <= startX) return;

    const px = 4;  // Pixel size for chunky look
    const blockY = Math.floor(y / px) * px;

    // Draw main stream as thick straight beam (5 pixels tall)
    for (let x = startX; x <= endX; x += px) {
      const bx = Math.floor(x / px) * px;

      // Outer edge (top)
      this.drawPixel(ctx, bx, blockY - px * 2, px, '#0077AA');
      // Upper
      this.drawPixel(ctx, bx, blockY - px, px, '#00AADD');
      // Center (brightest)
      this.drawPixel(ctx, bx, blockY, px, '#00CCFF');
      // Lower
      this.drawPixel(ctx, bx, blockY + px, px, '#00AADD');
      // Outer edge (bottom)
      this.drawPixel(ctx, bx, blockY + px * 2, px, '#0077AA');

      // Add highlight stripe in center (every other pixel)
      if (Math.floor(x / px) % 2 === 0) {
        this.drawPixel(ctx, bx, blockY - px, px, '#AAEEFF');
        this.drawPixel(ctx, bx, blockY, px, '#FFFFFF');
        this.drawPixel(ctx, bx, blockY + px, px, '#88DDFF');
      }
    }

    // Blunt head of the stream
    if (endX > startX + 20) {
      const headX = Math.floor(endX / px) * px;

      // Squared-off head pixels
      this.drawPixel(ctx, headX + px, blockY - px, px, '#00CCFF');
      this.drawPixel(ctx, headX + px, blockY, px, '#AAEEFF');
      this.drawPixel(ctx, headX + px, blockY + px, px, '#00CCFF');
    }
  }

  /**
   * Draw water stream on attacker screen
   */
  drawStreamScreen(ctx, w, h) {
    // Player info box
    this.drawPlayerInfoBox(ctx, w, h);

    // Attacker in Charge pose (frozen on last frame)
    if (this.attackerPokemon) {
      const sheet = this.attackerPokemon.getSheet('Charge');
      const scale = 3;
      const sw = sheet.frameWidth * scale;
      const sh = sheet.frameHeight * scale;
      const sx = 20;
      const sy = (h - sh) / 2 - 10;
      this.currentAnim = 'Charge';
      const lastFrame = sheet.durations.length - 1;
      sheet.drawFrame(ctx, sx, sy, this.dirIndex, lastFrame, scale);
    }

    // Draw water stream
    if (this.waterStream && this.waterStream.active) {
      this.drawWaterStream(
        ctx,
        this.waterStream.startX,
        this.waterStream.currentX,
        this.waterStream.y,
        this.waterStream.width
      );
    }

    // Text box
    this.drawTextBox(ctx, w, h, [`${this.attackerName} used`, `${this.moveName}!`]);
  }

  /**
   * Draw water stream hitting defender
   */
  drawStreamImpactScreen(ctx, w, h) {
    // Enemy info box
    this.drawEnemyInfoBox(ctx, w, h, 1.0);

    // Draw Bulbasaur with shake
    if (this.defenderPokemon) {
      const sheet = this.defenderPokemon.getSheet('Idle');
      if (sheet) {
        const scale = 3;
        const sw = sheet.frameWidth * scale;
        const sh = sheet.frameHeight * scale;
        const shakeX = (Math.random() - 0.5) * this.spriteShake;
        const shakeY = (Math.random() - 0.5) * this.spriteShake;
        const sx = (w - sw) / 2 + shakeX;
        const sy = (h - sh) / 2 - 10 + shakeY;
        const dirIndex = PMD_DIRECTIONS.indexOf(this.defenderDirection);
        const frameIndex = sheet.getFrameAtTime(Math.floor(this.defenderAnimTicks));
        sheet.drawFrame(ctx, sx, sy, dirIndex, frameIndex, scale);
      }
    }

    // Draw water stream (capped at defender position for impact)
    if (this.waterStream && this.waterStream.active) {
      const impactX = Math.min(this.waterStream.currentX, w / 2 + 20);
      this.drawWaterStream(
        ctx,
        this.waterStream.startX,
        impactX,
        this.waterStream.y,
        this.waterStream.width
      );

      // Draw pixel splash at impact point when stream is hitting
      if (this.waterStream.currentX >= w / 2) {
        this.drawPixelSplash(ctx, w / 2 + 10, this.waterStream.y, 1.0);
      }
    }

    // Text box
    this.drawTextBox(ctx, w, h, [`${this.attackerName} used`, `${this.moveName}!`]);
  }

  /**
   * Generate a pixelated lightning bolt path
   */
  generateLightningBolt(startX, startY, endX, endY) {
    const px = 4;
    const segments = [];

    // Calculate direction
    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.floor(dist / (px * 3));

    let offsetAccum = 0;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Base position along the line
      const baseX = startX + dx * t;
      const baseY = startY + dy * t;

      const perpX = -dy / dist;
      const perpY = dx / dist;

      // Mix of drift and occasional zig-zag
      offsetAccum += (Math.random() - 0.5) * px * 2;

      // Every few segments, add a sharper jag
      if (i % 3 === 0 && i > 0 && i < steps) {
        offsetAccum += (Math.random() > 0.5 ? 1 : -1) * px * 2;
      }

      // Clamp offset
      offsetAccum = Math.max(-px * 4, Math.min(px * 4, offsetAccum));

      segments.push({
        x: Math.floor((baseX + perpX * offsetAccum) / px) * px,
        y: Math.floor((baseY + perpY * offsetAccum) / px) * px
      });
    }

    this.lightning.bolts = segments;
  }

  /**
   * Draw pixelated lightning bolt
   */
  drawLightningBolt(ctx) {
    if (!this.lightning || this.lightning.bolts.length < 2) return;

    const px = 4;

    // Draw bolt segments
    for (let i = 0; i < this.lightning.bolts.length - 1; i++) {
      const p1 = this.lightning.bolts[i];
      const p2 = this.lightning.bolts[i + 1];

      // Draw thick pixelated line between points
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.floor(dist / px));

      for (let j = 0; j <= steps; j++) {
        const t = j / steps;
        const x = Math.floor((p1.x + dx * t) / px) * px;
        const y = Math.floor((p1.y + dy * t) / px) * px;

        // Core (bright yellow/white)
        this.drawPixel(ctx, x, y, px, '#FFFF00');
        // Glow around core
        this.drawPixel(ctx, x - px, y, px, '#FFEE00');
        this.drawPixel(ctx, x + px, y, px, '#FFEE00');
        this.drawPixel(ctx, x, y - px, px, '#FFEE00');
        this.drawPixel(ctx, x, y + px, px, '#FFEE00');
        // Outer glow (dimmer)
        if (Math.random() > 0.5) {
          this.drawPixel(ctx, x - px, y - px, px, '#DDCC00');
          this.drawPixel(ctx, x + px, y + px, px, '#DDCC00');
        }
      }
    }

    // Draw bright white core on top
    for (let i = 0; i < this.lightning.bolts.length - 1; i++) {
      const p1 = this.lightning.bolts[i];
      const p2 = this.lightning.bolts[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.floor(dist / px));

      for (let j = 0; j <= steps; j++) {
        const t = j / steps;
        const x = Math.floor((p1.x + dx * t) / px) * px;
        const y = Math.floor((p1.y + dy * t) / px) * px;
        this.drawPixel(ctx, x, y, px, '#FFFFFF');
      }
    }
  }

  /**
   * Draw pixelated electric spark
   */
  drawSpark(ctx, x, y) {
    const px = 4;
    const cx = Math.floor(x / px) * px;
    const cy = Math.floor(y / px) * px;

    // Small cross/star shape
    this.drawPixel(ctx, cx, cy, px, '#FFFFFF');
    if (Math.random() > 0.3) this.drawPixel(ctx, cx - px, cy, px, '#FFFF00');
    if (Math.random() > 0.3) this.drawPixel(ctx, cx + px, cy, px, '#FFFF00');
    if (Math.random() > 0.3) this.drawPixel(ctx, cx, cy - px, px, '#FFFF00');
    if (Math.random() > 0.3) this.drawPixel(ctx, cx, cy + px, px, '#FFFF00');
  }

  /**
   * Draw electric charge screen (lightning shooting up from attacker)
   */
  drawElectricChargeScreen(ctx, w, h) {
    // Player info box
    this.drawPlayerInfoBox(ctx, w, h);

    // Attacker in Charge pose
    if (this.attackerPokemon) {
      const sheet = this.attackerPokemon.getSheet('Charge');
      const scale = 3;
      const sw = sheet.frameWidth * scale;
      const sh = sheet.frameHeight * scale;
      const sx = (w - sw) / 2;
      const sy = (h - sh) / 2 - 10;
      this.currentAnim = 'Charge';
      const lastFrame = sheet.durations.length - 1;
      sheet.drawFrame(ctx, sx, sy, this.dirIndex, lastFrame, scale);
    }

    // Draw lightning bolt shooting upward
    this.drawLightningBolt(ctx);

    // Draw sparks around Charmander
    if (this.lightning) {
      for (const spark of this.lightning.sparks) {
        this.drawSpark(ctx, spark.x, spark.y);
      }
    }

    // Text box
    this.drawTextBox(ctx, w, h, [`${this.attackerName} used`, `${this.moveName}!`]);
  }

  /**
   * Draw electric strike screen (lightning hitting defender)
   */
  drawElectricStrikeScreen(ctx, w, h) {
    // Enemy info box
    this.drawEnemyInfoBox(ctx, w, h, 1.0);

    // Draw Bulbasaur with shake
    if (this.defenderPokemon) {
      const sheet = this.defenderPokemon.getSheet('Idle');
      if (sheet) {
        const scale = 3;
        const sw = sheet.frameWidth * scale;
        const sh = sheet.frameHeight * scale;
        const shakeX = (Math.random() - 0.5) * this.spriteShake;
        const shakeY = (Math.random() - 0.5) * this.spriteShake;
        const sx = (w - sw) / 2 + shakeX;
        const sy = (h - sh) / 2 - 10 + shakeY;
        const dirIndex = PMD_DIRECTIONS.indexOf(this.defenderDirection);
        const frameIndex = sheet.getFrameAtTime(Math.floor(this.defenderAnimTicks));
        sheet.drawFrame(ctx, sx, sy, dirIndex, frameIndex, scale);
      }
    }

    // Draw lightning bolt
    this.drawLightningBolt(ctx);

    // Draw impact sparks
    if (this.lightning) {
      for (const spark of this.lightning.sparks) {
        this.drawSpark(ctx, spark.x, spark.y);
      }
    }

    // Text box
    this.drawTextBox(ctx, w, h, [`${this.attackerName} used`, `${this.moveName}!`]);
  }

  /**
   * Draw a single pixelated slash mark (diagonal claw scratch)
   */
  drawSlashMark(ctx, centerX, centerY, alpha = 1.0) {
    const px = 4;
    ctx.globalAlpha = alpha;

    // Diagonal slash from top-left to bottom-right
    // White core with red edges (like a fresh scratch)
    const slashPixels = [
      // Main diagonal line (white core)
      { dx: -4, dy: -4, c: '#FFFFFF' },
      { dx: -3, dy: -3, c: '#FFFFFF' },
      { dx: -2, dy: -2, c: '#FFFFFF' },
      { dx: -1, dy: -1, c: '#FFFFFF' },
      { dx: 0, dy: 0, c: '#FFFFFF' },
      { dx: 1, dy: 1, c: '#FFFFFF' },
      { dx: 2, dy: 2, c: '#FFFFFF' },
      { dx: 3, dy: 3, c: '#FFFFFF' },
      { dx: 4, dy: 4, c: '#FFFFFF' },
      // Red/pink edges (scratch marks)
      { dx: -4, dy: -3, c: '#FF6666' },
      { dx: -3, dy: -2, c: '#FF8888' },
      { dx: -2, dy: -1, c: '#FFAAAA' },
      { dx: -1, dy: 0, c: '#FFCCCC' },
      { dx: 0, dy: 1, c: '#FFCCCC' },
      { dx: 1, dy: 2, c: '#FFAAAA' },
      { dx: 2, dy: 3, c: '#FF8888' },
      { dx: 3, dy: 4, c: '#FF6666' },
      // Other side edges
      { dx: -3, dy: -4, c: '#FF6666' },
      { dx: -2, dy: -3, c: '#FF8888' },
      { dx: -1, dy: -2, c: '#FFAAAA' },
      { dx: 0, dy: -1, c: '#FFCCCC' },
      { dx: 1, dy: 0, c: '#FFCCCC' },
      { dx: 2, dy: 1, c: '#FFAAAA' },
      { dx: 3, dy: 2, c: '#FF8888' },
      { dx: 4, dy: 3, c: '#FF6666' },
    ];

    for (const p of slashPixels) {
      this.drawPixel(ctx, centerX + p.dx * px, centerY + p.dy * px, px, p.c);
    }

    ctx.globalAlpha = 1.0;
  }

  /**
   * Draw slash effect screen
   */
  drawSlashScreen(ctx, w, h) {
    // Enemy info box
    this.drawEnemyInfoBox(ctx, w, h, 1.0);

    // Draw Bulbasaur with shake
    if (this.defenderPokemon) {
      const sheet = this.defenderPokemon.getSheet(this.defenderAnim);
      if (sheet) {
        const scale = 3;
        const sw = sheet.frameWidth * scale;
        const sh = sheet.frameHeight * scale;
        const shakeX = (Math.random() - 0.5) * this.spriteShake;
        const shakeY = (Math.random() - 0.5) * this.spriteShake;
        const sx = (w - sw) / 2 + shakeX;
        const sy = (h - sh) / 2 - 10 + shakeY;
        const dirIndex = PMD_DIRECTIONS.indexOf(this.defenderDirection);
        const frameIndex = this.defenderAnim === 'Pain'
          ? sheet.getFrameAtTimeOnce(Math.floor(this.defenderAnimTicks))
          : sheet.getFrameAtTime(Math.floor(this.defenderAnimTicks));
        sheet.drawFrame(ctx, sx, sy, dirIndex, frameIndex, scale);
      }
    }

    // Draw slash marks
    if (this.slash) {
      const centerX = w / 2;
      const centerY = h / 2 - 10;
      for (const mark of this.slash.marks) {
        this.drawSlashMark(ctx, centerX + mark.offsetX, centerY + mark.offsetY, this.slash.alpha);
      }
    }

    // Text box
    this.drawTextBox(ctx, w, h, [`${this.attackerName} used`, `${this.moveName}!`]);
  }

  drawDefenderScreen(ctx, w, h) {
    // Enemy info box with HP
    const hpPercent = Math.max(0, 1 - (this.damage / 100));
    this.drawEnemyInfoBox(ctx, w, h, hpPercent);

    // PMD Bulbasaur sprite (facing west/left) with shake
    if (this.defenderPokemon) {
      const sheet = this.defenderPokemon.getSheet(this.defenderAnim);
      if (sheet) {
        const scale = 3;
        const sw = sheet.frameWidth * scale;
        const sh = sheet.frameHeight * scale;
        const shakeX = (Math.random() - 0.5) * this.spriteShake;
        const shakeY = (Math.random() - 0.5) * this.spriteShake;
        // Center on screen
        const sx = (w - sw) / 2 + shakeX;
        const sy = (h - sh) / 2 - 10 + shakeY;
        // Get direction index for 'west' (facing left)
        const dirIndex = PMD_DIRECTIONS.indexOf(this.defenderDirection);
        // Pain animation plays once, Idle loops
        const frameIndex = this.defenderAnim === 'Pain'
          ? sheet.getFrameAtTimeOnce(Math.floor(this.defenderAnimTicks))
          : sheet.getFrameAtTime(Math.floor(this.defenderAnimTicks));
        sheet.drawFrame(ctx, sx, sy, dirIndex, frameIndex, scale);
      }
    }

    // Damage text box
    if (this.phase === PHASE.DAMAGE_TEXT) {
      this.drawTextBox(ctx, w, h, ["It's super effective!", `${this.defenderName} took ${this.damage} damage!`]);
    }
  }

  drawResultScreen(ctx, w, h) {
    // Player info box only
    this.drawPlayerInfoBox(ctx, w, h);

    // Attacker PMD sprite - centered and larger, standing still (same as idle screen)
    if (this.attackerPokemon) {
      this.currentAnim = 'Idle';
      const sheet = this.attackerPokemon.getSheet('Idle');
      const scale = 3;
      const sw = sheet.frameWidth * scale;
      const sh = sheet.frameHeight * scale;
      const sx = (w - sw) / 2;
      const sy = (h - sh) / 2 - 10;
      // Draw static frame 0 (no animation)
      sheet.drawFrame(ctx, sx, sy, this.dirIndex, 0, scale);
    }

    this.drawTextBox(ctx, w, h, ['What will you do?', '1-5=Attack B=Exit']);
  }

  get isActive() {
    return this.phase !== PHASE.IDLE;
  }

  get isDone() {
    return this.phase === PHASE.DONE;
  }

  reset() {
    this.phase = PHASE.IDLE;
    this.phaseTimer = 0;
    this.emitter.particles = [];
    this.currentAnim = 'Idle';
    this.animTicks = 0;
    this.defenderAnim = 'Idle';
    this.defenderAnimTicks = 0;
    this.damage = 0;
    this.fireball = null;
    this.bubbles = [];
    this.waterStream = null;
    this.lightning = null;
    this.slash = null;
  }
}
