export const bookingContent = {
    header: {
        title: 'Book a Consultation',
        subtitle: 'Schedule a session with our academic advisors to plan your language journey.',
    },
    form: {
        meetingTypes: [
            { id: 'online', label: 'Online Meeting' },
            { id: 'in-person', label: 'In-Person Visit' }
        ],
        languages: [
            { value: 'german', label: 'German Program' },
            { value: 'english', label: 'English Program' },
            { value: 'french', label: 'French Program' },
            { value: 'spanish', label: 'Spanish Program' }
        ],
        levels: [
            { value: 'beginner', label: 'Complete Beginner (A1)' },
            { value: 'elementary', label: 'Elementary (A2)' },
            { value: 'intermediate', label: 'Intermediate (B1/B2)' },
            { value: 'advanced', label: 'Advanced (C1/C2)' },
            { value: 'notsure', label: 'Not Sure - Need Assessment' }
        ],
        timeSlots: [
            '09:00 AM', '10:30 AM', '01:00 PM', '03:00 PM', '04:30 PM'
        ]
    },
    summary: {
        title: 'Booking Summary',
        noSelection: 'Please complete the form to see your booking summary.',
        confirmButton: 'Confirm Booking'
    }
};
