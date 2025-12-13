CREATE TABLE "Company" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"county" text NOT NULL,
	"type" text NOT NULL,
	"rate" text NOT NULL,
	"hasUrl" boolean,
	"url" text,
	"description" text,
	"values" text,
	"businessModel" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "Company_name_idx" ON "Company" USING btree ("name");