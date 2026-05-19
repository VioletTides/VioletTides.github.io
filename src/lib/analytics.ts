import type { AnalyticsSnapshot } from '../types';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
const PLAUSIBLE_API_KEY = import.meta.env.VITE_PLAUSIBLE_API_KEY;

let trackingInitialized = false;

export function initAnalytics(): void {
  if (trackingInitialized || typeof document === 'undefined') {
    return;
  }

  trackingInitialized = true;

  if (GA_ID) {
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

  if (PLAUSIBLE_DOMAIN) {
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = PLAUSIBLE_DOMAIN;
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }
}

export function trackPageView(path: string): void {
  if (GA_ID && typeof window.gtag === 'function') {
    window.gtag('config', GA_ID, { page_path: path });
  }

  if (PLAUSIBLE_DOMAIN && typeof window.plausible === 'function') {
    window.plausible('pageview', { u: path });
  }
}

export function isAnalyticsConfigured(): boolean {
  return Boolean(GA_ID || PLAUSIBLE_DOMAIN);
}

export async function fetchAnalyticsSnapshot(
  signal?: AbortSignal,
): Promise<AnalyticsSnapshot> {
  if (!PLAUSIBLE_DOMAIN || !PLAUSIBLE_API_KEY) {
    return { status: 'unconfigured' };
  }

  try {
    const params = new URLSearchParams({
      site_id: PLAUSIBLE_DOMAIN,
      period: '30d',
      metrics: 'visitors,pageviews,bounce_rate,visit_duration',
    });

    const response = await fetch(
      `https://plausible.io/api/v1/stats/aggregate?${params.toString()}`,
      {
        signal,
        headers: {
          Authorization: `Bearer ${PLAUSIBLE_API_KEY}`,
        },
      },
    );

    if (!response.ok) {
      return { status: 'error' };
    }

    const data = (await response.json()) as {
      results?: {
        visitors?: { value?: number };
        pageviews?: { value?: number };
        bounce_rate?: { value?: number };
        visit_duration?: { value?: number };
      };
    };

    const results = data.results;

    return {
      status: 'ready',
      visitors: results?.visitors?.value,
      pageviews: results?.pageviews?.value,
      bounceRate: results?.bounce_rate?.value,
      visitDurationSeconds: results?.visit_duration?.value,
    };
  } catch (error) {
    if (signal?.aborted) {
      return { status: 'idle' };
    }

    console.error('Failed to load analytics snapshot', error);
    return { status: 'error' };
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (
      event: string,
      options?: { u?: string },
    ) => void;
  }
}
