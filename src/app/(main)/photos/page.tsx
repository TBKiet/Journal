"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPhotos, type Photo } from "@/lib/data";

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const current = selectedIdx !== null ? photos[selectedIdx] : null;

  useEffect(() => {
    getPhotos().then((data) => { setPhotos(data); setLoading(false); });
  }, []);

  const open = useCallback((idx: number) => setSelectedIdx(idx), []);
  const close = useCallback(() => setSelectedIdx(null), []);
  const prev = useCallback(() => {
    setSelectedIdx((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null));
  }, []);
  const next = useCallback(() => {
    setSelectedIdx((i) => (i !== null ? (i + 1) % photos.length : null));
  }, []);

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

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <span className="text-6xl">📸</span>
        <p className="text-lg font-medium text-muted-foreground">Chưa có ảnh nào~</p>
        <p className="text-sm text-muted-foreground/70 text-center">Viết nhật ký và thêm ảnh để lưu giữ khoảnh khắc nhé!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold px-4 pt-4"
      >
        📸 Ảnh
      </motion.h1>

      <div className="px-3 columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
        {photos.map((photo, idx) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="break-inside-avoid cursor-pointer group"
            onClick={() => open(idx)}
          >
            <div className="relative overflow-hidden rounded-2xl shadow-md shadow-amber-900/10 hover:shadow-lg hover:shadow-amber-900/15 transition-shadow duration-300">
              <img
                src={photo.url}
                alt={photo.caption}
                loading="lazy"
                className="w-full h-auto block group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-sm font-medium">{photo.caption}</p>
                <p className="text-white/70 text-xs">{photo.date}</p>
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
              <p className="text-white font-medium text-base">{current.caption}</p>
              <p className="text-white/60 text-sm">{current.date}</p>
              <p className="text-white/40 text-xs">{selectedIdx! + 1} / {photos.length}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
