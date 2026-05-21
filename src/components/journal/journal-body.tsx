"use client";

import { useMemo } from "react";

import { sanitizeJournalHtml } from "@/lib/journal-rich-text";
import { cn } from "@/lib/utils";

export function JournalBody({
  body,
  className,
}: {
  body: string;
  className?: string;
}) {
  const html = useMemo(() => sanitizeJournalHtml(body), [body]);

  return (
    <div
      className={cn("journal-rich", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
