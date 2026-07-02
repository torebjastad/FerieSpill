// Smooth-follow camera with velocity look-ahead. Holds the world<->screen
// transform for the current frame.
class Camera {
  constructor(zoom) {
    this.x = 0;
    this.y = 0;
    this.zoom = zoom || 1;
    this.vw = 0;
    this.vh = 0;
  }

  resize(w, h) { this.vw = w; this.vh = h; }

  // Snap instantly (used when a run starts).
  snapTo(x, y) { this.x = x; this.y = y; }

  follow(target, vel, dt) {
    // Look ahead in the direction of travel so you can see where you're going.
    const lookAhead = 0.35;
    const tx = target.x + (vel ? vel.x * lookAhead : 0);
    const ty = target.y + (vel ? vel.y * lookAhead : 0);
    const k = 1 - Math.pow(0.0025, dt); // frame-rate independent smoothing
    this.x = Utils.lerp(this.x, tx, k);
    this.y = Utils.lerp(this.y, ty, k);
  }

  apply(ctx) {
    ctx.translate(this.vw / 2, this.vh / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }
}
