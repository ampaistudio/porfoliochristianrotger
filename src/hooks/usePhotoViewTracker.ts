import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "photo_view_stats";

export interface PhotoViewStats {
  photoId: string;
  totalViewMs: number;
  viewCount: number;
  lastViewedAt: string;
}

function loadStats(): Record<string, PhotoViewStats> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStats(stats: Record<string, PhotoViewStats>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

export function usePhotoViewTracker(photoId: string | null) {
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!photoId) return;
    startRef.current = Date.now();

    return () => {
      if (!photoId || startRef.current === null) return;
      const elapsed = Date.now() - startRef.current;
      if (elapsed < 500) return; // ignore accidental flickers

      const stats = loadStats();
      const prev = stats[photoId] || { photoId, totalViewMs: 0, viewCount: 0, lastViewedAt: "" };
      stats[photoId] = {
        photoId,
        totalViewMs: prev.totalViewMs + elapsed,
        viewCount: prev.viewCount + 1,
        lastViewedAt: new Date().toISOString(),
      };
      saveStats(stats);
      startRef.current = null;
    };
  }, [photoId]);
}

export function getAllViewStats(): PhotoViewStats[] {
  return Object.values(loadStats()).sort((a, b) => b.totalViewMs - a.totalViewMs);
}

export function useViewStatsPanel() {
  const [stats, setStats] = useState<PhotoViewStats[]>([]);

  useEffect(() => {
    setStats(getAllViewStats());
    const interval = setInterval(() => setStats(getAllViewStats()), 10_000);
    return () => clearInterval(interval);
  }, []);

  return stats;
}
