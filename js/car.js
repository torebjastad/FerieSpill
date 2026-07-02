// Top-down arcade drift car. Velocity is kept in world space; each frame it is
// split into forward/lateral components relative to the (freshly steered)
// heading. The lateral component is bled off by a grip coefficient — high grip
// means the car tracks its heading, low grip (or a hard turn at speed) leaves
// lateral velocity behind, i.e. a slide.
class Car {
  constructor(x, y, heading) {
    this.pos = { x, y };
    this.heading = heading;        // radians, 0 = +x
    this.vel = { x: 0, y: 0 };     // world-space velocity

    // Tuning (units are px/s, px/s^2).
    this.enginePower = 760;
    this.reversePower = 300;
    this.brakePower = 1350;
    this.maxSpeed = 560;
    this.maxTurn = 3.0;            // rad/s at full steer

    this.gripRoad = 8.0;           // lateral decay rate /s on tarmac
    this.gripOffRoad = 3.4;        // grass: slippery
    this.gripHandbrake = 1.4;      // deliberate drift

    this.width = 22;
    this.length = 42;

    // Derived per frame.
    this.speed = 0;
    this.lateral = 0;
    this.offRoad = false;
    this.drifting = false;
    this.skidMarks = [];           // recent {x,y} while sliding
  }

  update(dt, input, offRoad) {
    this.offRoad = offRoad;

    // 1. Steering rotates the heading. Needs some speed to bite, and eases off
    //    at very high speed for stability.
    const speed = Math.hypot(this.vel.x, this.vel.y);
    let fwd = { x: Math.cos(this.heading), y: Math.sin(this.heading) };
    const goingForward = (this.vel.x * fwd.x + this.vel.y * fwd.y) >= -1;
    const steerAuth = Utils.clamp(speed / 90, 0, 1) *
      (1 - 0.35 * Utils.clamp((speed - 360) / 240, 0, 1));
    let turn = input.steer * this.maxTurn * steerAuth;
    if (!goingForward) turn = -turn; // reverse steering
    this.heading += turn * dt;

    // 2. Rebuild basis with the new heading and decompose world velocity.
    fwd = { x: Math.cos(this.heading), y: Math.sin(this.heading) };
    const right = { x: -Math.sin(this.heading), y: Math.cos(this.heading) };
    let vForward = this.vel.x * fwd.x + this.vel.y * fwd.y;
    let vRight = this.vel.x * right.x + this.vel.y * right.y;

    // 3. Engine / brake along the forward axis.
    const throttle = input.throttle;
    if (throttle > 0) {
      vForward += this.enginePower * throttle * dt * (offRoad ? 0.6 : 1);
    } else if (throttle < 0) {
      if (vForward > 12) {
        vForward -= this.brakePower * (-throttle) * dt;   // brake
      } else {
        vForward += this.reversePower * throttle * dt;    // reverse
      }
    }

    // 4. Rolling resistance (linear) + drag (quadratic).
    const linFric = offRoad ? 3.2 : 0.9;
    const quadDrag = 0.0019;
    vForward -= (vForward * linFric +
      Math.sign(vForward) * vForward * vForward * quadDrag) * dt;
    vForward = Utils.clamp(vForward, -this.maxSpeed * 0.4, this.maxSpeed);

    // 5. Grip bleeds off lateral velocity (the drift model).
    let grip = offRoad ? this.gripOffRoad : this.gripRoad;
    if (input.handbrake) grip = this.gripHandbrake;
    vRight *= Math.exp(-grip * dt);

    // 6. Recompose world velocity and integrate.
    this.vel.x = fwd.x * vForward + right.x * vRight;
    this.vel.y = fwd.y * vForward + right.y * vRight;
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;

    // Bookkeeping for HUD + effects.
    this.speed = Math.hypot(this.vel.x, this.vel.y);
    this.lateral = Math.abs(vRight);
    this.drifting = this.lateral > 55 && this.speed > 60;

    if (this.drifting || (this.offRoad && this.speed > 40)) {
      this.skidMarks.push({ x: this.pos.x, y: this.pos.y });
      if (this.skidMarks.length > 220) this.skidMarks.shift();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.heading);
    const L = this.length, W = this.width;

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    this._roundRect(ctx, -L / 2 + 3, -W / 2 + 4, L, W, 6);
    ctx.fill();

    // body
    const grad = ctx.createLinearGradient(0, -W / 2, 0, W / 2);
    grad.addColorStop(0, '#ff5a4d');
    grad.addColorStop(1, '#c9302a');
    ctx.fillStyle = grad;
    this._roundRect(ctx, -L / 2, -W / 2, L, W, 6);
    ctx.fill();

    // windshield / roof
    ctx.fillStyle = '#22303a';
    this._roundRect(ctx, -L * 0.05, -W * 0.34, L * 0.34, W * 0.68, 3);
    ctx.fill();
    // headlights
    ctx.fillStyle = '#fff4c2';
    ctx.fillRect(L / 2 - 4, -W / 2 + 2, 3, 4);
    ctx.fillRect(L / 2 - 4, W / 2 - 6, 3, 4);
    ctx.restore();
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
