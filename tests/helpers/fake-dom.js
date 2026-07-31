// Minimal hand-rolled DOM/window stand-in for testing public/game.js under
// plain `node:test` — zero dependencies (SEC-6/NFR-3), no jsdom/canvas needed.
// Only implements the small surface game.js actually uses.

export class FakeElement {
  constructor() {
    this.hidden = false;
    this._text = '';
    this._listeners = new Map();
  }
  set textContent(v) { this._text = String(v); }
  get textContent() { return this._text; }
  addEventListener(type, fn) {
    if (!this._listeners.has(type)) this._listeners.set(type, new Set());
    this._listeners.get(type).add(fn);
  }
  dispatchEvent(evt) {
    const set = this._listeners.get(evt.type);
    if (set) for (const fn of set) fn(evt);
  }
}

export class FakeCanvas extends FakeElement {
  constructor(width = 480, height = 720) {
    super();
    this.width = width;
    this.height = height;
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: this.width, height: this.height };
  }
  getContext() {
    return {
      clearRect() {},
      fillRect() {},
      fillText() {},
      set font(_v) {},
      set fillStyle(_v) {},
      set textAlign(_v) {},
    };
  }
}

export function createFakeWindow() {
  const listeners = new Map();
  let nextId = 1;
  const pending = new Map();
  return {
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
    },
    dispatchEvent(evt) {
      const set = listeners.get(evt.type);
      if (set) for (const fn of set) fn(evt);
    },
    requestAnimationFrame(cb) {
      const id = nextId++;
      pending.set(id, cb);
      return id;
    },
    cancelAnimationFrame(id) {
      pending.delete(id);
    },
    // Test helper (not a real window API): run exactly one queued rAF callback.
    __tick(ts = 0) {
      const entries = Array.from(pending.entries());
      pending.clear();
      for (const [, cb] of entries) cb(ts);
    },
  };
}
