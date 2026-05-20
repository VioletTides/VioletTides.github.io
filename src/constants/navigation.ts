import type { View } from '../types';

export const TAB_ORDER: View[] = ['home', 'projects', 'contact'];

export function viewToPath(view: View): string {
  switch (view) {
    case 'home':
      return '/';
    case 'projects':
      return '/projects';
    case 'contact':
      return '/contact';
  }
}

export function pathToView(pathname: string): View {
  if (pathname.startsWith('/projects')) {
    return 'projects';
  }
  if (pathname.startsWith('/contact')) {
    return 'contact';
  }
  return 'home';
}

export function isProjectDetailPath(pathname: string): boolean {
  return /^\/projects\/[^/]+/.test(pathname);
}

/** Stable key for mobile tab outlet animations (collapses detail slugs to /projects). */
export function mainTabRouteKey(pathname: string): string {
  if (pathname.startsWith('/projects/') && pathname !== '/projects') {
    return pathname;
  }
  if (pathname === '/') {
    return '/';
  }
  if (pathname.startsWith('/projects')) {
    return '/projects';
  }
  if (pathname.startsWith('/contact')) {
    return '/contact';
  }
  return pathname;
}
