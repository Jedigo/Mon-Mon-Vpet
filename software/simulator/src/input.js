/**
 * Input Handler for Mon-Mon Simulator
 * Mon-Mon has only 3 buttons:
 * - D-pad (single rocker switch)
 * - A button
 * - B button
 */

export const Button = {
  DPAD: 'dpad',
  A: 'a',
  B: 'b',
};

export class Input {
  constructor() {
    // Current state of each button (pressed or not)
    this.state = {
      [Button.DPAD]: false,
      [Button.A]: false,
      [Button.B]: false,
    };

    // Callbacks for button events
    this.onPress = null;   // Called when button is pressed
    this.onRelease = null; // Called when button is released

    this._setupKeyboard();
    this._setupButtons();
  }

  /**
   * Check if a button is currently pressed
   * @param {string} button - Button constant
   * @returns {boolean}
   */
  isPressed(button) {
    return this.state[button] || false;
  }

  /**
   * Set up keyboard controls
   * Space/Enter/Arrows = D-pad, Z = B, X = A
   */
  _setupKeyboard() {
    const keyMap = {
      'Space': Button.DPAD,
      'Enter': Button.DPAD,
      'ArrowUp': Button.DPAD,
      'ArrowDown': Button.DPAD,
      'ArrowLeft': Button.DPAD,
      'ArrowRight': Button.DPAD,
      'KeyX': Button.A,
      'KeyZ': Button.B,
      'KeyA': Button.A,
      'KeyB': Button.B,
    };

    document.addEventListener('keydown', (e) => {
      const button = keyMap[e.code];
      if (button && !this.state[button]) {
        this.state[button] = true;
        this._highlightButton(button, true);
        if (this.onPress) this.onPress(button);
      }
      // Prevent space/arrows from scrolling
      if (e.code === 'Space' || e.code.startsWith('Arrow')) {
        e.preventDefault();
      }
    });

    document.addEventListener('keyup', (e) => {
      const button = keyMap[e.code];
      if (button) {
        this.state[button] = false;
        this._highlightButton(button, false);
        if (this.onRelease) this.onRelease(button);
      }
    });
  }

  /**
   * Set up on-screen button controls
   */
  _setupButtons() {
    const buttonMap = {
      'btn-dpad': Button.DPAD,
      'btn-a': Button.A,
      'btn-b': Button.B,
    };

    for (const [elementId, button] of Object.entries(buttonMap)) {
      const element = document.getElementById(elementId);
      if (!element) continue;

      // Mouse events
      element.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.state[button] = true;
        if (this.onPress) this.onPress(button);
      });

      element.addEventListener('mouseup', () => {
        this.state[button] = false;
        if (this.onRelease) this.onRelease(button);
      });

      element.addEventListener('mouseleave', () => {
        if (this.state[button]) {
          this.state[button] = false;
          if (this.onRelease) this.onRelease(button);
        }
      });

      // Touch events for mobile
      element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.state[button] = true;
        if (this.onPress) this.onPress(button);
      });

      element.addEventListener('touchend', () => {
        this.state[button] = false;
        if (this.onRelease) this.onRelease(button);
      });
    }
  }

  /**
   * Highlight button on screen when pressed via keyboard
   */
  _highlightButton(button, pressed) {
    const idMap = {
      [Button.DPAD]: 'btn-dpad',
      [Button.A]: 'btn-a',
      [Button.B]: 'btn-b',
    };

    const element = document.getElementById(idMap[button]);
    if (element) {
      if (pressed) {
        element.classList.add('pressed');
      } else {
        element.classList.remove('pressed');
      }
    }
  }
}
