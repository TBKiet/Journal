"use client";

import { useCallback, useEffect, useState } from "react";

export interface DraftEnvelope<T> {
  updatedAt: string;
  data: T;
}

export function readDraft<T>(storageKey: string): DraftEnvelope<T> | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DraftEnvelope<T>;
  } catch {
    return null;
  }
}

export function clearDraft(storageKey: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey);
}

function writeDraft<T>(storageKey: string, data: T) {
  if (typeof window === "undefined") return null;

  const envelope: DraftEnvelope<T> = {
    updatedAt: new Date().toISOString(),
    data,
  };

  window.localStorage.setItem(storageKey, JSON.stringify(envelope));
  return envelope.updatedAt;
}

export function formatDraftTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useDraftAutosave<T>({
  storageKey,
  value,
  enabled,
}: {
  storageKey: string;
  value: T;
  enabled: boolean;
}) {
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const timer = window.setTimeout(() => {
      const timestamp = writeDraft(storageKey, value);
      if (timestamp) {
        setSavedAt(timestamp);
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [storageKey, value, enabled]);

  const clearSavedDraft = useCallback(() => {
    clearDraft(storageKey);
    setSavedAt(null);
  }, [storageKey]);

  return {
    savedAt,
    clearSavedDraft,
  };
}
