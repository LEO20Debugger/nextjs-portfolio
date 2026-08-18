"use client"

import { MotionConfig } from "framer-motion"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProviderProps } from "next-themes/dist/types"
import * as React from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {/* `reducedMotion="user"` makes every framer transform/layout animation
          honour prefers-reduced-motion automatically, while keeping opacity
          fades so nothing becomes invisible. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemesProvider>
  )
}
