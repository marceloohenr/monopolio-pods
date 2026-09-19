import fs from "node:fs";
import { config } from "./config.js";
import { createApp } from "./app.js";
import { openDatabase, runMigrations } from "./db.js";
import { seedCatalog } from "./seed.js";

fs.mkdirSync(config.uploadDirectory, { recursive: true });
const database = openDatabase();
runMigrations(database);
await seedCatalog(database);

const server = createApp(database).listen(config.port, "127.0.0.1", () => {
  console.log(`Monopolio Pods listening on http://127.0.0.1:${config.port}`);
});

function shutdown() {
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

