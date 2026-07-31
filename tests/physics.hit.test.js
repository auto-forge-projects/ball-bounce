import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PHASE, createState, tryHit, isGrounded } from '../public/physics.js';

test('tryHit: ready fazında herhangi bir girdi oyunu başlatır', () => {
  const s = createState();
  const r = tryHit(s, s.ball.x, s.ball.y, 1000);
  assert.equal(r.accepted, true);
  assert.equal(s.phase, PHASE.PLAYING);
});

test('tryHit: erişim mesafesindeyken (r+HIT_PAD içinde) skor artar', () => {
  const s = createState();
  s.phase = PHASE.PLAYING;
  s.lastHitAt = 0;
  const r = tryHit(s, s.ball.x, s.ball.y, 1000);
  assert.equal(r.accepted, true);
  assert.equal(s.score, 1);
  assert.ok(s.ball.vy < 0, 'vuruş sonrası yukarı yönlü hız');
});

test('tryHit: erişim dışındaki (uzak) vuruş reddedilir, skor değişmez', () => {
  const s = createState();
  s.phase = PHASE.PLAYING;
  s.lastHitAt = 0;
  const r = tryHit(s, s.ball.x + 500, s.ball.y + 500, 1000);
  assert.equal(r.accepted, false);
  assert.equal(s.score, 0);
});

test('tryHit: cooldown süresi (120ms) dolmadan ikinci vuruş reddedilir', () => {
  const s = createState();
  s.phase = PHASE.PLAYING;
  s.lastHitAt = 0;
  tryHit(s, s.ball.x, s.ball.y, 1000);
  const r2 = tryHit(s, s.ball.x, s.ball.y, 1050); // +50ms < 120ms
  assert.equal(r2.accepted, false);
});

test('isGrounded: top zemine değince true döner', () => {
  const s = createState();
  s.ball.y = s.world.groundY - s.ball.r;
  assert.equal(isGrounded(s), true);
});

test('isGrounded: top havadayken false döner', () => {
  const s = createState();
  assert.equal(isGrounded(s), false);
});
