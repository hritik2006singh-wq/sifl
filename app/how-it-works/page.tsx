export default function WhySiflPage() {
    return (

        <><main className="pt-16 bg-background-light text-slate-900"></main><div className="min-h-screen flex flex-col bg-gray-50">

            <main className="flex-grow py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                    </div>

                    {/* Timeline Section */}
                    <div className="mb-20 pt-14 pb-12">
                        <h2 className="text-2xl font-bold text-center mb-11 text-slate-900">Your Journey to Fluency</h2>
                        <div className="w-full  pb-8" style={{ scrollbarWidth: 'none' }}>
                            <div className="relative flex flex-col md:flex-row md:justify-between items-center gap-10 md:gap-0 w-full px-6 md:px-16">
                                {/* Connecting Line */}
                                <div className="hidden md:block absolute top-7 left-0 right-0 h-[2px] bg-slate-200 z-0" />

                                {[
                                    { title: 'Book Call', icon: 'phone_in_talk' },
                                    { title: 'Demo Class', icon: 'smart_display' },
                                    { title: 'Enroll', icon: 'how_to_reg' },
                                    { title: 'Learn', icon: 'menu_book' },
                                    { title: 'Mock Exams', icon: 'quiz' },
                                    { title: 'Book Exam', icon: 'event_available' },
                                    { title: 'Certify', icon: 'workspace_premium' }
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="relative z-10 flex flex-col items-center group cursor-pointer w-full md:w-24"
                                    >
                                        <div className="relative flex items-center justify-center">

                                            {/* Icon Circle */}
                                            <div className="
        w-14 h-14
        rounded-full
        bg-white
        border-2 border-primary/30
        flex items-center justify-center
        shadow-md
        transition-all duration-300
        group-hover:scale-110
        group-hover:-translate-y-3 transition-all duration-300 ease-out    
        group-hover:shadow-xl   
        z-20
      ">
                                                <span className="material-symbols-outlined text-primary text-2xl">
                                                    {item.icon}
                                                </span>
                                            </div>

                                        </div>

                                        <span className="mt-4 text-xs font-semibold text-slate-600 text-center uppercase tracking-wider">
                                            {item.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Expandable Language Cards */}
                    <div className="mb-20">
                        <h2 className="text-2xl font-bold text-center mb-8 text-slate-900">Program Quick Facts</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-full md:max-w-5xl mx-auto">
                            {[
                                { lang: 'German', desc: 'A1 to C2 Goethe Standard. Focus on Engineering and Healthcare relocation to DACH region with intensive speaking labs.' },
                                { lang: 'English', desc: 'IELTS/PTE preparation. Covers Academic & General training modules utilizing official exam methodologies.' },
                                { lang: 'French', desc: 'DELF/DALF alignment. Focuses on conversational diplomacy, arts, and Canadian immigration pathways.' },
                                { lang: 'Spanish', desc: 'DELE preparation. Covering European & Latin American business Spanish to excel in international trade.' },
                                { lang: 'Japanese', desc: 'JLPT N5 to N1. Incorporates Hiragana, Katakana, Kanji, and crucial business etiquette for modern Japan.' }
                            ].map((prog, i) => (
                                <details key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer group transition-all duration-300 hover:border-primary/50 hover:shadow-md">
                                    <summary className="font-bold text-lg text-slate-800 outline-none list-none flex flex-col md:flex-row justify-between items-center group-open:text-primary">
                                        {prog.lang} Language
                                        <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-primary">expand_more</span>
                                    </summary>
                                    <div className="mt-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {prog.desc}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div></>
    )
}