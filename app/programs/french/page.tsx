import ProgramView from "@/components/ProgramView";

export default function FrenchProgram() {
    return (
        <ProgramView
            language="French"
            duration="4 - 10 Months"
            levelBreakdown={["CEFR A1", "CEFR A2", "CEFR B1", "CEFR B2", "CEFR C1", "CEFR C2"]}
            curriculumOverview="Comprehensive French language training optimized for DELF and DALF certification. Perfect for students and professionals looking to relocate to France, Canada, or Francophone Africa."
            teachingMethod="Focus on diplomacy, arts, and conversational fluency with immersive cultural modules."
            timeline={[
                { step: "Beginner", desc: "Basic vocabulary and pronunciation." },
                { step: "Intermediate", desc: "Conversational fluency and writing." },
                { step: "Advanced", desc: "Complex ideas and business terminology." },
                { step: "Certification Prep", desc: "Targeted DELF/DALF practice." },
            ]}
        />
    );
}
