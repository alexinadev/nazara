/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ReviewCriteria` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rating` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DeviceToken" DROP CONSTRAINT "DeviceToken_customerId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceToken" DROP CONSTRAINT "DeviceToken_staffId_fkey";

-- DropForeignKey
ALTER TABLE "Gallery" DROP CONSTRAINT "Gallery_staffId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_customerId_fkey";

-- AlterTable
ALTER TABLE "DeviceToken" ADD COLUMN     "userRole" "Role";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE INDEX "Appointment_salonId_idx" ON "Appointment"("salonId");

-- CreateIndex
CREATE INDEX "Appointment_staffId_idx" ON "Appointment"("staffId");

-- CreateIndex
CREATE INDEX "Appointment_customerId_idx" ON "Appointment"("customerId");

-- CreateIndex
CREATE INDEX "Appointment_scheduledAt_idx" ON "Appointment"("scheduledAt");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "AppointmentDiscount_appointmentId_idx" ON "AppointmentDiscount"("appointmentId");

-- CreateIndex
CREATE INDEX "AppointmentDiscount_discountId_idx" ON "AppointmentDiscount"("discountId");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "DeviceToken_staffId_idx" ON "DeviceToken"("staffId");

-- CreateIndex
CREATE INDEX "DeviceToken_customerId_idx" ON "DeviceToken"("customerId");

-- CreateIndex
CREATE INDEX "DeviceToken_token_idx" ON "DeviceToken"("token");

-- CreateIndex
CREATE INDEX "Discount_code_idx" ON "Discount"("code");

-- CreateIndex
CREATE INDEX "FavoriteSalon_customerId_idx" ON "FavoriteSalon"("customerId");

-- CreateIndex
CREATE INDEX "FavoriteStaff_customerId_idx" ON "FavoriteStaff"("customerId");

-- CreateIndex
CREATE INDEX "Review_customerId_idx" ON "Review"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewCriteria_name_key" ON "ReviewCriteria"("name");

-- CreateIndex
CREATE INDEX "ReviewCriteriaScore_reviewId_idx" ON "ReviewCriteriaScore"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewCriteriaScore_criteriaId_idx" ON "ReviewCriteriaScore"("criteriaId");

-- CreateIndex
CREATE INDEX "SearchHistory_customerId_idx" ON "SearchHistory"("customerId");

-- CreateIndex
CREATE INDEX "ServiceOption_serviceId_idx" ON "ServiceOption"("serviceId");

-- CreateIndex
CREATE INDEX "Staff_salonId_idx" ON "Staff"("salonId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
