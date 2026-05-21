"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/journal/rich-text-editor";
import { cn } from "@/lib/utils";
import {
  clearDraft,
  formatDraftTime,
  readDraft,
  useDraftAutosave,
} from "@/lib/draft-autosave";
import {
  extractJournalPhotoUrls,
  mergeJournalBodyWithPhotos,
  sanitizeJournalHtml,
} from "@/lib/journal-rich-text";
import {
  getJournalEntry,
  updateJournalEntry,
} from "@/lib/data";
import { uploadPhoto } from "@/lib/storage";

const PRESET_MOODS = ["😊", "😢", "🥰", "😤", "😴"];
const FULL_MOODS = [
  "😊", "😢", "🥰", "😤", "😴",
  "😍", "🤩", "😅", "😂", "🥺",
  "😭", "🤗", "😌", "😎", "🤔",
  "🙄", "😐", "😬", "😱", "🫠",
  "😋", "🤤", "😷", "🥳", "😶‍🌫️",
  "🫡", "💀", "👻", "🎉", "💕",
];

type JournalDraft = {
  title: string;
  date: string;
  mood: string;
  body: string;
};

export default function EditEntryPage() {
  const params = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [mood, setMood] = useState("");
  const [body, setBody] = useState("");
  const [moodPickerOpen, setMoodPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [restoredAt, setRestoredAt] = useState<string | null>(null);
  const initialEntryRef = useRef<JournalDraft | null>(null);
  const draftKey = `ourjournal:draft:journal:edit:${params.id as string}`;

  useEffect(() => {
    getJournalEntry(params.id as string).then((entry) => {
      if (!entry) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const initialEntry = {
        title: entry.title,
        date: entry.date,
        mood: entry.mood,
        body: mergeJournalBodyWithPhotos(entry.body, entry.photos),
      } satisfies JournalDraft;

      initialEntryRef.current = initialEntry;

      const storedDraft = readDraft<JournalDraft>(draftKey);
      if (storedDraft) {
        setTitle(storedDraft.data.title);
        setDate(storedDraft.data.date);
        setMood(storedDraft.data.mood);
        setBody(storedDraft.data.body);
        setRestoredAt(storedDraft.updatedAt);
      } else {
        setTitle(initialEntry.title);
        setDate(initialEntry.date);
        setMood(initialEntry.mood);
        setBody(initialEntry.body);
      }
      setDraftHydrated(true);
      setLoading(false);
    });
  }, [params.id, draftKey]);

  const handleSubmit = async () => {
    setError(null);

    if (!title.trim()) {
      setError("Hãy đặt tiêu đề cho bài viết này nha~");
      return;
    }
    if (!mood) {
      setError("Hãy chọn một mood emoji để thể hiện cảm xúc nè~");
      return;
    }

    setSubmitting(true);
    try {
      const sanitizedBody = sanitizeJournalHtml(body);
      const photoUrls = extractJournalPhotoUrls(sanitizedBody);

      await updateJournalEntry(params.id as string, {
        title: title.trim(),
        date,
        mood,
        body: sanitizedBody,
        photos: photoUrls,
      });
      clearSavedDraft();
      router.push(`/journal/${params.id}`);
    } catch {
      setError("Có lỗi khi lưu. Thử lại nha~");
      setSubmitting(false);
    }
  };

  const draftValue = useMemo<JournalDraft>(() => ({
    title,
    date,
    mood,
    body,
  }), [title, date, mood, body]);

  const { savedAt, clearSavedDraft } = useDraftAutosave({
    storageKey: draftKey,
    value: draftValue,
    enabled: draftHydrated && !submitting && !loading && !notFound,
  });

  const handleDiscardDraft = () => {
    clearDraft(draftKey);
    clearSavedDraft();
    setRestoredAt(null);

    if (!initialEntryRef.current) return;

    setTitle(initialEntryRef.current.title);
    setDate(initialEntryRef.current.date);
    setMood(initialEntryRef.current.mood);
    setBody(initialEntryRef.current.body);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <span className="text-6xl">🔍</span>
        <p className="text-lg font-semibold text-foreground">Không tìm thấy bài viết</p>
        <Button render={<Link href="/journal" />} variant="outline" className="rounded-full">
          ← Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full px-4 py-6">
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Button variant="ghost" size="icon-sm" render={<Link href={`/journal/${params.id}`} />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-extrabold text-foreground">
            ✏️ Sửa nhật ký
          </h1>
        </div>
      </motion.div>

      <div className="paper-panel mb-4 flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Draft autosave
          </p>
          <p className="mt-1 text-sm text-foreground">
            {!draftHydrated
              ? "Đang chuẩn bị nháp..."
              : savedAt
                ? `Đã lưu nháp lúc ${formatDraftTime(savedAt)}`
                : restoredAt
                  ? `Đã khôi phục nháp lúc ${formatDraftTime(restoredAt)}`
                  : "Nháp chỉnh sửa sẽ tự động lưu trên thiết bị này"}
          </p>
          <p className="text-xs text-muted-foreground">
            Lưu cả nội dung rich text và các ảnh inline đã chèn. Ảnh được upload ngay khi bạn thêm vào editor.
          </p>
        </div>
        {(savedAt || restoredAt) && (
          <Button variant="ghost" size="sm" onClick={handleDiscardDraft}>
            Xóa nháp
          </Button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-5"
      >
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">
            Tiêu đề <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="Đặt một cái tên thật dễ thương..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="h-10 text-base"
          />
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">
            📅 Ngày
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 max-w-[200px]"
          />
        </div>

        {/* Mood */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">
            Mood <span className="text-destructive">*</span>
          </label>
          <div className="flex items-center gap-2">
            {PRESET_MOODS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setMood(emoji)}
                className={cn(
                  "flex items-center justify-center size-12 rounded-xl text-2xl transition-all border-2",
                  mood === emoji
                    ? "border-primary bg-primary/10 scale-110 shadow-sm"
                    : "border-transparent bg-muted/50 hover:bg-muted hover:scale-105"
                )}
              >
                {emoji}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setMoodPickerOpen(true)}
              className="flex items-center justify-center size-12 rounded-xl text-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted transition-colors"
            >
              ...
            </button>
          </div>
          {mood && (
            <p className="text-sm text-muted-foreground mt-1">
              Đã chọn: <span className="text-xl align-middle">{mood}</span>
            </p>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">
            📝 Nội dung
          </label>
          <RichTextEditor
            value={body}
            onChange={setBody}
            onUploadImage={uploadPhoto}
            placeholder="Viết, chèn ảnh, tô màu và làm cho trang nhật ký này giống một trang Notion riêng của hai bạn."
          />
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-destructive bg-destructive/10 rounded-lg px-3 py-2"
          >
            ⚠️ {error}
          </motion.p>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          size="lg"
          className="w-full rounded-full h-11 text-base font-bold shadow-[0_4px_18px_oklch(0.62_0.15_37/0.3)] hover:shadow-[0_6px_24px_oklch(0.62_0.15_37/0.4)] transition-shadow"
        >
          {submitting ? "Đang lưu..." : "Cập nhật ✨"}
        </Button>
      </motion.div>

      {/* Full emoji picker dialog */}
      <Dialog open={moodPickerOpen} onOpenChange={setMoodPickerOpen}>
        <DialogContent className="max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Chọn mood emoji</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-6 gap-2 py-2">
            {FULL_MOODS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setMood(emoji);
                  setMoodPickerOpen(false);
                }}
                className={cn(
                  "flex items-center justify-center size-11 rounded-xl text-xl transition-all hover:bg-muted hover:scale-110",
                  mood === emoji && "bg-primary/15 ring-2 ring-primary"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
