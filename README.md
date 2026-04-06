# CMS — Content & Student Management System

A full-featured, role-based CMS built for educational institutions to manage students, teachers, scheduling, study materials, and public content from a single unified platform.

> **Example Client:** This system was built for and is currently deployed for **SIFL (School of International Foreign Languages)** — a language learning institute offering programs in English, French, German, Spanish, Japanese, and more.

---

## Overview

CMS is a Next.js web application that combines a public-facing website with a powerful internal management dashboard. It serves three distinct user roles — **Admins**, **Teachers**, and **Students** — each with their own tailored experience and access controls.

The system handles everything from enrolling students and assigning teachers, to scheduling demo sessions, uploading study materials, and publishing blog content — all through a clean, responsive UI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth & Database | Firebase (Auth + Firestore) |
| File Storage | AWS S3 + Presigned URLs |
| Charts | Chart.js + react-chartjs-2 |
| Animations | Lottie React |
| Notifications | React Hot Toast + Sonner |
| Icons | Lucide React |

---

## Features

### Admin Panel
- **Dashboard Overview** — Live metrics: total students, active students, teachers, pending demo bookings, today's demos, study materials count, and admins. Includes an enrollment trend chart.
- **Student Management** — Create, view, and manage student profiles. Stores academic info (language, level, assigned teacher), demographics, contact details, emergency contacts, and billing status.
- **Teacher Management** — Manage teacher profiles and assignments.
- **Demo Booking Management** — View and action incoming demo session requests. Real-time pending booking counter shown in the sidebar.
- **Schedule Manager** — Manage and configure class schedules.
- **Study Materials** — Upload and organize learning resources accessible to students.
- **Blog Manager** — Full CRUD blog editor for publishing content to the public website.
- **Settings** — Platform-wide configuration.

### Teacher Panel
- **Dashboard** — Overview of assigned students and upcoming schedule.
- **My Students** — View and manage the teacher's own student roster.
- **Availability / Schedule** — Set and view availability for classes and demos.
- **Profile** — Manage personal profile.

### Student Panel
- **Dashboard** — Personal overview of enrolled program and progress.
- **My Materials** — Access study materials uploaded by admin/teachers.
- **Tasks & Tests** — View and complete assignments.
- **Profile** — Manage personal details.

### Public Website
- Multi-language program pages (English, French, German, Spanish, Japanese, and more)
- Hero sections with auto-sliding carousels
- Faculty profiles
- About page
- Demo booking form for prospective students
- Blog / articles section

---

## Authentication & Security

Authentication is handled through **Firebase Auth** with a server-enforced role system:

- After login, the client sends a Firebase ID token to `POST /api/auth/set-role`
- The server verifies the token using Firebase Admin SDK and sets an **HttpOnly cookie** (`user_role`) that cannot be forged or read by client-side JavaScript
- Middleware uses this cookie to protect role-specific routes (`/admin/*`, `/teacher/*`, `/student/*`)
- On logout, `DELETE /api/auth/set-role` immediately expires the cookie

Valid roles: `admin`, `teacher`, `student`

---

## Project Structure

```
cms/
├── app/
│   ├── admin/              # Admin dashboard pages
│   │   ├── blogs/          # Blog CRUD
│   │   ├── demo-bookings/  # Demo session management
│   │   ├── manage-schedule/
│   │   ├── materials/      # Study materials
│   │   ├── settings/
│   │   ├── students/       # Student management
│   │   └── teachers/       # Teacher management
│   ├── api/                # API routes (Next.js Route Handlers)
│   │   ├── admin/
│   │   ├── auth/           # Token verification & role cookie
│   │   ├── blogs/
│   │   ├── bookings/
│   │   └── ...
│   ├── student/            # Student portal pages
│   ├── teacher/            # Teacher portal pages
│   └── (public pages)      # Home, About, Programs, etc.
├── components/             # Shared UI components
├── config/
│   ├── branding.ts         # Logo & brand assets config
│   └── sidebarRoutes.ts    # Navigation routes per role
├── hooks/                  # Custom React hooks (role guards, etc.)
├── lib/
│   ├── firebase-client.ts  # Firebase client SDK init
│   ├── firebase-admin.ts   # Firebase Admin SDK init
│   └── ...
├── public/
│   └── images/             # Static assets (flags, programs, faculty, UI)
├── services/               # Data access layer (Firestore)
│   ├── blog.service.ts
│   ├── booking.service.ts
│   ├── student.service.ts
│   ├── teacher.service.ts
│   └── user.service.ts
├── types/                  # TypeScript interfaces
└── utils/                  # Helpers (slugify, etc.)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project (Firestore + Authentication enabled)
- An AWS S3 bucket (for file uploads)

### Installation

```bash
git clone <your-repo-url>
cd cms
npm install
```

### Environment Variables

Create a `.env.local` file in the root with the following:

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-side)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# AWS S3
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm run start
```

> **Note:** If you encounter TypeScript or Turbopack issues during build, use the webpack fallback:
> ```bash
> npm run build:webpack
> ```

---

## Branding & White-Label Configuration

The system is designed to be easily rebranded for any institution. Update `config/branding.ts` to point to your institution's logo:

```ts
export const BRANDING = {
  dashboardLogo: "/images/your-logo.jpg"
};
```

Navigation sidebar routes are centrally configured in `config/sidebarRoutes.ts` and can be extended per role without modifying layout components.

---

## Seeding an Admin User

A helper script is included to promote an existing Firebase user to admin:

```bash
node setAdmin.js
```

Update the script with the target user's UID before running.

---

## Deployment

The recommended deployment target is **Vercel**:

1. Push your repository to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add all environment variables in the Vercel dashboard
4. Deploy

Alternatively, any Node.js-capable hosting environment works since this is a standard Next.js application.

---

## Example Client: SIFL

**SIFL (School of International Foreign Languages)** is the founding client for which this CMS was originally built. SIFL uses the platform to:

- Manage enrollment across 6+ language programs (English, French, German, Spanish, Japanese, and more)
- Run demo booking campaigns for prospective students
- Assign dedicated teachers to student batches
- Distribute study materials and track learning progress
- Publish program updates and success stories to their public website

The SIFL deployment serves as the reference implementation for this CMS, demonstrating the full feature set in a live production environment.

---

## License

Private / Proprietary. All rights reserved.
