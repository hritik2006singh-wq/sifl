import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="text-3xl font-extrabold text-white tracking-tighter mb-4 block">
                            SIFL
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Empowering global communication through structured, premium language education.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-4 text-gray-100">Explore</h4>
                        <ul className="space-y-3">
                            <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</Link></li>
                            <li><Link href="/programs" className="text-gray-400 hover:text-white transition-colors text-sm">Programs</Link></li>
                            <li><Link href="/consultation" className="text-gray-400 hover:text-white transition-colors text-sm">Book Consultation</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-4 text-gray-100">Portal</h4>
                        <ul className="space-y-3">
                            <li><Link href="/sign-in" className="text-gray-400 hover:text-white transition-colors text-sm">Student Sign In</Link></li>
                            <li><Link href="/portal" className="text-gray-400 hover:text-white transition-colors text-sm">Dashboard</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-4 text-gray-100">Contact</h4>
                        <ul className="space-y-3">
                            <li className="text-gray-400 text-sm">info@sifl.edu</li>
                            <li className="text-gray-400 text-sm">+1 (555) 123-4567</li>
                            <li className="text-gray-400 text-sm mt-4">123 Education Boulevard,<br />Knowledge City, 90210</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} SIFL Institute. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        <span className="text-gray-400 hover:text-white cursor-pointer transition-colors text-sm">Privacy Policy</span>
                        <span className="text-gray-400 hover:text-white cursor-pointer transition-colors text-sm">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
