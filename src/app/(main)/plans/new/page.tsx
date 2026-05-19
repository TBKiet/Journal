"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { addPlan } from "@/lib/data";
import { cn } from "@/lib/utils";

const statusOptions = [
  { value: "planned", label: "Sắp tới" },
  { value: "done", label: "Đã xong" },
  { value: "cancelled", label: "Huỷ" },
] as const;

export default function NewPlanPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"planned" | "done" | "cancelled">("planned");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setSaving(true);
    await addPlan({
      title: title.trim(),
      date,
      location: location.trim() || undefined,
      note: note.trim() || undefined,
      status,
    });
    router.push("/plans");
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold"
        >
          ✨ Kế hoạch mới
        </motion.h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4">
        <Card>
          <CardContent className="flex flex-col gap-4 py-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-sm font-semibold text-foreground">
                Tiêu đề <span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                placeholder="Đi chơi, ăn uống, du lịch..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="date" className="text-sm font-semibold text-foreground">
                  Ngày <span className="text-destructive">*</span>
                </label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Trạng thái
                </label>
                <div className="flex gap-1">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(opt.value)}
                      className={cn(
                        "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                        status === opt.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent border-input hover:bg-muted text-muted-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="location" className="text-sm font-semibold text-foreground">
                📍 Địa điểm
              </label>
              <Input
                id="location"
                placeholder="Quán cà phê, rạp phim, công viên..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="note" className="text-sm font-semibold text-foreground">
                📝 Ghi chú
              </label>
              <Textarea
                id="note"
                placeholder="Chi tiết kế hoạch, cần chuẩn bị gì..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => router.back()}
          >
            Huỷ
          </Button>
          <Button
            type="submit"
            disabled={!title.trim() || !date || saving}
            className="flex-1 rounded-full"
          >
            <Save className="size-4" />
            {saving ? "Đang lưu..." : "Lưu kế hoạch"}
          </Button>
        </div>
      </form>
    </div>
  );
}
