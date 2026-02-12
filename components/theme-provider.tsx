"use client"

import * as React from "react"

type ThemeProviderProps = {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("dark")
    root.classList.add("light")
  }, [])

  return <>{children}</>
}

export const useTheme = () => {
  return {
    theme: "light" as const,
    setTheme: () => {}, // No-op since we're forcing light mode
  }
}
