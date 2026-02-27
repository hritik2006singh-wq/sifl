import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white font-bold">
                                文
                            </div>
                            <span className="text-xl font-black tracking-tight text-white">
                                SIFL
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed">
                            Empowering global communication through structured, premium language education.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/consultation" className="hover:text-white transition-colors">Book Consultation</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Support</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
                    <p className="mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} SIFL Institute. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
