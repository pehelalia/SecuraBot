// Prisma configuration for CLI & migrations
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // url is required for migrate dev
    url: process.env.DATABASE_URL,
    adapter: process.env.DATABASE_URL,
  },
});
