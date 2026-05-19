"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const tabs = [
  { emoji: "🏠", label: "Home", href: "/home" },
  { emoji: "📖", label: "Journal", href: "/journal" },
  { emoji: "📸", label: "Photos", href: "/photos" },
  { emoji: "📋", label: "Plans", href: "/plans" },
  { emoji: "💬", label: "Prompts", href: "/prompts" },
  { emoji: "💕", label: "Dates", href: "/dates" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex flex-col flex-1 p-4">
        <div className="mb-8 px-2 py-4">
          <Link href="/home" className="text-xl font-extrabold text-sidebar-foreground tracking-tight">
            OurJournal
          </Link>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href)
            return (
              <Link key={tab.href} href={tab.href}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors select-none",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span className="text-lg leading-none">{tab.emoji}</span>
                  <span>{tab.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border pt-4 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar size="sm">
              <AvatarFallback>💑</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">Us</p>
            </div>
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
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
