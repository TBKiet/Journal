"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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

const DEMO_PASSCODES: Record<Profile, string> = {
  BK: "1234",
  Bi: "5678",
};

// Passcode → Supabase Auth credentials mapping
// Passwords được set trong Supabase Auth Dashboard
const AUTH_MAP: Record<Profile, { email: string; password: string }> = {
  BK: { email: "bk@ourjournal.local", password: "OurJournal@BK2024!" },
  Bi: { email: "bi@ourjournal.local", password: "OurJournal@Bi2024!" },
};

const MAX_DIGITS = 4;

const KEYPAD_KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "delete"],
] as const;

const ANH_ACCENT = "oklch(0.52 0.12 245)";
const EM_ACCENT = "oklch(0.58 0.15 355)";
const ANH_BG = "oklch(0.93 0.03 245)";
const EM_BG = "oklch(0.93 0.04 350)";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"profile" | "passcode">("profile");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [validating, setValidating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleProfileSelect = useCallback((profile: Profile) => {
    setSelectedProfile(profile);
    setStep("passcode");
    setPasscode("");
    setError(false);
  }, []);

  const handleDigitInput = useCallback((digit: string) => {
    if (validating) return;
    setPasscode((prev) => {
      if (prev.length >= MAX_DIGITS) return prev;
      return prev + digit;
    });
    setError(false);
  }, [validating]);

  const handleDelete = useCallback(() => {
    if (validating) return;
    setPasscode((prev) => prev.slice(0, -1));
    setError(false);
  }, [validating]);

  const handleBackToProfile = useCallback(() => {
    setStep("profile");
    setSelectedProfile(null);
    setPasscode("");
    setError(false);
    setValidating(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (passcode.length === MAX_DIGITS && selectedProfile) {
      setValidating(true);
      const correct = DEMO_PASSCODES[selectedProfile];

      if (passcode !== correct) {
        setError(true);
        setShaking(true);
        timerRef.current = setTimeout(() => {
          setShaking(false);
          setPasscode("");
          setValidating(false);
        }, 500);
        return;
      }

      const { email, password } = AUTH_MAP[selectedProfile];
      signIn(email, password)
        .then(() => {
          setCurrentUser(selectedProfile);
          router.push("/home");
        })
        .catch(() => {
          setError(true);
          setShaking(true);
          timerRef.current = setTimeout(() => {
            setShaking(false);
            setPasscode("");
            setValidating(false);
          }, 500);
        });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [passcode, selectedProfile, router]);

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
          <AnimatePresence mode="wait">
            {step === "profile" ? (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
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
                    onClick={() => handleProfileSelect("BK")}
                  />
                  <ProfileButton
                    emoji="🌸"
                    label="Bi"
                    accentColor={EM_ACCENT}
                    bgColor={EM_BG}
                    onClick={() => handleProfileSelect("Bi")}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="passcode"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col items-center gap-6"
              >
                {/* Back button */}
                <button
                  onClick={handleBackToProfile}
                  className="self-start text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  &#8592; Chọn lại
                </button>

                {/* User indicator */}
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <span className="text-2xl">
                    {selectedProfile === "BK" ? "🧑‍💻" : "🌸"}
                  </span>
                  <span>{selectedProfile}</span>
                </div>

                {/* Microcopy */}
                <p className="text-sm text-muted-foreground">
                  Nhập mật khẩu của {selectedProfile} nè~
                </p>

                {/* Passcode dots */}
                <motion.div
                  animate={shaking ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="flex gap-3"
                >
                  {Array.from({ length: MAX_DIGITS }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={{
                        scale: i < passcode.length ? 1 : 0.85,
                        backgroundColor:
                          i < passcode.length
                            ? "var(--primary)"
                            : "transparent",
                        borderColor: error
                          ? "var(--destructive)"
                          : i < passcode.length
                            ? "var(--primary)"
                            : "var(--border)",
                      }}
                      className={cn(
                        "w-4 h-4 rounded-full border-2",
                        i < passcode.length ? "border-primary" : "border-border"
                      )}
                    />
                  ))}
                </motion.div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-destructive font-medium"
                    >
                      Sai mật mã rồi, thử lại nha~
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Number pad */}
                <div className="grid grid-cols-3 gap-x-8 gap-y-3 mt-2">
                  {KEYPAD_KEYS.flat().map((key, index) => {
                    if (key === "") {
                      return <div key="empty" className="w-14 h-14" />;
                    }

                    const isDelete = key === "delete";
                    return (
                      <motion.button
                        key={key}
                        whileTap={{ scale: 0.88 }}
                        onClick={() =>
                          isDelete ? handleDelete() : handleDigitInput(key)
                        }
                        disabled={validating}
                        className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center text-2xl font-semibold select-none transition-colors",
                          "bg-[oklch(0.92_0.01_70)] hover:bg-[oklch(0.87_0.02_70)] active:bg-[oklch(0.84_0.03_70)]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          "disabled:opacity-50"
                        )}
                        aria-label={isDelete ? "Xoá" : key}
                      >
                        {isDelete ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-5"
                          >
                            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
                            <line x1="18" y1="9" x2="12" y2="15" />
                            <line x1="12" y1="9" x2="18" y2="15" />
                          </svg>
                        ) : (
                          key
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
  onClick,
}: {
  emoji: string;
  label: string;
  accentColor: string;
  bgColor: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex flex-col items-center gap-3 p-6 rounded-2xl w-36 cursor-pointer select-none transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={{
        backgroundColor: bgColor,
        boxShadow: `0 4px 24px -4px ${accentColor} / 0.18`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor} / 0.35, 0 8px 32px -4px ${accentColor} / 0.25`;
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
        {label}
      </span>
    </motion.button>
  );
}
