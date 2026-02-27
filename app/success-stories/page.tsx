'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const successStories = [
    {
        id: 1,
        name: "Elena Rodriguez",
        program: "Spanish DELE C1",
        quote: "The immersive methodology at SIFL transformed my career. Within 8 months, I was confidently negotiating contracts in Madrid.",
        image: "/brand/success/student-1.jpg",
        role: "International Business Director"
    },
    {
        id: 2,
        name: "Kenji Sato",
        program: "English IELTS 8.0",
        quote: "I needed a high IELTS score for my MBA in London. The rigorous mock tests and personalized feedback made all the difference.",
        image: "/brand/success/student-2.jpg",
        role: "MBA Candidate, LBS"
    },
    {
        id: 3,
        name: "Amara Okeke",
        program: "French DELF B2",
        quote: "Moving to Montreal was daunting, but SIFL prepared me not just with language, but with the cultural nuances required to thrive.",
        image: "/brand/faculty/leader-1.jpg",
        role: "Software Engineer"
    }
];

const videos = [
    { id: 1, title: "Elena's Journey to Madrid", thumb: "/brand/campus/campus-1.jpg", url: "/brand/videos/video-1.mp4" },
    { id: 2, title: "Mastering IELTS with Kenji", thumb: "/brand/campus/campus-2.jpg", url: "/brand/videos/video-2.mp4" },
    { id: 3, title: "Amara's Montreal Success", thumb: "/brand/campus/campus-3.jpg", url: "/brand/videos/video-3.mp4" }
];

export default function SuccessStoriesPage() {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((current) => (current + 1) % successStories.length);
        }, 5000); // Auto-slide every 5s
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setActiveIndex((current) => (current + 1) % successStories.length);
    const prevSlide = () => setActiveIndex((current) => (current - 1 + successStories.length) % successStories.length);

    return (
        <main className="pt-24 pb-16 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Success Stories</h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Discover how SIFL Academy has empowered students to achieve their global ambitions through language mastery and cultural fluency.
                    </p>
                </div>

                {/* Carousel Section */}
                <section className="mb-24">
                    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden min-h-[400px] flex items-center border border-slate-100 group">
                        {successStories.map((story, idx) => (
                            <div
                                key={story.id}
                                className={`absolute inset-0 transition-opacity duration-1000 flex flex-col md:flex-row ${idx === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                                    }`}
                            >
                                <div
                                    className="w-full md:w-2/5 h-64 md:h-full bg-cover bg-center"
                                    style={{ backgroundImage: `url('${story.image}')`, backgroundColor: '#e2e8f0' }}
                                />
                                <div className="w-full md:w-3/5 p-8 md:p-16 flex flex-col justify-center">
                                    <span className="material-symbols-outlined text-5xl text-primary/20 mb-6">format_quote</span>
                                    <p className="text-2xl md:text-3xl font-medium text-slate-800 leading-relaxed mb-8">
                                        "{story.quote}"
                                    </p>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900">{story.name}</h4>
                                        <p className="text-primary font-semibold">{story.program}</p>
                                        <p className="text-slate-500 text-sm mt-1">{story.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Manual Controls */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg text-slate-800 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg text-slate-800 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>

                        {/* Indicators */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                            {successStories.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveIndex(idx)}
                                    className={`w-3 h-3 rounded-full transition-all ${idx === activeIndex ? "bg-primary w-8" : "bg-slate-300 hover:bg-slate-400"
                                        }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Video Gallery Section */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Student Experiences</h2>
                        <p className="text-slate-600">Watch our alumni share their journeys from day one to certification.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {videos.map((video) => (
                            <div key={video.id} className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 bg-white cursor-pointer">
                                <div
                                    className="w-full h-48 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                    style={{ backgroundImage: `url('${video.thumb}')`, backgroundColor: '#e2e8f0' }}
                                />
                                <div className="absolute top-0 left-0 w-full h-48 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-3xl ml-1">play_arrow</span>
                                    </div>
                                </div>
                                <div className="p-6 relative bg-white">
                                    <h4 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">{video.title}</h4>
                                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">movie</span>
                                        Student Interview
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <Link href="/consultation" className="inline-block px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all">
                            Start Your Own Success Story
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
