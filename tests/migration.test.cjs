const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const rawSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'runtime.js'), 'utf8');
const source = rawSource.replace('export function initAdaria', 'function initAdaria') + '\ninitAdaria(window.Lenis, \"https://cdn.jsdelivr.net/gh/brandvm/adaria@v1.1.0/dist/\");';
function boot({ editor = false, dependencies = true, existing = null, slider = false } = {}) {
  const calls = { instances: [], ticks: [], native: [], scroll: [], button: null, assets: [], warnings: [] };
  const button = { addEventListener(type, fn) { if (type === 'click') calls.button = fn; } };
  const document = {
    readyState: 'complete',
    querySelectorAll(selector) {
      if (selector === '[data-function="go-to-top"]') return [button];
      if (slider && selector.includes('.micromarket-slider-w .swiper')) return [{}];
      return [];
    },
    createElement(tag) { return { tag, dataset: {} }; },
    head: { appendChild(el) { calls.assets.push(el); } },
    body: { appendChild(el) { calls.assets.push(el); } },
    querySelector() { return null; }, addEventListener() {},
  };
  const context = {
    document, URL,
    console: { log() {}, warn(...args) { calls.warnings.push(args); }, error(...args) { throw new Error(args.join(' ')); } },
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

test('slider dependencies resolve from the executing release directory', () => {
  const { calls } = boot({ slider: true });
  const css = calls.assets.find(a => a.tag === 'link');
  const script = calls.assets.find(a => a.tag === 'script');
  assert.equal(css.href, 'https://cdn.jsdelivr.net/gh/brandvm/adaria@v1.1.0/dist/swiper.min.css');
  assert.equal(script.src, 'https://cdn.jsdelivr.net/gh/brandvm/adaria@v1.1.0/dist/swiper.min.js');
});
test('a failed Swiper request is handled without breaking other modules', async () => {
  const { context, calls } = boot({ slider: true });
  calls.assets.find(a => a.tag === 'script').onerror();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(context.__ADARIA_INITIALIZED, true);
  assert.ok(context.lenis);
  assert.equal(calls.warnings.length, 1);
  assert.match(calls.warnings[0][0], /slider initialization unavailable/);
});
