import { Client } from "pg";
import { readFileSync } from "fs";

function getDbInfo() {
  const infoPath = process.env.TEST_DB_INFO_PATH;
  if (!infoPath) {
    throw new Error("TEST_DB_INFO_PATH is not set. Did global-setup run?");
  }
  return JSON.parse(readFileSync(infoPath, "utf-8"));
}

export function createTestClient() {
  const info = getDbInfo();
  return new Client(info);
}

export async function queryTestDb(sql: string, params?: any[]) {
  const client = createTestClient();
  await client.connect();
  try {
    return await client.query(sql, params);
  } finally {
    await client.end();
  }
}

export async function resetTestDb() {
  const client = createTestClient();
  await client.connect();
  try {
    await client.query("DROP TABLE IF EXISTS test CASCADE;");
    await client.query(
      "CREATE TABLE IF NOT EXISTS test (id serial primary key, name text);"
    );
    await client.query(
      `INSERT INTO test (name) VALUES ('John'), ('Sarah'), ('Michael');`
    );
  } finally {
    await client.end();
  }
}
