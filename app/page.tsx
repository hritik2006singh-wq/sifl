"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";

// ── Dot Indicator Component (mobile-only, desktop: hidden via CSS class) ──
function CarouselDots({ count, active }: { count: number; active: number }) {
  return (
    <div className="mobile-carousel-dots md:hidden" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`mobile-carousel-dot${i === active ? " active" : ""}`}
        />
      ))}
    </div>
  );
}

function useAutoSlider(itemCount: number, autoSlideInterval = 3500, resumeDelay = 5000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % itemCount);
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [isPaused, itemCount, autoSlideInterval]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const child = container.children[currentIndex] as HTMLElement;
      if (child) {
        container.scrollTo({
          left: child.offsetLeft - container.offsetLeft - 16,
          behavior: "smooth"
        });
      }
    }
  }, [currentIndex]);

  const handleInteraction = () => {
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, resumeDelay);
  };

  return { currentIndex, setCurrentIndex, scrollContainerRef, handleInteraction, setIsPaused };
}

export default function Page() {
  // Programs Slider
  const programs = [
    { id: 'german', title: 'German', subtitle: 'A1 to C2 Levels', img: '/images/programs/german.jpg', route: "/programs/german" },
    { id: 'english', title: 'English', subtitle: 'IELTS & Business', img: '/images/programs/english.jpg', route: "/programs/english" },
    { id: 'french', title: 'French', subtitle: 'DELF Preparation', img: '/images/programs/french.jpg', route: "/programs/french" },
    { id: 'japanese', title: 'Japanese', subtitle: 'JLPT N5-N1 Path', img: '/images/programs/japanese.jpg', route: "/programs/japanese" },
    { id: 'spanish', title: 'Spanish', subtitle: 'DELE Certification', img: '/images/programs/spanish.jpg', route: "/programs/spanish" },
  ];
  const progSlider = useAutoSlider(programs.length);

  // Why Choose SIFL Grid
  const advantages = [
    { title: 'Structured Learning Path', icon: 'architecture', desc: 'Step-by-step curriculum aligned with international standards.', route: '/ysifl' },
    { title: 'Career-Focused Curriculum', icon: 'work_history', desc: 'Job interview prep and professional terminology included.', route: '/ysifl' },
    { title: 'Certified & Experienced Trainers', icon: 'badge', desc: 'Learn from native-level experts with years of teaching experience.', route: '/ysifl' },
    { title: 'Global Outcome Focus', icon: 'public', desc: 'Designed specifically for professional migration and study abroad.', route: '/ysifl' },
    { title: 'Interactive Live Sessions', icon: 'record_voice_over', desc: 'Engaging real-time classes prioritizing spoken fluency.', route: '/ysifl' },
    { title: '100+ Students Placed Abroad 🌍', icon: 'flight_takeoff', desc: 'Join our growing alumni network thriving in international careers.', route: '/ysifl' },
  ];
  const advSlider = useAutoSlider(advantages.length);

  // Success Stories Slider
  const stories = [
    { name: 'Ananya R.', loc: 'Germany • German C1', role: 'MBA in Germany', img: '/brand/success/success_5.jpeg' },
    { name: 'Kanak M.', loc: 'Ireland • IELTS 8.5', role: 'Product Manager', img: '/brand/success/success_2.jpeg' },
    { name: 'Karan S.', loc: 'Germany • German C1', role: 'Student in TU Berlin', img: '/brand/success/success_1.jpeg' },
    { name: 'Sarah L.', loc: 'Germany • German B2', role: 'Software Engineer', img: '/brand/success/success_3.jpeg' },
  ];
  const storySlider = useAutoSlider(stories.length);

  // Journey steps
  const journeySteps = [
    { step: '01', title: 'Consultation', text: 'We map out your current language proficiency and target career destination to create a custom roadmap.', icon: 'event' },
    { step: '02', title: 'Foundation', text: 'Intensive immersion into syntax, grammar, and essential vocabulary to build unshakeable confidence.', icon: 'psychology' },
    { step: '03', title: 'Specialization', text: 'Industry-specific terminology and advanced colloquial practice aligned with CEFR standards.', icon: 'school' },
    { step: '04', title: 'Certification', text: 'Final exam simulations, interview preparation, and official certification readiness.', icon: 'verified' },
  ];
  const journeySlider = useAutoSlider(journeySteps.length, 4000);

  // Journey Accordion State (desktop only)
  const [activeJourney, setActiveJourney] = useState<number | null>(0);

  return (
    <>
      <HeroSection />
      <main className="overflow-hidden">

        {/* ─────────────────────────────────────────────────────────────
            LANGUAGE PROGRAMS — IG Swipe Carousel on mobile
        ───────────────────────────────────────────────────────────── */}
        <section className="px-6 py-16 md:py-20 bg-white" id="programs">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">Global Programs</h2>
                <div className="mt-4 h-1.5 w-16 rounded-full bg-primary" />
                <p className="mt-4 text-slate-600 max-w-xl text-lg">
                  Industry-recognized online courses strictly structured for your study or migration success.
                </p>
              </div>
              <Link href="/online-courses" className="font-semibold text-primary hover:text-primary-hover whitespace-nowrap hidden md:block">
                View All Programs →
              </Link>
            </div>

            {/*
              MOBILE: mobile-carousel-container → snap-x, hidden scrollbar, flex-row
              DESKTOP: md: classes override to normal scrollable flex
            */}
            <div
              className="mobile-carousel-container flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0"
              ref={progSlider.scrollContainerRef}
              onMouseEnter={() => progSlider.setIsPaused(true)}
              onMouseLeave={() => progSlider.setIsPaused(false)}
              onTouchStart={progSlider.handleInteraction}
              onScroll={progSlider.handleInteraction}
            >
              {programs.map((prog, idx) => (
                <Link
                  href={prog.route}
                  key={prog.id}
                  /*
                    mobile-carousel-card = min-width: 85%, snap-center, margin-right: 1rem
                    md:w-[340px] overrides on desktop
                  */
                  className="mobile-carousel-card group relative flex-shrink-0 w-[280px] md:w-[340px] snap-center rounded-2xl border border-gray-100 bg-white shadow-lg transition-transform hover:-translate-y-2 overflow-hidden"
                >
                  <div className="h-48 w-full bg-slate-200" style={{ backgroundImage: `url(${prog.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="p-6">
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">{prog.title}</h3>
                    <p className="mt-1 font-semibold text-primary">{prog.subtitle}</p>
                    <div className="mt-6 flex items-center justify-between text-sm font-bold text-slate-500">
                      <span>Explore Course</span>
                      <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile dots */}
            <CarouselDots count={programs.length} active={progSlider.currentIndex} />

            <Link href="/programs" className="md:hidden flex justify-center mt-4 font-bold text-primary">
              View All Courses →
            </Link>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            WHY CHOOSE SIFL — horizontal carousel on mobile, grid on desktop
        ───────────────────────────────────────────────────────────── */}
        <section className="bg-slate-50 py-16 md:py-24" id="advantage">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col lg:flex-row gap-12 lg:items-center mb-16">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-black text-slate-900 md:text-5xl">Why Choose SIFL?</h2>
                <div className="mt-4 h-1.5 w-16 rounded-full bg-primary" />
                <p className="mt-6 text-lg text-slate-600 font-medium">
                  We don&apos;t just teach words. We systematically build the linguistic bridge to your target career destination using structured methodologies.
                </p>
                <div className="mt-6 inline-flex items-center gap-3 bg-white px-5 py-3 rounded-full border border-emerald-100 shadow-sm">
                  <span className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <span className="material-symbols-outlined text-[20px]">public</span>
                  </span>
                  <span className="font-bold text-slate-800 tracking-tight">Over 100+ Students Now Studying Abroad</span>
                </div>
              </div>
              <div className="lg:w-1/3 rounded-3xl overflow-hidden shadow-2xl aspect-[2/2]" style={{ backgroundImage: `url('/images/ui/whysifl.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            </div>

            {/* Grid Cards → mobile carousel */}
            <div
              className="mobile-carousel-container flex flex-row overflow-x-auto gap-6 hide-scrollbar snap-x snap-mandatory pb-8 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:snap-none md:pb-0"
              ref={advSlider.scrollContainerRef}
              onTouchStart={advSlider.handleInteraction}
              onScroll={advSlider.handleInteraction}
            >
              {advantages.map((adv, idx) => (
                <Link
                  href={adv.route}
                  key={idx}
                  className="mobile-carousel-card group relative flex-shrink-0 w-[280px] md:w-auto snap-center flex flex-col rounded-2xl bg-white p-8 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block"
                >
                  <div className="size-14 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                    <span className="material-symbols-outlined text-[28px]">{adv.icon}</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{adv.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">{adv.desc}</p>
                  <p className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:underline">
                    Learn More <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </p>
                </Link>
              ))}
            </div>

            {/* Mobile dots */}
            <CarouselDots count={advantages.length} active={advSlider.currentIndex} />
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            SUCCESS STORIES — IG Swipe Carousel on mobile
        ───────────────────────────────────────────────────────────── */}
        <section className="px-6 py-16 md:py-24 bg-white" id="success">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900 md:text-5xl">Real Students.<br />Real Outcomes.</h2>
                <div className="mt-4 h-1.5 w-16 rounded-full bg-primary mx-auto md:mx-0" />
              </div>
              <Link href="/success-stories" className="font-bold text-primary hover:underline shrink-0">
                Read All Stories →
              </Link>
            </div>

            <div
              className="mobile-carousel-container flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0"
              ref={storySlider.scrollContainerRef}
              onMouseEnter={() => storySlider.setIsPaused(true)}
              onMouseLeave={() => storySlider.setIsPaused(false)}
              onTouchStart={storySlider.handleInteraction}
              onScroll={storySlider.handleInteraction}
            >
              {stories.map((story, idx) => (
                <Link
                  key={idx}
                  href="/success-stories"
                  className="mobile-carousel-card group relative flex-shrink-0 w-[260px] md:w-[320px] aspect-[3/4] snap-center overflow-hidden rounded-2xl shadow-lg transition-transform hover:-translate-y-2 cursor-pointer block"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${story.img})` }} />
                  <div className="absolute bottom-6 left-6 z-20 pr-6">
                    <p className="text-2xl font-black text-white">{story.name}</p>
                    <p className="text-sm text-primary font-bold uppercase tracking-wider mt-1">{story.loc}</p>
                    <p className="mt-2 text-sm text-slate-300 font-medium">{story.role}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile dots */}
            <CarouselDots count={stories.length} active={storySlider.currentIndex} />
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            JOURNEY TO FLUENCY — horizontal snap-scroll on mobile,
            hover-expand grid on desktop
        ───────────────────────────────────────────────────────────── */}
        <section className="px-6 py-16 md:py-24 bg-slate-900 text-white" id="journey">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-black md:text-5xl">Journey to Fluency</h2>
              <div className="mt-4 h-1.5 w-16 rounded-full bg-primary mx-auto" />
              <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto">
                A systematically structured roadmap that takes you from complete beginner to certified professional ready to fly.
              </p>
            </div>

            {/* Mobile: carousel. Desktop: grid */}
            <div
              className="mobile-carousel-container grid md:grid-cols-4 gap-4 overflow-x-auto md:overflow-visible -mx-6 px-6 md:mx-0 md:px-0"
              ref={journeySlider.scrollContainerRef}
              onTouchStart={journeySlider.handleInteraction}
              onScroll={journeySlider.handleInteraction}
            >
              {journeySteps.map((item, idx) => (
                <div
                  key={idx}
                  className={`mobile-carousel-card group relative rounded-2xl border ${activeJourney === idx ? 'border-primary bg-white/10' : 'border-white/10 bg-white/5'} overflow-hidden transition-all duration-300 cursor-pointer flex-shrink-0 md:min-w-0 md:max-w-none`}
                  onClick={() => setActiveJourney(activeJourney === idx ? null : idx)}
                  onMouseEnter={() => setActiveJourney(idx)}
                >
                  <div className="p-6 md:p-8 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-5xl font-black text-primary/30 group-hover:text-primary transition-colors">{item.step}</span>
                      <span className="material-symbols-outlined text-4xl text-white/50">{item.icon}</span>
                    </div>
                    <h4 className="text-2xl font-bold mb-4">{item.title}</h4>
                    <div className={`transition-all duration-300 overflow-hidden ${activeJourney === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 md:max-h-40 md:opacity-100'}`}>
                      <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile dots */}
            <CarouselDots count={journeySteps.length} active={journeySlider.currentIndex} />

            <div className="mt-12 text-center">
              <Link href="/ysifl/our-methodology" className="inline-flex items-center gap-2 font-bold text-white hover:text-primary transition-colors border border-white/20 px-6 py-3 rounded-full hover:bg-white/10">
                Explore The Full Journey
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            CTA SECTION
        ───────────────────────────────────────────────────────────── */}
        <section className="px-6 py-12 md:py-24 bg-white">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 px-8 py-20 text-center md:px-16 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />

              <div className="relative z-10 flex flex-col items-center gap-8">
                <h2 className="text-3xl font-black text-white md:text-5xl lg:max-w-3xl leading-tight">
                  Ready to Build Your<br />Global Future?
                </h2>
                <p className="max-w-lg text-lg text-slate-300 font-medium">
                  Join professionals who have successfully mastered languages and advanced their careers abroad.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto mt-4">
                  <Link href="/demo-booking" className="w-full sm:w-auto">
                    <button className="w-full rounded-xl bg-primary px-10 py-4 text-base font-bold text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-95 hover:-translate-y-1">
                      Book Free Demo
                    </button>
                  </Link>
                  <Link href="/study-abroad" className="w-full sm:w-auto">
                    <button className="w-full rounded-xl bg-slate-800 px-10 py-4 text-base font-bold text-white shadow-lg transition-all active:scale-95 hover:-translate-y-1">
                      Destinations
                    </button>
                  </Link>
                  <Link href="/online-courses" className="w-full sm:w-auto">
                    <button className="w-full rounded-xl border border-white/20 bg-white/5 px-10 py-4 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/15 hover:-translate-y-1">
                      Explore Courses
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
