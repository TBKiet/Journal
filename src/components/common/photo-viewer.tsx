"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

interface PhotoViewerProps {
  photos: string[]
  initialIndex: number
  open: boolean
  onClose: () => void
}

const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}

export function PhotoViewer({ photos, initialIndex, open, onClose }: PhotoViewerProps) {
  const [index, setIndex] = useState(initialIndex)
  const [direction, setDirection] = useState(0)

  const paginate = useCallback(
    (newDirection: number) => {
      const next = index + newDirection
      if (next < 0 || next >= photos.length) return
      setDirection(newDirection)
      setIndex(next)
    },
    [index, photos.length]
  )

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = swipePower(info.offset.x, info.velocity.x)
    if (swipe < -300) {
      paginate(1)
    } else if (swipe > 300) {
      paginate(-1)
    }
  }

  if (photos.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-none border-0 bg-transparent p-0 shadow-none sm:max-w-none"
      >
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <span className="rounded-full bg-black/40 px-3 py-1 text-sm font-medium text-white/90">
              {index + 1}/{photos.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
            >
              <XIcon className="size-5" />
            </Button>
          </div>

          {index > 0 && (
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => paginate(-1)}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
            >
              <ChevronLeftIcon className="size-6" />
            </Button>
          )}

          <div className="relative flex h-full w-full items-center justify-center px-16 py-20">
            <AnimatePresence initial={false} custom={direction}>
              <motion.img
                key={index}
                src={photos[index]}
                alt={`Photo ${index + 1}`}
                custom={direction}
                initial={{ x: direction * 200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction * -200, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className={cn(
                  "max-h-full max-w-full rounded-lg object-contain select-none",
                  "cursor-grab active:cursor-grabbing"
                )}
                draggable={false}
              />
            </AnimatePresence>
          </div>

          {index < photos.length - 1 && (
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => paginate(1)}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
            >
              <ChevronRightIcon className="size-6" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
