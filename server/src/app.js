import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import sensorRoutes from './routes/sensorRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { verifySensorSecret } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://el-vigia.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, error: 'Demasiadas peticiones, intenta mas tarde' },
  standardHeaders: true,
  legacyHeaders: false,
});

const sensorLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: 'Sensor rate limit exceeded' },
});

app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/sensors', sensorRoutes);
app.use('/api/sensors/reading', verifySensorSecret, sensorLimiter);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint no encontrado' });
});

app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`El Vigia Server corriendo en http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
