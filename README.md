<div align="center">

# 🚀 Boom Scope

**A modern, full-stack design workspace for creative projects.**

Built with Next.js 16, Convex, TipTap, and AI — Boom Scope brings project management, rich note-taking, canvas design, design-system generation, and productivity tools into one beautiful dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Convex](https://img.shields.io/badge/Convex-1.38-orange?logo=convex)](https://convex.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📁 **Projects** | Create and manage design projects with full CRUD |
| 📝 **Rich Notes** | TipTap-powered editor with tables, images, task lists, YouTube embeds, and more |
| 🎨 **Canvas** | Konva-based infinite canvas for sketching and visual design |
| 🎭 **Design System** | AI-generated design tokens — colors, fonts, suggestions — with public sharing |
| 🤖 **AI Generator** | OpenAI-powered multi-viewport layout generator |
| ⏱️ **Pomodoro Timer** | Built-in focus timer with configurable work/break intervals and IndexedDB persistence |
| 🌗 **Dark Mode** | System-aware theme toggle powered by `next-themes` |
| 🔐 **Auth** | Convex Auth with session management |

---

## 🛠 Tech Stack

**Frontend**
- [Next.js 16](https://nextjs.org) — App Router, Server Components, Typed Routes
- [React 19](https://react.dev)
- [TailwindCSS 4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) (Radix Nova style)
- [Framer Motion](https://www.framer.com/motion/) — animations
- [TipTap](https://tiptap.dev) — rich text editor
- [Konva / react-konva](https://konvajs.org) — canvas

**Backend / Data**
- [Convex](https://convex.dev) — real-time database, serverless functions, file storage
- [Convex Auth](https://labs.convex.dev/auth) — authentication

**AI**
- [OpenAI API](https://platform.openai.com) — design generation and analysis

**Tooling**
- [Bun](https://bun.sh) — package manager & runtime
- [Biome](https://biomejs.dev) — linting & formatting
- [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) — unit tests

---

## 📁 Project Structure

```
boom-scope/
├── app/
│   ├── dashboard/
│   │   ├── canvas/         # Konva infinite canvas
│   │   ├── design-system/  # Design system viewer & editor
│   │   ├── generator/      # AI layout generator
│   │   ├── notes/          # Note management
│   │   ├── pomodoro/       # Pomodoro timer page
│   │   ├── projects/       # Project CRUD
│   │   └── settings/       # Account settings
│   ├── login/
│   └── register/
├── components/
│   ├── dashboard/          # Layout, nav, header, Pomodoro context & timer
│   ├── notes/              # NoteEditor, NoteList, QuickNoteDialog
│   ├── design/             # DesignPreview, ShareDialog
│   └── ui/                 # shadcn primitive components
├── convex/                 # Convex schema, queries, mutations, actions
├── __tests__/              # Vitest unit tests
└── lib/                    # Utilities, canvas presets, note helpers
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 20
- [Bun](https://bun.sh) ≥ 1.0
- A [Convex](https://dashboard.convex.dev) account
- An [OpenAI](https://platform.openai.com) API key

### 1. Clone the repository

```bash
git clone https://github.com/your-username/boom-scope.git
cd boom-scope
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

Create a `.env.local` file at the project root:

```env
# Convex — obtained by running `npx convex dev` and following the prompts
CONVEX_DEPLOYMENT=dev:<your-deployment-slug>
NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://<your-deployment>.convex.site

# OpenAI
OPENAI_API_KEY=sk-...
```

### 4. Start the Convex backend

```bash
bun run convex
```

This starts the Convex dev server and syncs your schema and functions.

### 5. Start the Next.js dev server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run the full test suite:

```bash
bun run test
```

Run tests in watch mode:

```bash
bun run test --watch
```

Run a specific test file:

```bash
bun run test --run __tests__/pomodoro-context.test.tsx
```

Tests are written with [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com) under `__tests__/`.

---

## 🧹 Linting & Formatting

Boom Scope uses [Biome](https://biomejs.dev) for both linting and formatting:

```bash
# Check and auto-fix
bun run format

# Lint only
bun run lint
```

---

## 📜 Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start the Next.js development server |
| `bun run build` | Build the production bundle |
| `bun run start` | Start the production server |
| `bun run convex` | Start the Convex backend in dev mode |
| `bun run test` | Run Vitest test suite |
| `bun run lint` | Run Biome linter |
| `bun run format` | Run Biome formatter (with auto-fix) |

---

## 🔐 Authentication

Authentication is handled by [Convex Auth](https://labs.convex.dev/auth). Users register and log in via the `/login` and `/register` routes. Sessions are managed server-side through Convex.

Transactional emails (email verification and password reset) are sent via [Maileroo](https://maileroo.com). Configure these **Convex environment variables** (not `.env.local`):

```bash
npx convex env set MAILEROO_API_KEY "your-sending-key"
npx convex env set MAILEROO_FROM_EMAIL "noreply@your-domain.com"
npx convex env set MAILEROO_FROM_NAME "Boom Scope"
```

### Overovanie emailu a reset hesla

| Režim | `AUTH_EMAIL_VERIFICATION` | Správanie |
|-------|---------------------------|-----------|
| Vývoj (sandbox) | `false` alebo nezadané | Registrácia bez OTP; po úspechu sa pošle uvítací email |
| Produkcia | `true` | OTP overenie pri registrácii + reset hesla cez Maileroo |

```bash
# Zapnite až keď máte vlastnú overenú doménu (nie *.maileroo.org)
npx convex env set AUTH_EMAIL_VERIFICATION "true"
npx convex env set MAILEROO_EMAILS_ENABLED "true"
npx convex env set MAILEROO_FROM_EMAIL "noreply@vasadomena.sk"
```

**Dôležité:** Sandbox doména `*.maileroo.org` je len na testovanie API. Maileroo **zamietne** emaily mimo **Authorized Recipients** (`suppression: User is not allowed to send outside of the authorized email list`). Pre viac používateľov pridajte vlastnú doménu, overte DNS (SPF, DKIM) a až potom zapnite `MAILEROO_EMAILS_ENABLED=true`.

| Premenná | Účel |
|----------|------|
| `MAILEROO_EMAILS_ENABLED` | Uvítací email po registrácii (`false` = nevolať Maileroo vôbec) |
| `AUTH_EMAIL_VERIFICATION` | OTP overenie + reset hesla |

### Email šablóny (React Email)

Transakčné emaily používajú [React Email](https://react.email/) v `emails/`:

- `registration-welcome.tsx` — uvítací email po registrácii
- `verification-code.tsx` — OTP kód (overenie / reset hesla)

Náhľad šablón lokálne: `bun run email:dev`

Render prebieha v Convex Node action (`convex/emailsNode.tsx`).

---

## ⏱️ Pomodoro Timer

The built-in Pomodoro timer lives at `/dashboard/pomodoro`. It supports:
- **Focus** (default 25 min), **Short Break** (5 min), **Long Break** (15 min)
- Play / Pause / Reset / Skip controls
- Fully customizable durations via the settings panel
- Persistent settings via **IndexedDB** (`lib/pomodoro-db.ts`)
- Toast notifications on session completion

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">
  Made with ❤️ using Next.js and Convex
</div>
