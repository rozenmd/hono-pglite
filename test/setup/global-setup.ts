import { PGlite } from "@electric-sql/pglite";
import { createServer } from "pglite-server";
import { tmpdir } from "os";
import { join } from "path";
import { mkdtempSync, writeFileSync } from "fs";
import getPort from "get-port";

export async function setup() {
  const testDataDir = mkdtempSync(join(tmpdir(), "pglite-test-"));
  const db = new PGlite({ dataDir: testDataDir });
  await db.waitReady;

  await db.exec(`
    create table if not exists test (id serial primary key, name text);
    insert into test (name) values ('John'), ('Sarah'), ('Michael');
  `);

  // Use a random available port
  const PORT = await getPort();
  const pgServer = createServer(db);
  pgServer.listen(PORT, () => {
    console.log(`Test database server bound to port ${PORT}`);
  });

  // Write connection info to a file
  const info = {
    port: PORT,
    dataDir: testDataDir,
    user: "postgres",
    password: "postgres",
    database: "postgres",
    host: "localhost",
  };
  const infoPath = join(testDataDir, "test-db-info.json");
  writeFileSync(infoPath, JSON.stringify(info), "utf-8");

  // Save the info path for test helpers
  process.env.TEST_DB_INFO_PATH = infoPath;

  // Return for teardown
  return { db, pgServer, infoPath };
}

export async function teardown(ctx: any) {
  if (ctx && ctx.pgServer) {
    await new Promise<void>((resolve, reject) => {
      ctx.pgServer.close((err: any) => (err ? reject(err) : resolve()));
    });
  }
  if (ctx && ctx.db) await ctx.db.close();
  console.log("✅ Test database stopped");
  // Force exit to prevent lingering handles
  process.exit(0);
}
