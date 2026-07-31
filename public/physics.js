// Saf fizik çekirdeği — DOM/tarayıcı API bilmez (docs/05-architecture.md).
export const PHASE = { READY: 'ready', PLAYING: 'playing', OVER: 'over' };

const G0 = 1400; // px/s^2
const V0 = 620; // px/s
const VMAX = 1200; // px/s
const DT_MAX = 1 / 30; // s
const HIT_PAD = 26; // px
const HIT_COOLDOWN_MS = 120;
const K_STEP = 0.04;
const K_EVERY = 5;
const K_MAX = 1.8;
const VX_MAX = 180; // px/s

export function createState() {
  return {
    phase: PHASE.READY,
    score: 0,
    speed: 1.0,
    ball: { x: 240, y: 180, vx: 0, vy: 0, r: 24 },
    lastHitAt: 0,
    world: { w: 480, h: 720, groundY: 700 },
  };
}

export function speedFor(score) {
  return Math.min(K_MAX, 1 + Math.floor(score / K_EVERY) * K_STEP);
}

export function isGrounded(state) {
  return state.ball.y + state.ball.r >= state.world.groundY;
}

export function step(state, rawDt) {
  if (state.phase !== PHASE.PLAYING) return state;
  const dt = Math.min(rawDt, DT_MAX);
  const k = speedFor(state.score);
  state.speed = k;
  const gEff = G0 * k;
  state.ball.vy = Math.min(state.ball.vy + gEff * dt, VMAX);
  state.ball.y += state.ball.vy * dt;
  state.ball.x += state.ball.vx * dt;
  if (isGrounded(state)) {
    state.ball.y = state.world.groundY - state.ball.r;
    state.phase = PHASE.OVER;
  }
  return state;
}

export function tryHit(state, px, py, now) {
  if (state.phase === PHASE.READY) {
    state.phase = PHASE.PLAYING;
    state.lastHitAt = now;
    return { accepted: true };
  }
  if (state.phase !== PHASE.PLAYING) return { accepted: false };
  if (now - state.lastHitAt < HIT_COOLDOWN_MS) return { accepted: false };
  if (state.ball.vy <= -150) return { accepted: false };
  const dx = px - state.ball.x;
  const dy = py - state.ball.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > state.ball.r + HIT_PAD) return { accepted: false };

  const k = speedFor(state.score);
  state.score += 1;
  state.lastHitAt = now;
  state.ball.vy = -V0 * Math.sqrt(k);
  state.ball.vx = Math.max(-VX_MAX, Math.min(VX_MAX, state.ball.vx + dx * 2.5));
  return { accepted: true };
}
