/*
  Warnings:

  - The `courseId` column on the `Chapters` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Courses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `courseId` column on the `Courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "Chapters" DROP CONSTRAINT "Chapters_courseId_fkey";

-- AlterTable
ALTER TABLE "Chapters" DROP COLUMN "courseId",
ADD COLUMN     "courseId" INTEGER;

-- AlterTable
ALTER TABLE "Courses" DROP CONSTRAINT "Courses_pkey",
DROP COLUMN "courseId",
ADD COLUMN     "courseId" SERIAL NOT NULL,
ADD CONSTRAINT "Courses_pkey" PRIMARY KEY ("courseId");

-- CreateTable
CREATE TABLE "EnvironmentScenarios" (
    "envId" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "envDetailsId" TEXT NOT NULL,

    CONSTRAINT "EnvironmentScenarios_pkey" PRIMARY KEY ("envId")
);

-- CreateTable
CREATE TABLE "EnvironmentDetails" (
    "envDetailsId" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "EnvironmentDetails_pkey" PRIMARY KEY ("envDetailsId")
);

-- CreateTable
CREATE TABLE "_SuggestedEnvs" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SuggestedEnvs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnvironmentScenarios_envDetailsId_key" ON "EnvironmentScenarios"("envDetailsId");

-- CreateIndex
CREATE INDEX "_SuggestedEnvs_B_index" ON "_SuggestedEnvs"("B");

-- AddForeignKey
ALTER TABLE "Chapters" ADD CONSTRAINT "Chapters_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("courseId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentScenarios" ADD CONSTRAINT "EnvironmentScenarios_envDetailsId_fkey" FOREIGN KEY ("envDetailsId") REFERENCES "EnvironmentDetails"("envDetailsId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SuggestedEnvs" ADD CONSTRAINT "_SuggestedEnvs_A_fkey" FOREIGN KEY ("A") REFERENCES "EnvironmentDetails"("envDetailsId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SuggestedEnvs" ADD CONSTRAINT "_SuggestedEnvs_B_fkey" FOREIGN KEY ("B") REFERENCES "EnvironmentScenarios"("envId") ON DELETE CASCADE ON UPDATE CASCADE;
