import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { expand } from "dotenv-expand";

// Load .env.local (Next.js convention)
expand(config({ path: ".env.local" }));

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  }
});
