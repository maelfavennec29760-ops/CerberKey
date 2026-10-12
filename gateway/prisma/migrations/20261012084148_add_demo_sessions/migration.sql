-- CreateTable
CREATE TABLE "demo_sessions" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "tokenHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "demo_sessions_tokenHash_key" ON "demo_sessions"("tokenHash");
