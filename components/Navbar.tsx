"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-6xl">
      <div className="
        flex items-center justify-between
        px-6 py-4
        rounded-2xl
        bg-white/40
        backdrop-blur-xl
        border border-white/30
        shadow-[0_8px_32px_rgba(0,0,0,0.12)]
      ">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
            文
          </div>
          <span className="text-lg font-bold tracking-tight">SIFL</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-emerald-600 transition">
            Home
          </Link>

          <Link href="/programs" className="hover:text-emerald-600 transition">
            Programs
          </Link>

          <Link href="/about" className="hover:text-emerald-600 transition">
            About
          </Link>

          <Link href="/success-stories" className="hover:text-emerald-600 transition">
            Success Stories
          </Link>

          <Link href="/why-sifl" className="hover:text-emerald-600 transition">
            Why SIFL
          </Link>

          <Link href="/consultation" className="hover:text-emerald-600 transition">
            How It Works
          </Link>
        </nav>

        {/* CTA */}
        <Link
          href="#consultation"
          className="
            px-5 py-2.5
            rounded-xl
            bg-emerald-600
            text-white
            text-sm
            font-semibold
            shadow-lg
            hover:bg-emerald-700
            transition
          "
        >
          Book Consultation
        </Link>
      </div>
    </header>
  );
}