"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Pencil, ChevronDown, ChevronUp, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PersonAvatar } from "@/components/common/person-avatar";
import { cn } from "@/lib/utils";
import {
  getJournalEntries,
  deleteJournalEntry,
  addReaction,
  addComment,
  getCurrentUser,
  toggleJournalEntryPin,
  type JournalEntry,
  type Author,
} from "@/lib/data";

const REACTION_EMOJIS = ["❤️", "😍", "🥺", "😂", "😭", "👍", "🎉", "🥳", "💕", "🌟"];

const fadeStagger = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  },
};

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function getMonthLabel(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
}

function useForceUpdate() {
  const [, setTick] = useState(0);
  return useCallback(() => setTick((t) => t + 1), []);
}

type SortMode = "newest" | "oldest";

export default function JournalPage() {
  const [currentUser, setCurrentUser] = useState<Author>("BK");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<{ entryId: string; text: string } | null>(null);
  const [monthFilter, setMonthFilter] = useState<string | null>(null);
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [authorFilter, setAuthorFilter] = useState<"all" | Author>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);

  useEffect(() => {
    getJournalEntries().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const refresh = useCallback(async () => {
    setEntries(await getJournalEntries());
    forceUpdate();
  }, [forceUpdate]);

  const handleDelete = async (id: string) => {
    await deleteJournalEntry(id);
    await refresh();
  };

  const handleReaction = async (entryId: string, emoji: string) => {
    await addReaction(entryId, { emoji, by: currentUser });
    setShowReactionPicker(null);
    await refresh();
  };

  const handleComment = async (entryId: string) => {
    if (!commentInput || !commentInput.text.trim()) return;
    await addComment(entryId, { by: currentUser, text: commentInput.text.trim() });
    setCommentInput(null);
    await refresh();
  };

  const handleTogglePin = async (entryId: string, isPinned: boolean) => {
    await toggleJournalEntryPin(entryId, !isPinned);
    await refresh();
  };

  const allEntries = entries;
  const availableMonths = Array.from(
    new Map(
      allEntries.map((e) => [e.date.slice(0, 7), getMonthLabel(e.date)])
    )
  );
  const availableMoods = Array.from(
    new Set(allEntries.map((e) => e.mood))
  );

  const filtered = useMemo(() => {
    let result = entries.filter((e) => {
      if (monthFilter && !e.date.startsWith(monthFilter)) return false;
      if (moodFilter && e.mood !== moodFilter) return false;
      if (authorFilter !== "all" && e.author !== authorFilter) return false;
      return true;
    });
    result = [...result].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      const dA = new Date(a.date).getTime();
      const dB = new Date(b.date).getTime();
      return sortMode === "newest" ? dB - dA : dA - dB;
    });
    return result;
  }, [entries, monthFilter, moodFilter, authorFilter, sortMode]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-3 py-3 pb-24 sm:px-4 sm:py-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="paper-panel mb-1 flex flex-col gap-4 p-5 sm:p-6"
      >
        <div>
          <p className="section-kicker">Diary</p>
          <h1 className="mt-1 font-heading text-4xl tracking-[-0.04em] text-foreground">
            Nhật ký
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 rounded-full border border-border/70 bg-background/80 p-1">
            {(["all", "BK", "Bi"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setAuthorFilter(filter)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                  authorFilter === filter
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {filter === "all" ? "Tất cả" : filter === "BK" ? "🧑 BK" : "🌸 Bi"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-full border border-border/70 bg-background/80 p-1">
            {([
              { value: "newest" as SortMode, label: "Mới nhất" },
              { value: "oldest" as SortMode, label: "Cũ nhất" },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortMode(opt.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                  sortMode === opt.value
                    ? "bg-secondary text-secondary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Filters: Month & Mood */}
      <div className="paper-panel mb-1 flex items-center gap-2 overflow-x-auto pb-1 p-3 scrollbar-none">
        <div className="flex items-center gap-1 shrink-0">
          {availableMonths.map(([key, label]) => (
            <Badge
              key={key}
              variant={monthFilter === key ? "default" : "outline"}
              className="cursor-pointer select-none"
              onClick={() =>
                setMonthFilter(monthFilter === key ? null : key)
              }
            >
              {label}
            </Badge>
          ))}
        </div>
        <span className="text-muted-foreground/40 shrink-0">·</span>
        <div className="flex items-center gap-1 shrink-0">
          {availableMoods.map((mood) => (
            <Badge
              key={mood}
              variant={moodFilter === mood ? "default" : "outline"}
              className="cursor-pointer select-none px-2.5 text-base"
              onClick={() =>
                setMoodFilter(moodFilter === mood ? null : mood)
              }
            >
              {mood}
            </Badge>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground text-sm">Đang tải...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 rounded-2xl bg-card px-6 py-14 text-center ring-1 ring-foreground/10 mt-4"
        >
          <span className="text-6xl">📝</span>
          <div>
            <p className="text-base font-semibold text-foreground">
              {entries.length === 0
                ? "Chưa có bài viết nào cả"
                : "Không tìm thấy bài viết nào"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {entries.length === 0
                ? "Hãy viết bài đầu tiên nhé!"
                : "Thử bỏ bộ lọc để xem thêm nha~"}
            </p>
          </div>
          {entries.length === 0 && (
            <Button render={<Link href="/journal/new" />} className="rounded-full px-5">
              ✍️ Viết bài đầu tiên
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={fadeStagger.container}
          initial="hidden"
          animate="show"
          className="relative ml-4 flex flex-col gap-0"
        >
          <div className="absolute bottom-0 left-0 top-0 ml-[8px] w-px bg-border/80" />

          {filtered.map((entry) => (
            <motion.div
              key={entry.id}
              variants={fadeStagger.item}
              className="relative pl-8 pb-8 last:pb-0"
            >
              {/* Timeline dot */}
              <div className="absolute left-0 top-6 z-10 h-4 w-4 rounded-full bg-primary ring-4 ring-background shadow-sm" />

              <EntryCard
                entry={entry}
                currentUser={currentUser}
                showReactionPicker={showReactionPicker === entry.id}
                onToggleReactionPicker={() =>
                  setShowReactionPicker(
                    showReactionPicker === entry.id ? null : entry.id
                  )
                }
                onReaction={(emoji) => handleReaction(entry.id, emoji)}
                commentInput={commentInput}
                onCommentInputChange={(text) =>
                  setCommentInput({ entryId: entry.id, text })
                }
                onCommentSubmit={() => handleComment(entry.id)}
                onTogglePin={() => handleTogglePin(entry.id, entry.isPinned)}
                onDelete={() => handleDelete(entry.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* FAB */}
      <Link
        href="/journal/new"
        className="fixed bottom-6 right-6 z-20 flex items-center justify-center size-14 rounded-full bg-primary text-primary-foreground shadow-[0_4px_20px_oklch(0.62_0.15_37/0.4)] hover:shadow-[0_6px_26px_oklch(0.62_0.15_37/0.5)] transition-shadow active:scale-95"
      >
        <span className="text-2xl font-bold">+</span>
      </Link>
    </div>
  );
}

function EntryCard({
  entry,
  currentUser,
  showReactionPicker,
  onToggleReactionPicker,
  onReaction,
  commentInput,
  onCommentInputChange,
  onCommentSubmit,
  onTogglePin,
  onDelete,
}: {
  entry: JournalEntry;
  currentUser: Author;
  showReactionPicker: boolean;
  onToggleReactionPicker: () => void;
  onReaction: (emoji: string) => void;
  commentInput: { entryId: string; text: string } | null;
  onCommentInputChange: (text: string) => void;
  onCommentSubmit: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isOwn = entry.author === currentUser;
  const bodyThreshold = 200;
  const isLong = entry.body.length > bodyThreshold;
  const displayBody =
    isLong && !expanded ? entry.body.slice(0, bodyThreshold) + "..." : entry.body;

  const isCommenting = commentInput?.entryId === entry.id;

  return (
    <Card
      size="sm"
      className="bg-card/95 transition-transform hover:-translate-y-0.5"
    >
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="text-[1.75rem] leading-none" aria-label={entry.mood}>
            {entry.mood}
          </span>
          <div className="flex flex-col min-w-0 flex-1">
            <CardTitle className="text-sm leading-snug line-clamp-1">
              {entry.title}
            </CardTitle>
            <CardDescription className="text-xs flex items-center gap-1.5">
              <span>{formatDate(entry.date)}</span>
              {entry.isPinned && (
                <Badge className="h-5 gap-1 px-2 text-[0.62rem]">
                  <Pin className="size-3" />
                  Ghim
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="h-5 px-2 text-[0.62rem]"
              >
                {entry.author === "BK" ? "🧑 BK" : "🌸 Bi"}
              </Badge>
            </CardDescription>
        </div>
          {isOwn && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onTogglePin}
                aria-label={entry.isPinned ? "Bỏ ghim bài viết" : "Ghim bài viết"}
              >
                {entry.isPinned ? (
                  <PinOff className="size-3" />
                ) : (
                  <Pin className="size-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                render={<Link href={`/journal/${entry.id}/edit`} />}
              >
                <Pencil className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-destructive/70 hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground leading-6 whitespace-pre-line">
          {displayBody}
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-1 text-primary font-medium text-xs hover:underline inline-flex items-center gap-0.5"
            >
              {expanded ? "Thu gọn" : "Xem thêm"}
              {expanded ? (
                <ChevronUp className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
            </button>
          )}
        </p>

        {entry.photos.length > 0 && (
          <div
            className={cn(
              "mt-3 gap-1.5",
              entry.photos.length === 1
                ? "flex"
                : "grid grid-cols-2"
            )}
          >
            {entry.photos.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Ảnh ${i + 1}`}
                className={cn(
                  "rounded-xl border border-border/60 bg-muted object-cover",
                  entry.photos.length === 1
                    ? "w-full max-h-64"
                    : i === 0 && entry.photos.length === 3
                      ? "col-span-2 max-h-48 w-full"
                      : entry.photos.length === 3 && i > 0
                        ? "max-h-40 w-full"
                        : "aspect-square w-full"
                )}
                loading="lazy"
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Reactions */}
      <div className="flex flex-col gap-3 px-4 pb-1">
        {entry.reactions.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {Object.entries(
              entry.reactions.reduce<Record<string, { emoji: string; count: number; by: Author[] }>>((acc, r) => {
                if (!acc[r.emoji]) {
                  acc[r.emoji] = { emoji: r.emoji, count: 0, by: [] };
                }
                acc[r.emoji].count++;
                acc[r.emoji].by.push(r.by);
                return acc;
              }, {})
            ).map(([key, { emoji, count }]) => (
              <span
                key={key}
                className="inline-flex items-center gap-0.5 rounded-full bg-secondary/60 px-2.5 py-1 text-xs"
              >
                <span>{emoji}</span>
                <span className="text-[0.6rem] text-muted-foreground">{count}</span>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-border/60 pt-3">
          <button
            onClick={onToggleReactionPicker}
            className={cn(
              "text-xs font-medium transition-colors",
              showReactionPicker
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {showReactionPicker ? "✕ Đóng" : "+ Bày tỏ cảm xúc"}
          </button>
          <span className="text-muted-foreground/30">·</span>
          <button
            onClick={() =>
              isCommenting
                ? onCommentInputChange("")
                : onCommentInputChange("")
            }
            className={cn(
              "text-xs font-medium transition-colors",
              isCommenting
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isCommenting ? "✕ Đóng" : "+ Bình luận"}
          </button>
        </div>

        <AnimatePresence>
          {showReactionPicker && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="flex flex-wrap items-center gap-1 rounded-2xl border border-border/70 bg-popover/95 p-2 shadow-[0_14px_28px_-20px_rgba(86,59,42,0.35)]"
            >
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReaction(emoji)}
                  className="rounded-lg p-1 text-lg transition-colors hover:bg-muted active:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCommenting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <input
                type="text"
                value={commentInput?.text ?? ""}
                onChange={(e) => onCommentInputChange(e.target.value)}
                placeholder="Viết bình luận ngắn..."
                className="flex-1 h-8 rounded-lg border border-input bg-transparent px-2.5 text-xs outline-none focus-visible:border-ring transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCommentSubmit();
                }}
              />
              <Button
                size="sm"
                onClick={onCommentSubmit}
                disabled={!commentInput?.text.trim()}
                className="shrink-0 text-xs h-7"
              >
                Gửi
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {entry.comments.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-border/50 pt-3">
            {entry.comments.slice(-3).map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <PersonAvatar
                  person={c.by}
                  size="sm"
                  fallbackClassName="text-[0.55rem] bg-secondary/70 text-secondary-foreground"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[0.65rem] font-semibold text-foreground/80">
                    {c.by}
                  </span>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
            {entry.comments.length > 3 && (
              <Link
                href={`/journal/${entry.id}`}
                className="text-[0.65rem] text-primary hover:underline ml-7"
              >
                Xem tất cả {entry.comments.length} bình luận →
              </Link>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
