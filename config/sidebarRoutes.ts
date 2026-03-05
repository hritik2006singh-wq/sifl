export const ADMIN_ROUTES = [
    { name: "Overview", icon: "dashboard", path: "/admin" },
    { name: "Students", icon: "group", path: "/admin/students" },
    { name: "Teachers", icon: "school", path: "/admin/teachers" },
    { name: "Demo Bookings", icon: "event_available", path: "/admin/demo-bookings", requiresAction: true },
    { name: "Manage Schedule", icon: "schedule", path: "/admin/manage-schedule" },
    { name: "Study Materials", icon: "video_library", path: "/admin/materials" },
    { name: "Blog Manager", icon: "post", path: "/admin/blogs" }
];

export const TEACHER_ROUTES = [
    { name: "Overview", icon: "dashboard", path: "/teacher/dashboard" },
    { name: "My Students", icon: "group", path: "/teacher/students" },
    { name: "Schedule", icon: "event_available", path: "/teacher/availability" },
    { name: "Profile", icon: "person", path: "/teacher/profile" }
];

export const STUDENT_ROUTES = [
    { name: "Overview", icon: "home", path: "/student/dashboard" },
    { name: "My Materials", icon: "video_library", path: "/student/materials" },
    { name: "Tasks & Tests", icon: "assignment", path: "/student/assignments" },
    { name: "Profile", icon: "person", path: "/student/profile" }
];
