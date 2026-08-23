# Attributions & Licenses

## 📦 Third-Party Libraries & Software Licenses

| Layer / Package | Library | License | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend API** | `express` | MIT | Web framework and REST routing |
| | `@google/genai` | Apache-2.0 | Official Google GenAI SDK for Gemini |
| | `@prisma/client` / `prisma` | Apache-2.0 | Type-safe ORM & database migrations |
| | `zod` | MIT | Runtime schema validation & structured JSON parsing |
| | `cors` | MIT | Cross-Origin Resource Sharing middleware |
| | `dotenv` | BSD-2-Clause | Environment variable management |
| | `tsx` | MIT | TypeScript runtime execution |
| **Web Frontend** | `react` / `react-dom` | MIT | Declarative UI component library |
| | `tailwindcss` | MIT | Utility-first CSS framework |
| | `vite` | MIT | Build tool and frontend dev server |
| | `@vitejs/plugin-react` | MIT | React Fast Refresh Vite plugin |
| | `postcss` / `autoprefixer` | MIT | CSS toolchain & vendor prefixing |
| **Infrastructure** | `PostgreSQL 16` | PostgreSQL License | Relational database engine |
| | `Nginx` | 2-Clause BSD | Static frontend web server & API proxy |
| | `Node.js 20` | MIT / Node License | JavaScript runtime engine |

---

## 🤖 AI Coding Assistant Disclosure

- **Tools Used**: Google Antigravity was utilized during the development of this project for pair programming.
- **Verification & Review**: All pipeline logic, Business Process Reengineering heuristics, Zod normalization schemas, and database transactions were authored, reviewed, and audited with human verification.
- **Architecture**: AI integrations are strictly encapsulated behind the provider interface `LLMProvider`, allowing modular swapping of model backends.
