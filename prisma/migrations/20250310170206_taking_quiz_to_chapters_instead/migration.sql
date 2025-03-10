/*
  Warnings:

  - You are about to drop the column `quiz_id` on the `Courses` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Courses" DROP CONSTRAINT "Courses_quiz_id_fkey";

-- AlterTable
ALTER TABLE "Chapters" ADD COLUMN     "quiz_id" INTEGER;

-- AlterTable
ALTER TABLE "Courses" DROP COLUMN "quiz_id";

-- AddForeignKey
ALTER TABLE "Chapters" ADD CONSTRAINT "Chapters_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quizes"("quiz_id") ON DELETE SET NULL ON UPDATE CASCADE;
