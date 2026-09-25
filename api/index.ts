/**
 * Vercel Serverless Function Entrypoint
 */

import express from 'express';
import apiRouter from './routes.ts';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount the API router
app.use('/api', apiRouter);

export default app;
