import "@/styles/globals.css";
import React from "react";

export const metadata = { title: "LOSIA", description: "Secondhand First" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <header className="border-b">
          <div className="mx-auto max-w-6xl p-4 flex items-center justify-between">
            <a href="/" className="font-semibold">LOSIA</a>
            <nav className="flex gap-4 text-sm">
              <a href="/about">About</a>
              <a href="/cart">Cart</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
        <footer className="border-t mt-8">
          <div className="mx-auto max-w-6xl p-4 text-sm text-gray-500">
            © {new Date().getFullYear()} LOSIA — Secondhand First
          </div>
        </footer>
      </body>
    </html>
  );
}
