const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED,
});

async function addColumn() {
  try {
    await pool.query(
      `ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "passwordHash" text`
    );
    console.log("Added passwordHash column to User table");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

addColumn();
