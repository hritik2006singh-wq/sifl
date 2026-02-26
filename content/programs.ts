import { IMAGES } from './images';

export const programsContent = {
    hero: {
        title: 'Language Programs',
        subtitle: 'Choose from our structured learning paths tailored to your academic or professional goals.'
    },
    highlighted: [
        {
            id: 'german',
            title: 'German Proficiency Program',
            level: 'A1 - C2',
            duration: '12-48 Weeks',
            description: 'Our flagship German program prepares you for Goethe-Zertifikat and TestDaF, perfect for higher education or careers in the DACH region.',
            image: IMAGES.programs.german,
            features: ['Exam Preparation', 'Cultural Workshops', 'Conversation Clubs']
        },
        {
            id: 'english',
            title: 'Advanced English Excellence',
            level: 'B1 - C2',
            duration: '8-36 Weeks',
            description: 'Master professional and academic English. Preparation for IELTS, TOEFL, and Cambridge exams with native-speaking experts.',
            image: IMAGES.programs.english,
            features: ['Business English', 'Academic Writing', 'Accent Reduction']
        }
    ],
    otherPrograms: [
        {
            id: 'french',
            title: 'French Immersion',
            level: 'A1 - C1',
            description: 'Structured path to DELF/DALF certification.',
            image: IMAGES.programs.french
        },
        {
            id: 'spanish',
            title: 'Spanish Communication',
            level: 'A1 - B2',
            description: 'Engaging curriculum for DELE certification.',
            image: IMAGES.programs.spanish
        }
    ]
};
