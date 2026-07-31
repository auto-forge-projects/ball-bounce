import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, canvasPointFromEvent } from '../public/game.js';
import { PHASE } from '../public/physics.js';
import { FakeCanvas, FakeElement, createFakeWindow } from './helpers/fake-dom.js';

function setup() {
  const canvas = new FakeCanvas();
  const scoreEl = new FakeElement();
  const gameOverEl = new FakeElement();
  gameOverEl.hidden = true;
  const finalScoreEl = new FakeElement();
  const restartBtn = new FakeElement();
  const win = createFakeWindow();
  let t = 0;
  const now = () => t;
  const game = createGame({ canvas, scoreEl, gameOverEl, finalScoreEl, restartBtn, win, now });
  return { canvas, scoreEl, gameOverEl, finalScoreEl, restartBtn, win, game, advanceTime: (ms) => { t += ms; } };
}

test('canvasPointFromEvent: clientX/Y canvas-yerel koordinata çevrilir (ölçekleme dahil)', () => {
  const canvas = new FakeCanvas(480, 720);
  const p = canvasPointFromEvent(canvas, { clientX: 240, clientY: 360 });
  assert.equal(p.x, 240);
  assert.equal(p.y, 360);
});

test('pointerdown: canvas üzerindeki tıklama hit() tetikler (ready -> playing)', () => {
  const { canvas, game } = setup();
  assert.equal(game.getState().phase, PHASE.READY);
  canvas.dispatchEvent({ type: 'pointerdown', clientX: 240, clientY: 180 });
  assert.equal(game.getState().phase, PHASE.PLAYING);
});

test('keydown Space: hit() tetikler (klavye kontrolü, FR-6)', () => {
  const { win, game } = setup();
  assert.equal(game.getState().phase, PHASE.READY);
  win.dispatchEvent({ type: 'keydown', code: 'Space', preventDefault() {} });
  assert.equal(game.getState().phase, PHASE.PLAYING);
});

test('rAF döngüsü: her tick skor HUD metnini günceller', () => {
  const { win, scoreEl, game } = setup();
  game.hit(240, 180); // playing'e geçir + skor 1
  win.__tick(16);
  assert.equal(scoreEl.textContent, 'Skor: 1');
});

test('oyun bitişi: top zemine değince overlay görünür + final skor yazılır', () => {
  const { win, gameOverEl, finalScoreEl, game, advanceTime } = setup();
  game.hit(240, 180); // playing
  for (let i = 0; i < 500 && game.getState().phase === PHASE.PLAYING; i++) {
    advanceTime(16);
    win.__tick(i * 16);
  }
  assert.equal(game.getState().phase, PHASE.OVER);
  assert.equal(gameOverEl.hidden, false);
  assert.match(finalScoreEl.textContent, /Skor:/);
});

test('Yeniden Başlat: state sıfırlanır ve overlay gizlenir (FR-4)', () => {
  const { win, restartBtn, gameOverEl, game, advanceTime } = setup();
  game.hit(240, 180);
  for (let i = 0; i < 500 && game.getState().phase === PHASE.PLAYING; i++) {
    advanceTime(16);
    win.__tick(i * 16);
  }
  assert.equal(game.getState().phase, PHASE.OVER);
  restartBtn.dispatchEvent({ type: 'click' });
  assert.equal(game.getState().phase, PHASE.READY);
  assert.equal(game.getState().score, 0);
  assert.equal(gameOverEl.hidden, true);
});
