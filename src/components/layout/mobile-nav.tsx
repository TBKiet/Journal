"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const tabs: { emoji: string; label: string; href: string }[] = [
  { emoji: "🏠", label: "Home", href: "/home" },
  { emoji: "📖", label: "Journal", href: "/journal" },
  { emoji: "📋", label: "Plans", href: "/plans" },
  { emoji: "💬", label: "Prompts", href: "/prompts" },
  { emoji: "💕", label: "Dates", href: "/dates" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center md:hidden">
      <nav className="flex items-center gap-1 mx-4 mb-4 px-2 py-1.5 rounded-full bg-card border border-border shadow-lg shadow-foreground/5">
        {tabs.map((tab) => {
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
                  "relative flex flex-col items-center justify-center w-full py-2 rounded-full text-sm transition-colors cursor-pointer select-none",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 text-lg leading-none">{tab.emoji}</span>
                <span className="relative z-10 text-[10px] font-semibold mt-0.5">{tab.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
