import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_Jqk6UbDt5vXf@ep-square-sea-b41esflw-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
if (!connectionString) throw Error("Database URL not provided");

const sql = neon(connectionString);

export const db = drizzle({ client: sql });
