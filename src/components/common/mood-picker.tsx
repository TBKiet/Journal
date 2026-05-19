"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface MoodPickerProps {
  value: string
  onChange: (mood: string) => void
}

const QUICK_MOODS = ["😊", "😢", "🥰", "😤", "😴"]

const FULL_MOODS = [
  { category: "Faces", emojis: ["😊", "😢", "🥰", "😤", "😴", "😂", "😍", "🤩", "😎", "🤔", "😅", "🙃", "😌", "😏", "🤗", "🥺", "😋", "🫠"] },
  { category: "Hearts", emojis: ["💕", "💖", "💗", "💝", "💘", "❤️", "🧡", "💛", "💚", "💙", "💜", "🤍"] },
  { category: "Nature", emojis: ["🌸", "🌺", "🌻", "🌙", "⭐", "🌈", "☀️", "🌊", "🍀", "🌹"] },
]

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="popLayout">
        {QUICK_MOODS.map((mood) => {
          const selected = value === mood
          return (
            <motion.button
              key={mood}
              type="button"
              onClick={() => onChange(mood)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              layout
              className={cn(
                "flex size-12 items-center justify-center rounded-full text-2xl transition-colors",
                selected
                  ? "bg-primary/20 ring-2 ring-primary shadow-[0_0_12px_var(--color-primary)] dark:shadow-[0_0_16px_var(--color-primary)]"
                  : "bg-muted hover:bg-muted/80"
              )}
              aria-label={`Mood ${mood}`}
              aria-pressed={selected}
            >
              {mood}
            </motion.button>
          )
        })}
      </AnimatePresence>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "flex size-12 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-transparent text-xl text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground"
            )}
            aria-label="More moods"
          >
            +
          </motion.button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" side="bottom" align="start">
          <ScrollArea className="h-64">
            <div className="flex flex-col gap-3">
              {FULL_MOODS.map((group) => (
                <div key={group.category}>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.category}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.emojis.map((emoji) => {
                      const selected = value === emoji
                      return (
                        <motion.button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            onChange(emoji)
                            setOpen(false)
                          }}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          className={cn(
                            "flex size-10 items-center justify-center rounded-xl text-lg transition-colors",
                            selected
                              ? "bg-primary/25 ring-2 ring-primary"
                              : "bg-muted/50 hover:bg-muted"
                          )}
                          aria-label={`Mood ${emoji}`}
                          aria-pressed={selected}
                        >
                          {emoji}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  )
}
