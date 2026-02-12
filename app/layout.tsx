import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MagicSite - Prompts Mágicos para Gerar Sites Perfeitos",
  description:
    "MagicSite: Prompts mágicos para gerar sites perfeitos e sem alteração. Plataforma SaaS que gera sites profissionais usando IA.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider defaultTheme="dark" storageKey="magicsite-theme">
          {children}
        </ThemeProvider>
        <Toaster position="top-right" richColors />
        {/* Analytics component removed */}
      </body>
    </html>
  )
}
