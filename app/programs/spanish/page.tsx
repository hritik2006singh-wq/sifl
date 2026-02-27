import ProgramView from "@/components/ProgramView";

export default function SpanishProgram() {
    return (
        <ProgramView
            language="Spanish"
            duration="3 - 9 Months"
            levelBreakdown={["CEFR A1", "CEFR A2", "CEFR B1", "CEFR B2", "CEFR C1", "CEFR C2"]}
            curriculumOverview="Master Spanish for business and global travel. DELE certification preparation with focus on practical fluency and Latin American and European variations."
            teachingMethod="Interactive sessions focused on rapid conversational acquisition and business etiquette."
            timeline={[
                { step: "Beginner", desc: "Fundamentals of Spanish grammar and vocabulary." },
                { step: "Intermediate", desc: "Fluid conversation and daily interactions." },
                { step: "Advanced", desc: "Professional communication suited for business." },
                { step: "DELE Prep", desc: "Intensive exam preparation and mock assessments." },
            ]}
        />
    );
}
