import dotenv from 'dotenv';
dotenv.config();

import { pool } from './index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDB() {
  try {
    console.log('Inicializando base de datos...');
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schema);
    console.log('Base de datos inicializada correctamente');
    await pool.end();
  } catch (err) {
    console.error('Error inicializando la base de datos:', err.message);
    process.exit(1);
  }
}

initDB();
