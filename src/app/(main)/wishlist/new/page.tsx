"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addWishlistPlace, getCurrentUser, type WishlistPlace } from "@/lib/data";
import { cn } from "@/lib/utils";

const categoryOptions: { value: WishlistPlace["category"]; label: string }[] = [
  { value: "travel", label: "✈️ Du lịch" },
  { value: "food", label: "🍜 Ăn uống" },
  { value: "cafe", label: "☕ Cafe" },
  { value: "stay", label: "🛏️ Lưu trú" },
  { value: "other", label: "✨ Khác" },
];

const statusOptions: { value: WishlistPlace["status"]; label: string }[] = [
  { value: "want_to_go", label: "Muốn đi" },
  { value: "booked", label: "Đã đặt" },
  { value: "visited", label: "Đã đi" },
  { value: "archived", label: "Lưu trữ" },
];

export default function NewWishlistPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<WishlistPlace["category"]>("travel");
  const [status, setStatus] = useState<WishlistPlace["status"]>("want_to_go");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Hãy nhập tên địa điểm hoặc món muốn thử.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const currentUser = await getCurrentUser();
      await addWishlistPlace({
        title: title.trim(),
        category,
        address: address.trim() || undefined,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        mapUrl: mapUrl.trim() || undefined,
        status,
        createdBy: currentUser,
      });
      router.push("/wishlist");
    } catch {
      setError("Có lỗi khi lưu wish list. Thử lại nhé.");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-3 py-3 pb-8 sm:px-4 sm:py-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="size-4" />
        </Button>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="section-kicker">Wishlist</p>
          <h1 className="mt-1 font-heading text-4xl tracking-[-0.04em]">Thêm địa điểm mới</h1>
        </motion.div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Card>
          <CardContent className="flex flex-col gap-5 py-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">
                Tên địa điểm / trải nghiệm <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Ví dụ: Tiệm dimsum ngon ở Q1, Đà Lạt mùa hoa..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Danh mục</label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setCategory(option.value)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                        category === option.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background/80 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Trạng thái</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatus(option.value)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                        status === option.value
                          ? "border-secondary bg-secondary text-secondary-foreground"
                          : "border-border bg-background/80 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">📍 Địa chỉ</label>
              <Input
                placeholder="Tên quán, khu vực, thành phố..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">🖼️ Ảnh bìa (URL)</label>
              <Input
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">🗺️ Link map</label>
              <Input
                placeholder="Google Maps / bài review / website..."
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">📝 Mô tả</label>
              <Textarea
                placeholder="Vì sao muốn đi, món muốn thử, lúc nào thích hợp..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            ⚠️ {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={() => router.back()}>
            Huỷ
          </Button>
          <Button type="submit" disabled={saving || !title.trim()} className="flex-1 rounded-full">
            <Save className="size-4" />
            {saving ? "Đang lưu..." : "Lưu wish list"}
          </Button>
        </div>
      </form>
    </div>
  );
}
