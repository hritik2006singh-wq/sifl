import React from 'react';
import Link from 'next/link';

export const Navbar: React.FC = () => {
    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-3xl font-extrabold text-primary tracking-tighter">
                            SIFL
                        </Link>
                    </div>

                    <nav className="hidden md:flex space-x-8">
                        <Link href="/" className="text-gray-700 hover:text-primary font-medium transition-colors">Home</Link>
                        <Link href="/about" className="text-gray-700 hover:text-primary font-medium transition-colors">About Us</Link>
                        <Link href="/programs" className="text-gray-700 hover:text-primary font-medium transition-colors">Programs</Link>
                    </nav>

                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            href="/sign-in"
                            className="text-primary font-medium hover:text-primary-hover transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/consultation"
                            className="bg-primary text-white px-5 py-2.5 rounded-btn font-medium hover:bg-primary-hover transition-colors shadow-sm"
                        >
                            Book Consultation
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button className="text-gray-700 hover:text-primary focus:outline-none">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
