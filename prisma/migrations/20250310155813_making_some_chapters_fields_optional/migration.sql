-- DropForeignKey
ALTER TABLE "Chapters" DROP CONSTRAINT "Chapters_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Chapters" DROP CONSTRAINT "Chapters_simulation_id_fkey";

-- AlterTable
ALTER TABLE "Chapters" ALTER COLUMN "course_id" DROP NOT NULL,
ALTER COLUMN "simulation_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Chapters" ADD CONSTRAINT "Chapters_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("course_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapters" ADD CONSTRAINT "Chapters_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "Simulation"("simulation_id") ON DELETE SET NULL ON UPDATE CASCADE;
