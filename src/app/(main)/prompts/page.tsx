"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  getAllPrompts,
  getTodayPrompt,
  answerPrompt,
  getCurrentUser,
  type CouplePrompt,
  type Author,
} from "@/lib/data";

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(isoStr: string) {
  const date = new Date(isoStr);
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function useForceUpdate() {
  const [, setTick] = useState(0);
  return useCallback(() => setTick((t) => t + 1), []);
}

export default function PromptsPage() {
  const [currentUser, setCurrentUser] = useState<Author>("BK");
  const [prompts, setPrompts] = useState<CouplePrompt[]>([]);
  const [todayPrompt, setTodayPrompt] = useState<CouplePrompt | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);

  useEffect(() => {
    getAllPrompts().then(setPrompts);
    getTodayPrompt().then(setTodayPrompt);
  }, []);

  const refresh = useCallback(async () => {
    setPrompts(await getAllPrompts());
    setTodayPrompt(await getTodayPrompt());
    forceUpdate();
  }, [forceUpdate]);

  const handleAnswer = async (promptId: string) => {
    const text = answers[promptId]?.trim();
    if (!text) return;
    await answerPrompt(promptId, { by: currentUser, text });
    setAnswers((prev) => ({ ...prev, [promptId]: "" }));
    await refresh();
  };

  const hasAnswered = (prompt: CouplePrompt, user: Author) =>
    prompt.answers.some((a) => a.by === user);

  return (
    <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col gap-1 mb-6"
      >
        <h1 className="text-2xl font-extrabold text-foreground">
          💬 Câu hỏi cho hai đứa
        </h1>
        <p className="text-sm text-muted-foreground">
          Mỗi ngày một câu hỏi nhỏ để hiểu nhau hơn
        </p>
      </motion.div>

      {/* Today's question (if not fully answered) */}
      {todayPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-pink-50/80 via-rose-50/60 to-amber-50/70 dark:from-pink-950/30 dark:via-rose-950/20 dark:to-amber-950/20 ring-1 ring-pink-200 dark:ring-pink-800/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/40 dark:text-pink-200 dark:border-pink-700 text-xs">
              🌟 Hôm nay
            </Badge>
          </div>
          <p className="text-lg font-bold text-foreground mb-4">
            {todayPrompt.emoji} {todayPrompt.question}
          </p>

          {todayPrompt.answers.map((a) => (
            <div key={a.by} className="flex items-start gap-2 mb-2 p-3 rounded-xl bg-white/60 dark:bg-black/20">
              <Avatar size="sm" className="shrink-0 mt-0.5">
                <AvatarFallback className="text-[0.6rem] bg-secondary/80 font-bold">
                  {a.by === "BK" ? "BK" : "Bi"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold">{a.by}</span>
                  <span className="text-[0.6rem] text-muted-foreground">{formatTime(a.date)}</span>
                </div>
                <p className="text-sm leading-relaxed">{a.text}</p>
              </div>
            </div>
          ))}

          {!hasAnswered(todayPrompt, currentUser) && (
            <div className="flex items-start gap-2 mt-3">
              <Avatar size="sm" className="shrink-0 mt-1.5">
                <AvatarFallback className="text-[0.6rem] bg-primary/20 font-bold">
                  {currentUser === "BK" ? "BK" : "Bi"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center gap-2">
                <Textarea
                  placeholder={`${currentUser} trả lời nè...`}
                  value={answers[todayPrompt.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [todayPrompt.id]: e.target.value }))
                  }
                  rows={2}
                  className="text-sm resize-none flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAnswer(todayPrompt.id);
                    }
                  }}
                />
                <Button
                  size="icon-sm"
                  onClick={() => handleAnswer(todayPrompt.id)}
                  disabled={!answers[todayPrompt.id]?.trim()}
                  className="shrink-0"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Past prompts */}
      <div className="flex flex-col gap-3">
        {prompts.map((prompt, idx) => {
          const isExpanded = expandedId === prompt.id;
          const isToday = prompt === todayPrompt;
          return (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div
                className={cn(
                  "rounded-2xl bg-card ring-1 ring-foreground/10 overflow-hidden transition-shadow hover:shadow-sm",
                  isToday && "ring-pink-200 dark:ring-pink-800/30"
                )}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : prompt.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className="text-2xl shrink-0">{prompt.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold line-clamp-1">{prompt.question}</p>
                      {prompt.answers.length === 2 && (
                        <span className="text-xs shrink-0">✅</span>
                      )}
                      {isToday && (
                        <Badge className="text-[0.6rem] bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/40 dark:text-pink-200 shrink-0">
                          Hôm nay
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(prompt.date)}</span>
                      <span>·</span>
                      <span>{prompt.answers.length}/2 câu trả lời</span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="size-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 flex flex-col gap-2 border-t border-border/50 pt-3">
                        {prompt.answers.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            Chưa có ai trả lời~
                          </p>
                        )}
                        {prompt.answers.map((a) => (
                          <div key={a.by} className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/50">
                            <Avatar size="sm" className="shrink-0 mt-0.5">
                              <AvatarFallback className="text-[0.6rem] bg-secondary/80 font-bold">
                                {a.by === "BK" ? "BK" : "Bi"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-bold">{a.by}</span>
                                <span className="text-[0.6rem] text-muted-foreground">{formatTime(a.date)}</span>
                              </div>
                              <p className="text-sm leading-relaxed">{a.text}</p>
                            </div>
                          </div>
                        ))}

                        {!hasAnswered(prompt, currentUser) && (
                          <div className="flex items-start gap-2 mt-1">
                            <Avatar size="sm" className="shrink-0 mt-1.5">
                              <AvatarFallback className="text-[0.6rem] bg-primary/20 font-bold">
                                {currentUser === "BK" ? "BK" : "Bi"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex items-center gap-2">
                              <Textarea
                                placeholder={`${currentUser} trả lời nè...`}
                                value={answers[prompt.id] ?? ""}
                                onChange={(e) =>
                                  setAnswers((prev) => ({ ...prev, [prompt.id]: e.target.value }))
                                }
                                rows={2}
                                className="text-sm resize-none flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAnswer(prompt.id);
                                  }
                                }}
                              />
                              <Button
                                size="icon-sm"
                                onClick={() => handleAnswer(prompt.id)}
                                disabled={!answers[prompt.id]?.trim()}
                                className="shrink-0"
                              >
                                <Send className="size-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
