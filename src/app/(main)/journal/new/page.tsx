"use client";

import { Suspense, useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  addJournalEntry,
  getCurrentUser,
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

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function NewEntryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground text-sm">Đang tải...</p>
        </div>
      }
    >
      <NewEntryForm />
    </Suspense>
  );
}

function NewEntryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUserState] = useState<"BK" | "Bi">("BK");

  useEffect(() => {
    getCurrentUser().then(setCurrentUserState);
  }, []);

  const prefill = useMemo(() => {
    const from = searchParams.get("from");
    if (from === "plan") {
      return {
        title: searchParams.get("title") ?? "",
        text: searchParams.get("text") ?? "",
        location: searchParams.get("location") ?? "",
      };
    }
    return null;
  }, [searchParams]);

  const [title, setTitle] = useState(prefill?.title ?? "");
  const [date, setDate] = useState(todayStr());
  const [mood, setMood] = useState(prefill ? "🥰" : "");
  const [body, setBody] = useState(
    prefill
      ? `${prefill.text}${prefill.location ? `\n\n📍 ${prefill.location}` : ""}`
      : ""
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const [moodPickerOpen, setMoodPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFilesRef = useRef<File[]>([]);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    pendingFilesRef.current.push(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotos((p) => [...p, reader.result as string]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        Array.from(files).forEach(processFile);
      }
      e.target.value = "";
    },
    [processFile]
  );

  const addPhoto = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = (idx: number) => {
    setPhotos((p) => p.filter((_, i) => i !== idx));
    // Remove corresponding pending file (approximate — index-based)
    if (idx < pendingFilesRef.current.length) {
      pendingFilesRef.current.splice(idx, 1);
    }
  };

  // Paste image support
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) processFile(file);
        }
      }
    };
    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, [processFile]);

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
      // Upload pending files to Supabase Storage
      const uploadedUrls: string[] = [];
      for (const file of pendingFilesRef.current) {
        const url = await uploadPhoto(file);
        uploadedUrls.push(url);
      }
      const allPhotoUrls = [...uploadedUrls];

      await addJournalEntry({
        title: title.trim(),
        date,
        mood,
        body: body.trim(),
        photos: allPhotoUrls,
        author: currentUser,
      });
      router.push("/journal");
    } catch {
      setError("Có lỗi khi lưu. Thử lại nha~");
      setSubmitting(false);
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
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-extrabold text-foreground">
            {prefill ? "✨ Tạo kỷ niệm từ kế hoạch" : "✍️ Viết nhật ký"}
          </h1>
          <p className="text-xs text-muted-foreground">
            Đang viết với tư cách {currentUser === "BK" ? "🧑 BK" : "🌸 Bi"}
          </p>
        </div>
      </motion.div>

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
          <Textarea
            placeholder="Hôm nay tôi đã..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="text-base leading-relaxed resize-y"
          />
        </div>

        {/* Photos */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">
            📸 Thêm ảnh
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {photos.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden bg-muted">
                  <img
                    src={url}
                    alt={`Ảnh ${idx + 1}`}
                    className="aspect-square object-cover w-full"
                  />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 size-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addPhoto}
            className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
          >
            <ImagePlus className="size-8" />
            <span className="text-sm font-medium">
              📸 Chọn ảnh từ thiết bị
            </span>
            <span className="text-xs text-muted-foreground/60">
              Hoặc dán ảnh (Ctrl+V) vào đây
            </span>
          </button>
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
          {submitting ? "Đang lưu..." : "Lưu ✨"}
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
