const DPR = globalThis.devicePixelRatio || 1;

const IS_MOBILE = globalThis.innerWidth < 768 ||
  (globalThis.matchMedia?.('(hover: none) and (pointer: coarse)')?.matches ?? false);

const DEFAULTS = {
  frameCount: 299,
  basePathDesktop: '/FrameBusesWebP/desktop/',
  basePathMobile: '/FrameBusesWebP/mobile/',
  ext: 'webp',

  // Desktop preload
  preloadAhead: 20,
  preloadBehind: 10,
  maxCache: 45,
  concurrency: 6,
  initLoad: 12,
  lerpFactor: 0.12,

  // Mobile overrides (applied at runtime)
  isMobile: IS_MOBILE,
  onCacheMiss: null,
};

const MOBILE_OVERRIDES = {
  preloadAhead: 8,
  preloadBehind: 5,
  maxCache: 18,
  concurrency: 3,
  initLoad: 6,
  lerpFactor: 0.15,
};

export default class FrameManager {
  constructor(opts = {}) {
    const isMobile = opts.isMobile ?? IS_MOBILE;
    const overrides = isMobile ? MOBILE_OVERRIDES : {};
    this.options = { ...DEFAULTS, ...overrides, ...opts };

    this.cache = new Map();
    this.loadQueue = [];
    this.loadQueueSet = new Set();
    this.loadingFrames = new Set();
    this.draining = false;

    this.currentIndex = 0;
    this.targetIndex = 0;
    this.renderedIndex = -1;
    this.rafId = null;
    this.active = false;
    this.lastDirection = 1;
    this.cover = { x: 0, y: 0, w: 0, h: 0, dirty: true };
    this.loaded = false;
    this.callbacks = [];
  }

  /* ─── Path resolution ──────────────────────────────────── */

  get useMobile() {
    return this.options.isMobile;
  }

  get basePath() {
    return this.useMobile
      ? this.options.basePathMobile
      : this.options.basePathDesktop;
  }

  path(i) {
    return `${this.basePath}frame_${String(i).padStart(3, '0')}.${this.options.ext}`;
  }

  /* ─── Lifecycle ────────────────────────────────────────── */

  attach(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false,
    });
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.active = true;
    this.loop();
    this.loadInitial();
    return this;
  }

  detach() {
    this.active = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.ctx?.getContextAttributes();
    this.canvas = null;
    this.ctx = null;
  }

  destroy() {
    this.detach();
    this.cache.clear();
    this.loadQueue = [];
    this.loadQueueSet.clear();
    this.loadingFrames.clear();
    this.callbacks = [];
  }

  onLoad(fn) {
    this.callbacks.push(fn);
  }

  /* ─── RAF loop ─────────────────────────────────────────── */

  loop() {
    if (!this.active) return;
    this.tick();
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  tick() {
    if (!this.ctx || !this.canvas) return;

    // 1. Lerp currentIndex toward targetIndex
    const diff = this.targetIndex - this.currentIndex;
    if (Math.abs(diff) > 0.005) {
      this.currentIndex += diff * this.options.lerpFactor;
    } else {
      this.currentIndex = this.targetIndex;
    }

    // 2. Compute desired frame index
    const desiredIdx = Math.round(
      Math.max(0, Math.min(this.options.frameCount - 1, this.currentIndex))
    );

    // 3. Preload every tick — keeps buffer filled during fast scroll
    this.schedulePreload(desiredIdx);

    // 4. No change since last render — skip
    if (desiredIdx === this.renderedIndex) return;

    // 5. Desired frame is cached — draw it
    if (this.cache.has(desiredIdx)) {
      this.renderedIndex = desiredIdx;
      this.draw(desiredIdx);
      return;
    }

    // 6. Cache miss — show nearest cached frame instead of freezing
    this.options.onCacheMiss?.(desiredIdx);

    const nearest = this._nearestCached(desiredIdx);
    if (nearest >= 0 && nearest !== this.renderedIndex) {
      this.renderedIndex = nearest;
      this.draw(nearest);
    }
  }

  /* ─── External API ─────────────────────────────────────── */

  setProgress(t) {
    this.targetIndex = Math.max(0, Math.min(1, t)) * (this.options.frameCount - 1);

    const dir = this.targetIndex > this.currentIndex ? 1 : -1;
    if (dir !== this.lastDirection) {
      this.lastDirection = dir;
      // Direction change: reset queue to prioritize new direction
      this._flushStaleQueue();
    }
  }

  goTo(index) {
    const idx = Math.max(0, Math.min(this.options.frameCount - 1, Math.round(index)));
    this.targetIndex = idx;
    this.currentIndex = idx;
    this.renderedIndex = -1;

    if (this.cache.has(idx)) {
      this.renderedIndex = idx;
      this.draw(idx);
    }

    this.schedulePreload(idx);
  }

  resize(w, h) {
    if (!this.canvas) return;
    const dpr = DPR;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.cover.dirty = true;

    if (this.renderedIndex >= 0) {
      this.draw(this.renderedIndex);
    }
  }

  /* ─── Drawing ──────────────────────────────────────────── */

  draw(index) {
    if (!this.ctx || !this.canvas) return;

    const entry = this.cache.get(index);
    if (!entry) return;

    const img = entry.image;

    if (this.cover.dirty && this.canvas.width && this.canvas.height) {
      const cw = this.canvas.width;
      const ch = this.canvas.height;
      const cr = cw / ch;
      const ir = img.naturalWidth / img.naturalHeight;

      if (cr > ir) {
        this.cover.w = cw;
        this.cover.h = cw / ir;
        this.cover.x = 0;
        this.cover.y = (ch - this.cover.h) / 2;
      } else {
        this.cover.h = ch;
        this.cover.w = ch * ir;
        this.cover.x = (cw - this.cover.w) / 2;
        this.cover.y = 0;
      }
      this.cover.dirty = false;
    }

    this.ctx.drawImage(img, this.cover.x, this.cover.y, this.cover.w, this.cover.h);
  }

  /* ─── Nearest cached frame search ──────────────────────── */

  _nearestCached(index) {
    const maxSearch = Math.min(80, this.options.frameCount);

    for (let offset = 0; offset <= maxSearch; offset++) {
      // Prioritize forward direction during forward scroll
      const primary = index + offset * this.lastDirection;
      if (primary >= 0 && primary < this.options.frameCount && this.cache.has(primary)) {
        return primary;
      }

      const secondary = index - offset * this.lastDirection;
      if (secondary >= 0 && secondary < this.options.frameCount && this.cache.has(secondary)) {
        return secondary;
      }
    }
    return -1;
  }

  /* ─── Loading ──────────────────────────────────────────── */

  async loadInitial() {
    const count = Math.min(this.options.initLoad, this.options.frameCount);
    const promises = [];

    for (let i = 0; i < count; i++) {
      promises.push(this.loadOne(i, true).catch(() => {}));
    }

    await Promise.allSettled(promises);
    this.loaded = true;

    if (this.renderedIndex < 0) {
      this.goTo(0);
    }

    this.schedulePreload(0);
  }

  async loadOne(index, highPriority = false) {
    if (this.cache.has(index)) {
      this.touch(index);
      return;
    }
    if (this.loadingFrames.has(index)) return;

    this.loadingFrames.add(index);

    if (this.cache.size >= this.options.maxCache) {
      this.evict();
    }

    try {
      const img = new Image();
      const loaded = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error(`Frame ${index} load failed`));
      });

      if (highPriority) img.fetchPriority = 'high';
      img.src = this.path(index);

      await loaded;

      if (img.decode) {
        try { await img.decode(); } catch (_) { /* fallback */ }
      }

      this.cache.set(index, { image: img, time: performance.now() });
      this.callbacks.forEach(fn => fn('load', index, this.cache.size));

      // Draw immediately if this frame is near the current scroll position
      const currentRounded = Math.round(this.currentIndex);
      const distToRender = Math.abs(index - this.renderedIndex);
      const distToCurrent = Math.abs(index - currentRounded);

      if (
        index === this.renderedIndex ||
        distToCurrent <= 2 ||
        (this.renderedIndex >= 0 && distToCurrent < Math.abs(this.renderedIndex - currentRounded))
      ) {
        this.renderedIndex = index;
        this.draw(index);
      }
    } catch (e) {
      this.callbacks.forEach(fn => fn('error', index, e.message));
    } finally {
      this.loadingFrames.delete(index);
    }
  }

  /* ─── Cache management ─────────────────────────────────── */

  touch(index) {
    const e = this.cache.get(index);
    if (e) e.time = performance.now();
  }

  evict() {
    let oldest = Infinity;
    let key = -1;

    const protect = new Set();
    const r = this.renderedIndex;
    const c = Math.round(this.currentIndex);
    const buffer = this.useMobile ? 6 : 15;

    // Protect a buffer zone around rendered and current position
    for (let i = -buffer; i <= buffer; i++) {
      protect.add(r + i);
      protect.add(c + i);
    }

    for (const [k, v] of this.cache) {
      if (protect.has(k)) continue;
      if (v.time < oldest) {
        oldest = v.time;
        key = k;
      }
    }

    if (key >= 0) this.cache.delete(key);
  }

  /* ─── Preloading ───────────────────────────────────────── */

  schedulePreload(center) {
    const maxQ = this.options.maxCache * 2;
    const ahead = this.options.preloadAhead;
    const behind = this.options.preloadBehind;
    const dir = this.lastDirection;

    const toLoad = new Set();
    toLoad.add(center);

    // Load ahead in scroll direction
    for (let i = 1; i <= ahead; i++) {
      const idx = center + dir * i;
      if (idx >= 0 && idx < this.options.frameCount) toLoad.add(idx);
    }

    // Load behind in reverse direction
    for (let i = 1; i <= behind; i++) {
      const idx = center - dir * i;
      if (idx >= 0 && idx < this.options.frameCount) toLoad.add(idx);
    }

    // Trim queue if over limit
    if (this.loadQueue.length > maxQ) {
      const excess = this.loadQueue.length - maxQ;
      const removed = this.loadQueue.splice(0, excess);
      for (const id of removed) this.loadQueueSet.delete(id);
    }

    // Add new frames
    for (const idx of toLoad) {
      if (!this.cache.has(idx) && !this.loadQueueSet.has(idx) && !this.loadingFrames.has(idx)) {
        this.loadQueue.push(idx);
        this.loadQueueSet.add(idx);
      }
    }

    this.drainQueue();
  }

  _flushStaleQueue() {
    // On direction change, keep only frames relevant to the new direction
    const dir = this.lastDirection;
    const center = Math.round(this.currentIndex);
    const keep = [];

    for (const idx of this.loadQueue) {
      const relative = (idx - center) * dir;
      if (relative >= -this.options.preloadBehind * 2) {
        keep.push(idx);
      } else {
        this.loadQueueSet.delete(idx);
      }
    }

    this.loadQueue.length = 0;
    for (const idx of keep) this.loadQueue.push(idx);
  }

  async drainQueue() {
    if (this.draining || this.loadQueue.length === 0) return;
    this.draining = true;

    const batch = [];
    const maxBatch = this.options.concurrency;

    while (this.loadQueue.length > 0 && batch.length < maxBatch) {
      const idx = this.loadQueue.shift();
      this.loadQueueSet.delete(idx);

      if (!this.cache.has(idx)) {
        batch.push(this.loadOne(idx).catch(() => {}));
      }
    }

    await Promise.allSettled(batch);
    this.draining = false;

    if (this.loadQueue.length > 0) {
      this.drainQueue();
    }
  }
}
