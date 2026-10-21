import { Suspense } from "react";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import ToastProvider from "@/components/providers/ToastProvider";
import QueryProvider from "@/components/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Findora – Lost & Found",
  description: "Find and report lost and found items with ease.",
  icons: {
    icon: "/favicon.ico",
    apple: "/findora-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${bricolageGrotesque.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Geist:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50/40 text-slate-900 antialiased">
        <LanguageProvider>
          <QueryProvider>
            <ToastProvider>
              <Suspense fallback={<div className="h-16 w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800" />}>
                <Navbar />
              </Suspense>
              <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#9ae600] border-t-transparent animate-spin" /></div>}>
                <main className="flex-1">{children}</main>
              </Suspense>
              <Footer />
            </ToastProvider>
          </QueryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
