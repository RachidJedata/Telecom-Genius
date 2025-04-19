-- CreateEnum
CREATE TYPE "ModelType" AS ENUM ('Fading', 'PathLoss', 'Multipath', 'Standard', 'Modulation');

-- AlterTable
ALTER TABLE "Courses" ADD COLUMN     "channel_type" "ModelType";
