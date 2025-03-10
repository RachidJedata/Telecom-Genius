/*
  Warnings:

  - You are about to drop the column `quiz_id` on the `Chapters` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Chapters" DROP CONSTRAINT "Chapters_quiz_id_fkey";

-- AlterTable
ALTER TABLE "Chapters" DROP COLUMN "quiz_id";

-- CreateTable
CREATE TABLE "_QuizChapters" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_QuizChapters_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_QuizChapters_B_index" ON "_QuizChapters"("B");

-- AddForeignKey
ALTER TABLE "_QuizChapters" ADD CONSTRAINT "_QuizChapters_A_fkey" FOREIGN KEY ("A") REFERENCES "Chapters"("chapter_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuizChapters" ADD CONSTRAINT "_QuizChapters_B_fkey" FOREIGN KEY ("B") REFERENCES "Quizes"("quiz_id") ON DELETE CASCADE ON UPDATE CASCADE;
