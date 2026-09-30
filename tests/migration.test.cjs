const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'adaria-main.js'), 'utf8');
function boot({ editor = false, dependencies = true, existing = null } = {}) {
  const calls = { instances: [], ticks: [], native: [], scroll: [], button: null };
  const button = { addEventListener(type, fn) { if (type === 'click') calls.button = fn; } };
  const document = {
    readyState: 'complete',
    querySelectorAll(selector) { return selector === '[data-function="go-to-top"]' ? [button] : []; },
    querySelector() { return null; }, addEventListener() {},
  };
  const context = {
    document,
    console: { log() {}, warn() {}, error(...args) { throw new Error(args.join(' ')); } },
    setTimeout() { return 1; }, clearTimeout() {},
    addEventListener() {}, scrollTo(value) { calls.native.push(value); },
    matchMedia() { return { matches: false }; },
    Webflow: { env() { return editor; }, push(fn) { fn(); } }, lenis: existing,
  };
  if (dependencies) {
    context.Lenis = class {
      constructor(options) { this.options = options; calls.instances.push(this); }
      on(event, fn) { this.scrollHandler = fn; }
      raf(ms) { this.rafTime = ms; }
      scrollTo(target, options) { calls.scroll.push({ target, options }); }
    };
    context.ScrollTrigger = { update() {} };
    context.gsap = { ticker: { add(fn) { calls.ticks.push(fn); }, lagSmoothing(value) { calls.lag = value; } } };
  }
  context.window = context; vm.createContext(context); vm.runInContext(source, context);
  return { context, calls };
}
test('publishes Lenis and uses it for go-to-top', () => {
  const { context, calls } = boot();
  assert.equal(context.lenis, calls.instances[0]);
  assert.equal(context.lenis.options.duration, 1.2);
  assert.equal(context.lenis.options.smoothTouch, false);
  assert.equal(context.lenis.scrollHandler, context.ScrollTrigger.update);
  calls.ticks[0](2); assert.equal(context.lenis.rafTime, 2000);
  calls.button({ preventDefault() {} });
  assert.equal(calls.scroll[0].target, 0); assert.equal(calls.native.length, 0);
});
test('duplicate inclusion does not duplicate instances or tickers', () => {
  const { context, calls } = boot(); vm.runInContext(source, context);
  assert.equal(calls.instances.length, 1); assert.equal(calls.ticks.length, 1);
});
test('missing dependencies preserve native go-to-top', () => {
  const { context, calls } = boot({ dependencies: false });
  assert.equal(context.__ADARIA_INITIALIZED, true); assert.equal(calls.instances.length, 0);
  calls.button({ preventDefault() {} }); assert.equal(calls.native[0].top, 0);
});
test('Webflow editor does not initialize smooth scrolling', () => {
  const { calls } = boot({ editor: true });
  assert.equal(calls.instances.length, 0); assert.equal(calls.ticks.length, 0);
});
test('an existing Lenis instance is retained', () => {
  const existing = { scrollTo() {} }; const { context, calls } = boot({ existing });
  assert.equal(context.lenis, existing); assert.equal(calls.instances.length, 0);
  assert.equal(calls.ticks.length, 0);
});
