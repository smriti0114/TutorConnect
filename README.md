# TutorConnect: Kids Extracurricular Tutoring Platform

TutorConnect is a professional, production-ready, fully responsive web application that connects children with expert one-on-one tutors for extracurricular activities such as Guitar, Piano, Violin, Vocals, Dance, and Drawing. 

Designed with a warm, friendly, yet professional interface, TutorConnect coordinates schedules, class logs, homework assignments, billing invoices, and in-app notifications across three specialized dashboards: Parent/Student, Teacher, and Administrator.

---

## 📖 Table of Contents
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [Role-Based Access & Permissions](#-role-based-access--permissions)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
- [Pre-Seeded Demo Accounts](#-pre-seeded-demo-accounts)
- [Available Routes](#-available-routes)
- [Testing Instructions](#-testing-instructions)
- [Known Limitations](#-known-limitations)

---

## 💡 Problem Statement

Organizing kids' after-school extracurricular activities is often a coordination nightmare for parents, tutors, and program administrators alike. 
- **Parents** struggle with double-bookings, tracking child-specific lessons, reviewing homework feedback, and paying multiple scattered bills.
- **Tutors/Teachers** spend excessive time managing availability calendars, logging attendance, sending practice notes, and tracking earnings.
- **Administrators** lack a centralized ledger to oversee class approvals, manage user registries, track pending fees, and publish subjects.

TutorConnect resolves these pain points by offering a unified, real-time platform with role-based dashboards that streamline operations and keep everyone aligned.

---

## 🚀 Key Features

### 👨‍👩‍👧 Parent / Student Portal
- **Child Swapper Profile Dropdown**: Switch between children profiles seamlessly. All dashboard data (schedule, fees, homework) updates instantly.
- **Child Profile Management**: Register new child profiles and edit ages, notes, or teacher-directed tips.
- **Upcoming Lesson Card**: Quick visual glance of the child's next class date, time, subject, and tutor.
- **Interactive Tutor Discovery**: Filter tutors by activity/specialty, view profile statements, check availability, select slot calendars, and submit booking requests.
- **Homework Submission Desk**: Review assignments, mark them complete with notes, and specify mock file attachment links (e.g. `sheet_music.pdf`).
- **Tuition Billing Ledger**: View pending fees, track historical payments, and trigger simulated checkouts.

### 👨‍🏫 Teacher / Tutor Portal
- **Today & Next Lesson Info**: Quick view of today's schedule and details of the upcoming student.
- **Weekly Schedule Grid**: Unified calendar view displaying approved lessons by date and time slot.
- **Assigned Student Directory**: Search and access details for assigned students, including progress summaries, attendance logs, and past lessons.
- **Lesson Logger & Attendance Widget**: Mark class sessions as Completed, Student Absent, or Canceled, and record practice progress notes for parents.
- **Homework Assignment Desk**: Form to assign practice tasks to specific students, complete with descriptions, due dates, and mock attachment metadata.
- **Availability Editor**: Set available days of the week and hour slots so parents can only request free times.
- **Earnings Summary Card**: Track classes taught this month, total students, and monthly estimated earnings.
- **Incoming Requests Panel**: View pending child bookings. Approve, reject, or reschedule them in one click.

### 👑 Administrator Portal
- **KPI Summary Cards**: Real-time stats reflecting total students, total teachers, active classes, monthly revenue, and outstanding invoices.
- **User Registry Manager**: View, search, edit, or deactivate parent, teacher, or child accounts.
- **Class Logistics Manager**: Oversee all bookings, approve requests, reassign tutors, cancel classes, or reschedule sessions.
- **Manual Payment Tracker**: Ledger grouping tuition records by Paid, Pending, and Overdue. Process manual payment methods (Stripe, Cash, Check), log reference codes, and export records to CSV.
- **Subject Catalog Editor**: Add or edit extracurricular subjects, edit descriptions, adjust pricing, and toggle active status.
- **Teacher Performance Index**: Analyze lessons completed, overall attendance compliance, and parent ratings.

---

## 🔒 Role-Based Access & Permissions

Authorization guards are enforced at both the UI routing layer and the data service layer to protect user privacy and system integrity:
1. **Parent Boundaries**: Can only read/write details matching their own children's profiles. Cannot view other children, modify teacher profiles, or access administrator payment methods.
2. **Teacher Boundaries**: restricted to viewing only their assigned students' detail sheets. Cannot view unassigned children, access admin dashboards, or modify tuition invoices.
3. **Admin Boundaries**: Granted system-wide override access to manage users, classes, activities, and payments.
4. **Self-Registration**: Public self-registration is supported for Parent and Teacher roles at `/signup`. Administrator accounts cannot be self-registered and must be managed internally.

---

## 🛠 Technology Stack

- **Frontend Core**: React 19 (JSX), Vite 8, ES6+ JavaScript
- **Styling**: Tailwind CSS v4 featuring Google Fonts `Outfit` and `Plus Jakarta Sans`
- **Icons**: Lucide React
- **Router**: React Router DOM v6
- **Database Simulation**: Mock service repository layer backed by `localStorage`. Session cookies, bookings, homework states, and payments persist across browser refreshes.

---

## 📂 Project Directory Structure

```text
├── public/                 # Static assets (images, icons)
├── src/
│   ├── components/         # Reusable UI widgets & layout wrappers
│   │   └── layout/         # Layout modules (Parent, Teacher, Admin Sidebars)
│   ├── context/            # React Contexts (AuthContext, ChildContext)
│   ├── pages/              # Application views grouped by dashboard
│   │   ├── admin/          # Administrator Pages (Users, Classes, Payments)
│   │   ├── parent/         # Parent/Student Pages (Discovery, Classes, Homework)
│   │   ├── teacher/        # Tutor Pages (Availability, Students, Dashboard)
│   │   ├── Login.jsx       # Standard login entry portal
│   │   └── Signup.jsx      # Multi-step role selector and registration forms
│   ├── services/           # Data simulation layer
│   │   └── mockDb.js       # localStorage repository layer and validation rules
│   ├── App.jsx             # React Router routing configuration
│   ├── index.css           # Styling system configurations
│   └── main.jsx            # React root renderer
├── package.json            # Script targets and dependencies
└── vite.config.js          # Vite compilation config
```

---

## 💻 Getting Started

### 1. Installation
Install all project package dependencies:
```bash
npm install
```

### 2. Development Server
Start the local development server:
```bash
npm run dev
```
Open your browser and navigate to the address shown in the terminal (usually `http://localhost:5173`).

### 3. Production Compilation
Bundle the application for production deployment:
```bash
npm run build
```

### 4. Code Formatting & Linting
Run linter checks to ensure formatting rules are compliant:
```bash
npm run lint
```

---

## 🔑 Pre-Seeded Demo Accounts

The login interface displays quick-access buttons for testing seeded profiles:

| Role | Demo Email | Demo Password |
|---|---|---|
| **Student / Parent** | `parent@example.com` | `Demo123!` |
| **Teacher / Tutor** | `teacher@example.com` | `Demo123!` |
| **Administrator** | `admin@example.com` | `Demo123!` |

---

## 🛣 Available Routes

- `/login` - System login page.
- `/signup` - Multi-role registration (choose Parent or Teacher).
- **Parent Portal**:
  - `/parent/dashboard` - Dashboard with next class, due fees, homework overview.
  - `/parent/children` - Child profiles configuration (name, age, tips).
  - `/parent/activities` - Search activities, tutors, check availability calendar, and book lessons.
  - `/parent/classes` - View active enrollments, schedule details, and tutor feedback.
  - `/parent/homework` - Practice details tracker, complete tasks, upload mock files.
  - `/parent/payments` - Ledger tracking invoice fees with checkouts.
  - `/parent/notifications` - Notifications logs.
- **Teacher Portal**:
  - `/teacher/dashboard` - Next lesson, today's schedule, assigned student roster.
  - `/teacher/calendar` - Weekly schedule grid layout.
  - `/teacher/availability` - Set available days and hour ranges.
  - `/teacher/students` - Assigned students list.
  - `/teacher/students/:studentId` - Roster details, class log history, attendance logs.
  - `/teacher/homework` - Assign new practice tasks form.
  - `/teacher/earnings` - Earnings dashboard ledger.
- **Admin Portal**:
  - `/admin/dashboard` - Platform KPIs overview stats cards.
  - `/admin/users` - Directory listing user accounts and deactivation toggles.
  - `/admin/classes` - View all classes, approve requests, reschedule, or reassign teachers.
  - `/admin/activities` - Subjects pricing editor.
  - `/admin/payments` - Financial invoices manager, mark paid ledger, and CSV export.
  - `/admin/performance` - Tutor ratings and attendance logs.

---

## 🧪 Testing Instructions

TutorConnect includes programmatical integration test scripts to test logical constraints and state transformations inside a Node.js console environment:

1. **Core Platform Test Runner**:
   Asserts authorization rules, credentials check, double-booking validation, and metrics calculation:
   ```bash
   node .gemini/antigravity/brain/506b2c86-c33b-4eb5-9e8f-46981b6d0730/scratch/testAll.js
   ```
2. **Registration Test Runner**:
   Tests Parent/Teacher signup steps, credentials validations, and default child/profile generation:
   ```bash
   node .gemini/antigravity/brain/506b2c86-c33b-4eb5-9e8f-46981b6d0730/scratch/testSelfRegistration.js
   ```
3. **Teacher Approvals Test Runner**:
   Asserts incoming pending requests list actions (Accept, Reject, Reschedule) and conflict blocks:
   ```bash
   node .gemini/antigravity/brain/506b2c86-c33b-4eb5-9e8f-46981b6d0730/scratch/testTeacherApprovals.js
   ```

---

## ⚠️ Known Limitations

1. **Simulated Payments**: Financial transactions are manual. The "Pay Now" checkout processes cash, check, or credit simulations. No real payment gateways (Stripe, Razorpay) are connected.
2. **Local Notifications**: System alerts (reminders, booking status updates, due bills, new homework) are dispatched locally inside the app. No external SMS (Twilio) or Email (AWS SES/SendGrid) providers are integrated.
3. **Client-Side Persistence**: All operational data (bookings, homework status, user creation) is stored in browser `localStorage`. Cleaning browser cache will restore seeded defaults.
