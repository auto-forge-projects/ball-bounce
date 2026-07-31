import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PHASE, createState, step, speedFor } from '../public/physics.js';

test('createState: başlangıç değerleri (ready, score 0, hız katsayısı 1.0)', () => {
  const s = createState();
  assert.equal(s.phase, PHASE.READY);
  assert.equal(s.score, 0);
  assert.equal(s.speed, 1.0);
  assert.equal(s.ball.vy, 0);
});

test('speedFor: kademeli, üst-sınırlı katsayı (K_STEP=0.04, K_EVERY=5, K_MAX=1.8)', () => {
  assert.equal(speedFor(0), 1.0);
  assert.equal(speedFor(4), 1.0);
  assert.equal(speedFor(5), 1.04);
  assert.equal(speedFor(10), 1.08);
  assert.equal(speedFor(1000), 1.8); // üst sınır (K_MAX) hiçbir zaman aşılmaz
});

test('step: playing fazında yerçekimi vy artırır (dt clamp uygulanır)', () => {
  const s = createState();
  s.phase = PHASE.PLAYING;
  const vyBefore = s.ball.vy;
  step(s, 10); // aşırı büyük dt gönderilse bile DT_MAX ile clamp edilmeli
  assert.ok(s.ball.vy > vyBefore, 'vy yerçekimiyle artmalı');
  assert.ok(s.ball.vy <= 1200 + 1e-6, 'vy VMAX üst sınırını aşmamalı');
});

test('step: ready fazında top hareket etmez', () => {
  const s = createState();
  const yBefore = s.ball.y;
  step(s, 1);
  assert.equal(s.ball.y, yBefore);
});

test('step: top zemine ulaşınca faz over olur (NFR-2)', () => {
  const s = createState();
  s.phase = PHASE.PLAYING;
  for (let i = 0; i < 500 && s.phase === PHASE.PLAYING; i++) step(s, 1 / 30);
  assert.equal(s.phase, PHASE.OVER);
});
