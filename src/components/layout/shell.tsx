"use client"

import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "./sidebar"
import { MobileNav } from "./mobile-nav"

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <ThemeProvider>
      <div className="relative min-h-full overflow-x-clip">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8rem] top-[-5rem] h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />
          <div className="absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-64 texture-dots opacity-40" />
        </div>
        <Sidebar />
        <main className="relative pb-28 pt-4 md:pb-10 md:pl-72 md:pt-8">
          <div className="mx-auto max-w-6xl px-3 sm:px-5 md:px-8">
            <div className="page-frame min-h-[calc(100vh-4rem)] px-1 py-1 sm:px-2 sm:py-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="min-h-[calc(100vh-5rem)]"
              >
                {children}
              </motion.div>
            </AnimatePresence>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    </ThemeProvider>
  )
}
