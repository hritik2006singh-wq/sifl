import { IMAGES } from './images';

export const homeContent = {
    hero: {
        headline: 'Master Languages, Shape Your Future',
        subheadline: 'SIFL is a premium institution dedicated to excellence in global language education.',
        primaryCta: 'Explore Programs',
        secondaryCta: 'Book a Consultation',
        image: IMAGES.hero.main,
    },
    trustMetrics: [
        { value: '15+', label: 'Years of Excellence' },
        { value: '10k+', label: 'Successful Alumni' },
        { value: '50+', label: 'Expert Faculty' },
        { value: '100%', label: 'Commitment' },
    ],
    programsPreview: {
        title: 'Our Premium Language Programs',
        subtitle: 'Immersive, structured, and certified courses designed for real-world fluency.',
    },
    advantage: {
        title: 'The SIFL Advantage',
        points: [
            { title: 'Immersive Curriculum', description: 'Experience language learning through cultural immersion and practical scenarios.' },
            { title: 'Global Certification', description: 'Our courses prepare you for internationally recognized language exams.' },
            { title: 'Expert Instructors', description: 'Learn from native speakers and highly qualified language educators.' },
        ]
    },
    successStories: {
        title: 'Student Success Stories',
        stories: [
            { name: 'Sarah M.', program: 'German B2', quote: 'SIFL gave me the confidence to move to Berlin and start my engineering career.', image: IMAGES.students.student1 },
            { name: 'David L.', program: 'French C1', quote: 'The interactive classes and cultural insights were absolutely game-changing.', image: IMAGES.students.student2 },
        ]
    },
    journeySteps: {
        title: 'Your Journey to Fluency',
        steps: [
            { number: '01', title: 'Consultation', description: 'Discuss your goals with our advisors.' },
            { number: '02', title: 'Assessment', description: 'Determine your current proficiency level.' },
            { number: '03', title: 'Enrollment', description: 'Join the perfect tailored program.' },
            { number: '04', title: 'Success', description: 'Achieve your desired fluency and certification.' },
        ]
    },
    cta: {
        title: 'Ready to Begin Your Language Journey?',
        subtitle: 'Take the first step towards global communication today.',
        buttonText: 'Book Your Free Demo'
    }
};
