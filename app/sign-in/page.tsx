import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { IMAGES } from '@/content/images';
import Image from 'next/image';

export default function SignInPage() {
    return (
        <div className="min-h-screen flex text-foreground bg-white">
            {/* LEFT SIDE: INSTITUTIONAL MESSAGING */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 flex-col justify-center px-16 xl:px-24">
                <div className="absolute inset-0">
                    <Image
                        src={IMAGES.hero.main}
                        alt="Campus"
                        fill
                        className="object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <Link href="/" className="text-4xl font-extrabold text-white tracking-tighter mb-12 block">
                        SIFL
                    </Link>
                    <h1 className="text-4xl font-bold text-white leading-tight mb-6">
                        Welcome to the SIFL Student Portal
                    </h1>
                    <p className="text-lg text-gray-300 mb-10 leading-relaxed">
                        Access your courses, track your progress, check upcoming assignments, and connect with your instructors, all in one premium learning environment.
                    </p>
                    <div className="flex items-center space-x-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-700" />
                            ))}
                        </div>
                        <span className="text-sm font-medium text-gray-400">Join 10,000+ active learners</span>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: LOGIN FORM */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-24">
                <div className="max-w-md w-full mx-auto">
                    <div className="lg:hidden mb-10 text-center">
                        <Link href="/" className="text-4xl font-extrabold text-primary tracking-tighter inline-block">
                            SIFL
                        </Link>
                    </div>

                    <h2 className="text-3xl font-bold mb-2 text-center lg:text-left">Sign in to your account</h2>
                    <p className="text-gray-500 mb-10 text-center lg:text-left">Enter your credentials to access your academic dashboard.</p>

                    <form className="space-y-6">
                        <FormInput
                            label="Institutional Email"
                            type="email"
                            placeholder="student@sifl.edu"
                            required
                        />

                        <FormInput
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            required
                        />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary hover:text-primary-hover">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <Button type="submit" fullWidth size="lg">Sign in</Button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Need technical assistance? <a href="#" className="font-medium text-primary hover:underline">Contact IT Support</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
