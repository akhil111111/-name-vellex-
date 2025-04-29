import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vellex Gaming - Play Chess and More",
  description: "Play chess and other board games online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-xl font-bold text-white">
                  Vellex Gaming
                </Link>
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link href="/chess" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                    Chess
                  </Link>
                  <Link href="/games" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                    More Games
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
