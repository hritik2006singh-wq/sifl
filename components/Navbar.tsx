"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface NavbarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Navbar({ isMobileMenuOpen, setIsMobileMenuOpen }: NavbarProps) {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/" },
    { name: "Programs", href: "/programs" },
    { name: "About", href: "/about" },
    { name: "Why SIFL", href: "/ysifl" },
    { name: "Success Stories", href: "/success-stories" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <>
      <header className="z-50 flex items-center transition-all duration-300
        fixed md:top-4 md:left-1/2 md:-translate-x-1/2 md:w-[calc(100%-2rem)] md:max-w-7xl md:h-16
        md:bg-white/70 md:backdrop-blur-md md:border md:border-white/40 md:rounded-2xl md:shadow-[0_8px_32px_rgba(0,0,0,0.08)]
        max-md:fixed max-md:top-0 max-md:left-0 max-md:right-0 max-md:h-14 max-md:px-4
        max-md:bg-transparent max-md:border-none max-md:shadow-none
      ">
        <div className="w-full px-4 lg:px-6 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer flex-shrink-0">
            <div className="relative h-9 w-9 rounded-xl overflow-hidden bg-white/40 backdrop-blur-md border border-white/30 shadow-sm">
              <Image
                src="/images/hero/logo.jpg"
                alt="SIFL Logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <span className="text-base font-semibold tracking-tight text-primary">
              SIFL
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {links.map((link) => {
              const isActive =
                pathname === link.href ||
                (pathname.startsWith(link.href) && link.href !== "/");

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative transition-colors duration-200 py-1 ${isActive
                    ? "text-primary font-semibold"
                    : "text-gray-700 hover:text-primary"
                    }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 rounded-xl
                text-gray-800 font-medium text-sm
                hover:bg-black/5 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              href="/demo-booking"
              className="inline-flex items-center px-5 py-2 rounded-xl
                bg-primary text-white text-sm font-semibold
                shadow-md hover:scale-[1.02] transition-all duration-200"
            >
              Book Free Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[80%]
        bg-white/70 backdrop-blur-2xl
        border-l border-white/30
        shadow-2xl
        z-[60]
        transform transition-transform duration-300 ease-out
        md:hidden flex flex-col
        ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        <div className="p-4 flex justify-end">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-600 hover:text-gray-900"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col px-6 gap-6 mt-6">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (pathname.startsWith(link.href) && link.href !== "/");

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center text-base min-h-[48px] px-2 transition-colors relative ${isActive
                  ? "text-primary font-semibold"
                  : "text-gray-800 font-medium"
                  }`}
              >
                {isActive && (
                  <span className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />
                )}
                <span className="ml-4">{link.name}</span>
              </Link>
            );
          })}

          <div className="mt-8 pt-6 border-t border-black/10 flex flex-col gap-4">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex justify-center w-full px-5 py-3 rounded-xl
                border border-gray-200 text-gray-800 text-sm font-semibold
                hover:bg-gray-50 transition-all"
            >
              Login
            </Link>

            <Link
              href="/demo-booking"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex justify-center w-full px-5 py-3 rounded-xl
                bg-primary text-white text-sm font-semibold
                shadow-md hover:scale-[1.02] transition-all"
            >
              Book Free Demo
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
