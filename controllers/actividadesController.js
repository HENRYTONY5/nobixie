// Controlador para Actividades de Proyectos
const conexion = require('../database/db');

// OBTENER TODAS LAS ACTIVIDADES DE UN PROYECTO
exports.obtenerActividades = (req, res) => {
    try {
        const { proyecto_id } = req.query;

        if (!proyecto_id) {
            return res.status(400).json({
                success: false,
                message: 'proyecto_id es requerido'
            });
        }

        const query = `
            SELECT 
                ap.*,
                e.nombre as responsable_nombre,
                e.email as responsable_email
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
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
};

// OBTENER UNA ACTIVIDAD POR ID
exports.obtenerActividad = (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                ap.*,
                e.nombre as responsable_nombre,
                e.email as responsable_email,
                pa.nombre_proyecto
            FROM actividades_proyecto ap
            LEFT JOIN empleados e ON ap.responsable_id = e.id
            LEFT JOIN proyectos_activos pa ON ap.proyecto_id = pa.id
            WHERE ap.id = ?
        `;

        conexion.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error al obtener actividad:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener actividad'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Actividad no encontrada'
                });
            }

            res.json({
                success: true,
                data: results[0]
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

// CREAR NUEVA ACTIVIDAD
exports.crearActividad = (req, res) => {
    try {
        const { 
            proyecto_id, 
            titulo, 
            descripcion, 
            responsable_id, 
            tipo = 'Tarea', 
            prioridad = 'Media',
            horas_estimadas,
            fecha_inicio,
            fecha_vencimiento 
        } = req.body;

        if (!proyecto_id || !titulo) {
            return res.status(400).json({
                success: false,
                message: 'proyecto_id y titulo son requeridos'
            });
        }

        // Verificar que el proyecto existe
        conexion.query('SELECT id FROM proyectos_activos WHERE id = ? AND activo = TRUE', [proyecto_id], (error, projects) => {
            if (error) {
                console.error('Error al verificar proyecto:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al crear actividad'
                });
            }

            if (projects.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Proyecto no encontrado'
                });
            }

            const query = `
                INSERT INTO actividades_proyecto 
                (proyecto_id, titulo, descripcion, responsable_id, tipo, prioridad, horas_estimadas, fecha_inicio, fecha_vencimiento, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente')
            `;

            conexion.query(
                query,
                [proyecto_id, titulo, descripcion || null, responsable_id || null, tipo, prioridad, horas_estimadas || 0, fecha_inicio || null, fecha_vencimiento || null],
                (error, result) => {
                    if (error) {
                        console.error('Error al crear actividad:', error);
                        return res.status(500).json({
                            success: false,
                            message: 'Error al crear actividad'
                        });
                    }

                    // Recalcular avance del proyecto
                    recalcularAvanceProyecto(proyecto_id);

                    res.json({
                        success: true,
                        message: 'Actividad creada correctamente',
                        actividad_id: result.insertId
                    });
                }
            );
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
};

// ACTUALIZAR ACTIVIDAD
exports.actualizarActividad = (req, res) => {
    try {
        const { id } = req.params;
        const { 
            titulo, 
            descripcion, 
            responsable_id, 
            tipo, 
            prioridad, 
            estado, 
            horas_estimadas, 
            horas_invertidas,
            fecha_inicio, 
            fecha_vencimiento, 
            fecha_completacion 
        } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID de actividad requerido'
            });
        }

        // Obtener actividad actual para el proyecto_id
        conexion.query('SELECT proyecto_id FROM actividades_proyecto WHERE id = ?', [id], (error, activities) => {
            if (error || activities.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Actividad no encontrada'
                });
            }

            const proyecto_id = activities[0].proyecto_id;

            const query = `
                UPDATE actividades_proyecto 
                SET titulo = ?, descripcion = ?, responsable_id = ?, tipo = ?, prioridad = ?, 
                    estado = ?, horas_estimadas = ?, horas_invertidas = ?,
                    fecha_inicio = ?, fecha_vencimiento = ?, fecha_completacion = ?
                WHERE id = ?
            `;

            conexion.query(
                query,
                [titulo, descripcion || null, responsable_id || null, tipo, prioridad, estado, horas_estimadas || 0, horas_invertidas || 0, fecha_inicio || null, fecha_vencimiento || null, fecha_completacion || null, id],
                (error, result) => {
                    if (error) {
                        console.error('Error al actualizar actividad:', error);
                        return res.status(500).json({
                            success: false,
                            message: 'Error al actualizar actividad'
                        });
                    }

                    // Verificar si es "Liberación del AST" y se completó
                    if (titulo && titulo.toLowerCase().includes('liberación del ast') && estado === 'Completada') {
                        console.log(`✓ Actividad "Liberación del AST" completada - Cambiando proyecto ${proyecto_id} a "En Ejecución"`);
                        
                        const updateProyecto = `
                            UPDATE proyectos_activos 
                            SET estado = 'En Ejecución', 
                                fecha_ejecucion = CURDATE()
                            WHERE id = ? AND estado != 'En Ejecución'
                        `;
                        
                        conexion.query(updateProyecto, [proyecto_id], (err) => {
                            if (err) {
                                console.error('Error al actualizar estado del proyecto:', err);
                            } else {
                                console.log(`✓ Proyecto ${proyecto_id} ahora en "En Ejecución"`);
                            }
                        });
                    }

                    // Recalcular avance del proyecto
                    recalcularAvanceProyecto(proyecto_id);

                    res.json({
                        success: true,
                        message: 'Actividad actualizada correctamente'
                    });
                }
            );
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
};

// ELIMINAR ACTIVIDAD
exports.eliminarActividad = (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID de actividad requerido'
            });
        }

        // Obtener proyecto_id antes de eliminar
        conexion.query('SELECT proyecto_id FROM actividades_proyecto WHERE id = ?', [id], (error, activities) => {
            if (error || activities.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Actividad no encontrada'
                });
            }

            const proyecto_id = activities[0].proyecto_id;

            conexion.query('DELETE FROM actividades_proyecto WHERE id = ?', [id], (error, result) => {
                if (error) {
                    console.error('Error al eliminar actividad:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al eliminar actividad'
                    });
                }

                // Recalcular avance del proyecto
                recalcularAvanceProyecto(proyecto_id);

                res.json({
                    success: true,
                    message: 'Actividad eliminada correctamente'
                });
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

// ============================================
// FUNCIÓN AUXILIAR: Recalcular avance del proyecto
// ============================================
function recalcularAvanceProyecto(proyecto_id) {
    const query = `
        SELECT 
            COUNT(id) as total_actividades,
            SUM(CASE WHEN estado = 'Completada' THEN 1 ELSE 0 END) as completadas,
            SUM(horas_invertidas) as total_horas_invertidas,
            SUM(horas_estimadas) as total_horas_estimadas
        FROM actividades_proyecto
        WHERE proyecto_id = ?
    `;

    conexion.query(query, [proyecto_id], (error, results) => {
        if (error) {
            console.error('Error al recalcular avance:', error);
            return;
        }

        const stats = results[0];
        let porcentaje_avance = 0;

        if (stats.total_actividades > 0) {
            porcentaje_avance = Math.round((stats.completadas / stats.total_actividades) * 100);
        }

        // Actualizar proyecto
        conexion.query(
            'UPDATE proyectos_activos SET porcentaje_avance = ?, horas_invertidas = ? WHERE id = ?',
            [porcentaje_avance, stats.total_horas_invertidas || 0, proyecto_id]
        );
    });
}

// Exportar función auxiliar para uso externo
exports.recalcularAvanceProyecto = recalcularAvanceProyecto;
