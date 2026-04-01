import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { expand } from "dotenv-expand";

// Load .env.local (Next.js convention)
expand(config({ path: ".env.local" }));

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
