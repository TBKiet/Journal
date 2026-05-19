"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, Pencil, X, Pin, PinOff, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  getJournalEntry,
  deleteJournalEntry,
  addReaction,
  addComment,
  getCurrentUser,
  toggleJournalEntryPin,
  type JournalEntry,
  type Author,
} from "@/lib/data";

const REACTION_EMOJIS = ["❤️", "😍", "🥺", "😂", "😭", "👍", "🎉", "🥳", "💕", "🌟"];

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(isoStr: string) {
  const date = new Date(isoStr);
  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function useForceUpdate() {
  const [, setTick] = useState(0);
  return useCallback(() => setTick((t) => t + 1), []);
}

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Author>("BK");
  const forceUpdate = useForceUpdate();

  const [entry, setEntry] = useState<JournalEntry | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);

  useEffect(() => {
    getJournalEntry(params.id as string).then((data) => {
      setEntry(data);
      setLoading(false);
    });
  }, [params.id]);

  const refresh = useCallback(async () => {
    setEntry(await getJournalEntry(params.id as string));
    forceUpdate();
  }, [params.id, forceUpdate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-4 py-20 gap-4">
        <span className="text-6xl">🔍</span>
        <p className="text-lg font-semibold text-foreground">
          Không tìm thấy bài viết này
        </p>
        <p className="text-sm text-muted-foreground text-center">
          Có thể bài viết đã bị xóa hoặc đường dẫn không đúng.
        </p>
        <Button render={<Link href="/journal" />} variant="outline" className="rounded-full">
          ← Quay lại
        </Button>
      </div>
    );
  }

  const isOwn = entry.author === currentUser;

  const handleReaction = async (emoji: string) => {
    await addReaction(entry.id, { emoji, by: currentUser });
    setShowReactionPicker(false);
    await refresh();
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await addComment(entry.id, { by: currentUser, text: commentText.trim() });
    setCommentText("");
    await refresh();
  };

  const handleDelete = async () => {
    await deleteJournalEntry(entry.id);
    router.push("/journal");
  };

  const handleTogglePin = async () => {
    const updated = await toggleJournalEntryPin(entry.id, !entry.isPinned);
    if (updated) {
      setEntry(updated);
      forceUpdate();
    }
  };

  return (
    <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Button variant="ghost" size="icon-sm" render={<Link href="/journal" />}>
            <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-lg font-extrabold text-foreground flex-1 min-w-0 truncate">
          {entry.title}
        </h1>
        {isOwn && (
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon-sm" onClick={handleTogglePin}>
              {entry.isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
            </Button>
            <Button variant="ghost" size="icon-sm" render={<Link href={`/journal/${entry.id}/edit`} />}>
                <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive/70 hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-5"
      >
        {/* Mood + meta */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-16 rounded-2xl bg-primary/10 text-3xl">
            {entry.mood}
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm text-muted-foreground">
              {formatDate(entry.date)}
            </p>
            <div className="flex items-center gap-2">
              {entry.isPinned && (
                <Badge className="w-fit gap-1 text-xs">
                  <Pin className="size-3" />
                  Kỷ niệm ghim
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="w-fit text-xs"
              >
                {entry.author === "BK" ? "🧑 BK" : "🌸 Bi"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="bg-card rounded-2xl px-4 py-4 ring-1 ring-foreground/10">
          <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
            {entry.body}
          </p>
        </div>

        {/* Photos */}
        {entry.photos.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Ảnh trong bài viết</h3>
              <Button variant="ghost" size="sm" render={<Link href="/photos" />}>
                <BookOpen className="size-3.5" />
                Xem timeline ảnh
              </Button>
            </div>
          <div className="grid grid-cols-2 gap-2">
            {entry.photos.map((url, i) => (
              <button
                key={i}
                onClick={() => setFullscreenImage(url)}
                className={cn(
                  "rounded-xl overflow-hidden bg-muted",
                  entry.photos.length === 1 && "col-span-2",
                  entry.photos.length === 3 && i === 0 && "col-span-2"
                )}
              >
                <img
                  src={url}
                  alt={`Ảnh ${i + 1}`}
                  className="object-cover w-full hover:scale-105 transition-transform duration-300"
                  style={{
                    aspectRatio:
                      entry.photos.length === 1
                        ? "16/10"
                        : entry.photos.length === 3 && i === 0
                          ? "16/9"
                          : "1/1",
                  }}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
          </div>
        )}

        {/* Reactions */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {entry.reactions.length > 0 ? (
              Object.entries(
                entry.reactions.reduce<
                  Record<string, { emoji: string; count: number }>
                >((acc, r) => {
                  if (!acc[r.emoji]) acc[r.emoji] = { emoji: r.emoji, count: 0 };
                  acc[r.emoji].count++;
                  return acc;
                }, {})
              ).map(([key, { emoji, count }]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1 text-sm font-medium"
                >
                  <span>{emoji}</span>
                  <span className="text-xs text-muted-foreground">
                    {count}
                  </span>
                </span>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                Chưa có ai bày tỏ cảm xúc~
              </p>
            )}
          </div>

          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className={cn(
              "text-xs font-medium transition-colors self-start",
              showReactionPicker
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {showReactionPicker ? "✕ Đóng" : "+ Bày tỏ cảm xúc"}
          </button>

          <AnimatePresence>
            {showReactionPicker && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                className="flex items-center gap-1 flex-wrap p-2 rounded-xl bg-popover ring-1 ring-foreground/10 shadow-[0_4px_12px_oklch(0.25_0.02_45/0.08)]"
              >
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="text-xl p-1 rounded-lg hover:bg-muted transition-colors active:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comment input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Viết bình luận..."
            className="flex-1 h-9 rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring transition-colors"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleComment();
            }}
          />
          <Button
            size="sm"
            onClick={handleComment}
            disabled={!commentText.trim()}
            className="shrink-0 rounded-xl"
          >
            Gửi
          </Button>
        </div>

        {/* Comments */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-foreground">
            💬 Bình luận ({entry.comments.length})
          </h3>

          {entry.comments.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Chưa có bình luận nào. Hãy là người đầu tiên!
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {entry.comments.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-2 rounded-xl bg-card ring-1 ring-foreground/10 px-3 py-2.5"
                >
                  <PersonAvatar
                    person={c.by}
                    size="sm"
                    className="shrink-0 mt-0.5"
                    fallbackClassName="text-[0.6rem] bg-secondary/80 text-secondary-foreground font-bold"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-foreground">
                        {c.by}
                      </span>
                      <span className="text-[0.6rem] text-muted-foreground">
                        {formatDateTime(c.date)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/85 leading-snug">
                      {c.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Fullscreen image dialog */}
      <Dialog
        open={fullscreenImage !== null}
        onOpenChange={() => setFullscreenImage(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-full max-h-full sm:max-w-[90vw] sm:max-h-[90vh] p-0 bg-black/95 rounded-2xl overflow-hidden"
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-3 right-3 z-10 flex items-center justify-center size-9 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X className="size-5" />
          </button>
          {fullscreenImage && (
            <img
              src={fullscreenImage}
              alt="Ảnh kỷ niệm"
              className="w-full h-full object-contain max-h-[90vh] rounded-2xl"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
