/**
 * Vercel Serverless Function Entrypoint
 */

import express from 'express';
import apiRouter from './routes.ts';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount the API router on both root and /api to handle Vercel serverless routing
app.use('/api', apiRouter);
app.use(apiRouter);

export default app;
