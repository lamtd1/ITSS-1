import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import translationRoutes from './routes/translationRoutes.js';

import Translation from './models/Translation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

import sequelize from './config/database.js';

// PostgreSQL Connection
sequelize.authenticate()
    .then(async () => {
        console.log('PostgreSQL connected for AI Service');
        try {
            await sequelize.sync({ alter: true });
            console.log('Translation table synced');
        } catch (err) {
            console.error('Error syncing database:', err);
        }
    })
    .catch(err => console.error('PostgreSQL connection error:', err));

app.use('/', translationRoutes);

app.listen(PORT, () => {
    console.log(`AI Service running on port ${PORT}`);
});
