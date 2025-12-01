// api/silent-schedule.js  → Versión Vercel + Ultravox 100% funcional (2025)

import fetch from 'node-fetch';

// Vercel Serverless Function
export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { startTime, endTime, email, responsable = 'Cliente Ultravox', comentarios_cliente = '' } = req.body;

  if (!startTime || !endTime || !email) {
    return res.status(400).json({
      status: 'error',
      message: 'Faltan startTime, endTime o email'
    });
  }

  const CAL_API_KEY = process.env.CAL_API_KEY;

  if (!CAL_API_KEY) {
    return res.status(500).json({ status: 'error', message: 'API Key no configurada en el servidor' });
  }

  const cleanEmail = String(email).trim();
  const cleanName = String(responsable).trim();
  const cleanNotes = String(comentarios_cliente || '').trim();

  const payload = {
    eventTypeId: 4037384,                                    // Cambia este ID si usas otro evento
    start: startTime,                                        // ej: "2025-12-10T14:00:00-06:00"
    end: endTime,
    timeZone: "America/Mexico_City",
    language: "es",
    responses: {
      name: cleanName,
      email: cleanEmail,
      notes: cleanNotes
    }
  };

  try {
    const response = await fetch(`https://api.cal.com/api/bookings?apiKey=${CAL_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok || response.status === 201) {
      const meetLink = data.references?.find(r => r.type.includes('meet') || r.type.includes('zoom'))?.meetingUrl || null;

      return res.status(200).json({
        success: true,
        bookingId: data.id,
        uid: data.uid,
        meetingUrl: meetLink || 'Revisa tu email o Cal.com',
        message: '¡Cita agendada con éxito por Ultravox!'
      });
    } else {
      return res.status(response.status).json({
        success: false,
        error: data
      });
    }
  } catch (error) {
    console.error('Error en silent-schedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno',
      details: error.message
    });
  }
}

// Necesario para Vercel
export const config = {
  api: {
    bodyParser: true,
  },
};
