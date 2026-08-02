"use client";

import * as React from "react";

const KEY = "bl_recently_viewed";
const MAX = 8;

interface RecentEntry {
  handle: string;
  local: string;
  fallback: string;
  title: string;
  titleGr?: string;
  price: number;
  viewedAt: number;
}

function read(): RecentEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecentEntry[]) : [];
  } catch {
    return [];
  }
}

function write(list: RecentEntry[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // storage full/disabled — recently-viewed is a nicety, fail silently
  }
}

/** Call on a product page to record it was viewed (most-recent first, capped, deduped). */
export function recordView(entry: Omit<RecentEntry, "viewedAt">) {
  const list = read().filter((e) => e.handle !== entry.handle);
  list.unshift({ ...entry, viewedAt: Date.now() });
  write(list.slice(0, MAX));
}

/** Read the recently-viewed list, excluding a handle (typically the current product). */
export function useRecentlyViewed(excludeHandle?: string) {
  const [items, setItems] = React.useState<RecentEntry[]>([]);
  React.useEffect(() => {
    setItems(read().filter((e) => e.handle !== excludeHandle));
  }, [excludeHandle]);
  return items;
}
