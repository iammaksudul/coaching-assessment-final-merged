"use client"

import { useEffect, useState } from "react"
import { Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Testimonial = {
  quote: string
  name: string
  role: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Coaching Digs gave me the clarity I needed to target my growth areas. The 360-feedback was eye-opening!",
    name: "Jessica Lee",
    role: "Product Manager, ByteForge",
  },
  {
    quote: "Our organisation now uses coachability scores in every leadership review. Engagement is up 35 percent.",
    name: "Mark Chen",
    role: "VP People, NovaTech",
  },
  {
    quote: "The reporting dashboards make it effortless to track client progress and demonstrate ROI to stakeholders.",
    name: "Dr Anita Gomez",
    role: "Executive Coach",
  },
]

export function TestimonialsCarousel() {
  const [index, setIndex] = useState(0)

  // --- Auto-advance ---------------------------------------------------------
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  // --- Helpers --------------------------------------------------------------
  const next = () => setIndex((prev) => (prev + 1) % TESTIMONIALS.length)
  const prev = () => setIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="relative overflow-hidden">
        <CardContent className="p-8 md:p-12 min-h-[220px] flex flex-col items-center text-center gap-4">
          <Quote className="h-10 w-10 text-blue-600" />
          <p className="text-xl font-medium leading-relaxed">{TESTIMONIALS[index].quote}</p>
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{TESTIMONIALS[index].name}</span> – {TESTIMONIALS[index].role}
          </div>

          {/* Dots ------------------------------------------------------------ */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Show testimonial ${i + 1}`}
                className={cn("size-2 rounded-full transition-colors", i === index ? "bg-blue-600" : "bg-gray-300")}
              />
            ))}
          </div>
        </CardContent>

        {/* Prev / Next buttons (desktop only for neatness) ------------------ */}
        <Button
          size="icon"
          variant="ghost"
          onClick={prev}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2"
        >
          <span className="sr-only">Previous</span>‹
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={next}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2"
        >
          <span className="sr-only">Next</span>›
        </Button>
      </Card>
    </div>
  )
}
