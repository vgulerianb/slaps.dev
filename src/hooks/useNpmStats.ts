import { useEffect, useState } from "react";

export interface NpmStats {
  /** Latest published version, or the fallback until npm answers. */
  version: string;
  /** Downloads over the last 7 days, or null until npm answers. */
  weeklyDownloads: number | null;
}

/**
 * Live package stats from npm's public APIs (both send CORS headers).
 * Fetched in the browser on every visit, so the page never shows a stale
 * version again; the prerendered HTML carries the fallback until then.
 */
export function useNpmStats(pkg: string, fallbackVersion: string): NpmStats {
  const [stats, setStats] = useState<NpmStats>({ version: fallbackVersion, weeklyDownloads: null });

  useEffect(() => {
    const ctrl = new AbortController();
    const get = (url: string) =>
      fetch(url, { signal: ctrl.signal }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));

    get(`https://registry.npmjs.org/${pkg}/latest`)
      .then((d) => typeof d?.version === "string" && setStats((s) => ({ ...s, version: d.version })))
      .catch(() => {});
    get(`https://api.npmjs.org/downloads/point/last-week/${pkg}`)
      .then((d) => Number.isFinite(d?.downloads) && setStats((s) => ({ ...s, weeklyDownloads: d.downloads })))
      .catch(() => {});

    return () => ctrl.abort();
  }, [pkg]);

  return stats;
}

/** 1234 → "1.2K", 2500000 → "2.5M". */
export function compactNumber(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}
