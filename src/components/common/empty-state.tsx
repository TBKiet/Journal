"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  emoji: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
}

export function EmptyState({
  emoji,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 px-4 text-center">
      <motion.div
        className="text-6xl"
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {emoji}
      </motion.div>
      <div className="flex flex-col gap-2">
        <h3 className="font-heading text-xl font-bold text-foreground">
          {title}
        </h3>
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      </div>
      {actionLabel &&
        (actionHref ? (
          <Link
            href={actionHref}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "rounded-full bg-gradient-to-r from-accent to-primary px-6 font-semibold text-primary-foreground hover:opacity-90",
              "dark:from-accent dark:to-primary"
            )}
          >
            {actionLabel}
          </Link>
        ) : onAction ? (
          <Button
            onClick={onAction}
            size="lg"
            className={cn(
              "rounded-full bg-gradient-to-r from-accent to-primary px-6 font-semibold text-primary-foreground hover:opacity-90",
              "dark:from-accent dark:to-primary"
            )}
          >
            {actionLabel}
          </Button>
        ) : null)}
    </div>
  )
}
