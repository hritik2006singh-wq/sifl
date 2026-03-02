"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { CheckCircle2 } from 'lucide-react';

const heroImages = [
    "/hero1.jpg",
    "/hero2.jpg",
    "/hero3.jpg",
    "/hero4.jpg",
    "/hero5.jpg",
    "/hero6.jpg",
    "/hero7.jpg",
];

const universities = [
    { name: "USA", logo: "/images/Flag/usa.jpg" },
    { name: "UK", logo: "/images/Flag/uk.jpg" },
    { name: "Canada", logo: "/images/Flag/canada.jpg" },
    { name: "Australia", logo: "/images/Flag/australia.jpg" },
    { name: "Ireland", logo: "/images/Flag/ireland.jpg" },
    { name: "Germany", logo: "/images/Flag/german.jpg" },
    { name: "Spain", logo: "/images/Flag/spain.jpg" },
    { name: "Japan", logo: "/images/Flag/jap.jpg" },
    { name: "Frence", logo: "/images/Flag/french.jpg" },
];

const duplicatedUniversities = [...universities, ...universities, ...universities, ...universities];

export default function HeroSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [carouselIdx, setCarouselIdx] = useState(0);
    const trackRef = useRef<HTMLDivElement>(null);
    const rAF = useRef<number | null>(null);

    // Hero background slider
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Marquee continuous right to left logic
    useEffect(() => {
        let offset = 0;
        const speed = 0.5;

        const animate = () => {
            offset -= speed;

            if (trackRef.current) {
                trackRef.current.style.transform =
                    `translateX(${offset}px) translateY(-50%)`;

                const trackWidth = trackRef.current.scrollWidth / 2;

                if (Math.abs(offset) >= trackWidth) {
                    offset = 0;
                }
            }

            rAF.current = requestAnimationFrame(animate);
        };

        rAF.current = requestAnimationFrame(animate);

        return () => {
            if (rAF.current) cancelAnimationFrame(rAF.current);
        };
    }, []);
    // Carousel auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setCarouselIdx(prev => (prev + 1) % universities.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <section className="hero">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .hero {
                        position: relative;
                        height: 100vh;
                        overflow: hidden;
                    }

                    .slide {
                        position: absolute;
                        inset: 0;
                        background-size: cover;
                        background-position: center;
                        background-repeat: no-repeat;
                        opacity: 0;
                        transform: scale(1);
                        transition: opacity 1.3s ease-in-out, transform 2s ease-out;
                        z-index: 0;
                    }

                    .slide.active {
                        opacity: 1;
                        transform: scale(1.04);
                    }
                `}} />

                {heroImages.map((src, index) => (
                    <div
                        key={index}
                        className={`slide ${index === currentIndex ? "active" : ""}`}
                        style={{ backgroundImage: `url(${src})` }}
                    />
                ))}

                {/* Dark Overlay Gradient — boosted for readability */}
                <div
                    className="absolute inset-0 z-[1]"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.40) 40%, rgba(0,0,0,0.70) 100%)'
                    }}
                />

                {/* Content Layer — pushed below the floating navbar */}
                <div
                    className="relative z-[2] w-full h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-32"
                >

                    {/* TWO-LINE HEADLINE */}
                    <h1
                        className="animate-fade-in-up mb-4 text-white"
                        style={{
                            fontFamily: 'var(--font-jakarta), var(--font-inter), sans-serif',
                            fontWeight: 800,
                            letterSpacing: '-0.03em',
                            lineHeight: 1.05,
                            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                        }}
                    >Speak Beyond
                        <br />
                        <span
                            style={{
                                background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >Borders With Confidence.</span>
                    </h1>

                    {/* THREE-WORD TAGLINE */}
                    <p
                        className="animate-fade-in-up mb-10 max-w-2xl text-center text-white/80"
                        style={{
                            animationDelay: '0.1s',
                            fontSize: '1.125rem',
                            fontWeight: 500,
                            lineHeight: 1.6,
                        }}
                    >
                        Your trusted pathway to fluency with "SIFL".
                    </p>

                    {/* CTA BUTTONS — centered */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <Link href="/demo-booking">
                            <Button
                                size="lg"
                                className="bg-[#10b981] hover:bg-[#059669] text-white font-bold border-none shadow-xl transition-all duration-300 h-14 px-8 text-lg min-w-[200px]"
                            >
                            Book Free Demo
                            </Button>
                        </Link>

                        <Link href="/programs">
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300 h-14 px-8 text-lg min-w-[200px]"
                            >
                                Explore Programs
                            </Button>
                        </Link>
                    </div>

                    <p className="text-xs text-white/45 mb-10 animate-fade-in-up tracking-wider uppercase" style={{ animationDelay: '0.3s' }}>
                        Free Demo class&nbsp;·&nbsp; No obligation
                    </p>

                    {/* Metrics Row — centered, horizontal scroll on mobile */}
                    <div className="w-full max-w-full overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center justify-start md:justify-center gap-8 overflow-x-auto snap-x snap-mandatory pb-4 px-4 hide-scrollbar w-full whitespace-nowrap text-white/90 font-medium">
                            <div className="flex items-center gap-2 snap-center shrink-0">
                                <CheckCircle2 className="text-[#10b981] h-5 w-5 shrink-0" />
                                <span className="text-sm md:text-base">100+ Students Abroad</span>
                            </div>
                            <div className="flex items-center gap-2 snap-center shrink-0">
                                <CheckCircle2 className="text-[#10b981] h-5 w-5 shrink-0" />
                                <span className="text-sm md:text-base">5+ Languages</span>
                            </div>
                            <div className="flex items-center gap-2 snap-center shrink-0">
                                <CheckCircle2 className="text-[#10b981] h-5 w-5 shrink-0" />
                                <span className="text-sm md:text-base">5+ Expert Trainers</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Smooth Rounded Bottom Curve */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 pointer-events-none translate-y-[1px]">
                    <svg
                        viewBox="0 0 1440 100"
                        className="block w-full h-[60px] md:h-[100px]"
                        preserveAspectRatio="none"
                        style={{ filter: "drop-shadow(0px -4px 10px rgba(0,0,0,0.1))" }}
                    >
                        <path d="M0,100 C360,0 1080,0 1440,100 Z" fill="#ffffff" />
                    </svg>
                </div>
            </section>

            {/* ── TRUSTED UNIVERSITIES SHOWCASE ── */}
            <div className="bg-white pt-8 pb-12 overflow-hidden relative border-b border-gray-100">
                <div className="text-center mb-10 relative z-10 w-full max-w-lg mx-auto bg-white px-4">
                    <p className="text-xs md:text-sm font-bold tracking-widest uppercase text-slate-500">
                        Trusted by students now in:
                    </p>
                </div>

                <div className="relative w-full mx-auto h-[140px] flex items-center justify-center overflow-hidden" style={{ maxWidth: '1440px' }}>
                    {/* Ghost mask to fade edges */}
                    <div className="absolute inset-0 z-20 pointer-events-none"
                        style={{ background: 'linear-gradient(to right, white 0%, transparent 15%, transparent 85%, white 100%)' }}
                    />
                    {/* Carousel items */}
                    <div className="relative w-full overflow-hidden h-[140px]">

                        <div
                            ref={trackRef}
                            className="absolute left-0 top-1/2 flex items-center gap-16"
                            style={{ transform: "translateY(-50%)" }}
                        >
                            {duplicatedUniversities.map((uni, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center transition-all duration-300"
                                    style={{
                                        width: "160px",
                                    }}
                                >
                                    <img
                                        src={uni.logo}
                                        alt={uni.name}
                                        className="h-14 w-auto object-contain"
                                    />
                                    <span className="text-sm mt-2 text-slate-700 whitespace-nowrap">
                                        {uni.name}
                                    </span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
