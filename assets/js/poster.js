/* A0 poster: orientation from ?orient=portrait|landscape and the on-screen toggle, the print page size, and the
   screen fit. Classic script loaded in <head> (not deferred) so html[data-orient] and @page exist before first paint.
   The sheet is sized in mm in every medium; on screen it is zoomed to the stage width (print ignores the zoom). */
(() => {
  'use strict';
  const root = document.documentElement;
  const SIZE = {portrait: [841, 1189], landscape: [1189, 841]};  // mm
  const PX_PER_MM = 96 / 25.4;
  let orient = 'portrait';
  try {
    const q = new URLSearchParams(location.search).get('orient');
    if (q === 'portrait' || q === 'landscape') orient = q;
  } catch (_) { /* No query access: portrait. */ }

  // Page size for printing: one A0 sheet, no margin, in the chosen orientation.
  const page = document.createElement('style');
  page.id = 'poster-page';
  document.head.append(page);

  const fit = () => {
    const stage = document.querySelector('.poster-stage');
    if (!stage) return;
    const cs = getComputedStyle(stage);
    const width = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const scale = Math.min(1, Math.max(0.05, width / (SIZE[orient][0] * PX_PER_MM)));
    root.style.setProperty('--poster-fit', scale.toFixed(4));
  };

  const apply = o => {
    orient = o;
    root.dataset.orient = o;
    page.textContent = `@page{size:${SIZE[o][0]}mm ${SIZE[o][1]}mm;margin:0}`;
    fit();
  };
  apply(orient);

  document.addEventListener('DOMContentLoaded', () => {
    fit();
    addEventListener('resize', fit);
    document.querySelectorAll('button[data-orient-toggle]').forEach(b => b.addEventListener('click', () => {
      apply(orient === 'landscape' ? 'portrait' : 'landscape');
      try {
        const u = new URL(location.href);
        u.searchParams.set('orient', orient);
        history.replaceState(null, '', u.href);  // a reload or a shared link keeps the orientation
      } catch (_) { /* Some local-file contexts restrict history. */ }
    }));
  });
})();
