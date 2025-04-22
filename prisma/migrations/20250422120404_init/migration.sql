/*
  Warnings:

  - Added the required column `title` to the `EnvironmentDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `EnvironmentScenarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EnvironmentDetails" ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EnvironmentScenarios" ADD COLUMN     "title" TEXT NOT NULL;
