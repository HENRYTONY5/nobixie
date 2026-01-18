// Sistema de Alertas para Actividades Vencidas
// Requiere: npm install twilio (para WhatsApp)
const conexion = require('../database/db');

/**
 * Verifica actividades "Liberación del AST" que están por vencer o vencidas
 * y cuyos proyectos no han avanzado
 */
function verificarActividadesAST() {
    const query = `
        SELECT 
            ap.id as actividad_id,
            ap.titulo,
            ap.fecha_vencimiento,
            ap.estado as estado_actividad,
            DATEDIFF(ap.fecha_vencimiento, CURDATE()) as dias_restantes,
            pa.id as proyecto_id,
            pa.nombre_proyecto,
            pa.estado as estado_proyecto,
            pa.porcentaje_avance,
            e.nombre as responsable_nombre,
            e.telefono as responsable_telefono
        FROM actividades_proyecto ap
        INNER JOIN proyectos_activos pa ON ap.proyecto_id = pa.id
        LEFT JOIN empleados e ON ap.responsable_id = e.id
        WHERE ap.titulo LIKE '%Liberación del AST%'
            AND ap.estado != 'Completada'
            AND ap.fecha_vencimiento IS NOT NULL
            AND (
                -- Vence en 3 días o menos
                DATEDIFF(ap.fecha_vencimiento, CURDATE()) <= 3
                -- O ya venció
                OR ap.fecha_vencimiento < CURDATE()
            )
            AND pa.estado NOT IN ('En Ejecución', 'Finalizado', 'Cancelado')
            AND (pa.porcentaje_avance IS NULL OR pa.porcentaje_avance < 5)
        ORDER BY ap.fecha_vencimiento ASC
    `;

    conexion.query(query, (error, actividades) => {
        if (error) {
            console.error('Error verificando actividades:', error);
            return;
        }

        if (actividades.length === 0) {
            console.log('✓ No hay alertas de AST pendientes');
            return;
        }

        console.log(`⚠️  ${actividades.length} alertas de Liberación del AST encontradas:\n`);

        actividades.forEach(act => {
            const mensaje = generarMensajeAlerta(act);
            console.log(mensaje);
            console.log('─'.repeat(60));

            // Enviar WhatsApp si hay teléfono
            if (act.responsable_telefono) {
                enviarWhatsApp(act.responsable_telefono, mensaje);
            } else {
                console.log(`⚠️  Sin teléfono para ${act.responsable_nombre || 'responsable'}\n`);
            }
        });
    });
}

/**
 * Genera el mensaje de alerta personalizado
 */
function generarMensajeAlerta(actividad) {
    const { 
        nombre_proyecto, 
        titulo, 
        dias_restantes, 
        fecha_vencimiento,
        estado_proyecto,
        porcentaje_avance,
        responsable_nombre
    } = actividad;

    const fecha = new Date(fecha_vencimiento).toLocaleDateString('es-MX');
    let urgencia = '';
    let emoji = '';

    if (dias_restantes < 0) {
        urgencia = `¡VENCIDA hace ${Math.abs(dias_restantes)} días!`;
        emoji = '🚨';
    } else if (dias_restantes === 0) {
        urgencia = '¡VENCE HOY!';
        emoji = '⚠️';
    } else if (dias_restantes === 1) {
        urgencia = 'Vence MAÑANA';
        emoji = '⏰';
    } else {
        urgencia = `Vence en ${dias_restantes} días`;
        emoji = '📅';
    }

    return `${emoji} ALERTA - LIBERACIÓN DEL AST ${emoji}

Proyecto: ${nombre_proyecto}
Estado actual: ${estado_proyecto} (${porcentaje_avance || 0}% avance)
Actividad: ${titulo}
${urgencia} (${fecha})

Responsable: ${responsable_nombre || 'Sin asignar'}

⚠️ El proyecto debe iniciar ejecución completando esta actividad.

🔗 Accede al sistema para actualizar:
http://localhost:3000/proyectos#proyecto-${actividad.proyecto_id}-actividades
`;
}

/**
 * Envía mensaje por WhatsApp usando Twilio
 * Requiere configurar variables de entorno en .env:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_WHATSAPP_NUMBER (ej: whatsapp:+14155238886)
 */
function enviarWhatsApp(telefono, mensaje) {
    // Verificar si Twilio está configurado
    if (!process.env.TWILIO_ACCOUNT_SID) {
        console.log('ℹ️  Twilio no configurado. Mensaje NO enviado a WhatsApp.');
        console.log('   Para habilitar: npm install twilio y configurar .env\n');
        return;
    }

    try {
        const twilio = require('twilio');
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        // Formatear número (debe incluir código de país, ej: +52)
        const numeroFormateado = telefono.startsWith('+') 
            ? `whatsapp:${telefono}` 
            : `whatsapp:+52${telefono}`;

        client.messages.create({
            body: mensaje,
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: numeroFormateado
        })
        .then(message => {
            console.log(`✓ WhatsApp enviado a ${telefono} (SID: ${message.sid})\n`);
        })
        .catch(error => {
            console.error(`✗ Error enviando WhatsApp a ${telefono}:`, error.message, '\n');
        });
    } catch (error) {
        console.error('Error con Twilio:', error.message);
        console.log('   Instala con: npm install twilio\n');
    }
}

/**
 * Programa verificación periódica (cada hora)
 */
function iniciarMonitoreo() {
    console.log('🔍 Sistema de alertas AST iniciado');
    console.log('   Verificando cada hora...\n');

    // Verificar inmediatamente
    verificarActividadesAST();

    // Verificar cada hora (3600000 ms)
    setInterval(verificarActividadesAST, 3600000);
}

// Exportar funciones
module.exports = {
    verificarActividadesAST,
    iniciarMonitoreo,
    enviarWhatsApp
};

// Si se ejecuta directamente
if (require.main === module) {
    require('dotenv').config({ path: './env/.env' });
    verificarActividadesAST();
    
    // Cerrar conexión después de 5 segundos
    setTimeout(() => {
        conexion.end();
        process.exit(0);
    }, 5000);
}
