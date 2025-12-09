import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import translationRoutes from './routes/translationRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
// Use env var or fallback to the one found in ai-service
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://fullstack:admin%40%40123@cluster0.f5qsnek.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected for AI Service'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/', translationRoutes);

app.listen(PORT, () => {
    console.log(`AI Service running on port ${PORT}`);
});
