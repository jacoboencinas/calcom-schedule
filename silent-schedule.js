// api/silent-schedule.js → VERSIÓN FINAL Y FUNCIONAL

import 'dotenv/config'; // Para cargar variables de entorno como CAL_API_KEY
// No necesitamos importar axios/fetch aquí si tu entorno ya soporta fetch
// como en tu script anterior.

export default async function silentScheduleHandler(req, res) {
    // La validación de POST ya se maneja en server.js, pero lo dejamos aquí por seguridad.
    if (req.method !== "POST") {
        // Enviar respuesta inmediatamente
        return res.status(405).json({ error: "Método no permitido" });
    }

    // Desestructurar los datos enviados por Ultravox
    // La corrección en server.js ahora asegura que req.body esté definido.
    const { startTime, endTime, responsable, comentarios_cliente } = req.body;

    // Validación básica de datos
    if (!startTime || !endTime) {
        // Enviar respuesta inmediatamente
        return res.status(400).json({ error: "Faltan startTime o endTime" });
    }

    try {
        const payload = {
            // Datos fijos del evento (tomados de tu configuración de prueba)
            eventTypeId: 4028372, 
            username: "jacobo-encinas-ozx8y9", 
            userId: 1954907, // ¡TU ID DE USUARIO NUMÉRICO CORRECTO!
            user: "jacobo-encinas-ozx8y9", 

            // Datos variables de la cita
            start: startTime,
            end: endTime,
            
            // Datos adicionales
            timeZone: "America/Mexico_City",
            language: "es",
            
            responses: {
                // Usamos el email fijo, ya que Ultravox no lo envía variable en tu última prueba
                name: responsable || "Cliente desde Ultravox",
                email: "jacobo.encinas1928@gmail.com", 
                notes: comentarios_cliente || ""
            },
            metadata: {
                fuente: "Ultravox",
                agente: "Jacobo",
                comentarios_cliente: comentarios_cliente // Se incluye aquí para trazabilidad
            },
            // Eliminamos "silent: true" para asegurar la notificación y la creación del ID
        };

        const response = await fetch("https://api.cal.com/v2/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Asegúrate de que process.env.CAL_API_KEY esté disponible en tu .env
                Authorization: `Bearer ${process.env.CAL_API_KEY}` 
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Error de Cal.com:", data);
            // Si Cal.com devuelve un error, lo pasamos a Ultravox
            return res.status(response.status).json({ 
                status: 'error',
                message: data.message || 'Error al agendar en Cal.com',
                details: data 
            });
        }

        // ÉXITO: Obtener el ID de la reserva y responder a Ultravox
        const bookingId = data.booking?.id || data.id || "desconocido";
        console.log("¡CITA CREADA Y SINCRONIZADA CON GOOGLE CALENDAR! ID:", bookingId);

        return res.status(200).json({
            status: 'success',
            bookingId,
            message: "Cita agendada correctamente en Cal.com y sincronizada con Google Calendar."
        });

    } catch (error) {
        console.error("Error interno del servidor:", error);
        
        // Error genérico si algo falló en Node.js (ej. error de red)
        return res.status(500).json({ 
            status: 'error',
            message: "Error interno del servidor al procesar la solicitud." 
        });
    }
}