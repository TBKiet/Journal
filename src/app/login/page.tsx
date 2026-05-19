"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signIn } from "@/lib/auth";
import { setCurrentUser } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Profile = "BK" | "Bi";

const AUTH_MAP: Record<Profile, { email: string; password: string }> = {
  BK: { email: "bk@ourjournal.local", password: "OurJournal@BK2024!" },
  Bi: { email: "bi@ourjournal.local", password: "OurJournal@Bi2024!" },
};

const ANH_ACCENT = "oklch(0.52 0.12 245)";
const EM_ACCENT = "oklch(0.58 0.15 355)";
const ANH_BG = "oklch(0.93 0.03 245)";
const EM_BG = "oklch(0.93 0.04 350)";

export default function LoginPage() {
  const router = useRouter();
  const [loggingIn, setLoggingIn] = useState<Profile | null>(null);
  const [error, setError] = useState(false);

  const handleProfileSelect = useCallback((profile: Profile) => {
    setLoggingIn(profile);
    setError(false);
    const { email, password } = AUTH_MAP[profile];
    signIn(email, password)
      .then(() => {
        setCurrentUser(profile);
        router.push("/home");
      })
      .catch(() => {
        setError(true);
        setLoggingIn(null);
      });
  }, [router]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[oklch(0.98_0.006_355)] via-[oklch(0.95_0.04_350)] to-[oklch(0.92_0.06_345)] p-4">
      {/* Decorative soft blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[oklch(0.62_0.13_5_/_0.08)] blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[oklch(0.56_0.16_355_/_0.07)] blur-3xl" />
      </div>

      <Card className="relative w-full max-w-sm border-0 bg-[oklch(1_0.005_70_/_0.85)] backdrop-blur-sm shadow-[0_8px_40px_-12px_oklch(0.4_0.05_30_/_0.12)] rounded-3xl">
        <CardHeader className="items-center text-center pb-2 pt-8">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Our Journal{" "}
            <span role="img" aria-label="love">
              💕
            </span>
          </CardTitle>
          <CardDescription className="text-base">
            Nhật ký cá nhân
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-8 pt-4">
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            <p className="text-center text-muted-foreground text-sm">
              Bạn là ai?
            </p>
            <div className="flex gap-4 justify-center">
              <ProfileButton
                emoji="🧑‍💻"
                label="BK"
                accentColor={ANH_ACCENT}
                bgColor={ANH_BG}
                loading={loggingIn === "BK"}
                onClick={() => handleProfileSelect("BK")}
              />
              <ProfileButton
                emoji="🌸"
                label="Bi"
                accentColor={EM_ACCENT}
                bgColor={EM_BG}
                loading={loggingIn === "Bi"}
                onClick={() => handleProfileSelect("Bi")}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-sm text-destructive font-medium"
                >
                  Đăng nhập thất bại, thử lại nha~
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </CardContent>
      </Card>

      <p className="mt-8 text-xs text-muted-foreground/60">
        nhật ký của anh và em
      </p>
    </div>
  );
}

function ProfileButton({
  emoji,
  label,
  accentColor,
  bgColor,
  loading,
  onClick,
}: {
  emoji: string;
  label: string;
  accentColor: string;
  bgColor: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={loading ? {} : { scale: 1.04, y: -2 }}
      whileTap={loading ? {} : { scale: 0.96 }}
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex flex-col items-center gap-3 p-6 rounded-2xl w-36 cursor-pointer select-none transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        loading && "opacity-70 cursor-wait"
      )}
      style={{
        backgroundColor: bgColor,
        boxShadow: `0 4px 24px -4px ${accentColor} / 0.18`,
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor} / 0.35, 0 8px 32px -4px ${accentColor} / 0.25`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 24px -4px ${accentColor} / 0.18`;
      }}
    >
      <span className="text-5xl" role="img" aria-label={label}>
        {emoji}
      </span>
      <span
        className="text-lg font-bold"
        style={{ color: accentColor }}
      >
        {loading ? "Đang vào..." : label}
      </span>
    </motion.button>
  );
}
