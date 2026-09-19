import { createAdmin } from "./auth.js";
import { openDatabase, runMigrations } from "./db.js";

const [email, password] = process.argv.slice(2);
if (!email || !password || password.length < 12) {
  console.error("Usage: create-admin <email> <password-with-at-least-12-characters>");
  process.exit(1);
}

const database = openDatabase();
runMigrations(database);
await createAdmin(database, email, password);
database.close();
console.log(`Administrative account provisioned for ${email}.`);
