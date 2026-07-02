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
    this.armed = new Set();
    this.elapsed = 0;      // ms of driving time
    this.penaltyMs = 0;    // ms added by wrong answers
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
    this.armed = new Set();
    this.elapsed = 0;
    this.penaltyMs = 0;
    this.started = false;
    this.allVisited = false;
    this.state = 'driving';
    this.input.resetTouch();
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
    // The clock runs whenever a run is underway — including while a quiz is
    // open, so answering quickly (and not fumbling questions) matters.
    if (this.started && (this.state === 'driving' || this.state === 'quiz')) {
      this.elapsed += dt * 1000;
    }
    if (this.state === 'driving') this._update(dt, t);
    else if (this.state === 'quiz') this._updateQuizTimer();
    this._render(t);
    requestAnimationFrame((tt) => this._frame(tt));
  }

  _updateQuizTimer() {
    const el = document.getElementById('quiz-timer');
    if (el) el.textContent = Utils.formatTime(this.total());
  }

  _update(dt, t) {
    const input = this.input.read();
    const off = this.track.isOffRoad(this.car.pos);
    this.car.update(dt, input, off);

    // Start the clock once the car actually moves.
    if (!this.started && this.car.speed > 8) this.started = true;

    this.camera.follow(this.car.pos, this.car.vel, dt);

    this._checkHighlights();
    this._checkFinish();
    this._updateHud();
    this._updateHeadsUp();
  }

  // The next thing to aim for: nearest unvisited highlight, or START once done.
  _headsUpTarget() {
    if (this.allVisited) {
      return { x: this.track.start.x, y: this.track.start.y, name: 'START', home: true };
    }
    let best = null, bestD = Infinity;
    for (const h of this.city.highlights) {
      if (this.visited.has(h.id)) continue;
      const d = Utils.dist(this.car.pos.x, this.car.pos.y, h.x, h.y);
      if (d < bestD) { bestD = d; best = h; }
    }
    return best ? { x: best.x, y: best.y, name: best.name, dist: bestD } : null;
  }

  _updateHeadsUp() {
    const target = this._headsUpTarget();
    this._huTarget = target;
    const el = document.getElementById('ahead');
    if (!el) return;
    if (!target) { el.classList.remove('show'); return; }
    const d = Utils.dist(this.car.pos.x, this.car.pos.y, target.x, target.y);
    const aheadRange = 1000;
    if (d <= aheadRange) {
      document.getElementById('ahead-name').textContent =
        target.home ? 'Return to START' : target.name;
      document.getElementById('ahead-dist').textContent = Math.round(d / 12) + ' m';
      el.classList.add('show');
      el.classList.toggle('near', d < 340);
    } else {
      el.classList.remove('show');
    }
  }

  _checkHighlights() {
    if (this.quiz.active) return;
    for (const h of this.city.highlights) {
      const d = Utils.dist(this.car.pos.x, this.car.pos.y, h.x, h.y);
      // A highlight only becomes triggerable once the car has been outside its
      // ring, so spawning inside one never fires a quiz on the first frame.
      if (d > h.radius + 8) this.armed.add(h.id);
      if (this.visited.has(h.id) || !this.armed.has(h.id)) continue;
      // Must be in range AND slowed down (you have to actually stop by).
      if (d < h.radius && this.car.speed < 70) {
        this.state = 'quiz';
        this.input.resetTouch();
        this.quiz.open(h,
          () => { this.visited.add(h.id); this._afterQuiz(); },
          () => { this.penaltyMs += Quiz.PENALTY_MS; this._flashPenalty(); });
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
    if (d < 110) this._finish();
  }

  total() { return this.elapsed + this.penaltyMs; }

  _flashPenalty() {
    const timeEl = document.getElementById('hud-time');
    const popEl = document.getElementById('penalty-pop');
    if (popEl) {
      popEl.textContent = `+${Quiz.PENALTY_MS / 1000}s`;
      popEl.classList.remove('show');
      void popEl.offsetWidth; // restart the animation
      popEl.classList.add('show');
    }
    if (timeEl) {
      timeEl.classList.add('penalty');
      setTimeout(() => timeEl.classList.remove('penalty'), 600);
    }
  }

  _finish() {
    this.state = 'finished';
    document.getElementById('hud').classList.remove('show');
    document.getElementById('touch-controls').classList.remove('show');
    document.getElementById('ahead').classList.remove('show');
    const total = this.total();
    document.getElementById('finish-time').textContent = Utils.formatTime(total);

    // Penalty breakdown line.
    const penEl = document.getElementById('finish-penalty');
    if (penEl) {
      penEl.textContent = this.penaltyMs > 0
        ? `Includes +${Math.round(this.penaltyMs / 1000)}s in wrong-answer penalties`
        : 'No penalties — a clean run!';
    }

    // Best time per city in localStorage.
    let best = null;
    try {
      const key = 'feriespill.best.' + this.city.id;
      const prev = parseFloat(localStorage.getItem(key));
      if (!prev || total < prev) { localStorage.setItem(key, total); best = total; }
      else best = prev;
    } catch (e) { /* storage may be unavailable */ }
    const bestEl = document.getElementById('finish-best');
    bestEl.textContent = best != null ? Utils.formatTime(best) : Utils.formatTime(total);

    document.getElementById('finish').classList.add('show');
  }

  _updateHud() {
    const timeEl = document.getElementById('hud-time');
    const progEl = document.getElementById('hud-progress');
    const hintEl = document.getElementById('hud-hint');
    if (timeEl) timeEl.textContent = Utils.formatTime(this.total());
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
    this._drawAheadArrow(ctx);
    this.minimap.draw(ctx, this.car, this.visited, this.vw);
    this._drawSpeedo(ctx);
  }

  // An edge-of-screen chevron pointing to the next target while it's off-screen,
  // so on the bigger map you always know which way to head.
  _drawAheadArrow(ctx) {
    const target = this._huTarget;
    if (!target) return;
    const z = this.camera.zoom;
    const sx = this.vw / 2 + (target.x - this.camera.x) * z;
    const sy = this.vh / 2 + (target.y - this.camera.y) * z;
    const margin = 58;
    if (sx >= margin && sx <= this.vw - margin &&
        sy >= margin && sy <= this.vh - margin) return; // on screen already

    const cx = this.vw / 2, cy = this.vh / 2;
    const dx = sx - cx, dy = sy - cy;
    const halfW = this.vw / 2 - margin, halfH = this.vh / 2 - margin;
    const scale = Math.min(halfW / (Math.abs(dx) || 1e-3), halfH / (Math.abs(dy) || 1e-3));
    const ax = cx + dx * scale, ay = cy + dy * scale;
    const ang = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(ax, ay);
    // backing disc
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(18,22,28,0.72)';
    ctx.fill();
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(15, 0); ctx.lineTo(-8, -11); ctx.lineTo(-2, 0); ctx.lineTo(-8, 11);
    ctx.closePath();
    ctx.fillStyle = target.home ? '#5f8bff' : '#ffcf3a';
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.fill(); ctx.stroke();
    ctx.restore();
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
