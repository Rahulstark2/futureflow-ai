# FutureFlow AI — Enterprise Future Process Designer

FutureFlow AI is an enterprise AI solution designed for the Modus Enterprise AI Build Challenge. It takes complex operational workflows, extracts structured steps, diagnoses bottlenecks, maps specific AI opportunities, and synthesizes a future-state workflow with clear `human | ai | hybrid` division of responsibility and quantified ROI benefits.

---

## ⚡ Single-Command Evaluation (Docker Compose)

The entire stack (PostgreSQL database + Express API + Nginx Web Frontend) runs with one command.

### 1. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` and set your `GEMINI_API_KEY`:
```env
GEMINI_API_KEY="your-gemini-api-key"
```

### 2. Start the Stack
```bash
docker compose up --build
```
- Web UI: **[http://localhost:3000](http://localhost:3000)**
- Backend API: **[http://localhost:4000/health](http://localhost:4000/health)**
- Schema migrations run automatically on startup via `prisma migrate deploy`.

---

## 🛠️ Local Development Setup (Manual)

### 1. Prerequisites
- Node.js >= 18
- pnpm (`npm install -g pnpm`)
- PostgreSQL database
- Gemini API Key

### 2. Environment Configuration
Create `.env` in `apps/api/.env`:
```bash
PORT=4000
DATABASE_URL="postgresql://username:password@localhost:5432/futureflow?schema=public"
LLM_PROVIDER="gemini"
# Choose any Gemini model (e.g. gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-pro, etc.)
GEMINI_MODEL="gemini-2.5-flash"
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Install & Run
```bash
# Install dependencies across workspace
pnpm install

# Run database migrations
pnpm --filter @futureflow/api prisma:migrate

# Start Backend (:4000) and Frontend (:3000)
pnpm dev
```

---

## 🔄 LLM Provider Flexibility
The pipeline interacts strictly through `generateStructured(prompt, schema)` defined in `apps/api/src/llm/provider.ts` and is decoupled from the underlying vendor.

---

## 📚 Documentation
- [Architecture & Sequence Flow](docs/architecture.md)
- [Data Model & ER Diagram](docs/data-model.md)

---

## 📦 Third-Party Libraries & Licenses

All third-party open-source libraries used in this project are listed below with their respective software licenses:

| Layer / Package | Library | License | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend API** | `express` | MIT | HTTP server and REST routing |
| | `@google/genai` | Apache-2.0 | Official Google GenAI SDK for Gemini LLM |
| | `@prisma/client` / `prisma` | Apache-2.0 | Type-safe ORM & database migrations |
| | `zod` | MIT | Runtime schema validation & structured JSON parsing |
| | `cors` | MIT | Cross-Origin Resource Sharing middleware |
| | `dotenv` | BSD-2-Clause | Environment variable management |
| | `tsx` | MIT | TypeScript runtime execution for development & scripts |
| **Web Frontend** | `react` / `react-dom` | MIT | UI component library and virtual DOM |
| | `tailwindcss` | MIT | Utility-first CSS styling & design system |
| | `vite` | MIT | Next-generation frontend bundler & dev server |
| | `@vitejs/plugin-react` | MIT | React Fast Refresh Vite plugin |
| | `postcss` / `autoprefixer` | MIT | CSS transformations & vendor prefixing |
| **Infrastructure** | `PostgreSQL 16` | PostgreSQL License (Permissive) | Relational persistence store |
| | `Nginx` | 2-Clause BSD | Static frontend web server & reverse proxy |
| | `Node.js 20` | MIT / Node License | JavaScript runtime environment |

---

## 🤖 AI Coding Assistant Disclosure

In compliance with challenge transparency guidelines:

- **AI Coding Assistants Used**: Google Antigravity was utilized during the development of this project for pair programming.
- **Human Oversight & Verification**: All domain logic (the 5-step re-engineering pipeline, enterprise ROI benefit calculation heuristics, deterministic schema validation safeguards, and database normalization) was reviewed, audited, and tested for enterprise reliability and correctness.
- **Model Decoupling**: Application code interacts with AI capabilities strictly through standard typed provider interfaces (`LLMProvider`), ensuring vendor neutrality and modularity.
