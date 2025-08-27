import pg from "pg";
import env from "dotenv";

env.config();

const db = new pg.Client({
    user: process.env.PG_USER,
    host:process.env.PG_HOST,
    database:process.env.PG_DATABASE,
    password:process.env.PG_PASSWORD,
    port: process.env.PG_PORT
});
db.connect();

const createTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS reminders (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(20),
      time TIMESTAMP,
      message TEXT
    );
  `);
  console.log('Table created successfully');
};

createTable();

