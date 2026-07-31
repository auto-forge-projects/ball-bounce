// I/O adaptörü — canvas, input, HUD. Oyun kuralı bilmez (docs/05-architecture.md).
import { PHASE, createState, step, tryHit } from './physics.js';

export function canvasPointFromEvent(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const src = evt.touches && evt.touches[0] ? evt.touches[0] : evt;
  return {
    x: (src.clientX - rect.left) * scaleX,
    y: (src.clientY - rect.top) * scaleY,
  };
}

export function createGame({ canvas, scoreEl, gameOverEl, finalScoreEl, restartBtn, win, now }) {
  const ctx = canvas.getContext('2d');
  let state = createState();
  let rafId = null;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '48px sans-serif';
    ctx.fillText('🏀', state.ball.x - 24, state.ball.y + 16);
    scoreEl.textContent = `Skor: ${state.score}`;
  }

  function hit(px, py) {
    tryHit(state, px, py, now());
  }

  function loop(ts) {
    step(state, 1 / 60);
    render();
    if (state.phase === PHASE.OVER) {
      gameOverEl.hidden = false;
      finalScoreEl.textContent = `Skor: ${state.score}`;
      return;
    }
    rafId = win.requestAnimationFrame(loop);
  }

  function reset() {
    state = createState();
    gameOverEl.hidden = true;
    if (rafId != null) win.cancelAnimationFrame(rafId);
    rafId = win.requestAnimationFrame(loop);
  }

  canvas.addEventListener('pointerdown', (evt) => {
    const p = canvasPointFromEvent(canvas, evt);
    hit(p.x, p.y);
  });

  win.addEventListener('keydown', (evt) => {
    if (evt.code === 'Space') {
      evt.preventDefault();
      hit(state.ball.x, state.ball.y);
    }
  });

  restartBtn.addEventListener('click', reset);

  rafId = win.requestAnimationFrame(loop);

  return { getState: () => state, hit, reset };
}
