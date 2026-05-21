"use client";

import { useMemo } from "react";

import {
  getJournalPreviewHtml,
  sanitizeJournalHtml,
} from "@/lib/journal-rich-text";
import { cn } from "@/lib/utils";

export function JournalBody({
  body,
  className,
  preview = false,
}: {
  body: string;
  className?: string;
  preview?: boolean;
}) {
  const html = useMemo(
    () => (preview ? getJournalPreviewHtml(body) : sanitizeJournalHtml(body)),
    [body, preview]
  );

  return (
    <div
      className={cn("journal-rich", preview && "journal-rich--preview", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
