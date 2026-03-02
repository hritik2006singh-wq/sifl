import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Static Data for the Prototype 
const countryData: Record<string, any> = {
    germany: {
        name: "Germany",
        title: "Study in Germany from India | Language & Visa Guide | SIFL",
        desc: "Prepare for your study in Germany from India. Master German language requirements, visa processes, and living costs with certified trainers.",
        languageReq: "German B1/B2 (Goethe-Zertifikat)",
        avgCost: "₹8L - ₹12L / Year (Living Expenses, Public Univs oft Free)",
        visaSuccess: "98%",
        heroImg: "/images/programs/german.jpg",
    },
    singapore: {
        name: "Singapore",
        title: "Study in Singapore for Indian Students | IELTS Requirements | SIFL",
        desc: "Aiming for NUS or NTU? Crack your IELTS requirement for Singapore study visas with SIFL's structured coaching for Indian students.",
        languageReq: "IELTS Band 6.5+ (No band less than 6.0)",
        avgCost: "₹15L - ₹25L / Year (Tuition + Living)",
        visaSuccess: "95%",
        heroImg: "/images/programs/english.jpg",
    },
    france: {
        name: "France",
        title: "Study in France from India | DELF Language Coaching | SIFL",
        desc: "Targeting top business or fashion schools in France? Achieve your French DELF certification to clear visa guidelines securely with SIFL.",
        languageReq: "French B2 (DELF) or IELTS 6.5+",
        avgCost: "₹10L - ₹18L / Year (Tuition + Living)",
        visaSuccess: "92%",
        heroImg: "/images/programs/french.jpg",
    },
    malaysia: {
        name: "Malaysia",
        title: "Study in Malaysia from India | IELTS Requirements | SIFL",
        desc: "Accessible, high-quality Asian hubs. Find out the IELTS requirements to study in Malaysia for Indian students with SIFL.",
        languageReq: "IELTS Band 6.0+",
        avgCost: "₹6L - ₹12L / Year (Tuition + Living)",
        visaSuccess: "99%",
        heroImg: "/images/programs/japanese.jpg",
    }
};

type Props = {
    params: { country: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const safeCountry = (params?.country || "").toLowerCase();
    const data = countryData[safeCountry];
    if (!data) return { title: "Country Not Found" };

    return {
        title: data.title,
        description: data.desc,
        alternates: {
            canonical: `https://sifl.edu.in/study-abroad/${params.country}`
        }
    };
}

export default function CountryPage({ params }: Props) {
    if (!params?.country) { notFound(); }
    const safeCountry = (params.country || "").toLowerCase();
    const data = countryData[safeCountry];
    if (!data) return <div className="p-20 text-center text-3xl font-bold">Country Not Found</div>;

    return (
        <main className="min-h-screen bg-white">
            <header className="relative pt-32 pb-24 md:pt-40 md:pb-32 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: `url(${data.heroImg})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <Link href="/study-abroad" className="inline-flex items-center gap-2 text-emerald-400 font-bold text-sm tracking-widest uppercase mb-6 hover:text-emerald-300">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Destinations
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
                        Study in {data.name} from India
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl font-medium">
                        {data.desc}
                    </p>
                </div>
            </header>

            <section className="py-20 px-6 max-w-5xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                        <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined">translate</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Language Requirement</h3>
                        <p className="text-slate-600 font-medium">{data.languageReq}</p>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                        <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Average Cost (INR)</h3>
                        <p className="text-slate-600 font-medium">{data.avgCost}</p>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                        <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined">verified</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Visa Success via SIFL</h3>
                        <p className="text-slate-600 font-medium">{data.visaSuccess} Record</p>
                    </div>
                </div>

                <div className="prose prose-lg prose-emerald max-w-none">
                    <h2>Why Study in {data.name}?</h2>
                    <p>
                        With world-class unversities and post-study work visa opportunities, {data.name} has become a top choice for ambitious Indian students.
                        However, navigating the admissions and visa process requires strict adherence to language proficiencies.
                    </p>
                    <h2>Language Requirements for {data.name} Visa</h2>
                    <p>
                        Clearing {data.languageReq} is not just an admission requirement; it is a critical component of the student visa approval process.
                        At SIFL, our certified trainers map your study plan exactly to the timelines of university intakes to ensure your certification arrives on time.
                    </p>

                    <div className="mt-12 bg-emerald-50 rounded-3xl p-8 border border-emerald-100 text-center md:text-left flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1">
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Ready to target {data.name}?</h3>
                            <p className="text-slate-600">Join 100+ Indian students who have successfully placed abroad through our rigorous linguistic methodology.</p>
                        </div>
                        <Link href="/demo-booking" className="whitespace-nowrap px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg hover:-translate-y-1 transition-all">
                            Book Free Demo
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
