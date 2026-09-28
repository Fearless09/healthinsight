import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw Error("Database URL not provided");

const sql = neon(connectionString);

export const db = drizzle({ client: sql });
