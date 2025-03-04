-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "api";

-- CreateTable
CREATE TABLE "api"."sponsor_levels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "amount" DECIMAL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sponsor_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api"."sponsors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "level" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "cloudinary_public_id" TEXT,
    "image_url" TEXT,
    "website_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "api"."users"("email");

-- AddForeignKey
ALTER TABLE "api"."sponsors" ADD CONSTRAINT "sponsors_level_fkey" FOREIGN KEY ("level") REFERENCES "api"."sponsor_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
