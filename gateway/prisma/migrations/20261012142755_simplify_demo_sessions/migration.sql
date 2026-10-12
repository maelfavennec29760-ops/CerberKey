/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "demo_sessions" ADD COLUMN     "nonce" TEXT,
ADD COLUMN     "usedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "users";
