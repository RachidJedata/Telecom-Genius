/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `User` table. All the data in the column will be lost.
  - The required column `user_id` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "avatar" SET DEFAULT '/avatars/default.svg',
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("user_id");

-- CreateTable
CREATE TABLE "Courses" (
    "course_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "quiz_id" INTEGER NOT NULL,

    CONSTRAINT "Courses_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "Chapters" (
    "chapter_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "end_point" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,

    CONSTRAINT "Chapters_pkey" PRIMARY KEY ("chapter_id")
);

-- CreateTable
CREATE TABLE "Quizes" (
    "quiz_id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correct_answer_index" INTEGER NOT NULL,
    "explaination" TEXT NOT NULL,

    CONSTRAINT "Quizes_pkey" PRIMARY KEY ("quiz_id")
);

-- AddForeignKey
ALTER TABLE "Courses" ADD CONSTRAINT "Courses_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quizes"("quiz_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapters" ADD CONSTRAINT "Chapters_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;
