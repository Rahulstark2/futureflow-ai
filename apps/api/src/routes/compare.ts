import { Router, Request, Response } from "express";
import { prisma } from "../db/client";
import { pipelineManager } from "../pipeline/pipelineManager";

export const compareRouter = Router();

compareRouter.get("/:id/compare", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const isRunning = pipelineManager.isRunning(id);
    const pipelineStatus = pipelineManager.getStatus(id);

    const process = await prisma.process.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: { sequence: "asc" },
          include: { opportunities: true },
        },
        problems: true,
        opportunities: true,
        futureActivities: {
          orderBy: { sequence: "asc" },
        },
        benefits: true,
        comparisonCaches: {
          orderBy: { generatedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!process) {
      return res.status(404).json({ success: false, error: "Process not found" });
    }

    const hasCompletedCache = process.comparisonCaches.length > 0;

    // Guard against partial/interrupted state: if running or not fully completed, never return zero-filled table
    if (isRunning || !hasCompletedCache || process.futureActivities.length === 0) {
      return res.json({
        success: true,
        data: {
          process: {
            id: process.id,
            name: process.name,
            industry: process.industry,
            description: process.description,
          },
          isAnalyzing: isRunning,
          status: isRunning ? "running" : pipelineStatus?.status || "draft",
          currentStep: pipelineStatus?.currentStep || 0,
          stepName: pipelineStatus?.stepName || "Not Started",
          error: pipelineStatus?.error,
          currentActivities: [],
          problems: [],
          opportunities: [],
          futureActivities: [],
          benefits: [],
          summaryMetrics: {
            currentActivitiesCount: 0,
            futureActivitiesCount: 0,
            aiLedCount: 0,
            automationCount: 0,
            roboticsCount: 0,
            hybridCount: 0,
            humanCount: 0,
            automationPercentage: 0,
          },
        },
      });
    }

    const futureActs = process.futureActivities;
    const totalFuture = futureActs.length;
    const aiCount = futureActs.filter((a) => a.roleResponsibility === "ai").length;
    const automationCount = futureActs.filter((a) => a.roleResponsibility === "automation").length;
    const roboticsCount = futureActs.filter((a) => a.roleResponsibility === "robotics").length;
    const hybridCount = futureActs.filter((a) => a.roleResponsibility === "hybrid").length;
    const humanCount = futureActs.filter((a) => a.roleResponsibility === "human").length;

    const automatedTotal = aiCount + automationCount + roboticsCount + hybridCount * 0.5;
    const automationRatio = totalFuture > 0
      ? Math.round((automatedTotal / totalFuture) * 100)
      : 0;

    return res.json({
      success: true,
      data: {
        process: {
          id: process.id,
          name: process.name,
          industry: process.industry,
          description: process.description,
        },
        isAnalyzing: false,
        status: "completed",
        currentActivities: process.activities,
        problems: process.problems,
        opportunities: process.opportunities,
        futureActivities: process.futureActivities,
        benefits: process.benefits,
        summaryMetrics: {
          currentActivitiesCount: process.activities.length,
          futureActivitiesCount: totalFuture,
          aiLedCount: aiCount,
          automationCount: automationCount,
          roboticsCount: roboticsCount,
          hybridCount: hybridCount,
          humanCount: humanCount,
          automationPercentage: automationRatio,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});
