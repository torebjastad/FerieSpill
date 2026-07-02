// Small whole-track overview in a corner, so the player can navigate even when
// most of the track is off screen.
class Minimap {
  constructor(track) {
    this.track = track;
    this.w = 190;
    this.h = 150;
    this.pad = 10;
  }

  _fit() {
    const b = this.track.bounds;
    const bw = b.maxX - b.minX, bh = b.maxY - b.minY;
    const s = Math.min((this.w - 2 * this.pad) / bw, (this.h - 2 * this.pad) / bh);
    const ox = this.pad + ((this.w - 2 * this.pad) - bw * s) / 2;
    const oy = this.pad + ((this.h - 2 * this.pad) - bh * s) / 2;
    return { s, ox, oy, b };
  }

  draw(ctx, car, visited, screenW) {
    const x0 = screenW - this.w - 14;
    const y0 = 14;
    const f = this._fit();
    const tx = (p) => x0 + f.ox + (p.x - f.b.minX) * f.s;
    const ty = (p) => y0 + f.oy + (p.y - f.b.minY) * f.s;

    ctx.save();
    // panel
    ctx.fillStyle = 'rgba(18,22,28,0.78)';
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    this._roundRect(ctx, x0, y0, this.w, this.h, 10);
    ctx.fill(); ctx.stroke();

    // road
    const pts = this.track.centerline;
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx(pts[0]), ty(pts[0]));
    for (let i = 1; i < pts.length; i++) ctx.lineTo(tx(pts[i]), ty(pts[i]));
    ctx.closePath();
    ctx.stroke();

    // highlights
    this.track.city.highlights.forEach((h) => {
      ctx.beginPath();
      ctx.arc(tx(h), ty(h), 4, 0, Math.PI * 2);
      ctx.fillStyle = visited.has(h.id) ? '#4fc06a' : '#f0c040';
      ctx.fill();
    });

    // start
    ctx.beginPath();
    ctx.arc(tx(this.track.start), ty(this.track.start), 4, 0, Math.PI * 2);
    ctx.fillStyle = '#4d7dff';
    ctx.fill();

    // car (arrow)
    ctx.save();
    ctx.translate(tx(car.pos), ty(car.pos));
    ctx.rotate(car.heading);
    ctx.fillStyle = '#ff5a4d';
    ctx.beginPath();
    ctx.moveTo(6, 0); ctx.lineTo(-4, -4); ctx.lineTo(-4, 4);
    ctx.closePath(); ctx.fill();
    ctx.restore();

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
