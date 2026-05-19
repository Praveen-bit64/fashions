import { Pool } from 'pg';

/**
 * Cache the pool on globalThis so Next.js' dev-mode fast refresh doesn't
 * create a new Pool on every hot reload (which would exhaust Postgres
 * connection limits within a few file saves).
 */
const globalForPg = globalThis as unknown as { __pgPool?: Pool };

function buildPool(): Pool {
    return new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT ?? 5432),
        max: 10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
    });
}

export const db: Pool = globalForPg.__pgPool ?? buildPool();

if (process.env.NODE_ENV !== 'production') {
    globalForPg.__pgPool = db;
}
