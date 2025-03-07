/*
  Warnings:

  - The values [github,google,none] on the enum `Providers` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Providers_new" AS ENUM ('GITHUB', 'GOOGLE', 'NONE');
ALTER TABLE "User" ALTER COLUMN "provider" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "provider" TYPE "Providers_new" USING ("provider"::text::"Providers_new");
ALTER TYPE "Providers" RENAME TO "Providers_old";
ALTER TYPE "Providers_new" RENAME TO "Providers";
DROP TYPE "Providers_old";
ALTER TABLE "User" ALTER COLUMN "provider" SET DEFAULT 'NONE';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "provider" SET DEFAULT 'NONE';
