export const ADMIN_ROUTES = [
    { name: "Dashboard", path: "/admin", icon: "dashboard" },
    { name: "Demo Bookings", path: "/admin/schedule", icon: "calendar_month" },
    { name: "Students", path: "/admin/students", icon: "school" },
    { name: "Teachers", path: "/admin/teachers", icon: "co_present" },
    { name: "Study Materials", path: "/admin/materials", icon: "library_books" },
];

export const TEACHER_ROUTES = [
    { name: "Dashboard", path: "/teacher", icon: "dashboard" },
    { name: "My Students", path: "/teacher/students", icon: "groups" },
    { name: "Availability", path: "/teacher/availability", icon: "schedule" },
    { name: "My Profile", path: "/teacher/profile", icon: "person" },
];

export const STUDENT_ROUTES = [
    { name: "Dashboard", path: "/student", icon: "dashboard" },
    { name: "Assignments", path: "/student/assignments", icon: "assignment" },
    { name: "Study Materials", path: "/student/materials", icon: "menu_book" },
    { name: "My Profile", path: "/student/profile", icon: "person" },
];
