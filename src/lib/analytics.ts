import type { AnalyticsSnapshot } from '../types';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let trackingInitialized = false;

export function initAnalytics(): void {
  if (trackingInitialized || typeof document === 'undefined' || !GA_ID) {
    return;
  }

  trackingInitialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { anonymize_ip: true });
}

export function trackPageView(path: string): void {
  if (GA_ID && typeof window.gtag === 'function') {
    window.gtag('config', GA_ID, { page_path: path });
  }
}

export function isAnalyticsConfigured(): boolean {
  return Boolean(GA_ID);
}

export function getAnalyticsSnapshot(): AnalyticsSnapshot {
  if (!isAnalyticsConfigured()) {
    return { status: 'unconfigured' };
  }
  return { status: 'active' };
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
