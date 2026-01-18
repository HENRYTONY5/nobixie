// Controlador para Hitos de Proyectos
const conexion = require('../database/db');

// OBTENER TODOS LOS HITOS DE UN PROYECTO
exports.obtenerHitos = (req, res) => {
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
                hp.*,
                COUNT(ap.id) as total_actividades,
                SUM(CASE WHEN ap.estado = 'Completada' THEN 1 ELSE 0 END) as actividades_completadas,
                SUM(ap.horas_invertidas) as total_horas_invertidas
            FROM hitos_proyecto hp
            LEFT JOIN actividades_proyecto ap ON hp.proyecto_id = ap.proyecto_id
            WHERE hp.proyecto_id = ?
            GROUP BY hp.id
            ORDER BY hp.fecha_objetivo ASC
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
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
};

// OBTENER UN HITO POR ID
exports.obtenerHito = (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                hp.*,
                COUNT(ap.id) as total_actividades,
                SUM(CASE WHEN ap.estado = 'Completada' THEN 1 ELSE 0 END) as actividades_completadas
            FROM hitos_proyecto hp
            LEFT JOIN actividades_proyecto ap ON hp.proyecto_id = ap.proyecto_id
            WHERE hp.id = ?
            GROUP BY hp.id
        `;

        conexion.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error al obtener hito:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener hito'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Hito no encontrado'
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

// CREAR NUEVO HITO
exports.crearHito = (req, res) => {
    try {
        const { proyecto_id, nombre, descripcion, fecha_objetivo } = req.body;

        if (!proyecto_id || !nombre || !fecha_objetivo) {
            return res.status(400).json({
                success: false,
                message: 'proyecto_id, nombre y fecha_objetivo son requeridos'
            });
        }

        // Verificar que el proyecto existe
        conexion.query('SELECT id FROM proyectos_activos WHERE id = ? AND activo = TRUE', [proyecto_id], (error, projects) => {
            if (error) {
                console.error('Error al verificar proyecto:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al crear hito'
                });
            }

            if (projects.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Proyecto no encontrado'
                });
            }

            const query = `
                INSERT INTO hitos_proyecto (proyecto_id, nombre, descripcion, fecha_objetivo, estado)
                VALUES (?, ?, ?, ?, 'No iniciado')
            `;

            conexion.query(query, [proyecto_id, nombre, descripcion || null, fecha_objetivo], (error, result) => {
                if (error) {
                    console.error('Error al crear hito:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al crear hito'
                    });
                }

                res.json({
                    success: true,
                    message: 'Hito creado correctamente',
                    hito_id: result.insertId
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

// ACTUALIZAR HITO
exports.actualizarHito = (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, fecha_objetivo, estado, fecha_completacion } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID del hito requerido'
            });
        }

        const query = `
            UPDATE hitos_proyecto 
            SET nombre = ?, descripcion = ?, fecha_objetivo = ?, estado = ?, fecha_completacion = ?
            WHERE id = ?
        `;

        conexion.query(
            query,
            [nombre, descripcion || null, fecha_objetivo, estado, fecha_completacion || null, id],
            (error, result) => {
                if (error) {
                    console.error('Error al actualizar hito:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al actualizar hito'
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Hito no encontrado'
                    });
                }

                res.json({
                    success: true,
                    message: 'Hito actualizado correctamente'
                });
            }
        );
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
};

// ELIMINAR HITO
exports.eliminarHito = (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID del hito requerido'
            });
        }

        const query = 'DELETE FROM hitos_proyecto WHERE id = ?';

        conexion.query(query, [id], (error, result) => {
            if (error) {
                console.error('Error al eliminar hito:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al eliminar hito'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Hito no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Hito eliminado correctamente'
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

// AUTO-CALCULAR ESTADO DEL HITO basado en actividades
exports.recalcularEstadoHito = (req, res) => {
    try {
        const { proyecto_id } = req.params;

        // Obtener hitos del proyecto
        const queryHitos = `
            SELECT hp.id,
                COUNT(ap.id) as total_actividades,
                SUM(CASE WHEN ap.estado = 'Completada' THEN 1 ELSE 0 END) as actividades_completadas,
                SUM(CASE WHEN ap.estado = 'En Progreso' THEN 1 ELSE 0 END) as actividades_en_progreso
            FROM hitos_proyecto hp
            LEFT JOIN actividades_proyecto ap ON hp.proyecto_id = ap.proyecto_id
            WHERE hp.proyecto_id = ?
            GROUP BY hp.id
        `;

        conexion.query(queryHitos, [proyecto_id], (error, hitos) => {
            if (error) {
                console.error('Error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al recalcular hitos'
                });
            }

            // Actualizar cada hito basado en sus actividades
            hitos.forEach(hito => {
                let nuevoEstado = 'No iniciado';
                
                if (hito.total_actividades > 0) {
                    if (hito.actividades_completadas === hito.total_actividades) {
                        nuevoEstado = 'Completado';
                    } else if (hito.actividades_en_progreso > 0 || hito.actividades_completadas > 0) {
                        nuevoEstado = 'En progreso';
                    }
                }

                const fecha_completacion = nuevoEstado === 'Completado' ? new Date() : null;

                conexion.query(
                    'UPDATE hitos_proyecto SET estado = ?, fecha_completacion = ? WHERE id = ?',
                    [nuevoEstado, fecha_completacion, hito.id]
                );
            });

            res.json({
                success: true,
                message: 'Hitos recalculados correctamente'
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
