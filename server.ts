import express from 'express';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRouter from './api/routes.ts';

dotenv.config();

// Load AI Studio container secrets from /app/.dev.env.json if present
function loadContainerSecrets() {
  const devEnvPath = '/app/.dev.env.json';
  try {
    if (fs.existsSync(devEnvPath)) {
      const raw = fs.readFileSync(devEnvPath, 'utf8');
      const data = JSON.parse(raw);
      for (const [key, val] of Object.entries(data)) {
        if (typeof val === 'string' && val.trim() !== '') {
          process.env[key] = val;
        }
      }
    }
  } catch (err) {
    // Ignore container secret reading errors
  }
}
loadContainerSecrets();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Mount API router
  app.use('/api', apiRouter);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Career Navigator server ready on http://0.0.0.0:${PORT}`);
  });
}

startServer();
