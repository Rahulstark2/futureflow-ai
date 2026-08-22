import { Router, Request, Response } from "express";
import { runPipeline } from "../pipeline/runPipeline";
import { pipelineManager } from "../pipeline/pipelineManager";
import { prisma } from "../db/client";

export const analyzeRouter = Router();

analyzeRouter.get("/:id/status", async (req: Request, res: Response) => {
  const { id } = req.params;
  const status = pipelineManager.getStatus(id);
  const isRunning = pipelineManager.isRunning(id);

  const cache = await prisma.processComparisonCache.findFirst({
    where: { processId: id },
    orderBy: { generatedAt: "desc" },
  });

  return res.json({
    success: true,
    data: {
      isAnalyzing: isRunning,
      status: isRunning ? "running" : status?.status || (cache ? "completed" : "draft"),
      currentStep: status?.currentStep || (cache ? 5 : 0),
      stepName: status?.stepName || (cache ? "Completed" : "Not Started"),
      error: status?.error,
    },
  });
});

analyzeRouter.post("/:id/analyze", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (pipelineManager.isRunning(id)) {
    return res.json({
      success: true,
      message: "Analysis is already running in background",
      data: pipelineManager.getStatus(id),
    });
  }

  try {
    const result = await runPipeline(id, (step, stepName, status, details) => {
      console.log(`[Pipeline Progress] Step ${step} (${stepName}): ${status.toUpperCase()} ${details ? `- ${details}` : ""}`);
    });

    return res.json({
      success: true,
      message: "Analysis pipeline completed successfully",
      data: result,
    });
  } catch (error) {
    console.error("[Pipeline Error]", error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});
