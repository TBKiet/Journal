"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCurrentUser, getTodayPrompt, getJournalEntries, getUpcomingPlans, type JournalEntry, type Plan, type CouplePrompt } from "@/lib/data";

const RELATIONSHIP_START = new Date("2024-02-14");

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
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const daysTogether = getDaysTogether();
  const daysUntil = getDaysUntilAnniversary();
  const pinnedEntries = recentEntries.filter((entry) => entry.isPinned).slice(0, 2);
  const latestEntries = recentEntries.filter((entry) => !entry.isPinned).slice(0, 4);

  useEffect(() => {
    mountedRef.current = true;
    let pending = 4;

    const done = () => {
      pending--;
      if (pending === 0 && mountedRef.current) setLoading(false);
    };

    getCurrentUser()
      .then((u) => { if (mountedRef.current) setCurrentUser(u); })
      .catch(console.error)
      .finally(done);

    getTodayPrompt()
      .then((p) => { if (mountedRef.current) setTodayPrompt(p); })
      .catch(console.error)
      .finally(done);

    getJournalEntries()
      .then((entries) => { if (mountedRef.current) setRecentEntries(entries.slice(0, 5)); })
      .catch(console.error)
      .finally(done);

    // Plans filtered at DB level — no client-side filter needed
    getUpcomingPlans(3)
      .then((plans) => { if (mountedRef.current) setUpcomingPlans(plans); })
      .catch(console.error)
      .finally(done);

    return () => { mountedRef.current = false; };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-3 py-3 sm:px-4 sm:py-4">
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]"
      >
        <div className="paper-panel relative overflow-hidden p-6 sm:p-7">
          <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-primary/10 to-transparent" />
          <p className="section-kicker">Welcome back</p>
          <div className="mt-3 max-w-xl">
            <h1 className="font-heading text-4xl leading-none tracking-[-0.04em] text-foreground sm:text-5xl">
              Xin chào {currentUser}.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Đây là góc nhỏ để giữ lại những ngày bình thường, những điều đáng yêu và cả những kế hoạch đang chờ hai người thực hiện.
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-border/70 bg-background/75 p-4">
              <p className="section-kicker">Bên nhau</p>
              <p className="mt-2 font-heading text-3xl text-foreground">{daysTogether}</p>
              <p className="text-sm text-muted-foreground">ngày đã đi qua</p>
            </div>
            <div className="rounded-[1.25rem] border border-border/70 bg-background/75 p-4">
              <p className="section-kicker">Kỷ niệm tới</p>
              <p className="mt-2 font-heading text-3xl text-foreground">{daysUntil}</p>
              <p className="text-sm text-muted-foreground">ngày còn lại</p>
            </div>
            <div className="rounded-[1.25rem] border border-border/70 bg-secondary/55 p-4">
              <p className="section-kicker">Nhịp hôm nay</p>
              <p className="mt-2 text-lg font-semibold text-secondary-foreground">Chậm, ấm và gần nhau</p>
            </div>
          </div>
        </div>

        {todayPrompt && (
          <Link href="/prompts" className="block">
            <Card
              size="sm"
              className="h-full overflow-hidden bg-[linear-gradient(145deg,color-mix(in_oklab,var(--accent)_65%,white_35%),color-mix(in_oklab,var(--card)_72%,transparent))] transition-transform hover:-translate-y-0.5"
            >
              <CardHeader className="pb-2">
                <Badge className="w-fit bg-background/80 text-foreground shadow-none">Prompt hôm nay</Badge>
                <CardTitle className="mt-3 text-2xl leading-tight sm:text-[1.85rem]">
                  {todayPrompt.emoji} {todayPrompt.question}
                </CardTitle>
                <CardDescription className="mt-2 text-sm leading-6">
                  {todayPrompt.answers.length}/2 đã trả lời. Mở prompt để hoàn thành đoạn hội thoại nhỏ của hôm nay.
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex items-center justify-between pt-4">
                <span className="text-sm font-semibold text-primary">Mở prompt</span>
                <span className="rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground">trả lời trong 1 phút</span>
              </CardContent>
            </Card>
          </Link>
        )}
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="flex flex-col gap-3">
          {pinnedEntries.length > 0 && (
            <div className="flex flex-col gap-3">
              <div>
                <p className="section-kicker">Pinned memories</p>
                <h2 className="mt-1 font-heading text-3xl tracking-[-0.03em]">Kỷ niệm ghim</h2>
              </div>

              <div className="grid gap-3">
                {pinnedEntries.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: idx * 0.08, type: "spring", stiffness: 260, damping: 24 }}
                  >
                    <Link href={`/journal/${entry.id}`} className="block">
                      <Card className="overflow-hidden bg-[linear-gradient(140deg,color-mix(in_oklab,var(--accent)_58%,white_42%),color-mix(in_oklab,var(--card)_86%,transparent))] transition-transform hover:-translate-y-0.5">
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <div className="flex size-11 items-center justify-center rounded-2xl bg-background/75 text-2xl">
                              {entry.mood}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge className="gap-1 bg-background/80 text-foreground shadow-none">
                                  <Pin className="size-3" />
                                  Ghim
                                </Badge>
                                <span className="text-xs text-muted-foreground">{formatDate(entry.date)}</span>
                              </div>
                              <CardTitle className="mt-3 line-clamp-1">{entry.title}</CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{entry.body}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end justify-between">
            <div>
              <p className="section-kicker">Recent entries</p>
              <h2 className="mt-1 font-heading text-3xl tracking-[-0.03em]">Nhật ký gần đây</h2>
            </div>
            {recentEntries.length > 0 && (
              <Link href="/journal" className="text-sm font-semibold text-primary hover:underline underline-offset-4">
                Xem tất cả
              </Link>
            )}
          </div>

          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="paper-panel flex justify-center py-10">
              <span className="text-sm text-muted-foreground animate-pulse">Đang tải...</span>
            </motion.div>
          ) : latestEntries.length === 0 && pinnedEntries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="paper-panel flex flex-col items-center gap-4 px-6 py-12 text-center"
            >
              <span className="text-5xl">📝</span>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                Chưa có bài viết nào. Viết lại một ngày nhỏ trước, rồi phần còn lại sẽ tự đầy lên.
              </p>
              <Button render={<Link href="/journal/new" />}>✍️ Viết bài đầu tiên</Button>
            </motion.div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {latestEntries.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: idx * 0.08,
                    type: "spring",
                    stiffness: 260,
                    damping: 24,
                  }}
                >
                  <Link href={`/journal/${entry.id}`} className="block h-full">
                    <Card size="sm" className={cn("h-full transition-transform hover:-translate-y-0.5")}>
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl leading-none" aria-hidden>{entry.mood}</span>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="line-clamp-1">{entry.title}</CardTitle>
                            <CardDescription className="mt-1 text-xs">{formatDate(entry.date)}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {entry.isPinned && <Pin className="size-3.5 text-primary" />}
                            <Badge variant="secondary">{entry.author === "BK" ? "BK" : "Bi"}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{entry.body}</p>
                        {entry.photos.length > 0 && (
                          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-full bg-secondary px-2 py-1 text-secondary-foreground">Có {entry.photos.length} ảnh</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="section-kicker">Plans</p>
              <h2 className="mt-1 font-heading text-3xl tracking-[-0.03em]">Sắp tới</h2>
            </div>
            {upcomingPlans.length > 0 && (
              <Link href="/plans" className="text-sm font-semibold text-primary hover:underline underline-offset-4">
                Xem tất cả
              </Link>
            )}
          </div>

          <div className="paper-panel flex flex-col gap-3 p-3">
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-8">
                <span className="text-sm text-muted-foreground animate-pulse">Đang tải...</span>
              </motion.div>
            ) : upcomingPlans.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-4 py-10 text-center">
                <span className="text-5xl">📋</span>
                <p className="max-w-xs text-sm leading-6 text-muted-foreground">Chưa có kế hoạch nào. Thêm một cuộc hẹn nho nhỏ để cả hai có thứ để mong.</p>
                <Button variant="outline" render={<Link href="/plans/new" />}>➕ Thêm kế hoạch</Button>
              </div>
            ) : (
              upcomingPlans.map((plan, idx) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: idx * 0.08, type: "spring", stiffness: 280, damping: 24 }}
                >
                  <Link href="/plans">
                    <div className="rounded-[1.25rem] border border-border/70 bg-background/80 px-4 py-4 transition-colors hover:bg-background">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 text-2xl" aria-hidden>📍</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">{plan.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{formatDate(plan.date)}</p>
                          {plan.location && (
                            <p className="mt-3 text-sm text-muted-foreground">{plan.location}</p>
                          )}
                        </div>
                        <Badge variant="secondary">Sắp tới</Badge>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>

          <Card className="overflow-hidden bg-[linear-gradient(135deg,color-mix(in_oklab,var(--secondary)_58%,white_42%),color-mix(in_oklab,var(--card)_82%,transparent))]">
            <CardHeader>
              <p className="section-kicker">Write something</p>
              <CardTitle className="text-2xl">Ghi lại hôm nay trước khi nó trôi qua.</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <p className="text-sm leading-6 text-muted-foreground">Chỉ vài dòng cũng đủ để ngày mai còn có cái để nhớ.</p>
              <Button size="lg" render={<Link href="/journal/new" />}>✍️ Viết nhật ký</Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
