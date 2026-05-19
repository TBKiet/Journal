"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ConfettiProps {
  trigger: boolean
  duration?: number
}

const EMOJIS = ["💕", "✨", "🎉", "💖", "🌟"]

interface Particle {
  id: number
  emoji: string
  x: number
  delay: number
  size: number
}

let particleId = 0

export function Confetti({ trigger, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!trigger) return

    const count = 30
    const newParticles: Particle[] = Array.from({ length: count }, () => ({
      id: particleId++,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      size: 1 + Math.random() * 1.5,
    }))

    setParticles(newParticles)

    const timer = setTimeout(() => setParticles([]), duration)
    return () => clearTimeout(timer)
  }, [trigger, duration])

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              opacity: 1,
              y: "110vh",
              x: `${p.x}vw`,
              scale: p.size,
              rotate: 0,
            }}
            animate={{
              opacity: [1, 1, 0],
              y: "-10vh",
              rotate: [0, 180, 360],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2.5 + Math.random(),
              delay: p.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute bottom-0 text-2xl"
            style={{ left: `${p.x}%` }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
