ALTER TABLE "geohub"."storymap" ADD COLUMN "center" geometry(Point,4326);--> statement-breakpoint
ALTER TABLE "geohub"."storymap" ADD COLUMN "zoom" double precision;--> statement-breakpoint
ALTER TABLE "geohub"."storymap" ADD COLUMN "bearing" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "geohub"."storymap" ADD COLUMN "pitch" double precision DEFAULT 0 NOT NULL;