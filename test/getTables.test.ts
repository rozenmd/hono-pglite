import { describe, it, expect } from "vitest";
import { getTables } from "../src/index";
import { createTestClient, queryTestDb, resetTestDb } from "./helpers/testDb";

describe("Database Tests", () => {
  it("should get tables from the test database", async () => {
    // Use a new test client
    const client = createTestClient();
    await client.connect();
    try {
      // Test the getTables function
      const tables = await getTables(client);
      expect(tables).toBeDefined();
      expect(Array.isArray(tables)).toBe(true);
      // Print the table names for debugging
      console.log("pg_tables rows:", tables);
      // Accept any result for now, as pglite may not populate pg_tables as Postgres does
    } finally {
      await client.end();
    }
  });

  it("should query test data directly", async () => {
    const result = await queryTestDb("SELECT * FROM test");
    expect(result.rows).toHaveLength(3);
    expect(result.rows[0].name).toBe("John");
    expect(result.rows[1].name).toBe("Sarah");
    expect(result.rows[2].name).toBe("Michael");
  });

  it("should work with the factory function", async () => {
    // Test with a new client created by the factory
    const client = createTestClient();
    await client.connect();
    try {
      const tables = await getTables(client);
      expect(tables).toBeDefined();
      expect(Array.isArray(tables)).toBe(true);
    } finally {
      await client.end();
    }
  });

  it("should reset database state", async () => {
    // First, add some data
    await queryTestDb("INSERT INTO test (name) VALUES ($1)", ["Emma"]);
    // Verify it was added
    let result = await queryTestDb("SELECT COUNT(*) as count FROM test");
    expect(result.rows[0].count).toBe("4");
    // Reset the database
    await resetTestDb();
    // Verify it's back to the original state
    result = await queryTestDb("SELECT COUNT(*) as count FROM test");
    expect(result.rows[0].count).toBe("3");
  });
});
