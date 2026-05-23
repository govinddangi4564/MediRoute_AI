import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { connectDb } from './config/db.js';
import patientRoutes from './routes/patient.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3001' }));
app.use(express.json({ limit: '15mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'lifeline-ai-backend' }));
app.use('/api', patientRoutes);

connectDb().finally(() => {
  app.listen(port, () => {
    console.log(`LifeLine AI backend running on port ${port}`);
  });
});
