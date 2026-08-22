-- AlterTable
ALTER TABLE "Benefit" ADD COLUMN IF NOT EXISTS "confidence" TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE "Benefit" ADD COLUMN IF NOT EXISTS "assumptions" TEXT NOT NULL DEFAULT 'Requires baseline enterprise metrics for precise ROI quantification.';
