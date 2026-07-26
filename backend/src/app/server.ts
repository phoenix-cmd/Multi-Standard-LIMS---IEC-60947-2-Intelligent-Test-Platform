import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { correlationMiddleware } from '../gateway/middleware/correlation.middleware.js';
import { createGatewayRouter } from '../gateway/router.js';
import { WSServer } from '../infrastructure/messaging/WebSocketServer.js';
import { KernelManifest } from '../kernel/KernelManifest.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(correlationMiddleware);

// Mount Versioned API Gateway Router (/api/v1)
app.use('/api/v1', createGatewayRouter());

const server = http.createServer(app);

// Initialize WebSockets
WSServer.getInstance().initialize(server);

// Startup Validation
const validation = KernelManifest.getInstance().validateStartup();
if (!validation.valid) {
  console.warn('⚠️ Kernel Startup Validation Warnings:', validation.errors);
}

server.listen(PORT, () => {
  console.log(`🚀 Enterprise Engineering OS Kernel running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint available at ws://localhost:${PORT}/ws`);
  console.log(`🔗 API Gateway available at http://localhost:${PORT}/api/v1/`);
});
