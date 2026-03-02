import Link from "next/link";

export default function BlogCTABlock() {
    return (
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center text-white my-12 shadow-xl border border-slate-800">
            <h3 className="text-3xl font-black mb-4">Ready to Accelerate Your Global Journey?</h3>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                Stop guessing your linguistic requirements. Speak directly with our SIFL language master trainers to map your exact roadmap to Germany, France, or Singapore.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link href="/demo-booking" className="w-full sm:w-auto px-10 py-4 bg-emerald-600 font-bold rounded-xl hover:bg-emerald-500 transition-all text-white active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    Book Free Demo Consultation
                </Link>
                <Link href="/study-abroad" className="w-full sm:w-auto px-10 py-4 font-bold rounded-xl border border-white/20 hover:bg-white/10 transition-all text-white active:scale-95">
                    View Country Requirements
                </Link>
            </div>
            {/* Direct WhatsApp Call to Action embedded underneath for higher conversions */}
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-400">
                <span className="material-symbols-outlined text-emerald-500 text-[18px]">chat</span>
                Have quick questions? <a href="https://wa.me/your_number_here" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors">Chat on WhatsApp</a>
            </div>
        </div>
    );
}
