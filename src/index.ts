import { Hono } from "hono";
import { Client } from "pg";

export interface Env {
  HYPERDRIVE: Hyperdrive;
}

// Database service function that can be easily tested
export async function getTables(client: Client) {
  const results = await client.query("SELECT * FROM pg_tables");
  return results.rows;
}

// Factory function to create a client
export function createClient(connectionString: string): Client {
  return new Client({ connectionString });
}

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const client = createClient(c.env.HYPERDRIVE.connectionString);

  try {
    await client.connect();
    const tables = await getTables(client);
    await client.end();
    return c.json(tables);
  } catch (e) {
    console.error(e);
    return c.json({ error: e instanceof Error ? e.message : e }, 500);
  }
});

export default app;
