# 🦷 Dental Clinic Management System - Fullstack Project Instructions

You are a senior fullstack engineer.

Your task is to build a **production-ready Dental Clinic Management System**.

---

# 🎯 PROJECT GOAL

Build a SaaS web application for dental clinics that includes:

- Patient management
- Appointment scheduling
- Treatment planning
- File/image storage (x-ray, photos, PDFs)
- Payment tracking
- Role-based access system

---

# 🧱 TECH STACK

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod

## Backend

- NestJS
- TypeScript
- REST API

## Database

- PostgreSQL
- Prisma ORM

## Auth

- JWT (httpOnly cookies)
- Role-based access (doctor, assistant, admin)

## Storage

- AWS S3 (or mock local storage for development)

---

# 📁 PROJECT STRUCTURE

Create a monorepo:

/apps
/web (Next.js)
/api (NestJS)

/packages
/ui
/types

---

# 🗄️ DATABASE SCHEMA

Implement using Prisma.

Models:

- User
- Clinic
- Patient
- Appointment
- Treatment
- TreatmentStep
- Payment
- File
- AuditLog

Requirements:

- Use UUIDs
- Add createdAt / updatedAt
- Add relations properly
- Enforce clinic-based data isolation

---

# 🔐 AUTH SYSTEM

- Implement login/register
- Store JWT in httpOnly cookies
- Middleware for protected routes
- Role-based guards in backend

Roles:

- admin
- doctor
- assistant

---

# 📦 BACKEND MODULES (NestJS)

Create modules:

- auth
- users
- patients
- appointments
- treatments
- payments
- files

Each module must include:

- controller
- service
- DTOs
- validation

---

# 📡 API REQUIREMENTS

Implement CRUD for:

- Patients
- Appointments
- Treatments
- Payments
- Files

Extra:

- Upload file endpoint
- Get patient full detail endpoint (aggregated data)

---

# 🎨 FRONTEND PAGES

Create these routes:

/login
/dashboard
/patients
/patients/[id]
/appointments
/treatments

---

# 🧠 PATIENT DETAIL PAGE (CRITICAL)

Tabs:

- Overview
- Treatments
- Appointments
- Files
- Payments

---

# 📅 APPOINTMENT SYSTEM

- Calendar view (basic)
- Status:
  - scheduled
  - completed
  - cancelled
  - no-show

---

# 🦷 TREATMENT SYSTEM

- Create treatment plans
- Add steps
- Track status

---

# 📂 FILE UPLOAD SYSTEM

- Upload images/PDF
- Store URL in DB
- Use S3 or local storage mock
- Link files to patients

---

# 💰 PAYMENT SYSTEM

- Track total / paid / remaining
- Simple UI

---

# 🔍 AUDIT LOG

Track:

- who did what
- timestamp

---

# 🧪 BEST PRACTICES

- Use clean architecture
- Use DTO validation
- Use environment variables
- Use service layer properly
- Avoid duplication
- Write reusable components

---

# 🚀 MVP PRIORITY

1. Auth
2. Patients
3. Appointments
4. Treatments
5. File Upload

---

# ⚠️ IMPORTANT RULES

- Keep UI clean and minimal
- Do not over-engineer
- Write scalable code
- Use TypeScript strictly

---

# 🏁 OUTPUT

Start by:

1. Creating folder structure
2. Initializing backend (NestJS)
3. Initializing frontend (Next.js)
4. Setting up Prisma
5. Building core modules step by step

Explain what you are doing in comments.

---

END OF INSTRUCTIONS
