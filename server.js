// server.js

import express from 'express';
// Asegúrate de añadir el import 'dotenv/config' si lo necesitas para cargar variables
// import 'dotenv/config'; 
import silentScheduleHandler from './api/silent-schedule.js'; // Importa el handler

const app = express();
const port = 3000;

// **********************************************
// CORRECCIÓN CRÍTICA: Middleware para parsear JSON
// **********************************************
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Definición de la ruta para la herramienta de Ultravox
app.post('/api/silent-schedule', async (req, res) => {
    // 1. Logear el request para depuración
    console.log('Request recibido desde Ultravox:', req.body);

    try {
        // 2. Llama a la lógica de agendamiento en silent-schedule.js y le pasa req y res
        // Ahora es silent-schedule.js quien se encarga de responder (res.status().json())
        await silentScheduleHandler(req, res);

    } catch (error) {
        // 3. Manejar errores internos (solo si silentScheduleHandler falla antes de responder)
        console.error('Error interno del servidor:', error);

        // Aseguramos que solo respondemos si no se ha enviado una respuesta antes
        if (!res.headersSent) {
            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor al procesar la solicitud.'
            });
        }
    }
});

// Arrancar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    console.log('Listo para recibir llamadas de Ultravox');
});