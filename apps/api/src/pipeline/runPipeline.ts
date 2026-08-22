import { prisma } from "../db/client";
import { getLLMProvider } from "../llm";
import { extractActivities } from "./extractActivities";
import { identifyProblems } from "./identifyProblems";
import { generateOpportunities } from "./generateOpportunities";
import { designFutureProcess } from "./designFutureProcess";
import { computeBenefits } from "./computeBenefits";
import { pipelineManager } from "./pipelineManager";

export interface PipelineProgressCallback {
  (step: number, stepName: string, status: "started" | "completed" | "failed", details?: string): void;
}

export async function runPipeline(
  processId: string,
  onProgress?: PipelineProgressCallback
) {
  const process = await prisma.process.findUnique({
    where: { id: processId },
  });

  if (!process) {
    throw new Error(`Process with ID ${processId} not found.`);
  }

  pipelineManager.start(processId);

  // Clear previous comparison cache immediately so stale/partial results are never served
  await prisma.processComparisonCache.deleteMany({ where: { processId } }).catch(() => {});

  const llm = getLLMProvider();
  console.log(`[Pipeline] Starting 5-step analysis for process "${process.name}" (${process.id})...`);

  try {
    // Step 1: Extract Activities
    pipelineManager.updateStep(processId, 1, "Extracting Activities");
    onProgress?.(1, "Extract Activities", "started");
    const rawActivities = await extractActivities(
      llm,
      process.name,
      process.industry,
      process.description
    );
    onProgress?.(1, "Extract Activities", "completed", `Extracted ${rawActivities.length} activities`);

    // Transactionally reset existing analysis and persist current activities
    await prisma.$transaction(async (tx) => {
      // Delete existing downstream entities for clean re-analysis
      await tx.futureActivity.deleteMany({ where: { processId } });
      await tx.benefit.deleteMany({ where: { processId } });
      await tx.opportunity.deleteMany({ where: { processId } });
      await tx.problem.deleteMany({ where: { processId } });
      await tx.activity.deleteMany({ where: { processId } });

      // Create current activities
      for (const act of rawActivities) {
        await tx.activity.create({
          data: {
            processId,
            name: act.name,
            sequence: act.sequence,
            type: "current",
          },
        });
      }
    });

    // Fetch created activities with their generated DB IDs
    const createdActivities = await prisma.activity.findMany({
      where: { processId },
      orderBy: { sequence: "asc" },
    });

    // Step 2: Identify Problems
    pipelineManager.updateStep(processId, 2, "Identifying Problems");
    onProgress?.(2, "Identify Problems", "started");
    const rawProblems = await identifyProblems(
      llm,
      process.name,
      process.industry,
      createdActivities
    );

    await prisma.problem.createMany({
      data: rawProblems.map((p) => ({
        processId,
        description: p.description,
        severity: p.severity,
      })),
    });
    onProgress?.(2, "Identify Problems", "completed", `Identified ${rawProblems.length} problems`);

    // Step 3: Generate Opportunities
    pipelineManager.updateStep(processId, 3, "Generating AI Opportunities");
    onProgress?.(3, "Generate Opportunities", "started");
    const rawOpportunities = await generateOpportunities(
      llm,
      process.name,
      process.industry,
      createdActivities,
      rawProblems
    );

    await prisma.opportunity.createMany({
      data: rawOpportunities.map((o) => ({
        processId,
        activityId: o.activityId,
        opportunity: o.opportunity,
        technology: o.technology,
        automationPotential: o.automationPotential,
      })),
    });
    onProgress?.(3, "Generate Opportunities", "completed", `Generated ${rawOpportunities.length} opportunities`);

    // Step 4: Design Future Process
    pipelineManager.updateStep(processId, 4, "Designing Future Process");
    onProgress?.(4, "Design Future Process", "started");
    const rawFutureActivities = await designFutureProcess(
      llm,
      process.name,
      process.industry,
      createdActivities,
      rawOpportunities
    );

    await prisma.futureActivity.createMany({
      data: rawFutureActivities.map((f) => ({
        processId,
        activityIdRef: f.activityIdRef || null,
        newActivityName: f.newActivityName,
        roleResponsibility: f.roleResponsibility,
        sequence: f.sequence,
      })),
    });
    onProgress?.(4, "Design Future Process", "completed", `Architected ${rawFutureActivities.length} future activities`);

    // Step 5: Compute Benefits
    pipelineManager.updateStep(processId, 5, "Computing Benefits");
    onProgress?.(5, "Compute Benefits", "started");
    const rawBenefits = await computeBenefits(
      llm,
      process.name,
      process.industry,
      createdActivities,
      rawFutureActivities
    );

    await prisma.benefit.createMany({
      data: rawBenefits.map((b) => ({
        processId,
        benefitType: b.benefitType,
        description: b.description,
        confidence: b.confidence,
        assumptions: b.assumptions,
      })),
    });

    // Record comparison cache entry marking this process analysis complete and valid
    await prisma.processComparisonCache.create({
      data: {
        processId,
      },
    });

    pipelineManager.complete(processId);
    onProgress?.(5, "Compute Benefits", "completed", `Calculated ${rawBenefits.length} quantified benefits`);

    console.log(`[Pipeline] Analysis completed successfully for process ${process.id}.`);

    return prisma.process.findUnique({
      where: { id: processId },
      include: {
        activities: { orderBy: { sequence: "asc" } },
        problems: true,
        opportunities: { include: { activity: true } },
        futureActivities: { orderBy: { sequence: "asc" } },
        benefits: true,
      },
    });
  } catch (err) {
    const errorMsg = (err as Error).message;
    pipelineManager.fail(processId, errorMsg);
    onProgress?.(pipelineManager.getStatus(processId)?.currentStep || 1, "Pipeline", "failed", errorMsg);
    throw err;
  }
}
