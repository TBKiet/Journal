"use client";

import DOMPurify from "dompurify";

const JOURNAL_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "s",
  "u",
  "blockquote",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "span",
  "mark",
  "img",
];

const JOURNAL_ALLOWED_ATTR = ["src", "alt", "title", "style"];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isRichHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function parseImageSourcesFromHtml(html: string) {
  if (typeof window === "undefined") {
    return Array.from(html.matchAll(/<img[^>]+src="([^"]+)"/gi), (match) => match[1]);
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.querySelectorAll("img"))
    .map((img) => img.getAttribute("src") ?? "")
    .filter(Boolean);
}

export function plainTextToJournalHtml(value: string) {
  if (!value.trim()) return "<p></p>";

  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

export function sanitizeJournalHtml(value: string) {
  const source = isRichHtml(value) ? value : plainTextToJournalHtml(value);

  return DOMPurify.sanitize(source, {
    ALLOWED_TAGS: JOURNAL_ALLOWED_TAGS,
    ALLOWED_ATTR: JOURNAL_ALLOWED_ATTR,
    FORBID_TAGS: ["script", "style"],
    FORBID_ATTR: ["onerror", "onload"],
  });
}

export function getJournalPlainText(value: string) {
  const html = sanitizeJournalHtml(value);

  if (typeof window === "undefined") {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").replace(/\s+\n/g, "\n").trim();
}

export function getJournalPreviewText(value: string, maxLength?: number) {
  const plainText = getJournalPlainText(value);
  if (!maxLength || plainText.length <= maxLength) return plainText;
  return `${plainText.slice(0, maxLength).trimEnd()}...`;
}

export function extractJournalPhotoUrls(value: string) {
  const html = sanitizeJournalHtml(value);
  const uniqueUrls = new Set(parseImageSourcesFromHtml(html));
  return Array.from(uniqueUrls);
}

export function mergeJournalBodyWithPhotos(body: string, photos: string[]) {
  const sanitizedBody = sanitizeJournalHtml(body);
  const existingPhotos = new Set(extractJournalPhotoUrls(sanitizedBody));
  const missingPhotos = photos.filter((url) => !existingPhotos.has(url));

  if (missingPhotos.length === 0) return sanitizedBody;

  const appendedPhotos = missingPhotos
    .map(
      (url) =>
        `<p><img src="${escapeHtml(url)}" alt="Ảnh trong nhật ký" /></p>`
    )
    .join("");

  return `${sanitizedBody}${appendedPhotos}`;
}
