/**
 * Battle System - Option 3: One attacker at a time
 * Shows attacker with effect, then defender taking hit
 */

import { loadImage } from './sprites.js';

// Background image (loaded asynchronously)
let battleBackground = null;

/**
 * Load the battle background image
 */
export async function loadBattleBackground() {
  battleBackground = await loadImage('/sprites/battle/grass_battlefield.png');
}

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
 * Effect presets
 */
const EFFECTS = {
  ember: {
    colors: ['#FF6600', '#FF9900', '#FFCC00', '#FF3300'],
    speed: 120,
    angle: -Math.PI / 4, // Up-right
    spread: Math.PI / 3,
    life: 0.8,
    size: 4,
    count: 15,
    interval: 0.05,
    duration: 0.5
  },
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
  tackle: {
    colors: ['#CCCCCC', '#FFFFFF', '#AAAAAA'],
    speed: 60,
    angle: Math.PI, // Left
    spread: Math.PI / 2,
    life: 0.4,
    size: 3,
    count: 10,
    interval: 0,
    duration: 0.2
  }
};

/**
 * Battle phases
 */
const PHASE = {
  IDLE: 'idle',
  SHOW_ATTACKER: 'show_attacker',
  ATTACK_TEXT: 'attack_text',
  ATTACK_EFFECT: 'attack_effect',
  SHOW_DEFENDER: 'show_defender',
  HIT_EFFECT: 'hit_effect',
  DAMAGE_TEXT: 'damage_text',
  DONE: 'done'
};

/**
 * Battle Screen Manager
 */
export class BattleScreen {
  constructor(display) {
    this.display = display;
    this.emitter = new ParticleEmitter();

    // Sprites
    this.attackerSprite = null;
    this.defenderSprite = null;
    this.attackerName = '';
    this.defenderName = '';

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
  }

  async loadSprites() {
    // Load battle background and sprites in parallel
    await Promise.all([
      loadBattleBackground(),
      loadImage('/sprites/pokemon/battle_test/charmander_back.png').then(img => this.attackerSprite = img),
      loadImage('/sprites/pokemon/battle_test/bulbasaur_front.png').then(img => this.defenderSprite = img)
    ]);
    this.attackerName = 'CHARMANDER';
    this.defenderName = 'BULBASAUR';
  }

  /**
   * Start an attack sequence
   */
  startAttack(moveName, effect = 'ember', damage = 24) {
    this.moveName = moveName;
    this.damage = damage;
    this.currentEffect = EFFECTS[effect] || EFFECTS.ember;
    this.phase = PHASE.SHOW_ATTACKER;
    this.phaseTimer = 0;
    this.effectTimer = 0;
  }

  update(dt) {
    this.phaseTimer += dt;
    this.emitter.update(dt);

    // Decay shake and flash
    this.spriteShake *= 0.9;
    this.flashAlpha *= 0.9;

    switch (this.phase) {
      case PHASE.SHOW_ATTACKER:
        // Show attacker for 0.5s
        if (this.phaseTimer > 0.5) {
          this.phase = PHASE.ATTACK_TEXT;
          this.phaseTimer = 0;
        }
        break;

      case PHASE.ATTACK_TEXT:
        // Show attack text for 1s
        if (this.phaseTimer > 1.0) {
          this.phase = PHASE.ATTACK_EFFECT;
          this.phaseTimer = 0;
          this.effectTimer = 0;
        }
        break;

      case PHASE.ATTACK_EFFECT:
        // Emit particles during effect
        this.effectTimer += dt;
        if (this.effectTimer < this.currentEffect.duration) {
          if (this.phaseTimer > this.currentEffect.interval) {
            const cx = this.display.width / 2;
            const cy = this.display.height / 2 - 20;
            this.emitter.emit(cx, cy, this.currentEffect.count, this.currentEffect);
            this.phaseTimer = 0;
          }
        }
        // Wait for particles to finish
        if (this.effectTimer > this.currentEffect.duration + 0.5 && !this.emitter.active) {
          this.phase = PHASE.SHOW_DEFENDER;
          this.phaseTimer = 0;
        }
        break;

      case PHASE.SHOW_DEFENDER:
        // Brief pause showing defender
        if (this.phaseTimer > 0.3) {
          this.phase = PHASE.HIT_EFFECT;
          this.phaseTimer = 0;
          // Trigger hit effect
          const cx = this.display.width / 2;
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

      case PHASE.SHOW_ATTACKER:
      case PHASE.ATTACK_TEXT:
      case PHASE.ATTACK_EFFECT:
        this.drawAttackerScreen(ctx, w, h);
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
    this.drawTextBox(ctx, w, h, ['BATTLE MODE', 'Press A to attack, B to exit']);
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

  drawAttackerScreen(ctx, w, h) {
    // Player info box
    this.drawPlayerInfoBox(ctx, w, h);

    // Sprite (back view, positioned like FRLG - bottom left area)
    if (this.attackerSprite) {
      const scale = 2;
      const sw = this.attackerSprite.width * scale;
      const sh = this.attackerSprite.height * scale;
      const sx = 20;
      const sy = h - sh - 60;
      ctx.drawImage(this.attackerSprite, sx, sy, sw, sh);
    }

    // Attack text box
    if (this.phase === PHASE.ATTACK_TEXT || this.phase === PHASE.ATTACK_EFFECT) {
      this.drawTextBox(ctx, w, h, [`${this.attackerName} used`, `${this.moveName}!`]);
    }
  }

  drawDefenderScreen(ctx, w, h) {
    // Enemy info box with HP
    const hpPercent = Math.max(0, 1 - (this.damage / 100));
    this.drawEnemyInfoBox(ctx, w, h, hpPercent);

    // Sprite (front view, positioned like FRLG - top right area) with shake
    if (this.defenderSprite) {
      const scale = 2;
      const sw = this.defenderSprite.width * scale;
      const sh = this.defenderSprite.height * scale;
      const shakeX = (Math.random() - 0.5) * this.spriteShake;
      const shakeY = (Math.random() - 0.5) * this.spriteShake;
      const sx = w - sw - 20 + shakeX;
      const sy = 50 + shakeY;
      ctx.drawImage(this.defenderSprite, sx, sy, sw, sh);
    }

    // Damage text box
    if (this.phase === PHASE.DAMAGE_TEXT) {
      this.drawTextBox(ctx, w, h, ["It's super effective!", `${this.defenderName} took ${this.damage} damage!`]);
    }
  }

  drawResultScreen(ctx, w, h) {
    // Show both info boxes
    this.drawEnemyInfoBox(ctx, w, h, Math.max(0, 1 - (this.damage / 100)));
    this.drawPlayerInfoBox(ctx, w, h);

    // Both sprites
    if (this.defenderSprite) {
      const scale = 2;
      const sw = this.defenderSprite.width * scale;
      const sh = this.defenderSprite.height * scale;
      ctx.drawImage(this.defenderSprite, w - sw - 20, 50, sw, sh);
    }
    if (this.attackerSprite) {
      const scale = 2;
      const sw = this.attackerSprite.width * scale;
      const sh = this.attackerSprite.height * scale;
      ctx.drawImage(this.attackerSprite, 20, h - sh - 60, sw, sh);
    }

    this.drawTextBox(ctx, w, h, ['What will you do?', 'A = Attack again, B = Exit']);
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
  }
}
