import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "../providers/query-provider";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Infiniqe CRUD App | Preyas Mistry",
  description: "A modern Next.js CRUD application managing products, users, and recipes with a responsive UI and server-side state.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", dmSans.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col font-sans bg-gray-50/30">
        <QueryProvider>
          <Navbar />
          <main className="container mx-auto p-4 md:p-6">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
