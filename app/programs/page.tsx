import Link from 'next/link';

export default function ProgramsPage() {
  return (
    <>
      <main className="pt-16">
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
          <div className="relative flex h-auto min-screen w-full flex-col overflow-x-hidden">
            <div className="flex-1">
              <section className="px-6 py-16 lg:px-20 max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 mb-12">
                  <span className="text-primary font-bold tracking-widest uppercase text-xs">
                    Excellence in Linguistics
                  </span>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                    Our Language Programs
                  </h1>
                  <p className="text-slate-600 max-w-2xl text-lg leading-relaxed">
                    Master new languages with our premium academic curriculum designed
                    for global excellence and professional proficiency.
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* German - Col Span 2, Row Span 2 */}
                  <Link href="/programs/german" className="group bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 lg:col-span-2 lg:row-span-2 flex flex-col cursor-pointer">
                    <div
                      className="w-full flex-grow min-h-[250px] bg-slate-100 rounded-lg mb-6 bg-cover bg-center"
                      data-alt="Classical German architecture and town square"
                      style={{
                        backgroundImage:
                          `url('/brand/programs/german.jpg')`
                      }}
                    />
                    <h3 className="text-3xl font-black md:text-4xl mb-2 text-slate-900">German</h3>
                    <p className="text-slate-500 text-lg mb-6">
                      Innovation, Engineering &amp; Philosophy
                    </p>
                    <div className="flex items-center text-primary font-bold text-lg mt-auto">
                      Explore Syllabus{" "}
                      <span className="material-symbols-outlined ml-2">
                        arrow_forward
                      </span>
                    </div>
                  </Link>

                  {/* English - Col Span 1, Row Span 2 */}
                  <Link href="/programs/english" className="group bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 lg:col-span-1 lg:row-span-2 flex flex-col cursor-pointer">
                    <div
                      className="w-full flex-grow min-h-[200px] bg-slate-100 rounded-lg mb-4 bg-cover bg-center"
                      data-alt="Iconic red telephone booth in London street"
                      style={{
                        backgroundImage:
                          `url('/brand/programs/english.jpg')`
                      }}
                    />
                    <h3 className="text-2xl font-bold mb-1 text-slate-900">English</h3>
                    <p className="text-slate-500 text-sm mb-4">
                      Global Communication &amp; Academic Writing
                    </p>
                    <div className="flex items-center text-primary font-semibold text-sm mt-auto">
                      Explore Syllabus{" "}
                      <span className="material-symbols-outlined ml-1 text-sm">
                        arrow_forward
                      </span>
                    </div>
                  </Link>

                  {/* French */}
                  <Link href="/programs/french" className="group bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer">
                    <div
                      className="w-full h-40 bg-slate-100 rounded-lg mb-4 bg-cover bg-center"
                      data-alt="Eiffel tower view from Parisian street"
                      style={{
                        backgroundImage:
                          `url('/brand/programs/french.jpg')`
                      }}
                    />
                    <h3 className="text-xl font-bold mb-1 text-slate-900">French</h3>
                    <p className="text-slate-500 text-sm mb-4">
                      Diplomacy, Arts &amp; International Culture
                    </p>
                    <div className="flex items-center text-primary font-semibold text-sm mt-auto">
                      Explore Syllabus{" "}
                      <span className="material-symbols-outlined ml-1 text-sm">
                        arrow_forward
                      </span>
                    </div>
                  </Link>

                  {/* Spanish */}
                  <Link href="/programs/spanish" className="group bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer">
                    <div
                      className="w-full h-40 bg-slate-100 rounded-lg mb-4 bg-cover bg-center"
                      data-alt="Sunny architecture in Madrid Spain city"
                      style={{
                        backgroundImage:
                          `url('/brand/programs/spanish.jpg')`
                      }}
                    />
                    <h3 className="text-xl font-bold mb-1 text-slate-900">Spanish</h3>
                    <p className="text-slate-500 text-sm mb-4">
                      Business Expansion &amp; Global Travel
                    </p>
                    <div className="flex items-center text-primary font-semibold text-sm mt-auto">
                      Explore Syllabus{" "}
                      <span className="material-symbols-outlined ml-1 text-sm">
                        arrow_forward
                      </span>
                    </div>
                  </Link>

                  {/* Japanese */}
                  <Link href="/programs/japanese" className="group bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer">
                    <div
                      className="w-full h-40 bg-slate-100 rounded-lg mb-4 bg-cover bg-center"
                      data-alt="Mount Fuji Japan"
                      style={{
                        backgroundImage:
                          `url('/brand/programs/japanese.jpg')`
                      }}
                    />
                    <h3 className="text-xl font-bold mb-1 text-slate-900">Japanese</h3>
                    <p className="text-slate-500 text-sm mb-4">
                      Technology, Traditions &amp; JLPT Path
                    </p>
                    <div className="flex items-center text-primary font-semibold text-sm mt-auto">
                      Explore Syllabus{" "}
                      <span className="material-symbols-outlined ml-1 text-sm">
                        arrow_forward
                      </span>
                    </div>
                  </Link>
                </div>
              </section>
              <section className="bg-primary/5 py-20 px-6 lg:px-20">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">
                      Standardized Learning Levels
                    </h2>
                    <p className="text-slate-600">
                      Our curriculum follows the CEFR standard to ensure international
                      recognition.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-xl shadow-sm border-b-4 border-primary/30">
                      <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-primary font-bold">
                          signal_cellular_1_bar
                        </span>
                      </div>
                      <h4 className="text-lg font-bold mb-2">Beginner (A1 - A2)</h4>
                      <p className="text-slate-500 text-sm leading-relaxed mb-4">
                        Establish basic survival communication. Understand familiar
                        everyday expressions and basic phrases.
                      </p>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-xs">
                            check_circle
                          </span>{" "}
                          Intro to Grammar
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-xs">
                            check_circle
                          </span>{" "}
                          Basic Conversations
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-sm border-b-4 border-primary">
                      <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-primary font-bold">
                          signal_cellular_3_bar
                        </span>
                      </div>
                      <h4 className="text-lg font-bold mb-2">Intermediate (B1 - B2)</h4>
                      <p className="text-slate-500 text-sm leading-relaxed mb-4">
                        Achieve professional fluency. Handle complex texts and produce
                        clear, detailed communication.
                      </p>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-xs">
                            check_circle
                          </span>{" "}
                          Business Terminology
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-xs">
                            check_circle
                          </span>{" "}
                          Abstract Discussion
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-sm border-b-4 border-primary/30">
                      <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-primary font-bold">
                          signal_cellular_4_bar
                        </span>
                      </div>
                      <h4 className="text-lg font-bold mb-2">Advanced (C1 - C2)</h4>
                      <p className="text-slate-500 text-sm leading-relaxed mb-4">
                        Master subtle nuances. Understand virtually everything heard or
                        read with ease and spontaneity.
                      </p>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-xs">
                            check_circle
                          </span>{" "}
                          Academic Mastery
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-xs">
                            check_circle
                          </span>{" "}
                          Cultural Nuances
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
              <section className="py-20 px-6 lg:px-20 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <span className="text-primary font-bold text-xs uppercase tracking-widest mb-4 block">
                      Target Audience
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black mb-8 leading-tight">
                      Designed for Dedicated Learners
                    </h2>
                    <div className="space-y-6">
                      <div className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all">
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-3 rounded-lg h-fit">
                          work_outline
                        </span>
                        <div>
                          <h5 className="font-bold text-lg">Professionals</h5>
                          <p className="text-slate-500 text-sm">
                            Advancing careers in multinational environments and global
                            markets.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all">
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-3 rounded-lg h-fit">
                          school
                        </span>
                        <div>
                          <h5 className="font-bold text-lg">University Students</h5>
                          <p className="text-slate-500 text-sm">
                            Preparing for international exchange programs and higher
                            education abroad.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all">
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-3 rounded-lg h-fit">
                          travel_explore
                        </span>
                        <div>
                          <h5 className="font-bold text-lg">Global Citizens</h5>
                          <p className="text-slate-500 text-sm">
                            Relocating, traveling, or deeply connecting with diverse
                            cultures.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div
                      className="aspect-square rounded-xl bg-slate-200 overflow-hidden shadow-2xl bg-cover bg-center"
                      data-alt="Diverse students studying together in library"
                      style={{
                        backgroundImage:
                          `url('/brand/success/student-1.jpg')`
                      }}
                    />
                    <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl max-w-[200px]">
                      <div className="flex items-center gap-1 mb-2">
                        <span className="material-symbols-outlined text-yellow-400 fill-1">
                          star
                        </span>
                        <span className="material-symbols-outlined text-yellow-400 fill-1">
                          star
                        </span>
                        <span className="material-symbols-outlined text-yellow-400 fill-1">
                          star
                        </span>
                        <span className="material-symbols-outlined text-yellow-400 fill-1">
                          star
                        </span>
                        <span className="material-symbols-outlined text-yellow-400 fill-1">
                          star
                        </span>
                      </div>
                      <p className="text-xs font-bold italic">
                        "The most rigorous and rewarding program I've attended."
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2">
                        — Elena R., Senior Diplomat
                      </p>
                    </div>
                  </div>
                </div>
              </section>
              <section className="py-20 px-6 lg:px-20 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-xl">
                      <h2 className="text-3xl font-bold mb-4">
                        Flexible Learning Modes
                      </h2>
                      <p className="text-slate-400">
                        Choose the path that fits your schedule and learning
                        preferences.
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <span className="px-4 py-2 bg-primary/20 rounded-full text-primary text-xs font-bold">
                        2024 Enrollment Open
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group relative overflow-hidden rounded-xl bg-slate-800 p-8 border border-slate-700 hover:border-primary transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <span className="material-symbols-outlined text-4xl text-primary">
                          video_call
                        </span>
                        <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded">
                          Best for Remote
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Online Intensive</h3>
                      <p className="text-slate-400 mb-8 leading-relaxed">
                        Interactive live sessions with native instructors via our
                        proprietary learning portal. Includes recorded sessions and 24/7
                        access to digital resources.
                      </p>
                      <Link href="/schedule" className="block w-full text-center py-4 rounded-xl border border-slate-600 font-bold hover:bg-white hover:text-slate-900 transition-all">
                        View Online Schedule
                      </Link>
                    </div>
                    <div className="group relative overflow-hidden rounded-xl bg-slate-800 p-8 border border-slate-700 hover:border-primary transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <span className="material-symbols-outlined text-4xl text-primary">
                          location_on
                        </span>
                        <span className="text-xs font-bold px-2 py-1 bg-slate-700 text-slate-300 rounded">
                          On-Campus
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Offline Immersion</h3>
                      <p className="text-slate-400 mb-8 leading-relaxed">
                        Face-to-face instruction in our premium metropolitan facilities.
                        Full access to the campus library, study lounges, and social
                        mixers.
                      </p>
                      <Link
                        href="https://maps.google.com" target="_blank"
                        className="block w-full text-center py-4 rounded-xl border border-slate-600 font-bold hover:bg-white hover:text-slate-900 transition-all"
                        data-location="London"
                      >
                        Find a Campus Near You
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
              <section className="py-24 px-6 lg:px-20">
                <div className="max-w-4xl mx-auto bg-primary rounded-xl p-8 md:p-16 text-center shadow-2xl shadow-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24" />
                  <div className="relative z-10">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                      Ready to start your journey?
                    </h2>
                    <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                      Join thousands of students who have mastered a new language with
                      SIFL Academy's proven methodology.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/consultation" className="w-full md:w-auto px-8 py-4 bg-white text-primary rounded-xl font-black text-lg shadow-xl hover:scale-105 transition-transform text-center">
                        Get Started Today
                      </Link>
                      <Link href="/consultation" className="w-full md:w-auto px-8 py-4 bg-transparent border-2 border-white/40 text-white rounded-xl font-bold hover:bg-white/10 transition-all text-center">
                        Talk to an Advisor
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

        </div>
      </main >
    </>
  )
}