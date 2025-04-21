/*
  Warnings:

  - The primary key for the `Chapters` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `chapter_id` on the `Chapters` table. All the data in the column will be lost.
  - You are about to drop the column `course_id` on the `Chapters` table. All the data in the column will be lost.
  - You are about to drop the column `simulation_id` on the `Chapters` table. All the data in the column will be lost.
  - The primary key for the `Courses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `channel_type` on the `Courses` table. All the data in the column will be lost.
  - You are about to drop the column `course_id` on the `Courses` table. All the data in the column will be lost.
  - The primary key for the `Quizes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `correct_answer_index` on the `Quizes` table. All the data in the column will be lost.
  - You are about to drop the column `quiz_id` on the `Quizes` table. All the data in the column will be lost.
  - The primary key for the `Simulation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `end_point` on the `Simulation` table. All the data in the column will be lost.
  - You are about to drop the column `simulation_id` on the `Simulation` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `User` table. All the data in the column will be lost.
  - The required column `chapterId` was added to the `Chapters` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `courseId` was added to the `Courses` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `correctAnswerIndex` to the `Quizes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endPoint` to the `Simulation` table without a default value. This is not possible if the table is not empty.
  - The required column `userId` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Chapters" DROP CONSTRAINT "Chapters_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Chapters" DROP CONSTRAINT "Chapters_simulation_id_fkey";

-- DropForeignKey
ALTER TABLE "_QuizChapters" DROP CONSTRAINT "_QuizChapters_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuizChapters" DROP CONSTRAINT "_QuizChapters_B_fkey";

-- AlterTable
ALTER TABLE "Chapters" DROP CONSTRAINT "Chapters_pkey",
DROP COLUMN "chapter_id",
DROP COLUMN "course_id",
DROP COLUMN "simulation_id",
ADD COLUMN     "chapterId" TEXT NOT NULL,
ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "simulationId" INTEGER,
ADD CONSTRAINT "Chapters_pkey" PRIMARY KEY ("chapterId");

-- AlterTable
ALTER TABLE "Courses" DROP CONSTRAINT "Courses_pkey",
DROP COLUMN "channel_type",
DROP COLUMN "course_id",
ADD COLUMN     "channelType" "ModelType",
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD CONSTRAINT "Courses_pkey" PRIMARY KEY ("courseId");

-- AlterTable
ALTER TABLE "Quizes" DROP CONSTRAINT "Quizes_pkey",
DROP COLUMN "correct_answer_index",
DROP COLUMN "quiz_id",
ADD COLUMN     "correctAnswerIndex" INTEGER NOT NULL,
ADD COLUMN     "quizId" SERIAL NOT NULL,
ADD CONSTRAINT "Quizes_pkey" PRIMARY KEY ("quizId");

-- AlterTable
ALTER TABLE "Simulation" DROP CONSTRAINT "Simulation_pkey",
DROP COLUMN "end_point",
DROP COLUMN "simulation_id",
ADD COLUMN     "endPoint" TEXT NOT NULL,
ADD COLUMN     "simulationId" SERIAL NOT NULL,
ADD CONSTRAINT "Simulation_pkey" PRIMARY KEY ("simulationId");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("userId");

-- AddForeignKey
ALTER TABLE "Chapters" ADD CONSTRAINT "Chapters_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("courseId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapters" ADD CONSTRAINT "Chapters_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("simulationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuizChapters" ADD CONSTRAINT "_QuizChapters_A_fkey" FOREIGN KEY ("A") REFERENCES "Chapters"("chapterId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuizChapters" ADD CONSTRAINT "_QuizChapters_B_fkey" FOREIGN KEY ("B") REFERENCES "Quizes"("quizId") ON DELETE CASCADE ON UPDATE CASCADE;
