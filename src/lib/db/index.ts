import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("No database URL found. Set POSTGRES_URL or DATABASE_URL.");
}

const client = postgres(connectionString);

export const db = drizzle(client, { schema });
