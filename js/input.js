// Controls: keyboard on desktop, and an analog two-thumb touch layout on phones
// (a floating steering pad on the left, GAS / BRAKE / DRIFT pedals on the right).
// Pointer Events are used so left-thumb steering and right-thumb pedals work
// simultaneously. Steering is analog (-1..1) to match the drift physics.
class Input {
  constructor() {
    this.keys = {};

    // Touch state.
    this.tSteer = 0;    // -1..1 analog from steering pad
    this.tGas = 0;      // 0/1
    this.tBrake = 0;    // 0/1
    this.tHand = false; // handbrake / drift

    this.maxDrag = 105; // px of thumb travel for full lock
    this.deadZone = 6;

    this._bindKeyboard();
    this._bindSteering();
    this._bindPedals();
  }

  _bindKeyboard() {
    const tracked = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space',
      'KeyW', 'KeyA', 'KeyS', 'KeyD'];
    window.addEventListener('keydown', (e) => {
      if (tracked.includes(e.code)) e.preventDefault();
      this.keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    window.addEventListener('blur', () => { this.keys = {}; });
  }

  _haptic(ms) {
    if (navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* ignore */ } }
  }

  // Floating analog steering: touch anywhere in the left zone to plant the
  // stick, then slide left/right to steer proportionally. Releasing recenters.
  _bindSteering() {
    const zone = document.getElementById('steer-zone');
    const base = document.getElementById('steer-base');
    const knob = document.getElementById('steer-knob');
    if (!zone) return;

    let pointerId = null;
    let originX = 0, originY = 0;

    const place = (el, x, y) => {
      const r = zone.getBoundingClientRect();
      el.style.left = (x - r.left) + 'px';
      el.style.top = (y - r.top) + 'px';
    };

    zone.addEventListener('pointerdown', (e) => {
      if (pointerId !== null) return;
      pointerId = e.pointerId;
      try { zone.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      originX = e.clientX; originY = e.clientY;
      place(base, originX, originY);
      place(knob, originX, originY);
      zone.classList.add('active');
      this._haptic(8);
      e.preventDefault();
    });

    zone.addEventListener('pointermove', (e) => {
      if (e.pointerId !== pointerId) return;
      let dx = e.clientX - originX;
      const mag = Math.abs(dx) < this.deadZone ? 0 : dx;
      this.tSteer = Math.max(-1, Math.min(1, mag / this.maxDrag));
      const clamped = Math.max(-this.maxDrag, Math.min(this.maxDrag, dx));
      place(knob, originX + clamped, originY);
      e.preventDefault();
    });

    const end = (e) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      this.tSteer = 0;
      zone.classList.remove('active');
    };
    zone.addEventListener('pointerup', end);
    zone.addEventListener('pointercancel', end);
  }

  _bindPedals() {
    this._pedal('btn-gas', () => { this.tGas = 1; }, () => { this.tGas = 0; });
    this._pedal('btn-brake', () => { this.tBrake = 1; }, () => { this.tBrake = 0; });
    this._pedal('btn-hand',
      () => { this.tHand = true; this._haptic(12); },
      () => { this.tHand = false; });
  }

  _pedal(id, on, off) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('pointerdown', (e) => {
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      el.classList.add('pressed');
      on();
      e.preventDefault();
    });
    const up = (e) => { el.classList.remove('pressed'); off(); };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', up);
  }

  // Returns {throttle:-1..1, steer:-1..1, handbrake:bool}
  read() {
    const k = this.keys;
    const kSteer = ((k['ArrowRight'] || k['KeyD']) ? 1 : 0) -
      ((k['ArrowLeft'] || k['KeyA']) ? 1 : 0);
    const kGas = (k['ArrowUp'] || k['KeyW']) ? 1 : 0;
    const kBrake = (k['ArrowDown'] || k['KeyS']) ? 1 : 0;

    const steer = kSteer !== 0 ? kSteer : this.tSteer;
    const gas = Math.max(kGas, this.tGas);
    const brake = Math.max(kBrake, this.tBrake);
    const handbrake = !!k['Space'] || this.tHand;

    return {
      throttle: gas > 0 ? gas : (brake > 0 ? -brake : 0),
      steer: Math.max(-1, Math.min(1, steer)),
      handbrake
    };
  }
}
