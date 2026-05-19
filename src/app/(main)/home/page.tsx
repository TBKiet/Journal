"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getCurrentUser, getTodayPrompt, getJournalEntries, getPlans, type JournalEntry, type Plan, type CouplePrompt } from "@/lib/data";

const RELATIONSHIP_START = new Date("2024-02-14");

const fadeStagger = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 16, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 280, damping: 24 },
    },
  },
};

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function getDaysTogether() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor(
    (today.getTime() - RELATIONSHIP_START.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function getDaysUntilAnniversary() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = new Date(today.getFullYear(), 1, 14); // Feb 14
  if (next <= today) {
    next = new Date(today.getFullYear() + 1, 1, 14);
  }
  return Math.floor((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<"BK" | "Bi">("BK");
  const [todayPrompt, setTodayPrompt] = useState<CouplePrompt | undefined>(undefined);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [upcomingPlans, setUpcomingPlans] = useState<Plan[]>([]);
  const daysTogether = getDaysTogether();
  const daysUntil = getDaysUntilAnniversary();

  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
    getTodayPrompt().then(setTodayPrompt);
    getJournalEntries().then((entries) => setRecentEntries(entries.slice(0, 5)));
    getPlans().then((plans) => setUpcomingPlans(plans.filter((p) => p.status === "planned").slice(0, 3)));
  }, []);

  return (
    <div className="flex flex-col flex-1 gap-6 px-4 py-6 max-w-2xl mx-auto w-full">
      {/* ---- Top counters ---- */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-2"
      >
        <p className="text-sm font-semibold text-muted-foreground tracking-wide">
          👋 Xin chào {currentUser === "BK" ? "BK" : "Bi"}!
        </p>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-4 py-1.5 text-sm font-medium text-accent">
          <span>💕</span>
          <span>
            {daysTogether} ngày bên nhau · Còn {daysUntil} ngày đến kỷ niệm
          </span>
        </div>
      </motion.div>

      {/* ---- Today's Question ---- */}
      {todayPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/prompts" className="block">
            <Card
              size="sm"
              className="bg-gradient-to-br from-pink-50/80 via-rose-50/60 to-amber-50/70 dark:from-pink-950/30 dark:via-rose-950/20 dark:to-amber-950/20 ring-1 ring-pink-200 dark:ring-pink-800/30 shadow-[0_4px_16px_oklch(0.55_0.1_10/0.12)] hover:shadow-[0_6px_20px_oklch(0.55_0.1_10/0.18)] transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/40 dark:text-pink-200 text-[0.6rem]">
                    🌟 Hôm nay
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold leading-snug mt-1">
                  {todayPrompt.emoji} {todayPrompt.question}
                </CardTitle>
                <CardDescription className="text-xs">
                  {todayPrompt.answers.length}/2 đã trả lời · Chạm để trả lời ✨
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </motion.div>
      )}

      {/* ---- Latest Memories ---- */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            ✨ Nhật ký gần đây
          </h2>
          {recentEntries.length > 0 && (
            <Link
              href="/journal"
              className="text-sm font-medium text-primary hover:underline underline-offset-2"
            >
              Xem tất cả →
            </Link>
          )}
        </div>

        {recentEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 rounded-2xl bg-card px-6 py-12 text-center ring-1 ring-foreground/10"
          >
            <span className="text-5xl">📝</span>
            <p className="text-sm text-muted-foreground">
              Chưa có bài viết nào. Hãy viết bài đầu tiên nhé!
            </p>
            <Button render={<Link href="/journal/new" />}>
              ✍️ Viết bài đầu tiên
            </Button>
          </motion.div>
        ) : (
          <div className="-mx-4 px-4 md:mx-0 md:px-0">
            <motion.div
              variants={fadeStagger.container}
              initial="hidden"
              animate="show"
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-4 pb-1 scrollbar-none"
            >
              {recentEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  variants={fadeStagger.item}
                  className="shrink-0 w-[260px] snap-start"
                >
                  <Link href={`/journal/${entry.id}`}>
                    <Card
                      size="sm"
                      className={cn(
                        "h-full shadow-[0_4px_16px_oklch(0.25_0.02_45/0.08)]",
                        "hover:shadow-[0_6px_20px_oklch(0.25_0.02_45/0.12)] transition-shadow",
                      )}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl leading-none" aria-hidden>
                            {entry.mood}
                          </span>
                          <div className="flex flex-col">
                            <CardTitle className="text-sm leading-snug line-clamp-1">
                              {entry.title}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {formatDate(entry.date)}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {entry.body}
                        </p>
                        {entry.photos.length > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-secondary-foreground/70">
                            <span>🖼️</span>
                            <span>Có ảnh</span>
                          </div>
                        )}
                      </CardContent>
                      <div className="px-4 pb-3">
                        <Badge
                          variant="secondary"
                          className="text-[0.65rem]"
                        >
                          {entry.author === "BK" ? "🧑 BK" : "🌸 Bi"}
                        </Badge>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </section>

      <Separator />

      {/* ---- Upcoming Plans ---- */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">📋 Sắp tới</h2>
          {upcomingPlans.length > 0 && (
            <Link
              href="/plans"
              className="text-sm font-medium text-primary hover:underline underline-offset-2"
            >
              Xem tất cả →
            </Link>
          )}
        </div>

        {upcomingPlans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 rounded-2xl bg-card px-6 py-12 text-center ring-1 ring-foreground/10"
          >
            <span className="text-5xl">📋</span>
            <p className="text-sm text-muted-foreground">Chưa có kế hoạch nào~</p>
            <Button variant="outline" render={<Link href="/plans/new" />}>
              ➕ Thêm kế hoạch
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={fadeStagger.container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-2"
          >
            {upcomingPlans.map((plan) => (
              <motion.div key={plan.id} variants={fadeStagger.item}>
                <Link href={`/plans`}>
                  <Card
                    size="sm"
                    className="flex-row items-center gap-3 px-4 py-3 shadow-[0_4px_16px_oklch(0.25_0.02_45/0.06)] hover:shadow-[0_6px_20px_oklch(0.25_0.02_45/0.10)] transition-shadow"
                  >
                    <span className="text-2xl" aria-hidden>
                      {plan.location ?? "📍"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{plan.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(plan.date)}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-[0.65rem]"
                    >
                      📅 Sắp tới
                    </Badge>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ---- Bottom write CTA ---- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex justify-center pb-4 pt-2"
      >
        <Button
          size="lg"
          render={<Link href="/journal/new" />}
          className="rounded-full px-6 shadow-[0_4px_18px_oklch(0.62_0.15_37/0.35)] hover:shadow-[0_6px_24px_oklch(0.62_0.15_37/0.45)] transition-shadow text-sm"
        >
          ✍️ Viết nhật ký
        </Button>
      </motion.div>
    </div>
  );
}
