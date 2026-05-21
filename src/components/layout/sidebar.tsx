"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { navigationTabs } from "./nav-config"
import { PersonAvatar } from "@/components/common/person-avatar"

function subscribe() {
  return () => {};
}

export function Sidebar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)

  const themeLabel = !mounted
    ? "Đổi giao diện"
    : theme === "dark"
      ? "Chuyển sang sáng"
      : "Chuyển sang tối"

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 hidden w-72 p-4 md:flex">
      <div className="flex flex-1 flex-col rounded-[28px] border border-sidebar-border/80 bg-sidebar/88 p-5 shadow-[0_24px_60px_-32px_rgba(77,53,40,0.35)] backdrop-blur-xl">
        <div className="mb-8 border-b border-sidebar-border/80 px-2 pb-5 pt-3">
          <p className="section-kicker">Shared memory</p>
          <Link href="/home" className="mt-2 block font-heading text-[2rem] leading-none text-sidebar-foreground tracking-[-0.03em]">
            Our Journal
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          {navigationTabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href)
            return (
              <Link key={tab.href} href={tab.href}>
                <motion.div
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm font-semibold transition-all select-none",
                    isActive
                      ? "border-sidebar-primary/20 bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_14px_28px_-18px_rgba(154,93,62,0.85)]"
                      : "border-transparent text-sidebar-foreground/80 hover:border-sidebar-border hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span className={cn("text-lg leading-none transition-transform", isActive && "scale-110")}>{tab.emoji}</span>
                  <span className="flex-1">{tab.label}</span>
                  {isActive && <span className="h-2 w-2 rounded-full bg-sidebar-primary-foreground/80" />}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-sidebar-border/80 pt-4">
          <div className="rounded-2xl border border-sidebar-border/70 bg-background/55 px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <PersonAvatar person="BK" size="sm" className="ring-2 ring-background" />
                <PersonAvatar person="Bi" size="sm" className="ring-2 ring-background" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">Us</p>
              </div>
            </div>
            <button
              onClick={toggle}
              className="mt-3 flex w-full items-center justify-between rounded-xl border border-sidebar-border/70 px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60"
              aria-label={themeLabel}
            >
              <span>{themeLabel}</span>
              {mounted && theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
