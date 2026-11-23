import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { connectDatabase } from './db.js';
import authRouter from './routes/auth.js';
import entriesRouter from './routes/entries.js';
import publicRouter from './routes/public.js';
import statsRouter from './routes/stats.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leetlog';

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is missing — set it in server/.env');
}

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/public', publicRouter);

async function start() {
  try {
    const connectedUri = await connectDatabase(MONGODB_URI);
    console.log('MongoDB connected:', connectedUri.includes('127.0.0.1') || connectedUri.includes('localhost')
      ? connectedUri
      : '(remote/memory)');
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
