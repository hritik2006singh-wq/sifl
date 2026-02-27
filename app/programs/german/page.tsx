import ProgramView from "@/components/ProgramView";

export default function GermanProgram() {
    return (
        <ProgramView
            language="German"
            duration="4 - 12 Months (Depending on Level)"
            levelBreakdown={["A1", "A2", "B1", "B2", "C1", "C2 (Goethe Standard)"]}
            curriculumOverview="Master German for academic, professional, and daily communication in Germany, Austria, and Switzerland. Tailored for healthcare and engineering professionals."
            teachingMethod="Immersive classroom interactions with interactive digital labs. Focus on Goethe-Institut examination patterns."
            timeline={[
                { step: "Foundations (A1-A2)", desc: "Build basic vocabulary and sentence structure." },
                { step: "Intermediate (B1)", desc: "Navigate daily scenarios comfortably." },
                { step: "Advanced (B2)", desc: "Professional competency suitable for technical jobs." },
                { step: "Mastery (C1-C2)", desc: "Near-native fluency for university level education." },
            ]}
        />
    );
}
