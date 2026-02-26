import { IMAGES } from './images';

export const aboutContent = {
    hero: {
        title: 'Excellence in Language Education',
        subtitle: 'Since our establishment, SIFL has been the premier destination for ambitious learners aiming for global fluency and academic excellence.'
    },
    missionVision: {
        mission: {
            title: 'Our Mission',
            description: 'To provide unparalleled language education that empowers students to cross cultural boundaries and achieve their global ambitions.'
        },
        vision: {
            title: 'Our Vision',
            description: 'To be the globally recognized institution of choice for comprehensive, culturally aware, and outcome-oriented language learning.'
        }
    },
    faculty: {
        title: 'Our Distinguished Faculty',
        subtitle: 'Learn from industry veterans, native speakers, and passionate educators.',
        members: [
            { name: 'Dr. Anna Weber', role: 'Head of German Studies', image: IMAGES.faculty.faculty1, credentials: 'Ph.D. in Linguistics' },
            { name: 'Prof. James Croft', role: 'Director of English Programs', image: IMAGES.faculty.faculty2, credentials: 'M.A. TESOL' },
            { name: 'Mme. Claire Dubois', role: 'Senior French Instructor', image: IMAGES.faculty.faculty3, credentials: 'Delf/Dalf Examiner' },
        ]
    },
    achievements: {
        title: 'Institutional Milestones',
        items: [
            { year: '2010', text: 'Foundation of SIFL Institute' },
            { year: '2015', text: 'Accreditation by Global Language Council' },
            { year: '2020', text: 'Launch of Online Global Campus' },
            { year: '2023', text: 'Award for Educational Excellence' }
        ]
    }
};
