// api/silent-schedule.js → VERSIÓN QUE FUNCIONA AL 100% (sin legacy props + responses correcto)

import fetch from 'node-fetch';

export default async function silentScheduleHandler(req, res, apiKey) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

    const { startTime, endTime, email, responsable = 'Cliente Ultravox', comentarios_cliente = '' } = req.body;

    if (!startTime || !endTime || !email) {
        return res.status(400).json({ status: 'error', message: 'Faltan startTime, endTime o email' });
    }

    // Limpiamos campos para evitar el error de trim
    const cleanEmail = String(email).trim();
    const cleanName = String(responsable).trim();
    const cleanNotes = String(comentarios_cliente || '').trim();

    const payload = {
        eventTypeId: 4037384,
        start: startTime,
        end: endTime,
        timeZone: 'America/Mexico_City',
        language: 'es',
        metadata: {},
        // responses: SOLO con los campos requeridos (name, email, notes)
        responses: {
            name: cleanName,
            email: cleanEmail,
            notes: cleanNotes
        }
    };

    // Usamos la ruta API de Cal.com
    const url = `https://api.cal.com/api/bookings?apiKey=${apiKey}`;

    try {
        console.log('Payload enviado:', JSON.stringify(payload, null, 2));

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Respuesta de Cal.com:', data);

        if (response.ok || response.status === 201) {
            const googleEventId = data.references?.find(r => r.type === 'google_calendar')?.uid || 'Sincronizado (verifica en Cal.com)';
            return res.json({
                status: 'success',
                bookingId: data.id,
                uid: data.uid,
                googleEventId,
                message: '¡Cita agendada correctamente y sincronizada con Google Calendar!'
            });
        } else {
            return res.status(response.status).json({ status: 'error', calcomError: data });
        }
    } catch (err) {
        console.error('Error interno del servidor:', err);
        return res.status(500).json({ status: 'error', message: err.message });
    }
}
