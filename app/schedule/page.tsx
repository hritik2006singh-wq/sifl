import Link from 'next/link';

export default function SchedulePage() {
    return (
        <main className="pt-24 pb-16 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto px-6">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Class Schedule</h1>
                    <p className="text-lg text-slate-600">Find the perfect time for your language mastery journey.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Upcoming Batches</h2>
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold">Updated Weekly</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {/* German */}
                        <div className="p-8 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">German A1 Foundations</h3>
                                <p className="text-slate-500 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">event</span> Mon, Wed, Fri
                                    <span className="material-symbols-outlined text-sm ml-4">schedule</span> 18:00 - 20:00
                                </p>
                                <div className="flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">Online</span>
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">Seats Available</span>
                                </div>
                            </div>
                            <Link href="/consultation" className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:shadow-lg transition-all w-full md:w-auto text-center">
                                Reserve Seat
                            </Link>
                        </div>

                        {/* English */}
                        <div className="p-8 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">English IELTS Prep Intensive</h3>
                                <p className="text-slate-500 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">event</span> Weekends (Sat, Sun)
                                    <span className="material-symbols-outlined text-sm ml-4">schedule</span> 10:00 - 14:00
                                </p>
                                <div className="flex gap-2">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">On-Campus</span>
                                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">Filling Fast</span>
                                </div>
                            </div>
                            <Link href="/consultation" className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:shadow-lg transition-all w-full md:w-auto text-center">
                                Reserve Seat
                            </Link>
                        </div>

                        {/* Japanese */}
                        <div className="p-8 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Japanese JLPT N5</h3>
                                <p className="text-slate-500 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">event</span> Tue, Thu
                                    <span className="material-symbols-outlined text-sm ml-4">schedule</span> 19:00 - 21:00
                                </p>
                                <div className="flex gap-2">
                                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">Online</span>
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">Seats Available</span>
                                </div>
                            </div>
                            <Link href="/consultation" className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:shadow-lg transition-all w-full md:w-auto text-center">
                                Reserve Seat
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
