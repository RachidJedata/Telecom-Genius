import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import SignOutButton from "./ui/components/signOut";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TelecomGenius",
  description: "TelecomGenius is an interactive learning platform for telecommunications, developed as part of my final year project. It provides educational resources on networks, signals, and communication systems, with real-time signal processing visualization using Python and Next.js.",
  icons: {
    icon: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen">
          {/* Navbar */}
          <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link
                href='/'
                className="flex items-center gap-2">
                <Image
                  width={20}
                  height={20}
                  src="/logo.png"
                  alt="Global Communications"
                  className="h-8 w-8 text-primary"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  TelecomGenius
                </span>
              </Link>
              {(session?.user) && (
                <SignOutButton />
              )}
            </div>
          </nav>


          {/* Add padding to account for fixed navbar */}
          <div className="pt-16">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
