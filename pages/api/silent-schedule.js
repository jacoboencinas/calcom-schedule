import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { startTime, email, responsable = 'Cliente Ultravox', comentarios_cliente = '' } = req.body;

  if (!startTime || !email) {
    return res.status(400).json({ error: 'Faltan startTime o email' });
  }

  const start = new Date(startTime);
  const end = new Date(start.getTime() + 15 * 60000);
  const endTime = end.toISOString().replace('.000Z', '-06:00');

  const payload = {
    eventTypeId: 4037384,
    user: "jacobo-encinas-ozx8y9",
    start: startTime,
    end: endTime,
    timeZone: 'America/Mexico_City',
    language: 'es',
    responses: {
      name: String(responsable).trim(),
      email: String(email).trim(),
      notes: String(comentarios_cliente || '').trim()
    }
  };

  try {
    const response = await fetch(`https://api.cal.com/v1/bookings?apiKey=${process.env.CAL_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok || response.status === 201) {
      return res.json({ status: 'success', booking: data });
    } else {
      return res.status(400).json({ status: 'error', calcomError: data });
    }
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}
