/**
 * ILI9225 Display Simulator
 * Simulates a 176x220 pixel display like the real hardware
 */

export class Display {
  constructor(canvasId) {
    // Native ILI9225 resolution
    this.WIDTH = 176;
    this.HEIGHT = 220;

    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // Set canvas to native resolution - CSS will scale it
    this.canvas.width = this.WIDTH;
    this.canvas.height = this.HEIGHT;

    // Disable image smoothing for crisp pixels
    this.ctx.imageSmoothingEnabled = false;

    // Calculate display scale from CSS size
    const rect = this.canvas.getBoundingClientRect();
    this.scale = Math.min(rect.width / this.WIDTH, rect.height / this.HEIGHT);

    // Clear to black
    this.clear();
  }

  /**
   * Clear the display
   * @param {string} color - CSS color string (default: black)
   */
  clear(color = '#000000') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
  }

  /**
   * Set a single pixel
   * @param {number} x
   * @param {number} y
   * @param {string} color - CSS color string
   */
  setPixel(x, y, color) {
    if (x < 0 || x >= this.WIDTH || y < 0 || y >= this.HEIGHT) return;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }

  /**
   * Draw a filled rectangle
   * @param {number} x
   * @param {number} y
   * @param {number} w - width
   * @param {number} h - height
   * @param {string} color - CSS color string
   */
  fillRect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  /**
   * Draw a rectangle outline
   * @param {number} x
   * @param {number} y
   * @param {number} w - width
   * @param {number} h - height
   * @param {string} color - CSS color string
   */
  drawRect(x, y, w, h, color) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(Math.floor(x) + 0.5, Math.floor(y) + 0.5, Math.floor(w) - 1, Math.floor(h) - 1);
  }

  /**
   * Draw a line
   * @param {number} x0 - start x
   * @param {number} y0 - start y
   * @param {number} x1 - end x
   * @param {number} y1 - end y
   * @param {string} color - CSS color string
   */
  drawLine(x0, y0, x1, y1, color) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(Math.floor(x0) + 0.5, Math.floor(y0) + 0.5);
    this.ctx.lineTo(Math.floor(x1) + 0.5, Math.floor(y1) + 0.5);
    this.ctx.stroke();
  }

  /**
   * Draw a filled circle
   * @param {number} cx - center x
   * @param {number} cy - center y
   * @param {number} r - radius
   * @param {string} color - CSS color string
   */
  fillCircle(cx, cy, r, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(Math.floor(cx), Math.floor(cy), Math.floor(r), 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Draw a circle outline
   * @param {number} cx - center x
   * @param {number} cy - center y
   * @param {number} r - radius
   * @param {string} color - CSS color string
   */
  drawCircle(cx, cy, r, color) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(Math.floor(cx), Math.floor(cy), Math.floor(r), 0, Math.PI * 2);
    this.ctx.stroke();
  }

  /**
   * Draw text
   * @param {string} text - text to draw
   * @param {number} x
   * @param {number} y
   * @param {string} color - CSS color string
   * @param {number} size - font size in pixels (default: 8)
   */
  drawText(text, x, y, color, size = 8) {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px monospace`;
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(text, Math.floor(x), Math.floor(y));
  }

  /**
   * Draw a sprite from a 2D array of color values
   * @param {Array<Array<string|null>>} sprite - 2D array of CSS colors (null = transparent)
   * @param {number} x - top-left x position
   * @param {number} y - top-left y position
   */
  drawSprite(sprite, x, y) {
    for (let row = 0; row < sprite.length; row++) {
      for (let col = 0; col < sprite[row].length; col++) {
        const color = sprite[row][col];
        if (color !== null && color !== undefined) {
          this.setPixel(x + col, y + row, color);
        }
      }
    }
  }

  /**
   * Render - no-op now since we draw directly to canvas
   */
  render() {
    // Direct drawing, no buffer needed
  }

  /**
   * Get display dimensions
   */
  get width() { return this.WIDTH; }
  get height() { return this.HEIGHT; }
}

// Common colors (RGB565-ish palette for authenticity)
export const Colors = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  RED: '#FF0000',
  GREEN: '#00FF00',
  BLUE: '#0000FF',
  YELLOW: '#FFFF00',
  CYAN: '#00FFFF',
  MAGENTA: '#FF00FF',
  ORANGE: '#FF8000',
  PINK: '#FF80FF',
  GRAY: '#808080',
  DARK_GRAY: '#404040',
  LIGHT_GRAY: '#C0C0C0',

  // Game Boy-ish palette
  GB_LIGHTEST: '#9BBC0F',
  GB_LIGHT: '#8BAC0F',
  GB_DARK: '#306230',
  GB_DARKEST: '#0F380F',
};
