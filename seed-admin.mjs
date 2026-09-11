import "dotenv/config";
import { Pool } from "pg";
import { randomBytes, scryptSync } from "crypto";
import fs from "fs";

console.log("🔍 بررسی متغیرهای محیطی...");

// خودمون دستی .env.local رو می‌خونیم (چون dotenv فقط .env رو می‌خونه)
if (fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  });
  console.log("✅ فایل .env.local خونده شد");
} else {
  console.log("❌ فایل .env.local پیدا نشد!");
}

if (!process.env.DATABASE_URL) {
  console.log("❌ DATABASE_URL تنظیم نشده!");
  process.exit(1);
}
console.log("✅ DATABASE_URL پیدا شد");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const username = "admin";
  const password = "4815";
  const passwordHash = hashPassword(password);

  try {
    console.log("🔌 در حال اتصال به دیتابیس...");

    // اول ساختار جدول رو چک کن
    const cols = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'admins'",
    );
    console.log("📋 ستون‌های جدول admins:");
    cols.rows.forEach((r) => console.log("   -", r.column_name));

    const existing = await pool.query("SELECT id FROM admins LIMIT 1");

    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE admins SET username = $1, password_hash = $2 WHERE id = $3",
        [username, passwordHash, existing.rows[0].id],
      );
      console.log("✅ رمز ادمین آپدیت شد");
    } else {
      await pool.query(
        "INSERT INTO admins (username, password_hash) VALUES ($1, $2)",
        [username, passwordHash],
      );
      console.log("✅ ادمین جدید ساخته شد");
    }
    console.log("   👤 نام کاربری: admin");
    console.log("   🔑 رمز عبور: 4815");
  } catch (err) {
    console.error("❌ خطا:", err.message);
  } finally {
    await pool.end();
  }
}

main();
