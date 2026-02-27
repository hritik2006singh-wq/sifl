import HeroSection from "@/components/HeroSection";

export default function Page() {
  return (
    <>
      <HeroSection />
      <main>
        {/* Hero Section */}

        {/* Trust Metrics */}
        <section className="bg-white py-12 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="flex flex-col items-center border-r border-slate-100 last:border-0 dark:border-slate-800">
                <p className="text-4xl font-black text-primary" style={{}}>
                  100+
                </p>
                <p className="text-sm font-medium text-slate-500" style={{}}>
                  Students Abroad
                </p>
              </div>
              <div className="flex flex-col items-center border-r border-slate-100 last:border-0 dark:border-slate-800">
                <p className="text-4xl font-black text-primary" style={{}}>
                  5+
                </p>
                <p className="text-sm font-medium text-slate-500" style={{}}>
                  Languages
                </p>
              </div>
              <div className="flex flex-col items-center border-r border-slate-100 last:border-0 dark:border-slate-800">
                <p className="text-4xl font-black text-primary" style={{}}>
                  5+
                </p>
                <p className="text-sm font-medium text-slate-500" style={{}}>
                  Expert Trainers
                </p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-4xl font-black text-primary" style={{}}>
                  Hybrid
                </p>
                <p className="text-sm font-medium text-slate-500" style={{}}>
                  Learning Modes
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Language Programs */}
        <section className="px-6 py-24" id="programs">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 flex flex-col items-center text-center">
              <h2
                className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl"
                style={{}}
              >
                Our Language Programs
              </h2>
              <div className="mt-4 h-1.5 w-24 rounded-full bg-primary" />
              <p
                className="mt-6 max-w-2xl text-slate-600 dark:text-slate-400"
                style={{}}
              >
                Industry-recognized certifications and career-focused curricula
                tailored for your success.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* German - Featured */}
              <div className="group relative overflow-hidden rounded-xl border-2 border-primary bg-white p-8 shadow-xl transition-all hover:-translate-y-1 dark:bg-slate-900 lg:col-span-2 lg:flex lg:gap-8">
                <div
                  className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white uppercase"
                  style={{}}
                >
                  Most Popular
                </div>
                <div
                  className="mb-6 h-48 w-full shrink-0 rounded-lg lg:mb-0 lg:h-auto lg:w-64"
                  data-alt="Brandenburg Gate Berlin"
                  style={{
                    backgroundImage:
                      `url('/brand/hero-bg.jpg')`,
                    backgroundSize: "cover"
                  }}
                />
                <div className="flex flex-col justify-center">
                  <h3
                    className="text-2xl font-black text-slate-900 dark:text-slate-100"
                    style={{}}
                  >
                    German
                  </h3>
                  <p className="mt-2 text-primary font-semibold" style={{}}>
                    A1 to C2 Levels
                  </p>
                  <p className="mt-4 text-slate-600 dark:text-slate-400" style={{}}>
                    Intensive training designed specifically for healthcare and
                    engineering professionals targeting Germany.
                  </p>
                  <div className="mt-6 flex gap-4">
                    <span
                      className="flex items-center gap-1 text-xs font-bold text-slate-500"
                      style={{}}
                    >
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{}}
                      >
                        schedule
                      </span>{" "}
                      12+ Weeks
                    </span>
                    <span
                      className="flex items-center gap-1 text-xs font-bold text-slate-500"
                      style={{}}
                    >
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{}}
                      >
                        group
                      </span>{" "}
                      Small Batches
                    </span>
                  </div>
                </div>
              </div>
              {/* English - Featured */}
              <div className="group relative overflow-hidden rounded-xl border-2 border-primary bg-white p-8 shadow-xl transition-all hover:-translate-y-1 dark:bg-slate-900">
                <div
                  className="mb-6 h-48 w-full rounded-lg"
                  data-alt="Big Ben London"
                  style={{
                    backgroundImage:
                      `url('/brand/campus/campus-1.jpg')`,
                    backgroundSize: "cover"
                  }}
                />
                <h3
                  className="text-2xl font-black text-slate-900 dark:text-slate-100"
                  style={{}}
                >
                  English
                </h3>
                <p className="mt-2 text-primary font-semibold" style={{}}>
                  IELTS &amp; Business English
                </p>
                <p className="mt-4 text-slate-600 dark:text-slate-400" style={{}}>
                  Master communication for global corporations and ace your
                  proficiency exams.
                </p>
              </div>
              {/* Other Languages */}
              <div className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-primary/50 dark:border-slate-800 dark:bg-slate-900">
                <div
                  className="mb-4 aspect-video rounded-lg"
                  data-alt="Eiffel Tower Paris"
                  style={{
                    backgroundImage:
                      `url('/brand/campus/campus-2.jpg')`,
                    backgroundSize: "cover"
                  }}
                />
                <h4
                  className="text-lg font-bold text-slate-900 dark:text-slate-100"
                  style={{}}
                >
                  French
                </h4>
                <p className="text-sm text-slate-500" style={{}}>
                  DELF Preparation
                </p>
              </div>
              <div className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-primary/50 dark:border-slate-800 dark:bg-slate-900">
                <div
                  className="mb-4 aspect-video rounded-lg"
                  data-alt="Mount Fuji Japan"
                  style={{
                    backgroundImage:
                      `url('/brand/programs/japanese.jpg')`,
                    backgroundSize: "cover"
                  }}
                />
                <h4
                  className="text-lg font-bold text-slate-900 dark:text-slate-100"
                  style={{}}
                >
                  Japanese
                </h4>
                <p className="text-sm text-slate-500" style={{}}>
                  JLPT N5-N1 Path
                </p>
              </div>
              <div className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-primary/50 dark:border-slate-800 dark:bg-slate-900">
                <div
                  className="mb-4 aspect-video rounded-lg"
                  data-alt="Sagrada Familia Spain"
                  style={{
                    backgroundImage:
                      `url('/brand/programs/other.jpg')`,
                    backgroundSize: "cover"
                  }}
                />
                <h4
                  className="text-lg font-bold text-slate-900 dark:text-slate-100"
                  style={{}}
                >
                  Spanish
                </h4>
                <p className="text-sm text-slate-500" style={{}}>
                  DELE Certification
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Why Choose SIFL */}
        <section className="bg-primary/5 py-24" id="why">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2
                  className="text-3xl font-black text-slate-900 dark:text-slate-100 md:text-4xl"
                  style={{}}
                >
                  The SIFL Advantage
                </h2>
                <p
                  className="mt-6 text-lg text-slate-600 dark:text-slate-400"
                  style={{}}
                >
                  We don't just teach words; we build bridges to your future career
                  abroad. Our methodology is refined over years of successful
                  placements.
                </p>
                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
                    <span
                      className="material-symbols-outlined text-primary text-3xl"
                      style={{}}
                    >
                      architecture
                    </span>
                    <h4 className="font-bold" style={{}}>
                      Structured Learning
                    </h4>
                    <p className="text-sm text-slate-500" style={{}}>
                      Step-by-step curriculum aligned with international standards
                      (CEFR).
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
                    <span
                      className="material-symbols-outlined text-primary text-3xl"
                      style={{}}
                    >
                      work_history
                    </span>
                    <h4 className="font-bold" style={{}}>
                      Career-focused
                    </h4>
                    <p className="text-sm text-slate-500" style={{}}>
                      Job interview prep and professional terminology included.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
                    <span
                      className="material-symbols-outlined text-primary text-3xl"
                      style={{}}
                    >
                      badge
                    </span>
                    <h4 className="font-bold" style={{}}>
                      Certified Trainers
                    </h4>
                    <p className="text-sm text-slate-500" style={{}}>
                      Learn from native-level experts with years of teaching
                      experience.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
                    <span
                      className="material-symbols-outlined text-primary text-3xl"
                      style={{}}
                    >
                      calendar_month
                    </span>
                    <h4 className="font-bold" style={{}}>
                      Flexible Schedules
                    </h4>
                    <p className="text-sm text-slate-500" style={{}}>
                      Choose from weekday, weekend, or evening intensive batches.
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="relative aspect-square overflow-hidden rounded-2xl shadow-2xl"
                data-alt="Tutor helping a student one on one"
                style={{
                  backgroundImage:
                    `url('/brand/faculty/member-1.jpg')`,
                  backgroundSize: "cover"
                }}
              />
            </div>
          </div>
        </section>
        {/* Success Stories */}
        <section className="px-6 py-24" id="success">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16">
              <h2
                className="text-3xl font-black text-slate-900 dark:text-slate-100"
                style={{}}
              >
                Success Stories
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400" style={{}}>
                Our alumni are now living their dreams across the globe.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="group relative aspect-[3/4] overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <div
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                  data-alt="Student smiling in Munich"
                  style={{
                    backgroundImage:
                      `url('/brand/faculty/member-2.jpg')`,
                    backgroundSize: "cover"
                  }}
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <p className="text-lg font-bold text-white" style={{}}>
                    Ananya R.
                  </p>
                  <p
                    className="text-sm text-primary font-bold uppercase"
                    style={{}}
                  >
                    Germany • German C1
                  </p>
                  <p className="mt-1 text-xs text-slate-300" style={{}}>
                    Software Engineer at Siemens
                  </p>
                </div>
              </div>
              <div className="group relative aspect-[3/4] overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <div
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                  data-alt="Student in London park"
                  style={{
                    backgroundImage:
                      `url('/brand/faculty/member-3.jpg')`,
                    backgroundSize: "cover"
                  }}
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <p className="text-lg font-bold text-white" style={{}}>
                    James M.
                  </p>
                  <p
                    className="text-sm text-primary font-bold uppercase"
                    style={{}}
                  >
                    UK • IELTS 8.5
                  </p>
                  <p className="mt-1 text-xs text-slate-300" style={{}}>
                    Masters at Oxford University
                  </p>
                </div>
              </div>
              <div className="group relative aspect-[3/4] overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <div
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                  data-alt="Student in Tokyo office"
                  style={{
                    backgroundImage:
                      `url('/brand/faculty/member-4.jpg')`,
                    backgroundSize: "cover"
                  }}
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <p className="text-lg font-bold text-white" style={{}}>
                    Kenji S.
                  </p>
                  <p
                    className="text-sm text-primary font-bold uppercase"
                    style={{}}
                  >
                    Japan • JLPT N2
                  </p>
                  <p className="mt-1 text-xs text-slate-300" style={{}}>
                    Senior UX Designer
                  </p>
                </div>
              </div>
              <div className="group relative aspect-[3/4] overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <div
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                  data-alt="Student in Montreal"
                  style={{
                    backgroundImage:
                      `url('/brand/faculty/member-5.jpg')`,
                    backgroundSize: "cover"
                  }}
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <p className="text-lg font-bold text-white" style={{}}>
                    Sarah L.
                  </p>
                  <p
                    className="text-sm text-primary font-bold uppercase"
                    style={{}}
                  >
                    Canada • French B2
                  </p>
                  <p className="mt-1 text-xs text-slate-300" style={{}}>
                    Healthcare Administrator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Testimonials */}
        <section className="bg-white py-24 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-3xl bg-primary/5 p-8 md:p-16">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
                <div className="flex-1">
                  <span
                    className="material-symbols-outlined text-5xl text-primary/30"
                    style={{}}
                  >
                    format_quote
                  </span>
                  <p
                    className="mt-4 text-2xl font-medium leading-relaxed italic text-slate-800 dark:text-slate-200 md:text-3xl"
                    style={{}}
                  >
                    "The trainers at SIFL don't just teach you grammar; they give
                    you the confidence to speak. Thanks to their intensive German
                    program, I cleared my B2 in the first attempt and landed a
                    nursing role in Frankfurt."
                  </p>
                  <div className="mt-8 flex items-center gap-4">
                    <div
                      className="h-12 w-12 rounded-full"
                      data-alt="Portrait of a female professional"
                      style={{
                        backgroundImage:
                          `url('/brand/success/student-2.jpg')`,
                        backgroundSize: "cover"
                      }}
                    />
                    <div>
                      <p
                        className="font-bold text-slate-900 dark:text-slate-100"
                        style={{}}
                      >
                        Deepika Iyer
                      </p>
                      <p className="text-sm text-slate-500" style={{}}>
                        Registered Nurse, University Hospital Frankfurt
                      </p>
                    </div>
                  </div>
                </div>
                <div className="hidden h-px bg-primary/20 lg:block lg:h-64 lg:w-px" />
                <div className="flex flex-col gap-6 lg:w-1/3">
                  <div className="rounded-xl border border-primary/20 bg-white p-6 dark:bg-slate-900">
                    <div className="flex text-primary">
                      <span className="material-symbols-outlined" style={{}}>
                        star
                      </span>
                      <span className="material-symbols-outlined" style={{}}>
                        star
                      </span>
                      <span className="material-symbols-outlined" style={{}}>
                        star
                      </span>
                      <span className="material-symbols-outlined" style={{}}>
                        star
                      </span>
                      <span className="material-symbols-outlined" style={{}}>
                        star
                      </span>
                    </div>
                    <p
                      className="mt-2 text-sm text-slate-600 dark:text-slate-400"
                      style={{}}
                    >
                      "Best language institute for IELTS. Highly recommended!"
                    </p>
                    <p className="mt-4 text-xs font-bold uppercase" style={{}}>
                      - Rahul V.
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary/20 bg-white p-6 dark:bg-slate-900">
                    <div className="flex text-primary">
                      <span className="material-symbols-outlined" style={{}}>
                        star
                      </span>
                      <span className="material-symbols-outlined" style={{}}>
                        star
                      </span>
                      <span className="material-symbols-outlined" style={{}}>
                        star
                      </span>
                      <span className="material-symbols-outlined" style={{}}>
                        star
                      </span>
                      <span className="material-symbols-outlined" style={{}}>
                        star
                      </span>
                    </div>
                    <p
                      className="mt-2 text-sm text-slate-600 dark:text-slate-400"
                      style={{}}
                    >
                      "Flexible timings allowed me to learn while working my 9-5."
                    </p>
                    <p className="mt-4 text-xs font-bold uppercase" style={{}}>
                      - Priya S.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* How It Works */}
        <section className="px-6 py-24" id="how">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2
                className="text-3xl font-black text-slate-900 dark:text-slate-100 md:text-4xl"
                style={{}}
              >
                Your Journey to Fluency
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400" style={{}}>
                Four simple steps to start your international career.
              </p>
            </div>
            <div className="relative grid gap-12 md:grid-cols-4">
              {/* Progress Line (desktop) */}
              <div className="absolute left-0 top-12 hidden h-0.5 w-full bg-slate-100 dark:bg-slate-800 md:block" />
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white text-primary shadow-xl dark:bg-slate-900">
                  <span className="material-symbols-outlined text-4xl" style={{}}>
                    event_available
                  </span>
                </div>
                <h4 className="text-xl font-bold" style={{}}>
                  1. Book
                </h4>
                <p className="mt-2 text-sm text-slate-500" style={{}}>
                  Schedule your free 15-minute consultation.
                </p>
              </div>
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white text-primary shadow-xl dark:bg-slate-900">
                  <span className="material-symbols-outlined text-4xl" style={{}}>
                    psychology
                  </span>
                </div>
                <h4 className="text-xl font-bold" style={{}}>
                  2. Assess
                </h4>
                <p className="mt-2 text-sm text-slate-500" style={{}}>
                  Take a level assessment test with our experts.
                </p>
              </div>
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white text-primary shadow-xl dark:bg-slate-900">
                  <span className="material-symbols-outlined text-4xl" style={{}}>
                    edit_note
                  </span>
                </div>
                <h4 className="text-xl font-bold" style={{}}>
                  3. Choose
                </h4>
                <p className="mt-2 text-sm text-slate-500" style={{}}>
                  Select the batch and schedule that fits you.
                </p>
              </div>
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/40">
                  <span className="material-symbols-outlined text-4xl" style={{}}>
                    rocket_launch
                  </span>
                </div>
                <h4 className="text-xl font-bold" style={{}}>
                  4. Start
                </h4>
                <p className="mt-2 text-sm text-slate-500" style={{}}>
                  Begin your journey towards global success.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section className="px-6 py-12 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 px-8 py-16 text-center dark:bg-slate-800 md:px-16">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative z-10 flex flex-col items-center gap-8">
                <h2
                  className="text-3xl font-black text-white md:text-5xl lg:max-w-3xl"
                  style={{}}
                >
                  Ready to Start Your Global Career?
                </h2>
                <p className="max-w-xl text-lg text-slate-300" style={{}}>
                  Join 1000+ students who have successfully learned a new language
                  and settled abroad.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    className="rounded-xl bg-primary px-10 py-4 text-lg font-bold text-white shadow-xl shadow-primary/30 transition-transform active:scale-95"
                    style={{}}
                  >
                    Book Free Consultation
                  </button>
                  <button
                    className="rounded-xl border border-white/20 bg-white/5 px-10 py-4 text-lg font-bold text-white backdrop-blur-md transition-colors hover:bg-white/10"
                    style={{}}
                  >
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
