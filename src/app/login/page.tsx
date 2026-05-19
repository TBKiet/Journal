"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signIn } from "@/lib/auth";
import { setCurrentUser } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[linear-gradient(180deg,oklch(0.985_0.008_70),oklch(0.955_0.018_58))] p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-[-4rem] h-96 w-96 rounded-full bg-[oklch(0.72_0.08_24_/_0.14)] blur-3xl" />
        <div className="absolute -bottom-24 left-[-5rem] h-96 w-96 rounded-full bg-[oklch(0.84_0.05_145_/_0.18)] blur-3xl" />
        <div className="texture-dots absolute inset-0 opacity-40" />
      </div>

      <Card className="relative w-full max-w-md rounded-[2rem] bg-[oklch(1_0.004_70_/_0.82)] backdrop-blur-md">
        <CardHeader className="items-center pb-2 pt-8 text-center">
          <p className="section-kicker">Shared diary</p>
          <CardTitle className="mt-2 text-4xl tracking-[-0.04em]">
            Our Journal <span role="img" aria-label="love">💕</span>
          </CardTitle>
          <CardDescription className="max-w-xs text-sm leading-6">
            Chọn người đang mở nhật ký để tiếp tục vào không gian riêng của hai bạn.
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
            <p className="text-center text-sm text-muted-foreground">
              Bạn là ai?
            </p>
            <div className="flex gap-4 justify-center">
              <ProfileButton
                imageSrc="/bk-avatar.png"
                label="BK"
                accentColor={ANH_ACCENT}
                bgColor={ANH_BG}
                loading={loggingIn === "BK"}
                onClick={() => handleProfileSelect("BK")}
              />
              <ProfileButton
                imageSrc="/bi-avatar.png"
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

      <p className="mt-8 text-xs tracking-[0.18em] text-muted-foreground/70 uppercase">
        nhật ký của anh và em
      </p>
    </div>
  );
}

function ProfileButton({
  imageSrc,
  label,
  accentColor,
  bgColor,
  loading,
  onClick,
}: {
  imageSrc: string;
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
        "flex w-36 cursor-pointer select-none flex-col items-center gap-3 rounded-[1.6rem] border border-white/55 p-6 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
      <Avatar size="lg" className="size-20 ring-4 ring-white/65 shadow-md">
        <AvatarImage src={imageSrc} alt={label} />
        <AvatarFallback>{label}</AvatarFallback>
      </Avatar>
      <span
        className="text-lg font-bold"
        style={{ color: accentColor }}
      >
        {loading ? "Đang vào..." : label}
      </span>
    </motion.button>
  );
}
