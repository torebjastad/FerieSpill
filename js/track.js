// Builds and draws the loop track (a closed Catmull-Rom spline through the
// city's waypoints), the surrounding water/parks/buildings, the start line and
// highlight markers. Also answers "is the car off the road?".
class Track {
  constructor(city) {
    this.city = city;
    this.roadWidth = city.roadWidth || 70;
    this.centerline = this._buildSpline(city.waypoints, 16);

    // Start = first sample; heading toward the next sample.
    const a = this.centerline[0];
    const b = this.centerline[3];
    this.start = { x: a.x, y: a.y };
    this.startHeading = Math.atan2(b.y - a.y, b.x - a.x);

    this.bounds = this._computeBounds();
  }

  _buildSpline(pts, segsPer) {
    const n = pts.length, out = [];
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i];
      const p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      for (let s = 0; s < segsPer; s++) {
        out.push(Utils.catmullRom(p0, p1, p2, p3, s / segsPer));
      }
    }
    return out;
  }

  _computeBounds() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const grow = (x, y) => {
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    };
    this.centerline.forEach((p) => grow(p.x, p.y));
    this.city.highlights.forEach((h) => grow(h.x, h.y));
    const m = 140;
    return { minX: minX - m, minY: minY - m, maxX: maxX + m, maxY: maxY + m };
  }

  // Distance from a point to the road centerline (with early-out).
  distanceToRoad(pos) {
    let min = Infinity;
    const pts = this.centerline, n = pts.length;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const d = Utils.pointSegDist(pos.x, pos.y, a.x, a.y, b.x, b.y);
      if (d < min) { min = d; if (min < this.roadWidth * 0.4) return min; }
    }
    return min;
  }

  isOffRoad(pos) { return this.distanceToRoad(pos) > this.roadWidth * 0.5; }

  // ---- rendering -----------------------------------------------------------

  draw(ctx, camera) {
    const t = this.city.theme;

    // Land base.
    ctx.fillStyle = t.land;
    ctx.fillRect(this.bounds.minX, this.bounds.minY,
      this.bounds.maxX - this.bounds.minX, this.bounds.maxY - this.bounds.minY);

    // Parks / forest.
    (this.city.parks || []).forEach((poly) => {
      this._fillPoly(ctx, poly, t.park);
    });

    // Water bodies.
    (this.city.water || []).forEach((w) => {
      const col = w.type === 'sea' ? t.sea : (w.type === 'lake' ? t.lake : t.water);
      this._fillPoly(ctx, w.points, col);
    });

    // Skid marks (drawn under the road? no — under car, above road) handled by game.

    // Road: dark edge, then tarmac, then dashed centre line.
    this._strokeCenterline(ctx, this.roadWidth + 8, t.roadEdge);
    this._strokeCenterline(ctx, this.roadWidth, t.road);
    this._dashedCenterLine(ctx, t.roadLine);

    // Buildings.
    (this.city.buildings || []).forEach((b) => {
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(b.x + 3, b.y + 3, b.w, b.h);
      ctx.fillStyle = b.color || t.building;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    this._drawStart(ctx);
  }

  _strokeCenterline(ctx, width, color) {
    const pts = this.centerline;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.stroke();
  }

  _dashedCenterLine(ctx, color) {
    const pts = this.centerline;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([16, 20]);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  _drawStart(ctx) {
    // Checkered start/finish band across the road at the start point.
    const a = this.centerline[0];
    const dir = { x: Math.cos(this.startHeading), y: Math.sin(this.startHeading) };
    const perp = { x: -dir.y, y: dir.x };
    const hw = this.roadWidth / 2;
    const cell = hw / 3;
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(this.startHeading);
    for (let row = 0; row < 2; row++) {
      for (let col = -3; col < 3; col++) {
        ctx.fillStyle = ((row + col) & 1) ? '#ffffff' : '#111111';
        ctx.fillRect(row * cell - cell, col * cell, cell, cell);
      }
    }
    ctx.restore();
    void perp;
  }

  drawHighlights(ctx, visited, allVisited, time) {
    this.city.highlights.forEach((h, i) => {
      const done = visited.has(h.id);
      const pulse = 1 + 0.12 * Math.sin(time / 300 + i);
      const r = 26 * pulse;
      ctx.save();
      // trigger ring
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
      ctx.fillStyle = done ? 'rgba(90,200,120,0.10)' : 'rgba(255,210,70,0.10)';
      ctx.fill();
      // marker
      ctx.beginPath();
      ctx.arc(h.x, h.y, r, 0, Math.PI * 2);
      ctx.fillStyle = done ? '#3fa55a' : '#e8b23a';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(done ? '✓' : String(i + 1), h.x, h.y + 1);
      // label
      ctx.font = '600 15px sans-serif';
      ctx.textBaseline = 'bottom';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.strokeText(h.name, h.x, h.y - r - 6);
      ctx.fillText(h.name, h.x, h.y - r - 6);
      ctx.restore();
    });

    if (allVisited) {
      // Flag home.
      ctx.save();
      const s = this.start;
      const pulse = 1 + 0.15 * Math.sin(time / 250);
      ctx.beginPath();
      ctx.arc(s.x, s.y, 30 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = '#4d7dff';
      ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('★', s.x, s.y + 1);
      ctx.restore();
    }
  }

  _fillPoly(ctx, poly, color) {
    if (!poly || poly.length < 3) return;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(poly[0].x, poly[0].y);
    for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
    ctx.closePath();
    ctx.fill();
  }
}
