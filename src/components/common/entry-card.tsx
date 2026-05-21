"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getJournalPreviewText } from "@/lib/journal-rich-text"
import { cn } from "@/lib/utils"

interface EntryCardProps {
  entry: {
    id: string
    title: string
    date: string
    mood: string
    body: string
    photos: string[]
    author: "BK" | "Bi"
  }
  showFull?: boolean
}

export function EntryCard({ entry, showFull = false }: EntryCardProps) {
  const { id, title, date, mood, body, photos, author } = entry
  const previewBody = getJournalPreviewText(body)

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Link href={`/journal/${id}`} className="block">
        <Card
          className={cn(
            "cursor-pointer transition-shadow hover:shadow-md",
            "bg-card hover:shadow-primary/5",
            "dark:bg-card dark:hover:shadow-primary/10"
          )}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-xl">{mood}</span>
              <h3 className="flex-1 font-heading text-base font-semibold text-foreground line-clamp-1">
                {title}
              </h3>
              <Badge
                variant={author === "BK" ? "default" : "secondary"}
                className="shrink-0 text-[0.65rem] uppercase tracking-wide"
              >
                {author}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{date}</p>
          </CardHeader>

          <CardContent>
            <p
              className={cn(
                "text-sm leading-relaxed text-muted-foreground",
                showFull ? "whitespace-pre-wrap" : "line-clamp-3"
              )}
            >
              {previewBody}
            </p>

            {photos.length > 0 && (
              <div
                className={cn(
                  "mt-3 grid gap-1.5",
                  photos.length === 1
                    ? "grid-cols-1"
                    : "grid-cols-2"
                )}
              >
                {photos.map((src, i) => (
                  <div
                    key={i}
                    className={cn(
                      "overflow-hidden rounded-lg",
                      photos.length === 1 ? "aspect-[16/9]" : "aspect-square"
                    )}
                  >
                    <img
                      src={src}
                      alt={`${title} photo ${i + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
