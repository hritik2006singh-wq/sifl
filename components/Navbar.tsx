"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { name: "Programs", href: "/programs" },
    { name: "About", href: "/about" },
    { name: "Success Stories", href: "/success-stories" },
    { name: "How It Works", href: "/how-it-works" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">

          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">
              文
            </div>
            <div className="flex flex-col -gap-1">
              <span className="text-base font-bold tracking-tight text-primary leading-none mt-1">SIFL</span>
            </div>
          </Link>

          {/* Center/Desktop: Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {links.map((link) => {
              const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`transition-colors py-1 ${isActive
                      ? "text-primary border-b-2 border-primary font-semibold"
                      : "text-gray-600 hover:text-primary"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right/Desktop: CTA & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link
              href="/consultation"
              className="hidden md:inline-flex items-center px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary-hover transition"
            >
              👉 Book Free Demo
            </Link>

            {/* Hamburger */}
            <button
              className="md:hidden p-2 text-gray-700 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white z-[60] shadow-2xl transform transition-transform duration-300 ease-out md:hidden flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="p-4 flex justify-end">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-800"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col px-6 gap-6 mt-4">
          {links.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-base transition-colors ${isActive ? "text-primary font-bold" : "text-gray-700 font-medium"
                  }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="mt-6 border-t border-gray-100 pt-6">
            <Link
              href="/consultation"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex justify-center w-full px-5 py-3 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary-hover transition"
            >
              👉 Book Free Demo
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
