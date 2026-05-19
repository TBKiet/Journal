"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ReactionBarProps {
  reactions: { emoji: string; count: number; by: string[] }[]
  onReact: (emoji: string) => void
}

const QUICK_EMOJIS = ["💕", "😍", "😂", "🥺", "🎉", "🔥"]

export function ReactionBar({ reactions, onReact }: ReactionBarProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <AnimatePresence mode="popLayout">
        {reactions.map((r) => (
          <motion.button
            key={r.emoji}
            type="button"
            onClick={() => onReact(r.emoji)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.85 }}
            layout
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-sm transition-colors hover:bg-muted hover:border-primary/30",
              "dark:bg-muted/40 dark:hover:bg-muted/60"
            )}
          >
            <span>{r.emoji}</span>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {r.count}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger>
          <button
            type="button"
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-full border border-dashed border-muted-foreground/25 bg-transparent text-sm text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground"
            )}
            aria-label="Add reaction"
          >
            +
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" side="top" align="center">
          <div className="flex gap-1">
            {QUICK_EMOJIS.map((emoji) => (
              <motion.button
                key={emoji}
                type="button"
                onClick={() => {
                  onReact(emoji)
                  setPopoverOpen(false)
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.85 }}
                className="flex size-9 items-center justify-center rounded-lg bg-muted/50 text-lg transition-colors hover:bg-muted"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
