export const SITE_THEME_EVENT = 'site-theme-change';

export type SiteTheme = 'light' | 'dark';

export function getSiteTheme(): SiteTheme {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('theme') as SiteTheme | null;
  if (saved === 'dark' || saved === 'light') return saved;
  return 'dark';
}

export function setSiteTheme(theme: SiteTheme) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Ignore storage quota or security errors
  }
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
  window.dispatchEvent(new CustomEvent(SITE_THEME_EVENT, { detail: { theme } }));
}
