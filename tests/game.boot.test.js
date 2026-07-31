import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../public/game.js';
import { PHASE } from '../public/physics.js';
import { FakeCanvas, FakeElement, createFakeWindow } from './helpers/fake-dom.js';

function fakeDocument(elements) {
  return { getElementById: (id) => elements[id] };
}

test('boot(): index.html id\'leriyle gercek DOM elemanlarina baglanir ve oyunu calistirir (REQ-001 regresyonu — top hic render edilmiyordu cunku createGame() gercek DOM ile hic cagrilmiyordu)', () => {
  const canvas = new FakeCanvas();
  const scoreEl = new FakeElement();
  const gameOverEl = new FakeElement();
  gameOverEl.hidden = true;
  const finalScoreEl = new FakeElement();
  const restartBtn = new FakeElement();
  const win = createFakeWindow();
  win.performance = { now: () => 0 };
  const doc = fakeDocument({
    game: canvas,
    score: scoreEl,
    'game-over': gameOverEl,
    'final-score': finalScoreEl,
    restart: restartBtn,
  });

  const game = boot(doc, win);

  assert.equal(game.getState().phase, PHASE.READY);
  canvas.dispatchEvent({ type: 'pointerdown', clientX: 240, clientY: 180 });
  assert.equal(game.getState().phase, PHASE.PLAYING);
});
