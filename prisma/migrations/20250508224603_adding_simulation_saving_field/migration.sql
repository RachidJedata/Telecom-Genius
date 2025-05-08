-- AlterTable
ALTER TABLE "EnvironmentScenarios" ADD COLUMN     "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Simulation" ADD COLUMN     "savedParams" TEXT;
