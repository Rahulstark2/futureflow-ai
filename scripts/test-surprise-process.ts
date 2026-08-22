/**
 * CLI Smoke Test: Submits a novel "surprise" process through the full API pipeline
 * to verify end-to-end extraction, problem diagnosis, AI opportunities, future design, and benefits calculation.
 */
async function testSurpriseProcess() {
  const API_URL = process.env.API_URL || "http://localhost:4000/api";

  const novelProcess = {
    name: "Supplier Quality Audit & CAPA Workflow",
    industry: "Medtech & Regulated Electronics",
    description: `Incoming supplier quality audits are currently triggered manually using spreadsheet schedules. 
Auditors travel on-site, take paper notes, and manually photograph inspection lots. 
Audit findings and non-conformances are typed up into PDF reports 5-10 days after inspection. 
Corrective and Preventive Actions (CAPA) requests are emailed to suppliers without central tracking. 
Follow-up on open CAPAs is reactive, leading to audit backlog, unverified remediation, and compliance risk during ISO 13485 regulatory audits.`,
  };

  console.log("=== FutureFlow AI Smoke Test: Surprise Process ===");
  console.log(`1. Target API: ${API_URL}`);
  console.log(`2. Creating process: "${novelProcess.name}"...`);

  const createRes = await fetch(`${API_URL}/processes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novelProcess),
  });

  const createJson = await createRes.json();
  if (!createRes.ok || !createJson.success) {
    throw new Error(`Failed to create process: ${JSON.stringify(createJson)}`);
  }

  const processId = createJson.data.id;
  console.log(`✓ Process created with ID: ${processId}`);

  console.log("\n3. Triggering 5-step Reasoning Pipeline (POST /processes/:id/analyze)...");
  const analyzeRes = await fetch(`${API_URL}/processes/${processId}/analyze`, {
    method: "POST",
  });

  const analyzeJson = await analyzeRes.json();
  if (!analyzeRes.ok || !analyzeJson.success) {
    throw new Error(`Pipeline analysis failed: ${JSON.stringify(analyzeJson)}`);
  }
  console.log("✓ Pipeline execution complete!");

  console.log("\n4. Fetching structured comparison & metrics (GET /processes/:id/compare)...");
  const compareRes = await fetch(`${API_URL}/processes/${processId}/compare`);
  const compareJson = await compareRes.json();
  const data = compareJson.data;

  console.log("\n=== SUMMARY METRICS ===");
  console.log(`- Current Activities: ${data.summaryMetrics.currentActivitiesCount}`);
  console.log(`- Problems Detected: ${data.problems.length}`);
  console.log(`- AI Opportunities: ${data.opportunities.length}`);
  console.log(`- Future Activities: ${data.summaryMetrics.futureActivitiesCount}`);
  console.log(`  * AI-Led: ${data.summaryMetrics.aiLedCount}`);
  console.log(`  * Hybrid: ${data.summaryMetrics.hybridCount}`);
  console.log(`  * Human: ${data.summaryMetrics.humanCount}`);
  console.log(`- Automation Score (Model Index): ${data.summaryMetrics.automationPercentage}%`);
  console.log(`- Quantified Benefits: ${data.benefits.length}`);

  console.log("\n✓ Surprise process test passed successfully!");
}

testSurpriseProcess().catch((err) => {
  console.error("\n❌ Test failed:", err);
  process.exit(1);
});
