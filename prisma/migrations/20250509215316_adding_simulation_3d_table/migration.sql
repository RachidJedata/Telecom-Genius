-- CreateTable
CREATE TABLE "simulation3D" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "endPoint" TEXT NOT NULL,
    "params" TEXT NOT NULL,

    CONSTRAINT "simulation3D_pkey" PRIMARY KEY ("id")
);
