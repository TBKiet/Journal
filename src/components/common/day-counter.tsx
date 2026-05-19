"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface DayCounterProps {
  label: string
  date: Date
  variant: "countup" | "countdown"
  emoji: string
}

function computeDays(target: Date, variant: "countup" | "countdown"): number {
  const now = new Date()
  const diffMs = variant === "countup" ? now.getTime() - target.getTime() : target.getTime() - now.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

export function DayCounter({ label, date, variant, emoji }: DayCounterProps) {
  const [display, setDisplay] = useState(0)
  const target = computeDays(date, variant)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)

  useEffect(() => {
    const duration = 1200
    const startValue = 0

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(startValue + (target - startValue) * eased))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    startRef.current = 0
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "inline-flex items-center gap-3 rounded-2xl px-5 py-3",
        "bg-gradient-to-br from-accent/20 via-primary/15 to-secondary/20",
        "dark:from-accent/15 dark:via-primary/10 dark:to-secondary/15",
        "shadow-sm ring-1 ring-primary/10"
      )}
    >
      <span className="text-3xl">{emoji}</span>
      <div className="flex flex-col">
        <span className="font-heading text-2xl font-extrabold text-foreground tabular-nums">
          {display.toLocaleString()}
        </span>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
    </motion.div>
  )
}
