// Ties everything together: state machine (menu / driving / quiz / finished),
// the fixed-ish update loop, timing, highlight triggering and the HUD.
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input();
    this.quiz = new Quiz();
    this.camera = new Camera(1.0);

    this.state = 'menu';
    this.city = null;
    this.track = null;
    this.car = null;
    this.minimap = null;

    this.visited = new Set();
    this.elapsed = 0;      // ms of driving time
    this.started = false;  // clock starts on first movement
    this.allVisited = false;

    this.lastT = 0;
    this._resize();
    window.addEventListener('resize', () => this._resize());
    requestAnimationFrame((t) => this._frame(t));
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.vw = window.innerWidth;
    this.vh = window.innerHeight;
    this.camera.resize(this.vw, this.vh);
  }

  start(city) {
    this.city = city;
    this.track = new Track(city);
    this.minimap = new Minimap(this.track);
    this.car = new Car(this.track.start.x, this.track.start.y, this.track.startHeading);
    this.visited = new Set();
    this.elapsed = 0;
    this.started = false;
    this.allVisited = false;
    this.state = 'driving';
    this.camera.snapTo(this.car.pos.x, this.car.pos.y);
    document.getElementById('menu').classList.remove('show');
    document.getElementById('finish').classList.remove('show');
    document.getElementById('hud').classList.add('show');
    document.getElementById('touch-controls').classList.add('show');
    this._updateHud();
  }

  _frame(t) {
    const dt = Math.min(0.033, (t - this.lastT) / 1000 || 0);
    this.lastT = t;
    if (this.state === 'driving') this._update(dt, t);
    this._render(t);
    requestAnimationFrame((tt) => this._frame(tt));
  }

  _update(dt, t) {
    const input = this.input.read();
    const off = this.track.isOffRoad(this.car.pos);
    this.car.update(dt, input, off);

    // Start the clock once the car actually moves.
    if (!this.started && this.car.speed > 8) this.started = true;
    if (this.started) this.elapsed += dt * 1000;

    this.camera.follow(this.car.pos, this.car.vel, dt);

    this._checkHighlights();
    this._checkFinish();
    this._updateHud();
  }

  _checkHighlights() {
    if (this.quiz.active) return;
    for (const h of this.city.highlights) {
      if (this.visited.has(h.id)) continue;
      const d = Utils.dist(this.car.pos.x, this.car.pos.y, h.x, h.y);
      // Must be in range AND slowed down (you have to actually stop by).
      if (d < h.radius && this.car.speed < 70) {
        this.state = 'quiz';
        this.quiz.open(h,
          () => { this.visited.add(h.id); this._afterQuiz(); },
          () => { this.elapsed += 5000; });
        return;
      }
    }
  }

  _afterQuiz() {
    this.allVisited = this.visited.size === this.city.highlights.length;
    this.state = 'driving';
    this._updateHud();
  }

  _checkFinish() {
    if (!this.allVisited) return;
    const d = Utils.dist(this.car.pos.x, this.car.pos.y,
      this.track.start.x, this.track.start.y);
    if (d < 90) this._finish();
  }

  _finish() {
    this.state = 'finished';
    document.getElementById('hud').classList.remove('show');
    document.getElementById('touch-controls').classList.remove('show');
    const timeStr = Utils.formatTime(this.elapsed);
    document.getElementById('finish-time').textContent = timeStr;

    // Best time per city in localStorage.
    let best = null;
    try {
      const key = 'feriespill.best.' + this.city.id;
      const prev = parseFloat(localStorage.getItem(key));
      if (!prev || this.elapsed < prev) { localStorage.setItem(key, this.elapsed); best = this.elapsed; }
      else best = prev;
    } catch (e) { /* storage may be unavailable */ }
    const bestEl = document.getElementById('finish-best');
    bestEl.textContent = best != null ? Utils.formatTime(best) : timeStr;

    document.getElementById('finish').classList.add('show');
  }

  _updateHud() {
    const timeEl = document.getElementById('hud-time');
    const progEl = document.getElementById('hud-progress');
    const hintEl = document.getElementById('hud-hint');
    if (timeEl) timeEl.textContent = Utils.formatTime(this.elapsed);
    if (progEl) progEl.textContent =
      `${this.visited.size} / ${this.city.highlights.length}`;
    if (hintEl) {
      hintEl.textContent = this.allVisited
        ? 'All done — return to ★ START!'
        : (this.car && this.car.offRoad ? 'Off-road — slow!' : 'Visit the numbered highlights');
    }
  }

  _render(t) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.vw, this.vh);
    if (this.state === 'menu' || !this.track) {
      ctx.fillStyle = '#12324a';
      ctx.fillRect(0, 0, this.vw, this.vh);
      return;
    }

    ctx.save();
    this.camera.apply(ctx);

    this.track.draw(ctx, this.camera);
    this._drawSkids(ctx);
    this.track.drawHighlights(ctx, this.visited, this.allVisited, t);
    this.car.draw(ctx);

    ctx.restore();

    // Screen-space overlays.
    this.minimap.draw(ctx, this.car, this.visited, this.vw);
    this._drawSpeedo(ctx);
  }

  _drawSkids(ctx) {
    const marks = this.car.skidMarks;
    if (!marks.length) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(20,20,20,0.35)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(marks[0].x, marks[0].y);
    for (let i = 1; i < marks.length; i++) ctx.lineTo(marks[i].x, marks[i].y);
    ctx.stroke();
    ctx.restore();
  }

  _drawSpeedo(ctx) {
    const kmh = Math.round(this.car.speed / 3.4);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(kmh + ' km/h', this.vw / 2, this.vh - 14);
    if (this.car.drifting) {
      ctx.fillStyle = '#ffd23a';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('DRIFT!', this.vw / 2, this.vh - 46);
    }
    ctx.restore();
  }
}
