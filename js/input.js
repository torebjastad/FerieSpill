// Controls: keyboard on desktop, and an analog two-thumb touch layout on phones
// (a floating steering pad on the left, GAS / BRAKE / DRIFT pedals on the right).
//
// Robustness notes: pointer tracking for steering is done on `window` (not via
// element pointer-capture), and every pointer stream has window-level up/cancel
// fallbacks plus a global reset on blur / tab-hide. This makes it impossible for
// the stick or a pedal to "stick" in a pressed/offset state if iOS steals or
// drops a pointer (e.g. when a system gesture interrupts the touch).
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

    // Active touch pointers.
    this._steerId = null;
    this._steerOrigin = 0;
    this._pedals = {};  // id -> { pointerId, release }

    this._bindKeyboard();
    this._bindSteering();
    this._bindPedals();
    this._bindGlobalSafety();
    this._installZoomGuards();
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

  // Floating analog steering. Touch anywhere in the left zone to plant the
  // stick; move/up/cancel are tracked on `window` so we never lose the release.
  _bindSteering() {
    const zone = document.getElementById('steer-zone');
    const base = document.getElementById('steer-base');
    const knob = document.getElementById('steer-knob');
    if (!zone) return;
    this._steerEls = { zone, base, knob };

    const place = (el, x, y) => {
      const r = zone.getBoundingClientRect();
      el.style.left = (x - r.left) + 'px';
      el.style.top = (y - r.top) + 'px';
    };

    zone.addEventListener('pointerdown', (e) => {
      if (this._steerId !== null) return;
      this._steerId = e.pointerId;
      this._steerOrigin = e.clientX;
      place(base, e.clientX, e.clientY);
      place(knob, e.clientX, e.clientY);
      zone.classList.add('active');
      this._haptic(8);
      e.preventDefault();
    });

    // Tracked on window so dragging outside the zone still updates/releases.
    window.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this._steerId) return;
      const dx = e.clientX - this._steerOrigin;
      const mag = Math.abs(dx) < this.deadZone ? 0 : dx;
      this.tSteer = Math.max(-1, Math.min(1, mag / this.maxDrag));
      const clamped = Math.max(-this.maxDrag, Math.min(this.maxDrag, dx));
      const r = zone.getBoundingClientRect();
      knob.style.left = (this._steerOrigin + clamped - r.left) + 'px';
    });
  }

  _releaseSteer() {
    this._steerId = null;
    this.tSteer = 0;
    if (this._steerEls) this._steerEls.zone.classList.remove('active');
  }

  _bindPedals() {
    this._pedal('btn-gas', 'gas', () => { this.tGas = 1; }, () => { this.tGas = 0; });
    this._pedal('btn-brake', 'brake', () => { this.tBrake = 1; }, () => { this.tBrake = 0; });
    this._pedal('btn-hand', 'hand',
      () => { this.tHand = true; this._haptic(12); },
      () => { this.tHand = false; });
  }

  _pedal(id, key, on, off) {
    const el = document.getElementById(id);
    if (!el) return;
    const release = () => { el.classList.remove('pressed'); off(); this._pedals[key] = null; };
    this._pedals[key] = null;
    el.addEventListener('pointerdown', (e) => {
      this._pedals[key] = { pointerId: e.pointerId, el, release };
      el.classList.add('pressed');
      on();
      e.preventDefault();
    });
  }

  // Window-level fallbacks + a hard reset when focus/visibility is lost.
  _bindGlobalSafety() {
    const endPointer = (e) => {
      if (e.pointerId === this._steerId) this._releaseSteer();
      for (const key of Object.keys(this._pedals)) {
        const p = this._pedals[key];
        if (p && p.pointerId === e.pointerId) p.release();
      }
    };
    window.addEventListener('pointerup', endPointer);
    window.addEventListener('pointercancel', endPointer);
    window.addEventListener('blur', () => this.resetTouch());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.resetTouch();
    });
    window.addEventListener('pagehide', () => this.resetTouch());
  }

  // Zero every touch control and recentre the stick.
  resetTouch() {
    this._releaseSteer();
    for (const key of Object.keys(this._pedals)) {
      const p = this._pedals[key];
      if (p) p.release();
    }
    this.tGas = 0; this.tBrake = 0; this.tHand = false;
  }

  // Stop iOS/Safari from pinch-, double-tap- or gesture-zooming the game (which
  // can otherwise leave the player stuck zoomed in with no way back).
  _installZoomGuards() {
    const stop = (e) => e.preventDefault();
    ['gesturestart', 'gesturechange', 'gestureend'].forEach((t) =>
      document.addEventListener(t, stop, { passive: false }));
    document.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 1) e.preventDefault();
    }, { passive: false });
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      // Suppress double-tap-to-zoom, but never on real controls/buttons.
      if (now - lastTouchEnd <= 350 &&
          !(e.target.closest && e.target.closest('button, select, a'))) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
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
