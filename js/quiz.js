// Highlight quiz modal. Shows the highlight blurb + one question; the player
// must pick the correct answer to continue. Wrong answers report back so the
// game can apply a time penalty.
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
    this.titleEl.textContent = highlight.name;
    this.blurbEl.textContent = highlight.blurb;
    this.qEl.textContent = highlight.question.q;
    this.feedbackEl.textContent = '';
    this.feedbackEl.className = 'quiz-feedback';
    this.optsEl.innerHTML = '';

    const answer = highlight.question.answer;
    highlight.question.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        if (!this.active) return;
        if (idx === answer) {
          btn.classList.add('correct');
          this.feedbackEl.textContent = 'Correct! Drive on.';
          this.feedbackEl.className = 'quiz-feedback ok';
          this.active = false;
          setTimeout(() => this._close(this.onCorrect), 650);
        } else {
          btn.classList.add('wrong');
          btn.disabled = true;
          this.feedbackEl.textContent = 'Not quite — try again (+5s penalty).';
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
