-- AlterTable
ALTER TABLE "projects" ADD COLUMN "team_id" UUID;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "google_id" VARCHAR(255),
ADD COLUMN "provider" VARCHAR(50) DEFAULT 'credentials',
ADD COLUMN "login_method" VARCHAR(50) DEFAULT 'credentials',
ADD COLUMN "created_by_google" BOOLEAN DEFAULT false,
ADD COLUMN "email_verification_token" VARCHAR(255),
ADD COLUMN "email_verification_expiry" TIMESTAMP(3),
ADD COLUMN "reset_password_otp_hash" VARCHAR(255),
ADD COLUMN "reset_password_otp_expiry" TIMESTAMP(3),
ADD COLUMN "otp_resend_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "otp_resend_cooldown" TIMESTAMP(3),
ADD COLUMN "otp_verify_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "last_password_change" TIMESTAMP(3),
ADD COLUMN "last_login_ip" VARCHAR(50),
ADD COLUMN "last_login_device" VARCHAR(255);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_queue" (
    "id" UUID NOT NULL,
    "to" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "html" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_team_id_idx" ON "projects"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "email_queue_status_idx" ON "email_queue"("status");

-- CreateIndex
CREATE INDEX "email_queue_created_at_idx" ON "email_queue"("created_at");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
