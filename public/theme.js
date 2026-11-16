// The dark mode switch on every page. Base.astro sets the theme before first paint. A choice is saved.
// The tree redraws on the themechange event.
{
  const btn = document.getElementById('theme'), sys = matchMedia('(prefers-color-scheme: dark)');
  const set = (dark, save) => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    btn.setAttribute('aria-pressed', String(dark)); btn.textContent = dark ? 'Dark mode: on' : 'Dark mode: off';
    if (save) try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
    dispatchEvent(new Event('themechange'));
  };
  set(document.documentElement.dataset.theme === 'dark', false);
  btn.addEventListener('click', () => set(document.documentElement.dataset.theme !== 'dark', true));
  sys.addEventListener('change', e => { let s = null; try { s = localStorage.getItem('theme'); } catch {} if (!s) set(e.matches, false); });
}
