"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getPlans, updatePlan, type Plan } from "@/lib/data";

const statusBadge: Record<Plan["status"], { label: string; variant: "secondary" | "default" | "outline"; className: string }> = {
  planned: {
    label: "Sắp tới",
    variant: "secondary",
    className: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200",
  },
  done: {
    label: "Đã xong",
    variant: "default",
    className: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  cancelled: {
    label: "Huỷ",
    variant: "outline",
    className: "text-muted-foreground line-through",
  },
};

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tab, setTab] = useState<"upcoming" | "done">("upcoming");
  const [doneAnimId, setDoneAnimId] = useState<string | null>(null);
  const [convertDialogPlan, setConvertDialogPlan] = useState<Plan | null>(null);

  useEffect(() => {
    getPlans().then(setPlans).catch(console.error);
  }, []);

  const filtered = plans.filter((p) => {
    if (tab === "upcoming") return p.status === "planned";
    return p.status === "done" || p.status === "cancelled";
  });

  const refresh = useCallback(async () => {
    setPlans(await getPlans());
  }, []);

  const handleMarkDone = useCallback((plan: Plan) => {
    setDoneAnimId(plan.id);
    setTimeout(async () => {
      const updated = await updatePlan(plan.id, { status: "done" });
      if (updated) {
        await refresh();
        setDoneAnimId(null);
        setConvertDialogPlan(updated);
      }
    }, 600);
  }, [refresh]);

  const handleRevert = useCallback(async (plan: Plan) => {
    await updatePlan(plan.id, { status: "planned" });
    await refresh();
  }, [refresh]);

  return (
    <div className="flex flex-col gap-6 pb-24">
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold px-4 pt-4"
      >
        📋 Kế hoạch chung
      </motion.h1>

      <div className="flex gap-2 px-4">
        <Button
          variant={tab === "upcoming" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("upcoming")}
          className="rounded-full"
        >
          Sắp tới
        </Button>
        <Button
          variant={tab === "done" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("done")}
          className="rounded-full"
        >
          Đã xong
        </Button>
      </div>

      <div className="flex flex-col gap-3 px-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((plan, idx) => (
            <motion.div
              key={plan.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    {plan.status === "planned" ? (
                      <button
                        onClick={() => handleMarkDone(plan)}
                        className="mt-0.5 size-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center shrink-0 hover:border-emerald-400 hover:bg-emerald-50 transition-colors dark:hover:bg-emerald-950/30"
                        aria-label="Đánh dấu đã xong"
                      >
                        {doneAnimId === plan.id ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-emerald-500 text-sm"
                          >
                            ✨
                          </motion.span>
                        ) : null}
                      </button>
                    ) : plan.status === "done" ? (
                      <button
                        onClick={() => handleRevert(plan)}
                        className="mt-0.5 size-6 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center shrink-0 hover:bg-emerald-200 transition-colors dark:bg-emerald-900/30 dark:border-emerald-600"
                        aria-label="Đánh dấu chưa xong"
                      >
                        <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      </button>
                    ) : (
                      <span className="mt-0.5 size-6 rounded-full border-2 border-muted-foreground/15 flex items-center justify-center shrink-0 text-muted-foreground/40 text-xs">
                        ✕
                      </span>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold text-base ${plan.status === "cancelled" ? "line-through text-muted-foreground" : ""}`}>
                          {plan.title}
                        </p>
                        <Badge className={statusBadge[plan.status].className}>
                          {statusBadge[plan.status].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                        <span>{plan.date}</span>
                        {plan.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="size-3" /> {plan.location}
                          </span>
                        )}
                      </div>
                      {plan.note && (
                        <p className={`text-sm mt-2 line-clamp-2 ${plan.status === "cancelled" ? "text-muted-foreground/50" : "text-foreground/70"}`}>
                          {plan.note}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground py-12"
          >
            {tab === "upcoming" ? "Chưa có kế hoạch nào~" : "Chưa có kế hoạch nào hoàn thành~"}
          </motion.p>
        )}
      </div>

      <Button
        onClick={() => router.push("/plans/new")}
        size="lg"
        className="fixed bottom-6 right-6 rounded-full shadow-lg shadow-amber-400/30 h-14 w-14 p-0 z-40"
      >
        <Plus className="size-6" />
      </Button>

      <Dialog open={!!convertDialogPlan} onOpenChange={() => setConvertDialogPlan(null)}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-amber-500" />
              Chúc mừng!
            </DialogTitle>
            <DialogDescription>
              Kế hoạch <strong>{convertDialogPlan?.title}</strong> đã hoàn thành. Bạn có muốn chuyển thành một kỷ niệm trong nhật ký không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertDialogPlan(null)}>
              Để sau
            </Button>
            <Button
              onClick={() => {
                const plan = convertDialogPlan;
                setConvertDialogPlan(null);
                if (plan) {
                  const params = new URLSearchParams();
                  params.set("title", plan.title);
                  if (plan.note) params.set("text", plan.note);
                  if (plan.location) params.set("location", plan.location);
                  params.set("from", "plan");
                  router.push(`/journal/new?${params.toString()}`);
                }
              }}
            >
              ✨ Tạo kỷ niệm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
