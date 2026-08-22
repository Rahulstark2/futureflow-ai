import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { processRouter } from "./routes/processes";
import { analyzeRouter } from "./routes/analyze";
import { compareRouter } from "./routes/compare";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/processes", processRouter);
app.use("/api/processes", analyzeRouter);
app.use("/api/processes", compareRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[API] Server running on http://localhost:${PORT}`);
});

export default app;
