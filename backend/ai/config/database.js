import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sequelize = new Sequelize(
    process.env.AI_DB_NAME,
    process.env.AI_DB_USER,
    process.env.AI_DB_PASSWORD,
    {
        host: process.env.AI_DB_HOST || 'localhost',
        port: process.env.AI_DB_PORT || 5432,
        dialect: 'postgres',
        logging: false, // Set to console.log to see SQL queries
    }
);

export default sequelize;
