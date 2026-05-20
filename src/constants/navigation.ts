/** Stable key for main tab outlet remounting (collapses list routes to tab keys). */
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
