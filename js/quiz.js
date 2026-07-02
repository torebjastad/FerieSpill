// Highlight quiz modal. Each highlight carries a POOL of questions; one is
// picked at random per visit (and the options are shuffled) so answers can't be
// memorised. The player must pick the correct option to continue; wrong answers
// report back so the game can apply a time penalty.
class Quiz {
  constructor() {
    this.modal = document.getElementById('quiz');
    this.titleEl = document.getElementById('quiz-title');
    this.blurbEl = document.getElementById('quiz-blurb');
    this.qEl = document.getElementById('quiz-question');
    this.optsEl = document.getElementById('quiz-options');
    this.feedbackEl = document.getElementById('quiz-feedback');
    this.onCorrect = null;
    this.onWrong = null;
    this.active = false;
  }

  open(highlight, onCorrect, onWrong) {
    this.active = true;
    this.onCorrect = onCorrect;
    this.onWrong = onWrong;

    const pool = highlight.questions || (highlight.question ? [highlight.question] : []);
    const question = pool[Math.floor(Math.random() * pool.length)];

    // Shuffle options, remembering where the correct one lands.
    const entries = question.options.map((text, i) => ({ text, correct: i === question.answer }));
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [entries[i], entries[j]] = [entries[j], entries[i]];
    }

    this.titleEl.textContent = highlight.name;
    this.blurbEl.textContent = highlight.blurb;
    this.qEl.textContent = question.q;
    this.feedbackEl.textContent = '';
    this.feedbackEl.className = 'quiz-feedback';
    this.optsEl.innerHTML = '';

    entries.forEach((entry) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = entry.text;
      btn.addEventListener('click', () => {
        if (!this.active) return;
        if (entry.correct) {
          btn.classList.add('correct');
          if (navigator.vibrate) { try { navigator.vibrate([15, 40, 15]); } catch (e) { /* ignore */ } }
          this.feedbackEl.textContent = 'Correct! Drive on.';
          this.feedbackEl.className = 'quiz-feedback ok';
          this.active = false;
          setTimeout(() => this._close(this.onCorrect), 650);
        } else {
          btn.classList.add('wrong');
          btn.disabled = true;
          this.feedbackEl.textContent =
            `Wrong! +${Quiz.PENALTY_MS / 1000}s penalty — try again.`;
          this.feedbackEl.className = 'quiz-feedback bad';
          if (this.onWrong) this.onWrong();
        }
      });
      this.optsEl.appendChild(btn);
    });

    this.modal.classList.add('show');
  }

  _close(cb) {
    this.modal.classList.remove('show');
    if (cb) cb();
  }
}

// Time added for each wrong answer.
Quiz.PENALTY_MS = 5000;
