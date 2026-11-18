/* web-style-classic behaviour (Paper & Lamp). Classic deferred script: no modules, no dependencies, works from file://.
   Every part checks that its elements exist, so pages can drop any component. The inline pre-paint script in each
   page's <head> has already set html[data-theme] and html[lang]; this file wires the toggles and the Korean text. */
(() => {
  'use strict';
  const root = document.documentElement;
  const query = (() => { try { return new URLSearchParams(location.search); } catch (_) { return new URLSearchParams(); } })();
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) { /* Private mode or blocked storage: choice lasts this page only. */ } },
  };
  const S = {
    en: {toDark: 'Switch to dark theme', toLight: 'Switch to light theme', copied: 'Copied.',
      selected: 'Selected. Press Ctrl+C or Command+C to copy.'},
    ko: {toDark: '다크 테마로 전환', toLight: '라이트 테마로 전환', copied: '복사했습니다.',
      selected: '선택했습니다. Ctrl+C 또는 Command+C를 눌러 복사하세요.'},
  };
  const lang = () => root.lang === 'ko' ? 'ko' : 'en';
  const theme = () => root.dataset.theme === 'dark' ? 'dark' : 'light';
  const announce = (name, value) => document.dispatchEvent(new CustomEvent(name, {detail: value}));

  // 1. Accent preview: page.html?accent=<catalogue name> (see assets/css/accents.css).
  const accent = query.get('accent');
  if (accent && /^[a-z-]+$/.test(accent)) root.dataset.accent = accent;

  // 2. Theme: button[data-theme-toggle] flips html[data-theme], saves "ws-theme", names the next action in its aria-label.
  const themeButtons = [...document.querySelectorAll('button[data-theme-toggle]')];
  const syncTheme = () => themeButtons.forEach(b => b.setAttribute('aria-label', S[lang()][theme() === 'dark' ? 'toLight' : 'toDark']));
  const setTheme = (t, save) => {
    root.dataset.theme = t;
    if (save) store.set('ws-theme', t);
    syncTheme();
    announce('ws:theme', t);
  };
  themeButtons.forEach(b => b.addEventListener('click', () => setTheme(theme() === 'dark' ? 'light' : 'dark', true)));
  // Follow the system theme while the visitor has made no choice (no ?theme=, nothing saved).
  const systemDark = matchMedia('(prefers-color-scheme: dark)');
  systemDark.addEventListener('change', () => {
    if (!/^(light|dark)$/.test(query.get('theme') || '') && !/^(light|dark)$/.test(store.get('ws-theme') || ''))
      setTheme(systemDark.matches ? 'dark' : 'light', false);
  });
  // Print always uses the light palette, whatever the screen theme; the screen theme comes back afterwards.
  let screenTheme = null;
  const toPrint = () => { if (screenTheme === null) { screenTheme = theme(); root.dataset.theme = 'light'; } };
  const fromPrint = () => { if (screenTheme !== null) { root.dataset.theme = screenTheme; screenTheme = null; } };
  addEventListener('beforeprint', toPrint);
  addEventListener('afterprint', fromPrint);
  matchMedia('print').addEventListener('change', e => (e.matches ? toPrint : fromPrint)());

  // 3. Language: English stays in the markup; Korean lives beside it in attributes.
  //    data-ko="…" replaces textContent (innerHTML when the element also has data-html), data-ko-label="…" replaces
  //    aria-label, data-ko-title="…" replaces title, [data-ko-only] is shown only in Korean.
  //    button[data-lang-toggle] flips html[lang], saves "ws-lang" and shows the other language's name.
  const texts = [...document.querySelectorAll('[data-ko]')], labels = [...document.querySelectorAll('[data-ko-label]')];
  const titles = [...document.querySelectorAll('[data-ko-title]')], koOnly = [...document.querySelectorAll('[data-ko-only]')];
  texts.forEach(el => el.setAttribute('data-en', el.hasAttribute('data-html') ? el.innerHTML : el.textContent));
  labels.forEach(el => el.setAttribute('data-en-label', el.getAttribute('aria-label') || ''));
  titles.forEach(el => el.setAttribute('data-en-title', el.getAttribute('title') || ''));
  const langButtons = [...document.querySelectorAll('button[data-lang-toggle]')];
  const setLang = (l, save) => {
    const ko = l === 'ko';
    root.lang = l;
    texts.forEach(el => {
      const v = el.getAttribute(ko ? 'data-ko' : 'data-en');
      if (el.hasAttribute('data-html')) el.innerHTML = v; else el.textContent = v;
    });
    labels.forEach(el => el.setAttribute('aria-label', el.getAttribute(ko ? 'data-ko-label' : 'data-en-label')));
    titles.forEach(el => el.setAttribute('title', el.getAttribute(ko ? 'data-ko-title' : 'data-en-title')));
    koOnly.forEach(el => { el.hidden = !ko; });
    langButtons.forEach(b => { b.textContent = ko ? 'English' : '한국어'; b.lang = ko ? 'en' : 'ko'; });
    document.querySelectorAll('.copy-status').forEach(st => { st.textContent = ''; });
    if (save) store.set('ws-lang', l);
    syncTheme();
    announce('ws:lang', l);
  };
  langButtons.forEach(b => b.addEventListener('click', () => setLang(lang() === 'ko' ? 'en' : 'ko', true)));
  // Enter flips a toggle exactly once, also for synthetic key events that do not activate the button.
  [...themeButtons, ...langButtons].forEach(b => b.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.repeat) { e.preventDefault(); b.click(); }
  }));
  // A choice saved in another tab or in the demo's parent page applies here too, unless this page's query fixes it.
  addEventListener('storage', e => {
    if (e.key === 'ws-theme' && /^(light|dark)$/.test(e.newValue || '') && !query.has('theme')) setTheme(e.newValue, false);
    if (e.key === 'ws-lang' && /^(en|ko)$/.test(e.newValue || '') && !query.has('lang')) setLang(e.newValue, false);
  });
  setLang(lang(), false);

  // 4. Mobile menu: below 820px the section links fold into a sheet behind .menu-toggle.
  const menu = document.querySelector('.menu-toggle'), nav = document.getElementById('section-nav');
  if (menu && nav) {
    const mobile = matchMedia('(max-width: 819px)');
    const closeMenu = (returnFocus = false) => {
      menu.setAttribute('aria-expanded', 'false');
      nav.hidden = mobile.matches;
      if (returnFocus) menu.focus({preventScroll: true});
    };
    const layout = () => {
      const focusedLink = nav.contains(document.activeElement);
      menu.hidden = !mobile.matches;
      closeMenu(mobile.matches && focusedLink);
    };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      nav.hidden = !open;
    });
    menu.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' && mobile.matches) {
        e.preventDefault();
        menu.setAttribute('aria-expanded', 'true');
        nav.hidden = false;
        nav.querySelector('a')?.focus();
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        e.preventDefault();
        closeMenu(true);
      }
    });
    nav.addEventListener('click', e => {
      const link = e.target.closest('a');
      if (!mobile.matches || !link) return;
      // Only same-document links are scrolled here; links to other pages or sites navigate normally.
      const target = link.hash && link.origin === location.origin && link.pathname === location.pathname
        && link.search === location.search
        && document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (!target) { closeMenu(); return; }
      e.preventDefault();
      closeMenu(true);
      target.scrollIntoView();
      try { history.replaceState(null, '', link.hash); } catch (_) { /* Some local-file contexts restrict history. */ }
    });
    mobile.addEventListener('change', layout);
    layout();
  }

  // 5. Copy buttons: .codeblock > pre + button.copy + .copy-status[role=status].
  document.querySelectorAll('.codeblock').forEach(block => {
    const button = block.querySelector('button.copy'), pre = block.querySelector('pre');
    const status = block.querySelector('.copy-status');
    if (!button || !pre) return;
    const say = text => { if (status) status.textContent = text; };
    button.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(pre.textContent);
        say(S[lang()].copied);
      } catch (_) {
        const selection = getSelection(), range = document.createRange();
        range.selectNodeContents(pre);
        selection.removeAllRanges();
        selection.addRange(range);
        pre.focus();
        say(S[lang()].selected);
      }
    });
  });

  // 6. Reduced motion: autoplaying videos are stopped and do not restart; native controls stay.
  const autoplaying = [...document.querySelectorAll('video[autoplay]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const holdVideos = () => {
    if (!reduce.matches) return;
    autoplaying.forEach(v => { v.autoplay = false; v.removeAttribute('autoplay'); v.pause(); });
  };
  if (autoplaying.length) { reduce.addEventListener('change', holdVideos); holdVideos(); }

  // 7. Placeholder links: aria-disabled links and href="#" links do nothing.
  document.querySelectorAll('a[aria-disabled="true"], a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));

  // 8. Docs sidebar: mark the link of the section in view with aria-current.
  const links = [...document.querySelectorAll('.sidebar a[href^="#"]')];
  const targets = links.map(a => document.getElementById(a.hash.slice(1)));
  if (links.length && targets.every(Boolean) && 'IntersectionObserver' in window) {
    const visible = new Set();
    const mark = () => {
      let index = targets.findLastIndex(t => visible.has(t));  // the deepest entry when targets nest
      // Nothing crosses the band (page top, or a gap): fall back to the last target above it, else the first.
      if (index < 0) index = Math.max(0, targets.findLastIndex(t => t.getBoundingClientRect().top < innerHeight * .15));
      links.forEach((a, i) => i === index ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
    };
    // A thin band just below the sticky nav: the section crossing it is the current one.
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
      mark();
    }, {rootMargin: '-15% 0px -80% 0px'});
    targets.forEach(t => observer.observe(t));
  }
})();
