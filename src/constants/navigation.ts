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

export function swipeTabOrder(): View[] {
  return TAB_ORDER;
}

export function pathToSwipeView(pathname: string): View {
  return pathToView(pathname);
}
