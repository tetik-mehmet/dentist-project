import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dental Clinic",
  description: "Diş Kliniği Yönetim Sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            expand={false}
            richColors
            toastOptions={{
              classNames: {
                toast:
                  "rounded-xl border border-border bg-card text-card-foreground shadow-xl text-sm font-medium",
                title: "font-semibold",
                description: "text-muted-foreground text-xs",
                success: "!border-emerald-500/30 !bg-emerald-500/10 !text-emerald-400",
                error: "!border-red-500/30 !bg-red-500/10 !text-red-400",
                warning: "!border-amber-500/30 !bg-amber-500/10 !text-amber-400",
                info: "!border-blue-500/30 !bg-blue-500/10 !text-blue-400",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
