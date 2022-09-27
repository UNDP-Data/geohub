import { Client } from 'ts-postgres'

export const pgClient = () => {
  const client = new Client({
    host: import.meta.env.VITE_PG_HOST,
    port: import.meta.env.VITE_PG_PORT,
    user: import.meta.env.VITE_PG_USER,
    password: import.meta.env.VITE_PG_PASSWORD,
    database: import.meta.env.VITE_PG_DATABASE,
    ssl: import.meta.env.VITE_PG_SSLMODE,
  })
  return client
}
