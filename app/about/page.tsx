import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="pt-16 bg-background-light text-slate-900">

      {/* HERO SECTION */}
      <section className="px-6 lg:px-40 py-20">
        <div className="mx-auto max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">

          <div className="space-y-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              Our Institution
            </span>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Cultivating the next generation of global pioneers.
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed">
              The Strategic Institute for Future Leaders (SIFL) is a premier academic institution dedicated to cultivating global leadership through rigorous research and innovative teaching methodologies.
            </p>
          </div>

          <div
            className="aspect-square rounded-xl overflow-hidden shadow-2xl bg-cover bg-center"
            style={{
              backgroundImage:
                "url('/images/faculty/hero.jpg')"
            }}
          />
        </div>
      </section>

      {/* FACULTY SECTION */}
      <section className="bg-primary/5 px-6 lg:px-40 py-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Distinguished Faculty</h2>
            <div className="mt-2 h-1.5 w-20 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Faculty 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5">
              <div
                className="aspect-square rounded-lg mb-6 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('/images/faculty/uncle-ji.jpeg')"
                }}
              />
              <h3 className="text-xl font-bold">Mr. Tuteja</h3>
              <p className="text-primary text-sm mb-3">  Co-Founder | Investor | Mentor | </p>
              <p className="text-slate-600 text-sm">
                A results-driven investor backing education with disciplined capital, strategic oversight, and a mandate to scale quality learning outcomes.
              </p>
            </div>

            {/* Faculty 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5">
              <div
                className="aspect-square rounded-lg mb-6 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('/images/faculty/sristhi-di.jpeg')"
                }}
              />
              <h3 className="text-xl font-bold">Ms. Srishti</h3>
              <p className="text-primary text-sm mb-3">Founder | Lead German Teacher</p>
              <p className="text-slate-600 text-sm">
                Certified German language teacher with C1 from the Goethe-Institut and a Diploma in German from the University of Delhi.
              </p>
            </div>

            {/* Faculty 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5">
              <div
                className="aspect-square rounded-lg mb-6 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('/images/faculty/english.jpeg')"
                }}
              />
              <h3 className="text-xl font-bold">Marcus Thorne, PhD</h3>
              <p className="text-primary text-sm mb-3">Lead English Teacher</p>
              <p className="text-slate-600 text-sm">
                Specializes in macro-economic forecasting and emerging market dynamics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="px-6 lg:px-40 py-20">
        <div className="mx-auto max-w-[1200px] grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          <div className="p-10 rounded-xl bg-white border border-primary/10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-primary/10 transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-8xl" style={{}}>
                visibility
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-slate-900" style={{}}>
              Our Vision
            </h3>
            <p className="text-slate-600 leading-relaxed relative z-10" style={{}}>
              To be the global benchmark for leadership education, where academic
              rigor meets practical wisdom, creating a more sustainable and
              equitable future for all humanity through enlightened leadership.
            </p>
          </div>
          <div className="p-10 rounded-xl bg-slate-900 text-white shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-primary/20 transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-8xl" style={{}}>
                rocket_launch
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{}}>
              Our Mission
            </h3>
            <p className="text-slate-300 leading-relaxed relative z-10" style={{}}>
              We provide a transformative educational experience that equips
              aspiring leaders with the critical thinking skills, ethical
              foundation, and global perspective required to lead in a complex
              world.
            </p>
          </div>
        </div>
      </section>
      <section className="bg-slate-50 px-6 lg:px-40 py-20 border-t border-slate-100">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-slate-900" style={{}}>
                Student Achievements
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed" style={{}}>
                Our students aren't just preparing for the future; they are actively
                shaping it through innovative projects and global recognition.
              </p>
            </div>
            <Link href="/success-stories" className="font-semibold text-primary hover:text-primary-hover whitespace-nowrap hidden md:block">
              View All Stories →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-100">
              <div
                className="h-48 bg-slate-200 overflow-hidden"
                data-alt="Group of students working on a project together"
                style={{
                  backgroundImage:
                    `url('/brand/faculty/leader-1.jpg')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center"
                }}
              />
              <div className="p-6">
                <div
                  className="text-primary text-xs font-bold uppercase mb-2"
                  style={{}}
                >
                  Sustainable Dev Award
                </div>
                <h4 className="font-bold text-lg text-slate-900 mb-2" style={{}}>
                  Global Impact Challenge 2023
                </h4>
                <p className="text-sm text-slate-600 line-clamp-2" style={{}}>
                  Our student team won first place for their modular water
                  filtration system designed for rural communities.
                </p>
              </div>
            </div>
            <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-100">
              <div
                className="h-48 bg-slate-200 overflow-hidden"
                data-alt="Corporate boardroom meeting with diverse people"
                style={{
                  backgroundImage:
                    `url('/brand/faculty/leader-2.jpg')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center"
                }}
              />
              <div className="p-6">
                <div
                  className="text-primary text-xs font-bold uppercase mb-2"
                  style={{}}
                >
                  Fellowship
                </div>
                <h4 className="font-bold text-lg text-slate-900 mb-2" style={{}}>
                  Rhodes Scholarship Recipient
                </h4>
                <p className="text-sm text-slate-600 line-clamp-2" style={{}}>
                  Julian Chen (Class of '24) awarded the prestigious scholarship for
                  his research in behavioral economics.
                </p>
              </div>
            </div>
            <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-100">
              <div
                className="h-48 bg-slate-200 overflow-hidden"
                data-alt="Modern office collaborative workspace"
                style={{
                  backgroundImage:
                    `url('/brand/faculty/leader-3.jpg')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center"
                }}
              />
              <div className="p-6">
                <div
                  className="text-primary text-xs font-bold uppercase mb-2"
                  style={{}}
                >
                  Innovation
                </div>
                <h4 className="font-bold text-lg text-slate-900 mb-2" style={{}}>
                  Incubator Launch: EcoTrack
                </h4>
                <p className="text-sm text-slate-600 line-clamp-2" style={{}}>
                  Three senior students successfully launched a carbon-tracking
                  startup, raising $2M in seed funding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}