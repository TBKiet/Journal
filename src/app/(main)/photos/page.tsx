"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPhotos, type Photo } from "@/lib/data";

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const current = selectedIdx !== null ? photos[selectedIdx] : null;

  useEffect(() => {
    getPhotos()
      .then((data) => {
        setPhotos(data);
      })
      .catch((error) => {
        console.error(error);
        setPhotos([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const open = useCallback((idx: number) => setSelectedIdx(idx), []);
  const close = useCallback(() => setSelectedIdx(null), []);
  const prev = useCallback(() => {
    setSelectedIdx((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null));
  }, [photos.length]);
  const next = useCallback(() => {
    setSelectedIdx((i) => (i !== null ? (i + 1) % photos.length : null));
  }, [photos.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    if (selectedIdx !== null) {
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
  }, [selectedIdx, close, prev, next]);

  if (loading) {
    return (
      <div className="paper-panel flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">Đang tải ảnh...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="paper-panel flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <span className="text-6xl">📸</span>
        <p className="font-heading text-3xl text-foreground">Chưa có ảnh nào</p>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">Viết nhật ký và thêm ảnh để lưu giữ những khoảnh khắc nhỏ đáng nhớ.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-3 py-3 pb-8 sm:px-4 sm:py-4">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="paper-panel p-5 sm:p-6"
      >
        <p className="section-kicker">Gallery</p>
        <h1 className="mt-1 font-heading text-4xl tracking-[-0.04em]">Ảnh</h1>
      </motion.div>

      <div className="columns-2 gap-3 space-y-3 sm:columns-3 lg:columns-4 xl:columns-5">
        {photos.map((photo, idx) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="break-inside-avoid cursor-pointer group"
            onClick={() => open(idx)}
          >
            <div className="relative overflow-hidden rounded-[1.6rem] border border-border/70 bg-card shadow-[0_18px_36px_-24px_rgba(86,59,42,0.34)] transition-shadow duration-300 hover:shadow-[0_22px_46px_-24px_rgba(86,59,42,0.42)]">
              <img
                src={photo.url}
                alt={photo.caption}
                loading="lazy"
                className="w-full h-auto block group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex items-center gap-2">
                  {photo.entryMood && <span className="text-lg leading-none">{photo.entryMood}</span>}
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-medium text-white">{photo.entryTitle || photo.caption}</p>
                    <p className="text-xs text-white/70">{photo.date}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#1a1410]/95 flex items-center justify-center"
            onClick={close}
          >
            <Button
              variant="ghost"
              size="icon-lg"
              className="absolute top-4 right-4 z-10 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
              onClick={close}
            >
              <X className="size-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon-lg"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
              onClick={(e) => { e.stopPropagation(); prev(); }}
            >
              <ChevronLeft className="size-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon-lg"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
              onClick={(e) => { e.stopPropagation(); next(); }}
            >
              <ChevronRight className="size-8" />
            </Button>

            <motion.div
              key={current.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={current.url}
                alt={current.caption}
                className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl object-contain"
              />
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-base font-medium text-white">{current.entryTitle || current.caption}</p>
                <p className="text-sm text-white/60">{current.date}</p>
                {current.author && (
                  <p className="text-xs text-white/50">{current.author === "BK" ? "🧑 BK" : "🌸 Bi"}</p>
                )}
              </div>
              {current.entryId && (
                <Button variant="secondary" size="sm" render={<Link href={`/journal/${current.entryId}`} />}>
                  <BookOpen className="size-3.5" />
                  Mở bài viết gốc
                </Button>
              )}
              <p className="text-white/40 text-xs">{selectedIdx! + 1} / {photos.length}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
