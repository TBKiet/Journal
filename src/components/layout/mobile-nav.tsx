"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { navigationTabs } from "./nav-config"

function subscribe() {
  return () => {};
}

export function MobileNav() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)

  const themeLabel = !mounted
    ? "Đổi giao diện"
    : theme === "dark"
      ? "Chuyển sang sáng"
      : "Chuyển sang tối"

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="pointer-events-none mx-auto flex w-[min(100%-1.5rem,38rem)] justify-end px-1">
        <button
          onClick={toggle}
          aria-label={themeLabel}
          className="pointer-events-auto mb-2 mr-2 inline-flex size-11 items-center justify-center rounded-full border border-border/80 bg-card/90 text-foreground shadow-[0_16px_35px_-24px_rgba(86,59,42,0.55)] backdrop-blur-xl transition-colors hover:bg-card"
        >
          {mounted && theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>

      <div className="flex justify-center">
        <nav className="mx-3 mb-3 flex w-[min(100%-1.5rem,38rem)] items-center gap-1 rounded-[28px] border border-border/80 bg-card/90 px-2 py-2 shadow-[0_20px_45px_-30px_rgba(86,59,42,0.5)] backdrop-blur-xl">
          {navigationTabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex-1"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "relative flex w-full flex-col items-center justify-center rounded-[22px] px-1 py-2.5 text-sm transition-colors cursor-pointer select-none",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-[22px] bg-primary shadow-[0_14px_26px_-16px_rgba(154,93,62,0.8)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 text-lg leading-none">{tab.emoji}</span>
                  <span className="relative z-10 mt-0.5 text-[10px] font-semibold">{tab.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
