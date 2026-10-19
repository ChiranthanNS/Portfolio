# Chiranthan N S — Developer Portfolio

A fast, accessible, dark-themed portfolio built with **Next.js 15**, **TypeScript (strict)**, and **Tailwind CSS v4** — statically generated and engineered for effortless deployment on Vercel.

Faithfully replicates the design system, layout, and visual fidelity of Nayeem Islam's portfolio, personalized for **Chiranthan N S**.

---

## Features

- **Single-page home** — Hero with entrance animations, featured projects, experience & education tabs, interactive skills filtering, contact section, and footer in a unified dark aesthetic.
- **Project case studies** — Statically generated `/projects/[slug]` pages detailing problem, solution, architecture reasoning, tech stack, and interactive screenshot galleries with per-page Open Graph metadata.
- **Category filtering** — Accessible pill tabs for projects (*All*, *AI/ML*, *Full Stack*, *Frontend*) and skills (*Languages*, *AI/ML & Data*, *Frontend*, *Backend & APIs*, *Databases*, *Tools & DevOps*).
- **Working contact & feedback forms** — Server actions with Zod validation, honeypot spam protection, per-IP rate limiting, and optional [Resend](https://resend.com) email delivery with graceful fallback.
- **Scroll-spy navigation** — An `IntersectionObserver` smoothly highlights the active section in the sticky navbar.
- **SEO & Social Sharing** — Complete Open Graph / Twitter cards, dynamic sitemap (`/sitemap.xml`), robots (`/robots.txt`), and JSON-LD Person schema.
- **Accessibility & Motion** — WCAG contrast, ARIA tab semantics, keyboard navigation, and full `prefers-reduced-motion` compliance.
- **Fully responsive** — Tailored layouts from narrow mobile screens (360px) to ultra-wide desktop monitors.

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Server Components, SSG via `generateStaticParams`, Server Actions |
| **Language** | TypeScript (Strict) | Full type safety across content models and UI components |
| **Styling** | Tailwind CSS v4 | CSS-first `@theme` variables and responsive utility classes |
| **Animation** | Motion (`motion/react`) | Lightweight, performant GPU-accelerated motion with reduced-motion support |
| **Email** | Nodemailer (Gmail SMTP) | Direct Gmail SMTP delivery with instant auto-confirmation for visitors |
| **Validation** | Zod | Runtime schema validation for forms |
| **Icons** | Lucide React & Custom SVG | SVG icon sets for brand and interface elements |

---

## Getting Started

### 1. Prerequisites
- Node.js 18.18+ or 20+
- npm or pnpm

### 2. Installation
```bash
npm install
```

### 3. Environment Setup (Optional)
Copy `.env.example` to `.env.local` to configure email delivery via Gmail SMTP:
```bash
cp .env.example .env.local
```
Edit `.env.local`:
```env
GMAIL_USER=chiranthanns24056@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password_here
NEXT_PUBLIC_SITE_URL=https://chiranthanns.vercel.app
```
*(App password can be generated from Google Account → Security → 2-Step Verification → App Passwords).*

### 4. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## Deploying to Vercel

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Personalized developer portfolio for Chiranthan N S"
   git push origin main
   ```
2. Import the repository in [Vercel](https://vercel.com/new).
3. Framework Preset: **Next.js** (automatically detected).
4. Add your environment variables in the Vercel dashboard:
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `NEXT_PUBLIC_SITE_URL`
5. Click **Deploy**.
