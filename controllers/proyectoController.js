// Controlador para Proyectos Activos
const conexion = require('../database/db');

// OBTENER TODOS LOS PROYECTOS
exports.obtenerProyectos = (req, res) => {
    const query = `
        SELECT 
            pa.id,
            pa.nombre_proyecto,
            pa.cliente,
            pa.estado,
            pa.porcentaje_avance,
            pa.fecha_ejecucion,
            pa.fecha_termino_prevista,
            pa.presupuesto_estimado,
            pa.presupuesto_real,
            e.nombre as encargado,
            COUNT(ap.id) as total_actividades,
            SUM(CASE WHEN ap.estado = 'Completada' THEN 1 ELSE 0 END) as actividades_completadas
        FROM proyectos_activos pa
        LEFT JOIN empleados e ON pa.encargado_id = e.id
        LEFT JOIN actividades_proyecto ap ON pa.id = ap.proyecto_id
        WHERE pa.activo = TRUE
        GROUP BY pa.id
        ORDER BY pa.fecha_ejecucion DESC
    `;

    conexion.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener proyectos:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener proyectos'
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};

// OBTENER DETALLE DE UN PROYECTO
exports.obtenerProyecto = (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT 
            pa.*,
            e.nombre as encargado,
            e.email as email_encargado,
            u.user as creado_por
        FROM proyectos_activos pa
        LEFT JOIN empleados e ON pa.encargado_id = e.id
        LEFT JOIN users u ON pa.creado_por = u.id
        WHERE pa.id = ?
    `;

    conexion.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error al obtener proyecto:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener proyecto'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Proyecto no encontrado'
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    });
};

// CREAR NUEVO PROYECTO
exports.crearProyecto = async (req, res) => {
    try {
        const {
            nombre_proyecto,
            descripcion,
            cliente,
            encargado_id,
            fecha_levantamiento,
            presupuesto_estimado,
            horas_estimadas
        } = req.body;

        // Validar campos obligatorios
        if (!nombre_proyecto || !cliente) {
            return res.status(400).json({
                success: false,
                message: 'Nombre del proyecto y cliente son obligatorios'
            });
        }

        const proyectoData = {
            nombre_proyecto,
            descripcion: descripcion || null,
            cliente,
            encargado_id: encargado_id || null,
            fecha_levantamiento: fecha_levantamiento || null,
            presupuesto_estimado: presupuesto_estimado || null,
            horas_estimadas: horas_estimadas || null,
            estado: 'Levantamiento',
            creado_por: req.user?.id || null
        };

        const query = 'INSERT INTO proyectos_activos SET ?';
        conexion.query(query, proyectoData, (error, result) => {
            if (error) {
                console.error('Error al crear proyecto:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al crear proyecto'
                });
            }

            res.json({
                success: true,
                message: 'Proyecto creado correctamente',
                data: { id: result.insertId }
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
};

// ACTUALIZAR PROYECTO
exports.actualizarProyecto = (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre_proyecto,
            descripcion,
            cliente,
            encargado_id,
            estado,
            fecha_cotizacion,
            fecha_ejecucion,
            fecha_termino_prevista,
            fecha_termino_real,
            presupuesto_estimado,
            presupuesto_real,
            orden_compra,
            estatus_oc,
            porcentaje_avance,
            horas_invertidas
        } = req.body;

        const updateData = {
            nombre_proyecto,
            descripcion,
            cliente,
            encargado_id,
            estado,
            fecha_cotizacion,
            fecha_ejecucion,
            fecha_termino_prevista,
            fecha_termino_real,
            presupuesto_estimado,
            presupuesto_real,
            orden_compra,
            estatus_oc,
            porcentaje_avance,
            horas_invertidas
        };

        const query = 'UPDATE proyectos_activos SET ? WHERE id = ?';
        conexion.query(query, [updateData, id], (error, result) => {
            if (error) {
                console.error('Error al actualizar proyecto:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al actualizar proyecto'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Proyecto no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Proyecto actualizado correctamente'
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
};

// OBTENER ACTIVIDADES DEL PROYECTO
exports.obtenerActividades = (req, res) => {
    const { proyecto_id } = req.params;

    const query = `
        SELECT 
            ap.*,
            e.nombre as responsable,
            e.email as email_responsable
        FROM actividades_proyecto ap
        LEFT JOIN empleados e ON ap.responsable_id = e.id
        WHERE ap.proyecto_id = ?
        ORDER BY ap.prioridad DESC, ap.fecha_vencimiento ASC
    `;

    conexion.query(query, [proyecto_id], (error, results) => {
        if (error) {
            console.error('Error al obtener actividades:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener actividades'
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};

// CREAR ACTIVIDAD EN PROYECTO
exports.crearActividad = (req, res) => {
    try {
        const { proyecto_id } = req.params;
        const {
            titulo,
            descripcion,
            responsable_id,
            tipo,
            prioridad,
            horas_estimadas,
            fecha_inicio,
            fecha_vencimiento
        } = req.body;

        if (!titulo) {
            return res.status(400).json({
                success: false,
                message: 'El título de la actividad es obligatorio'
            });
        }

        const actividadData = {
            proyecto_id,
            titulo,
            descripcion: descripcion || null,
            responsable_id: responsable_id || null,
            tipo: tipo || 'Tarea',
            prioridad: prioridad || 'Media',
            horas_estimadas: horas_estimadas || null,
            fecha_inicio: fecha_inicio || null,
            fecha_vencimiento: fecha_vencimiento || null
        };

        const query = 'INSERT INTO actividades_proyecto SET ?';
        conexion.query(query, actividadData, (error, result) => {
            if (error) {
                console.error('Error al crear actividad:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al crear actividad'
                });
            }

            res.json({
                success: true,
                message: 'Actividad creada correctamente',
                data: { id: result.insertId }
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
};

// OBTENER HITOS DEL PROYECTO
exports.obtenerHitos = (req, res) => {
    const { proyecto_id } = req.params;

    const query = `
        SELECT * FROM hitos_proyecto
        WHERE proyecto_id = ?
        ORDER BY fecha_objetivo ASC
    `;

    conexion.query(query, [proyecto_id], (error, results) => {
        if (error) {
            console.error('Error al obtener hitos:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener hitos'
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};

// OBTENER RESUMEN PARA DASHBOARD
exports.obtenerResumenProyectos = (req, res) => {
    const query = `
        SELECT 
            COUNT(*) as total_proyectos,
            SUM(CASE WHEN estado = 'En Ejecución' THEN 1 ELSE 0 END) as en_ejecucion,
            SUM(CASE WHEN estado = 'Finalizado' THEN 1 ELSE 0 END) as finalizados,
            SUM(CASE WHEN estado = 'Pausa' THEN 1 ELSE 0 END) as en_pausa,
            AVG(porcentaje_avance) as promedio_avance,
            SUM(presupuesto_estimado) as presupuesto_total,
            SUM(presupuesto_real) as presupuesto_invertido
        FROM proyectos_activos
        WHERE activo = TRUE
    `;

    conexion.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener resumen:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener resumen'
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    });
};
