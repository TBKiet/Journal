"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, MapPin, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getWishlistPlaces,
  updateWishlistPlace,
  type WishlistPlace,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const categoryOptions = [
  { value: "all", label: "Tất cả" },
  { value: "travel", label: "Du lịch" },
  { value: "food", label: "Ăn uống" },
  { value: "cafe", label: "Cafe" },
  { value: "stay", label: "Lưu trú" },
  { value: "other", label: "Khác" },
] as const;

const statusOptions = [
  { value: "want_to_go", label: "Muốn đi" },
  { value: "booked", label: "Đã đặt" },
  { value: "visited", label: "Đã đi" },
  { value: "archived", label: "Lưu trữ" },
] as const;

const statusMeta: Record<
  WishlistPlace["status"],
  { label: string; className: string }
> = {
  want_to_go: {
    label: "Muốn đi",
    className: "bg-primary/12 text-primary border-primary/20",
  },
  booked: {
    label: "Đã đặt",
    className: "bg-secondary text-secondary-foreground border-secondary/60",
  },
  visited: {
    label: "Đã đi",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200",
  },
  archived: {
    label: "Lưu trữ",
    className: "bg-muted text-muted-foreground border-border",
  },
};

const categoryMeta: Record<WishlistPlace["category"], string> = {
  travel: "✈️ Du lịch",
  food: "🍜 Ăn uống",
  cafe: "☕ Cafe",
  stay: "🛏️ Lưu trú",
  other: "✨ Khác",
};

export default function WishlistPage() {
  const [places, setPlaces] = useState<WishlistPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<(typeof categoryOptions)[number]["value"]>("all");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]["value"] | "all">("all");

  const refresh = useCallback(async () => {
    setPlaces(await getWishlistPlaces());
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await getWishlistPlaces();
        if (active) {
          setPlaces(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [refresh]);

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      if (categoryFilter !== "all" && place.category !== categoryFilter) return false;
      if (statusFilter !== "all" && place.status !== statusFilter) return false;
      return true;
    });
  }, [places, categoryFilter, statusFilter]);

  const handleStatusChange = async (placeId: string, status: WishlistPlace["status"]) => {
    await updateWishlistPlace(placeId, { status });
    await refresh();
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-3 py-3 pb-24 sm:px-4 sm:py-4">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="paper-panel p-5 sm:p-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker">Shared wishlist</p>
            <h1 className="mt-1 font-heading text-4xl tracking-[-0.04em]">Wish list chung</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Nơi lưu lại những quán ăn, điểm đến, chỗ nghỉ và bất kỳ nơi nào hai bạn muốn thử cùng nhau.
            </p>
          </div>
          <Button size="lg" render={<Link href="/wishlist/new" />}>
            <Plus className="size-4" />
            Thêm địa điểm
          </Button>
        </div>
      </motion.div>

      <div className="paper-panel flex flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setCategoryFilter(option.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                categoryFilter === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/80 text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              statusFilter === "all"
                ? "bg-secondary text-secondary-foreground"
                : "bg-background/80 text-muted-foreground hover:text-foreground"
            )}
          >
            Mọi trạng thái
          </button>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                statusFilter === option.value
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-background/80 text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="paper-panel flex justify-center py-16">
          <p className="text-sm text-muted-foreground animate-pulse">Đang tải wish list...</p>
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="paper-panel flex flex-col items-center gap-4 px-6 py-16 text-center">
          <span className="text-6xl">🗺️</span>
          <div>
            <p className="font-heading text-3xl text-foreground">Chưa có nơi nào trong danh sách</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Thêm quán ăn, chuyến đi hoặc nơi nghỉ mà hai bạn muốn thử để bắt đầu xây bản đồ những điều đáng mong.
            </p>
          </div>
          <Button render={<Link href="/wishlist/new" />}>
            <Sparkles className="size-4" />
            Thêm địa điểm đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredPlaces.map((place, idx) => (
              <motion.div
                key={place.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.04, duration: 0.28 }}
              >
                <Card className="h-full overflow-hidden">
                  {place.imageUrl ? (
                    <div className="aspect-[16/10] overflow-hidden border-b border-border/70 bg-muted">
                      <img
                        src={place.imageUrl}
                        alt={place.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[16/10] items-center justify-center border-b border-border/70 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_50%,white_50%),color-mix(in_oklab,var(--secondary)_60%,white_40%))] text-5xl">
                      {place.category === "travel" ? "✈️" : place.category === "food" ? "🍽️" : place.category === "cafe" ? "☕" : place.category === "stay" ? "🏨" : "✨"}
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Badge variant="outline" className="mb-3">
                          {categoryMeta[place.category]}
                        </Badge>
                        <CardTitle className="line-clamp-2">{place.title}</CardTitle>
                      </div>
                      <Badge className={statusMeta[place.status].className}>
                        {statusMeta[place.status].label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-4">
                    {place.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="mt-0.5 size-4 shrink-0" />
                        <span>{place.address}</span>
                      </div>
                    )}

                    {place.description && (
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {place.description}
                      </p>
                    )}

                    <div className="mt-auto flex flex-wrap gap-2">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(place.id, option.value)}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                            place.status === option.value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background/80 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {place.mapUrl && (
                        <Button variant="outline" size="sm" render={<a href={place.mapUrl} target="_blank" rel="noreferrer" />}>
                          <ExternalLink className="size-3.5" />
                          Mở map
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        render={<Link href={`/plans/new?title=${encodeURIComponent(place.title)}&location=${encodeURIComponent(place.address ?? "")}&text=${encodeURIComponent(place.description ?? "")}`} />}
                      >
                        <Sparkles className="size-3.5" />
                        Tạo kế hoạch
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
