/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Salon` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Salon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Salon" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Salon_slug_key" ON "Salon"("slug");
