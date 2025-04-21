import Header from "@/components/Header";

import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">

      <Header />

      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>
          <span className="text-4xl font-bold text-gray-800 dark:text-gray-200">
            Welcome to Finance RAG
          </span>
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400">
          A powerful platform that combines the power of graph with RAG for optimal Financial Advisory.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/dashboard"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
          >
            Try now
          </Link>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 Finance RAG. All rights reserved.
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <Link href="#" className="text-sm text-gray-600 dark:text-gray-400">
            Privacy Policy
          </Link>
          <span className="text-sm text-gray-600 dark:text-gray-400">|</span>
          <Link href="#" className="text-sm text-gray-600 dark:text-gray-400">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
