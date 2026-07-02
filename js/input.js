// Keyboard + optional on-screen touch buttons -> a simple control state.
class Input {
  constructor() {
    this.keys = {};
    this.touch = { up: false, down: false, left: false, right: false, brake: false };

    window.addEventListener('keydown', (e) => {
      if (this._tracked(e.code)) e.preventDefault();
      this.keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    window.addEventListener('blur', () => { this.keys = {}; });

    this._bindTouch();
  }

  _tracked(code) {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space',
      'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(code);
  }

  _bindTouch() {
    const map = { 'btn-up': 'up', 'btn-down': 'down', 'btn-left': 'left',
      'btn-right': 'right', 'btn-brake': 'brake' };
    Object.keys(map).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const key = map[id];
      const on = (e) => { e.preventDefault(); this.touch[key] = true; };
      const off = (e) => { e.preventDefault(); this.touch[key] = false; };
      el.addEventListener('touchstart', on, { passive: false });
      el.addEventListener('touchend', off, { passive: false });
      el.addEventListener('touchcancel', off, { passive: false });
      el.addEventListener('mousedown', on);
      el.addEventListener('mouseup', off);
      el.addEventListener('mouseleave', off);
    });
  }

  // Returns {throttle:-1..1, steer:-1..1, handbrake:bool}
  read() {
    const k = this.keys, t = this.touch;
    const up = k['ArrowUp'] || k['KeyW'] || t.up;
    const down = k['ArrowDown'] || k['KeyS'] || t.down;
    const left = k['ArrowLeft'] || k['KeyA'] || t.left;
    const right = k['ArrowRight'] || k['KeyD'] || t.right;
    const brake = k['Space'] || t.brake;
    return {
      throttle: (up ? 1 : 0) - (down ? 1 : 0),
      steer: (right ? 1 : 0) - (left ? 1 : 0),
      handbrake: !!brake
    };
  }
}
