"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Pencil, Plus, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  getDates,
  updateDateEntry,
  addDateEntry,
  type DateInfo,
} from "@/lib/data";

const DATE_EMOJIS = ["💫", "💘", "💍", "🎂", "🎄", "🎁", "🌟", "💝", "🌸", "🎉", "🏠", "✈️"];

const DATE_TYPE_LABELS: Record<DateInfo["type"] | "custom", string> = {
  "first-meet": "Ngày đầu gặp",
  "first-date": "Ngày đầu hẹn hò",
  anniversary: "Kỷ niệm",
  "birthday-him": "Sinh nhật BK",
  "birthday-her": "Sinh nhật Bi",
  custom: "Ngày đặc biệt",
};

function useForceUpdate() {
  const [, setTick] = useState(0);
  return useCallback(() => setTick((t) => t + 1), []);
}

function startOfDay(d: Date): Date {
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  return new Date(y, m, day);
}

function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function nextOccurrence(month: number, day: number, from: Date): Date {
  const thisYear = new Date(from.getFullYear(), month - 1, day);
  if (startOfDay(thisYear) >= startOfDay(from)) return thisYear;
  return new Date(from.getFullYear() + 1, month - 1, day);
}

function formatDateVN(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d} tháng ${m}, ${y}`;
}

function computeDateCard(entry: DateInfo, now: Date) {
  const [y, m, d] = entry.date.split("-").map(Number);
  const original = new Date(y, m - 1, d);

  if (entry.type === "birthday-him" || entry.type === "birthday-her") {
    const next = nextOccurrence(m, d, now);
    const daysUntil = daysBetween(now, next);
    const isToday = daysUntil === 0;
    const upcomingWithinWeek = daysUntil <= 7 && daysUntil >= 0;

    return {
      label: `${entry.emoji} ${entry.person ? `${entry.person} — ` : ""}${entry.label}`,
      dateStr: formatDateVN(entry.date),
      count: isToday ? 0 : daysUntil,
      countLabel: isToday ? "🎉 Hôm nay!" : `Còn ${daysUntil} ngày`,
      isToday,
      isUpcoming: upcomingWithinWeek && !isToday,
    };
  }

  if (entry.type === "anniversary" || entry.type === "first-meet" || entry.type === "first-date" || entry.type === "custom") {
    const daysSince = daysBetween(original, now);
    const next = nextOccurrence(m, d, now);
    const daysUntil = daysBetween(now, next);
    const isToday = daysUntil === 0;

    return {
      label: `${entry.emoji} ${entry.label}`,
      dateStr: formatDateVN(entry.date),
      count: daysSince,
      countLabel: `${daysSince} ngày kể từ ngày ấy`,
      nextCountdown: isToday ? "🎉 Hôm nay là kỷ niệm!" : `Còn ${daysUntil} ngày đến kỷ niệm tới`,
      isToday,
      isAnniversary: true,
    };
  }

  const daysSince = daysBetween(original, now);
  return {
    label: `${entry.emoji} ${entry.label}`,
    dateStr: formatDateVN(entry.date),
    count: daysSince,
    countLabel: `${daysSince} ngày kể từ ngày ấy`,
    isToday: false,
  };
}

export default function DatesPage() {
  const [now, setNow] = useState<Date>(new Date());
  const [dates, setDates] = useState<DateInfo[]>([]);
  const [editingDate, setEditingDate] = useState<DateInfo | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    label: "",
    date: "",
    emoji: "💫",
    type: "custom" as DateInfo["type"] | "custom",
    person: "",
  });
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    getDates().then(setDates);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const refresh = useCallback(async () => {
    setDates(await getDates());
    forceUpdate();
  }, [forceUpdate]);

  const openEdit = (entry: DateInfo) => {
    setEditingDate(entry);
    setForm({
      label: entry.label,
      date: entry.date,
      emoji: entry.emoji,
      type: entry.type,
      person: entry.person ?? "",
    });
  };

  const openAdd = () => {
    setIsAdding(true);
    setForm({
      label: "",
      date: "",
      emoji: "💫",
      type: "custom",
      person: "",
    });
  };

  const handleSave = async () => {
    if (!form.label.trim() || !form.date) return;

    if (editingDate) {
      await updateDateEntry(editingDate.id, {
        label: form.label.trim(),
        date: form.date,
        emoji: form.emoji,
        type: form.type as DateInfo["type"],
        person: form.person.trim() || undefined,
      });
      setEditingDate(null);
    } else if (isAdding) {
      await addDateEntry({
        label: form.label.trim(),
        date: form.date,
        emoji: form.emoji,
        type: form.type as DateInfo["type"],
        person: form.person.trim() || undefined,
      });
      setIsAdding(false);
    }
    await refresh();
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex items-center justify-between px-4 pt-4">
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold"
        >
          💕 Ngày quan trọng
        </motion.h1>
        <Button size="sm" onClick={openAdd} className="rounded-full gap-1">
          <Plus className="size-4" />
          Thêm
        </Button>
      </div>

      <div className="flex flex-col gap-4 px-4">
        {dates.map((entry, idx) => {
          const card = computeDateCard(entry, now);
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="relative group"
            >
              <Card
                className={cn(
                  "relative",
                  card.isToday &&
                    "border-2 border-amber-300/60 shadow-lg shadow-amber-200/30 bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-pink-50/60 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-pink-950/30",
                  card.isAnniversary &&
                    "bg-gradient-to-br from-pink-50/60 via-rose-50/40 to-amber-50/50 dark:from-pink-950/20 dark:via-rose-950/15 dark:to-amber-950/20 shadow-md shadow-pink-200/20",
                  card.isUpcoming &&
                    "border border-amber-200/50 shadow-sm shadow-amber-100/20"
                )}
              >
                <CardContent className="flex items-center justify-between py-5 pr-12">
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-base">{card.label}</p>
                    <p className="text-sm text-muted-foreground">{card.dateStr}</p>
                    {card.nextCountdown && (
                      <p className="text-xs text-pink-500 font-medium mt-0.5">
                        {card.nextCountdown}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {card.isToday ? (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-sm px-3 py-1 rounded-full dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700">
                        🎉 Hôm nay!
                      </Badge>
                    ) : (
                      <span className="text-xl font-extrabold text-primary tabular-nums">
                        {card.count.toLocaleString("vi-VN")}
                      </span>
                    )}
                    {!card.isToday && (
                      <span className="text-xs text-muted-foreground">{card.countLabel}</span>
                    )}
                  </div>
                </CardContent>

                <button
                  onClick={() => openEdit(entry)}
                  className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full bg-muted/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-all"
                  aria-label="Sửa"
                >
                  <Pencil className="size-3.5" />
                </button>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Edit / Add Dialog */}
      <Dialog
        open={editingDate !== null || isAdding}
        onOpenChange={(open) => {
          if (!open) {
            setEditingDate(null);
            setIsAdding(false);
          }
        }}
      >
        <DialogContent className="max-w-[380px]">
          <DialogHeader>
            <DialogTitle>
              {editingDate ? "✏️ Sửa ngày" : "✨ Thêm ngày mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {/* Emoji */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Emoji</label>
              <div className="flex flex-wrap gap-1.5">
                {DATE_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, emoji }))}
                    className={cn(
                      "size-10 flex items-center justify-center rounded-lg text-xl transition-all",
                      form.emoji === emoji
                        ? "bg-primary/20 ring-2 ring-primary scale-110"
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Loại</label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(DATE_TYPE_LABELS) as [DateInfo["type"] | "custom", string][]).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: key }))}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        form.type === key
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Label */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">
                Tên <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Ví dụ: Kỷ niệm 2 năm"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              />
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">
                📅 Ngày <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>

            {/* Person (only for birthdays) */}
            {(form.type === "birthday-him" || form.type === "birthday-her") && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold">Người</label>
                <Input
                  placeholder="BK / Bi"
                  value={form.person}
                  onChange={(e) => setForm((f) => ({ ...f, person: e.target.value }))}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingDate(null);
                setIsAdding(false);
              }}
            >
              Huỷ
            </Button>
            <Button onClick={handleSave} disabled={!form.label.trim() || !form.date}>
              <Save className="size-4" />
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
