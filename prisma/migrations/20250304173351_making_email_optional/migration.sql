-- CreateEnum
CREATE TYPE "Providers" AS ENUM ('github', 'google', 'none');

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "provider" "Providers" NOT NULL DEFAULT 'none',
    "avatar" TEXT NOT NULL DEFAULT '/avatars/default.png',

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
