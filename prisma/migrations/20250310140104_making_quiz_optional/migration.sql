/*
  Warnings:

  - You are about to drop the column `name` on the `Courses` table. All the data in the column will be lost.
  - Added the required column `title` to the `Courses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Courses" DROP CONSTRAINT "Courses_quiz_id_fkey";

-- AlterTable
ALTER TABLE "Courses" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "quiz_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Courses" ADD CONSTRAINT "Courses_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quizes"("quiz_id") ON DELETE SET NULL ON UPDATE CASCADE;
