import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://itsmohamedwael.info"),
  title: {
    default: "Mohamed Wael | Software Engineer & Full-Stack Developer",
    template: "%s | Mohamed Wael",
  },
  description:
    "Portfolio of Mohamed Wael - Software Engineer, Full-Stack Web Developer, Graphic Designer, C++ Programmer, and AI Developer. Building innovative digital solutions.",
  keywords: [
    "Mohamed Wael",
    "Software Engineer",
    "Full-Stack Developer",
    "Web Developer",
    "AI Developer",
    "C++ Programmer",
    "Graphic Designer",
    "Next.js",
    "React",
    "TypeScript",
  ],
  authors: [{ name: "Mohamed Wael", url: "https://itsmohamedwael.info" }],
  creator: "Mohamed Wael",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://itsmohamedwael.info",
    title: "Mohamed Wael | Software Engineer & Full-Stack Developer",
    description:
      "Portfolio of Mohamed Wael - Building innovative digital solutions with modern technologies.",
    siteName: "Mohamed Wael Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mohamed Wael - Software Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mohamed Wael | Software Engineer & Full-Stack Developer",
    description: "Portfolio of Mohamed Wael - Building innovative digital solutions.",
    images: ["/og-image.png"],
    creator: "@its_mohamedwael",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
