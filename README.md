<div align="center">

# 🎓 CMS — Content & Student Management System

**A role-based, full-stack CMS built for educational institutions — manage students, teachers, scheduling, materials, and public content from one unified platform.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.x-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![AWS S3](https://img.shields.io/badge/AWS_S3-Storage-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)](.)

> 🏫 **Example Client:** Built for and deployed at **SIFL (School of International Foreign Languages)** — a language learning institute offering programs in English, French, German, Spanish, Japanese, and more.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Authentication & Security](#-authentication--security)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Branding & White-Label](#-branding--white-label-configuration)
- [Deployment](#-deployment)
- [Example Client: SIFL](#-example-client-sifl)

---

## 🌟 Overview

CMS is a Next.js web application combining a **public-facing website** with a powerful **internal management dashboard**. It serves three distinct user roles — **Admins**, **Teachers**, and **Students** — each with their own tailored experience and access controls.

The system handles everything from enrolling students and assigning teachers, to scheduling demo sessions, uploading study materials, and publishing blog content — all through a clean, responsive UI.

---

## ✨ Features

| Area | Feature | Description |
|---|---|---|
| 🛠️ Admin | **Dashboard Overview** | Live metrics: students, teachers, pending demos, materials count + enrollment trend chart |
| 🛠️ Admin | **Student Management** | Full student profiles — academic info, demographics, contact, billing |
| 🛠️ Admin | **Teacher Management** | Teacher profiles and student assignments |
| 🛠️ Admin | **Demo Booking Management** | Real-time pending booking counter; review and action requests |
| 🛠️ Admin | **Schedule Manager** | Configure and manage class schedules |
| 🛠️ Admin | **Study Materials** | Upload and organise resources for students |
| 🛠️ Admin | **Blog Manager** | Full CRUD blog editor for the public website |
| 🛠️ Admin | **Settings** | Platform-wide configuration |
| 👩‍🏫 Teacher | **My Students** | View and manage assigned student roster |
| 👩‍🏫 Teacher | **Availability / Schedule** | Set and view availability for classes and demos |
| 🎓 Student | **My Materials** | Access study resources uploaded by admin/teachers |
| 🎓 Student | **Tasks & Tests** | View and complete assignments |
| 🌐 Public | **Program Pages** | Multi-language program pages with auto-sliding carousels |
| 🌐 Public | **Demo Booking Form** | Prospective student booking with real-time notifications |
| 🌐 Public | **Blog** | Publicly accessible articles and success stories |

---

## 🛠️ Tech Stack

### Core

[![Next.js](https://img.shields.io/badge/Next.js-16.1_App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

### Backend & Services

[![Firebase](https://img.shields.io/badge/Firebase_Auth-12.x-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Firestore](https://img.shields.io/badge/Firestore-NoSQL-FF6F00?style=flat-square&logo=firebase&logoColor=white)](https://firebase.google.com/products/firestore)
[![AWS S3](https://img.shields.io/badge/AWS_S3-File_Storage-FF9900?style=flat-square&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)

### UI & Utilities

[![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![Lottie](https://img.shields.io/badge/Lottie_React-Animations-00C4CC?style=flat-square)](https://lottiereact.com/)
[![Lucide](https://img.shields.io/badge/Lucide_React-Icons-F97316?style=flat-square)](https://lucide.dev/)
[![Sonner](https://img.shields.io/badge/Sonner-Toasts-8B5CF6?style=flat-square)](https://sonner.emilkowal.ski/)

---

## 📁 Project Structure

```
cms/
├── app/
│   ├── admin/              # Admin dashboard pages
│   │   ├── blogs/          # Blog CRUD
│   │   ├── demo-bookings/  # Demo session management
│   │   ├── manage-schedule/
│   │   ├── materials/      # Study materials
│   │   ├── settings/
│   │   ├── students/       # Student management + [id] detail
│   │   └── teachers/       # Teacher management + [id] detail
│   ├── api/                # Next.js Route Handlers
│   │   ├── admin/          # Staff creation & user deletion
│   │   ├── auth/           # Token verification & role cookie
│   │   ├── blogs/
│   │   ├── bookings/
│   │   └── ...
│   ├── student/            # Student portal pages
│   ├── teacher/            # Teacher portal pages
│   └── (public pages)      # Home, About, Programs, etc.
│
├── components/             # Shared UI components
├── config/
│   ├── branding.ts         # 🎨 Logo & brand assets — edit to rebrand
│   └── sidebarRoutes.ts    # 🗺️ Navigation routes per role
├── hooks/                  # Custom React hooks (role guards, etc.)
├── lib/
│   ├── firebase-client.ts  # Firebase client SDK init
│   └── firebase-admin.ts   # Firebase Admin SDK init
├── public/
│   └── images/             # Static assets (flags, programs, faculty, UI)
├── services/               # Firestore data access layer
│   ├── blog.service.ts
│   ├── booking.service.ts
│   ├── student.service.ts
│   ├── teacher.service.ts
│   └── user.service.ts
├── types/                  # TypeScript interfaces
└── utils/                  # Helpers (slugify, etc.)
```

---

## 🔐 Authentication & Security

Authentication uses **Firebase Auth** with a server-enforced role system that prevents cookie forgery:

```
Client login  →  Firebase Auth ID Token
                        ↓
POST /api/auth/set-role  →  Firebase Admin SDK verifies token
                        ↓
        HttpOnly cookie  user_role=admin|teacher|student
                        ↓
     Middleware protects  /admin/*  /teacher/*  /student/*
```

- The `user_role` cookie is **HttpOnly** — JavaScript cannot read or forge it
- `sameSite: strict` provides CSRF protection
- `DELETE /api/auth/set-role` immediately expires the cookie on logout

Valid roles: `admin` · `teacher` · `student`

---

## 🚀 Getting Started

### Prerequisites

[![Node.js](https://img.shields.io/badge/Node.js-≥18-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase_Project-Required-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://console.firebase.google.com/)
[![AWS](https://img.shields.io/badge/AWS_S3_Bucket-Required-FF9900?style=flat-square&logo=amazonaws&logoColor=white)](https://aws.amazon.com/s3/)

### Installation

```bash
git clone <your-repo-url>
cd cms
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start

# If you hit TypeScript / Turbopack issues:
npm run build:webpack
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the root:

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

> ⚠️ Never commit real credentials. Add `.env.local` to `.gitignore`.

---

## 🎨 Branding & White-Label Configuration

The system is designed to be easily rebranded for any institution. Two files control all brand identity:

**`config/branding.ts`** — swap in your logo:
```ts
export const BRANDING = {
  dashboardLogo: "/images/your-logo.jpg"
};
```

**`config/sidebarRoutes.ts`** — extend navigation per role without touching layout components.

---

## 🌱 Seeding an Admin User

A helper script promotes an existing Firebase user to admin:

```bash
node setAdmin.js
```

Update the script with the target user's UID before running.

---

## 🌐 Deployment

[![Vercel](https://img.shields.io/badge/Vercel-Recommended-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Supported-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://netlify.com/)
[![AWS](https://img.shields.io/badge/AWS_Amplify-Supported-FF9900?style=for-the-badge&logo=awsamplify&logoColor=white)](https://aws.amazon.com/amplify/)

1. Push your repository to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add all environment variables in the Vercel dashboard
4. Deploy

Any Node.js-capable hosting environment works — this is a standard Next.js application.

---

## 🏫 Example Client: SIFL

**SIFL (School of International Foreign Languages)** is the founding client for which this CMS was originally built and is the reference production deployment.

| What SIFL Uses | Detail |
|---|---|
| 🌍 Language Programs | English, French, German, Spanish, Japanese, and more |
| 📅 Demo Bookings | Prospective student intake with real-time admin notifications |
| 👩‍🏫 Teacher Assignment | Dedicated teachers assigned per student batch and language |
| 📚 Study Materials | Digital resources distributed to enrolled students |
| 📝 Blog & Content | Program updates and student success stories |

The SIFL deployment demonstrates the full feature set of this CMS in a live production environment and serves as the canonical reference implementation.

---

<div align="center">

**Built with ❤️ — Private / Proprietary. All rights reserved.**

</div>
