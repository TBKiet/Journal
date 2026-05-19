"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { navigationTabs } from "./nav-config"

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center md:hidden">
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
  )
}
