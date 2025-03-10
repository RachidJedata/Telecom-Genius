/*
  Warnings:

  - You are about to drop the column `end_point` on the `Chapters` table. All the data in the column will be lost.
  - You are about to drop the column `params` on the `Chapters` table. All the data in the column will be lost.
  - Added the required column `simulation_id` to the `Chapters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chapters" DROP COLUMN "end_point",
DROP COLUMN "params",
ADD COLUMN     "simulation_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Simulation" (
    "simulation_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "end_point" TEXT NOT NULL,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("simulation_id")
);

-- AddForeignKey
ALTER TABLE "Chapters" ADD CONSTRAINT "Chapters_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "Simulation"("simulation_id") ON DELETE RESTRICT ON UPDATE CASCADE;
