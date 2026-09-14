# 🚀 Multi-Tenant SaaS Booking Platform (MVP)

A modern, full-stack multi-tenant SaaS booking platform built to help service-based businesses (auto repair shops, beauty salons, medical clinics, fitness centers) manage bookings, services, and client schedules efficiently.

The platform features **Self-Service Onboarding**, **Strict Tenant Isolation**, and **Dynamic Public Booking Pages** for each registered business.

---

## 🛠 Tech Stack

* **Framework:** [Next.js 15+](https://nextjs.org/) (App Router, Server Actions)
* **Authentication:** [Supabase Auth](https://supabase.com/) (`@supabase/ssr` for secure cookie-based session management)
* **Database & ORM:** [PostgreSQL](https://www.postgresql.org/) (Hosted on Supabase) + [Prisma ORM](https://www.prisma.io/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Version Control:** Git & GitHub

---

## 🌟 Key Features Built

### 1. Self-Service Business Onboarding
* Instant business account creation with an automatically generated unique URL slug (`/[slug]`).
* Atomic registration flow: creates user credentials in Supabase Auth and initial business data in PostgreSQL simultaneously.
* Automatic seed of the primary service, default pricing, and duration upon signup.

### 2. Multi-Tenant Architecture & Security
* Multi-tenant data isolation verified via `business.userId === user.id`.
* Automatic route redirection to prevent cross-tenant dashboard access.
* Secure server-side authentication backed by Server Actions and HTTP-only cookies.

### 3. Dedicated Admin Dashboards (`/[slug]/admin`)
* Real-time dashboard to view incoming appointments.
* Overview of active services, pricing structures, and service durations.
* Business stats cards displaying total bookings and service counts.

---

## 🗄 Database Schema (Prisma)

```prisma
model Business {
  id        String   @id @default(cuid())
  userId    String?  // References Supabase Auth User ID
  name      String
  slug      String   @unique
  category  String
  phone     String
  email     String
  address   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  services  Service[]
  bookings  Booking[]
}

model Service {
  id          String   @id @default(cuid())
  businessId  String
  name        String
  price       Float
  durationMin Int
  createdAt   DateTime @default(now())

  business    Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
}

model Booking {
  id            String   @id @default(cuid())
  businessId    String
  serviceName   String?
  customerName  String
  customerPhone String
  bookingDate   DateTime
  createdAt     DateTime @default(now())

  business      Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
}



# 🚀 Multi-Tenant SaaS Booking Platform (MVP)

A modern, full-stack multi-tenant SaaS booking platform built to help service-based businesses (auto repair shops, beauty salons, medical clinics, fitness centers) manage bookings, services, and client schedules efficiently.

The platform features **Self-Service Onboarding**, **Strict Tenant Isolation**, and **Dynamic Public Booking Pages** for each registered business.

---

## 🛠 Tech Stack

* **Framework:** Next.js 15+ (App Router, Server Actions)
* **Authentication:** Supabase Auth (`@supabase/ssr` for secure cookie-based session management)
* **Database & ORM:** PostgreSQL (Hosted on Supabase) + Prisma ORM
* **Styling:** Tailwind CSS
* **Version Control:** Git & GitHub

---

## 🌟 Key Features Built

### 1. Self-Service Business Onboarding
* Instant business account creation with an automatically generated unique URL slug (`/[slug]`).
* Atomic registration flow: creates user credentials in Supabase Auth and initial business data in PostgreSQL simultaneously.
* Automatic seed of the primary service, default pricing, and duration upon signup.

### 2. Multi-Tenant Architecture & Security
* Multi-tenant data isolation verified via `business.userId === user.id`.
* Automatic route redirection to prevent cross-tenant dashboard access.
* Secure server-side authentication backed by Server Actions and HTTP-only cookies.

### 3. Dedicated Admin Dashboards (`/[slug]/admin`)
* Real-time dashboard to view incoming appointments.
* Overview of active services, pricing structures, and service durations.
* Business stats cards displaying total bookings and service counts.

---

## ⚙️ Getting Started

### 1. Clone the repository
`git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git`
`cd my-booking-saas`
`npm install`

### 2. Environment Configuration
Create a `.env` file in the root directory and add the following keys:

`DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"`
`NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"`
`NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"`

### 3. Database Synchronization
Push schema to PostgreSQL and generate local Prisma Client types:

`npx prisma db push`
`npx prisma generate`

### 4. Run Development Server
`npm run dev`

Open http://localhost:3000 in your browser.
