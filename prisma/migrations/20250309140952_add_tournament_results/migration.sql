-- CreateTable
CREATE TABLE "api"."tournament_years" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api"."flights" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tournament_year_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api"."teams" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "flight_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api"."results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "team_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "score" DECIMAL NOT NULL,
    "purse" DECIMAL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api"."players" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "team_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api"."contests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tournament_year_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api"."contest_results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contest_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "result" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contest_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tournament_years_year_key" ON "api"."tournament_years"("year");

-- AddForeignKey
ALTER TABLE "api"."flights" ADD CONSTRAINT "flights_tournament_year_id_fkey" FOREIGN KEY ("tournament_year_id") REFERENCES "api"."tournament_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api"."teams" ADD CONSTRAINT "teams_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "api"."flights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api"."results" ADD CONSTRAINT "results_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "api"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api"."players" ADD CONSTRAINT "players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "api"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api"."contests" ADD CONSTRAINT "contests_tournament_year_id_fkey" FOREIGN KEY ("tournament_year_id") REFERENCES "api"."tournament_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api"."contest_results" ADD CONSTRAINT "contest_results_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "api"."contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api"."contest_results" ADD CONSTRAINT "contest_results_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "api"."players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
