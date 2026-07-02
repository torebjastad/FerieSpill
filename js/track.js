// Builds and draws the loop track (a closed Catmull-Rom spline through the
// city's waypoints), the surrounding water/parks/buildings, the start line and
// highlight markers. Also answers "is the car off the road?".
class Track {
  constructor(city) {
    this.city = city;
    this.roadWidth = city.roadWidth || 70;
    this._segsPer = 16;
    this.centerline = this._buildSpline(city.waypoints, this._segsPer);

    // Start line sits at a chosen waypoint (default 0), pointing along the loop.
    // `startIndex` lets a city place the line on a stretch clear of highlights.
    const n = this.centerline.length;
    this.startSample = ((city.startIndex || 0) * this._segsPer) % n;
    const a = this.centerline[this.startSample];
    const b = this.centerline[(this.startSample + 3) % n];
    this.start = { x: a.x, y: a.y };
    this.startHeading = Math.atan2(b.y - a.y, b.x - a.x);

    // Little "lollipop" side roads out to each highlight, so you can reach them
    // on tarmac instead of driving across the grass.
    this.sideWidth = this.roadWidth * 0.72;
    this.sideRoads = this._buildSideRoads();

    this.bounds = this._computeBounds();
  }

  _nearestCenterlinePoint(p) {
    const pts = this.centerline, n = pts.length;
    let best = pts[0], bestD = Infinity;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const dx = b.x - a.x, dy = b.y - a.y;
      const l2 = dx * dx + dy * dy || 1;
      let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
      t = Math.max(0, Math.min(1, t));
      const cx = a.x + t * dx, cy = a.y + t * dy;
      const d = Math.hypot(p.x - cx, p.y - cy);
      if (d < bestD) { bestD = d; best = { x: cx, y: cy }; }
    }
    return best;
  }

  // Each side road is a spur from the main road out to a small loop (cul-de-sac)
  // encircling the highlight, so you can drive in, trigger it, and loop back out.
  _buildSideRoads() {
    const rLoop = 50, segs = 22;
    return this.city.highlights.map((h) => {
      const p = this._nearestCenterlinePoint(h);
      const len = Math.hypot(h.x - p.x, h.y - p.y) || 1;
      const dx = (h.x - p.x) / len, dy = (h.y - p.y) / len;
      const entry = { x: h.x - dx * rLoop, y: h.y - dy * rLoop };
      const pts = [{ x: p.x, y: p.y }, entry];
      const startAng = Math.atan2(entry.y - h.y, entry.x - h.x);
      for (let i = 1; i <= segs; i++) {
        const a = startAng + (i / segs) * Math.PI * 2;
        pts.push({ x: h.x + Math.cos(a) * rLoop, y: h.y + Math.sin(a) * rLoop });
      }
      pts.push(entry, { x: p.x, y: p.y });
      return { points: pts };
    });
  }

  // Distance from a point to the main road centerline (with early-out).
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

  distanceToSideRoad(pos) {
    let min = Infinity;
    for (const r of this.sideRoads) {
      const pts = r.points;
      for (let i = 0; i < pts.length - 1; i++) {
        const d = Utils.pointSegDist(pos.x, pos.y, pts[i].x, pts[i].y,
          pts[i + 1].x, pts[i + 1].y);
        if (d < min) { min = d; if (min < this.sideWidth * 0.4) return min; }
      }
    }
    return min;
  }

  isOffRoad(pos) {
    if (this.distanceToRoad(pos) <= this.roadWidth * 0.5) return false;
    if (this.distanceToSideRoad(pos) <= this.sideWidth * 0.5) return false;
    return true;
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

    // Side-road spurs first, so the main road overlays their junctions cleanly.
    this.sideRoads.forEach((r) => this._strokePath(ctx, r.points, this.sideWidth + 8, t.roadEdge));
    this.sideRoads.forEach((r) => this._strokePath(ctx, r.points, this.sideWidth, t.road));

    // Main road: dark edge, then tarmac, then dashed centre line.
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

  _strokePath(ctx, pts, width, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
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
    const a = this.start;
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
