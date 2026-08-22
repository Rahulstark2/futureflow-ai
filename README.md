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

## 🧪 Smoke Testing the "Surprise Process"
To test the pipeline on a novel process via CLI:
```bash
npx tsx scripts/test-surprise-process.ts
```

---

## 🔄 LLM Provider Flexibility
The pipeline interacts strictly through `generateStructured(prompt, schema)` defined in `apps/api/src/llm/provider.ts` and is decoupled from the underlying vendor.

---

## 📚 Documentation
- [Architecture & Sequence Flow](docs/architecture.md)
- [Data Model & ER Diagram](docs/data-model.md)
