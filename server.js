// server.js  ←  COPIA Y PEGA TODO ESTO TAL CUAL
import { config } from 'dotenv';
config();

import express from 'express';
import silentScheduleHandler from './api/silent-schedule.js';

const app = express();
const port = 3000;

// PASAMOS LA CLAVE DIRECTAMENTE AL HANDLER (así nunca falla)
const CAL_API_KEY = process.env.CAL_API_KEY?.trim();

if (!CAL_API_KEY) {
  console.error('FATAL: No hay CAL_API_KEY en el .env');
  process.exit(1);
}

app.use(express.json());

// Le pasamos la clave al handler como closure
app.post('/api/silent-schedule', (req, res) => 
  silentScheduleHandler(req, res, CAL_API_KEY)
);

app.get('/', (req, res) => res.json({ status: 'OK', keyLoaded: !!CAL_API_KEY }));

app.listen(port, () => console.log('Servidor ON – clave cargada correctamente'));