export const dashboardContent = {
    sidebar: {
        items: [
            { id: 'dashboard', label: 'Dashboard', path: '/portal' },
            { id: 'courses', label: 'My Courses', path: '/portal/courses' },
            { id: 'results', label: 'Test Results', path: '/portal/results' },
            { id: 'schedule', label: 'Schedule', path: '/portal/schedule' },
            { id: 'messages', label: 'Messages', path: '/portal/messages' },
            { id: 'settings', label: 'Settings', path: '/portal/settings' },
        ]
    },
    welcome: {
        greeting: 'Welcome back, Student!',
        message: 'You have 2 assignments due this week.'
    },
    metrics: [
        { label: 'Overall Progress', value: '78%' },
        { label: 'Classes Attended', value: '24/30' },
        { label: 'Current Level', value: 'B2.1' }
    ],
    recentTests: [
        { date: 'Oct 12', name: 'German Grammar Midterm', score: '92%' },
        { date: 'Sep 28', name: 'Vocabulary Quiz', score: '88%' },
        { date: 'Sep 15', name: 'Speaking Assessment', score: '85%' },
    ],
    assignmentsDue: [
        { title: 'Essay: Umwelt und Gesellschaft', due: 'Tomorrow, 11:59 PM', course: 'German B2' },
        { title: 'Listening Comprehension Exercise', due: 'Friday, 10:00 AM', course: 'German B2' }
    ],
    scheduleWidget: [
        { time: '10:00 AM - 11:30 AM', class: 'Advanced Conversation', location: 'Room 4B / Zoom' },
        { time: '02:00 PM - 03:30 PM', class: 'Grammar Intensive', location: 'Room 2A' }
    ]
};
