# FutureFlow AI — Enterprise Future Process Designer

FutureFlow AI is an enterprise AI solution designed for the Modus Enterprise AI Build Challenge. It takes complex operational workflows, extracts structured steps, diagnoses bottlenecks, maps specific AI opportunities, and synthesizes a future-state workflow with clear `human | ai | hybrid` division of responsibility and quantified ROI benefits.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js >= 18
- pnpm (`npm install -g pnpm`)
- PostgreSQL instance running (or local / cloud Postgres URL)
- Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### 2. Environment Setup
Create `.env` inside `futureflow-ai/apps/api/.env` (or copy from `.env.example`):

```bash
PORT=4000
DATABASE_URL="postgresql://username:password@localhost:5432/futureflow?schema=public"
LLM_PROVIDER="gemini"
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Install & Setup Database
```bash
# From futureflow-ai root:
pnpm install

# Run database migrations
pnpm --filter @futureflow/api prisma:migrate
```

### 4. Run Locally
```bash
# Start both Backend API (:4000) and Frontend Web (:3000):
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Smoke Testing the "Surprise Process"
To test the pipeline on a novel process via CLI:
```bash
npx tsx scripts/test-surprise-process.ts
```

---

## 🔄 LLM Provider Flexibility
If API access changes, switch providers by updating the `LLMProvider` interface in `apps/api/src/llm/`. The pipeline interacts strictly through `generateStructured(prompt, schema)` and is completely decoupled from the underlying model vendor.

---

## 📚 Documentation
- [Architecture & Sequence Flow](docs/architecture.md)
- [Data Model & ER Diagram](docs/data-model.md)
