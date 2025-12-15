import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as requested
import "./globals.css";
import ToastProvider from "@/components/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EmailVerifier | Professional Email Validation Tool",
  description: "Verify email lists with syntax check, domain validation, and risk detection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        {/* Simple Header */}
        <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-bold text-xl tracking-tight">EmailVerifier</span>
              </div>
              <nav className="flex items-center gap-6">
                <a href="/upload" className="text-gray-600 hover:text-black font-medium text-sm transition-colors">
                  Upload
                </a>
                <a href="/history" className="text-gray-600 hover:text-black font-medium text-sm transition-colors">
                  History
                </a>
                <div className="h-4 w-px bg-gray-200" />
                <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 hover:text-black transition-colors text-sm">
                  GitHub
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow bg-white">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-500">
              © {new Date().getFullYear()} EmailVerifier. All rights reserved.
            </p>
          </div>
        </footer>

        {/* Toast Notifications */}
        <ToastProvider />
      </body>
    </html>
  );
}
