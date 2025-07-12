import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from '@clerk/nextjs';
import { ColoredTopLoader } from "@/components/layout/ColoredTopLoader";
import Navigation from "@/components/layout/Navigation";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScheduleTemplateProvider } from "@/contexts/ScheduleTemplateContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "スケジュール管理アプリ",
  description: "チーム全体のスケジュールを効率的に管理するアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ClerkProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>
                <ScheduleTemplateProvider>
                  {/* 統一されたローディングバー */}
                  <ColoredTopLoader />
                  {/* ナビゲーション */}
                  <Navigation />
                  {children}
                </ScheduleTemplateProvider>
              </TooltipProvider>
            </ThemeProvider>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
