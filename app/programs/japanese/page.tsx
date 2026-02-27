import ProgramView from "@/components/ProgramView";

export default function JapaneseProgram() {
    return (
        <ProgramView
            language="Japanese"
            duration="6 - 18 Months"
            levelBreakdown={["JLPT N5", "JLPT N4", "JLPT N3", "JLPT N2", "JLPT N1"]}
            curriculumOverview="A structured pathway starting from basic Hiragana and Katakana to mastery of complex Kanji, fully aligned with the JLPT framework."
            teachingMethod="Strict progressive curriculum involving extensive reading, listening practice, and immersive Japanese business etiquette."
            timeline={[
                { step: "N5 Level", desc: "Master Hiragana, Katakana, and basic Kanji." },
                { step: "N4 Level", desc: "Basic conversations and everyday life vocabulary." },
                { step: "N3 Level", desc: "Intermediate Japanese bridging into practical fluency." },
                { step: "N2-N1 Level", desc: "Advanced language proficiency for professional and academic success in Japan." },
            ]}
        />
    );
}
