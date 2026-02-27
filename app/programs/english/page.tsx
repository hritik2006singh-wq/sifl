import ProgramView from "@/components/ProgramView";

export default function EnglishProgram() {
    return (
        <ProgramView
            language="English"
            duration="3 - 6 Months Intensive"
            levelBreakdown={["CEFR A1", "CEFR A2", "CEFR B1", "CEFR B2", "CEFR C1", "CEFR C2"]}
            curriculumOverview="Comprehensive IELTS and Business English training to master global communication and ace your proficiency exams."
            teachingMethod="Scenario-based functional learning combining speaking, listening, reading, and writing skills."
            timeline={[
                { step: "Beginner", desc: "Basic survival communication." },
                { step: "Intermediate", desc: "Fluent everyday conversations." },
                { step: "Advanced / IELTS Prep", desc: "Exam specific strategies and mock tests." },
                { step: "Mastery", desc: "Business communication and leadership." },
            ]}
        />
    );
}
