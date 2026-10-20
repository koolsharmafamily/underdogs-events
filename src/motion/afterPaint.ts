/** Schedule optional work after the server-rendered UI has painted. */
export function afterPaint(work: () => void | (() => void) | Promise<void | (() => void)>) {
  let cancelled=false, raf=0, idle=0, cleanup: void | (() => void);
  raf=requestAnimationFrame(() => { raf=requestAnimationFrame(() => {
    const run=() => { if (!cancelled) void Promise.resolve(work()).then(fn => { if(cancelled) fn?.(); else cleanup=fn; }); };
    idle=window.requestIdleCallback ? window.requestIdleCallback(run,{timeout:2000}) : window.setTimeout(run,0);
  }); });
  return () => { cancelled=true; cancelAnimationFrame(raf); if(window.cancelIdleCallback) window.cancelIdleCallback(idle); else clearTimeout(idle); cleanup?.(); };
}
