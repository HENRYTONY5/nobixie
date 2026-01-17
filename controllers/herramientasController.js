// Controlador para Herramientas Entregadas
const conexion = require('../database/db');

// OBTENER HERRAMIENTAS ENTREGADAS POR DEPARTAMENTO
exports.obtenerHerramientasEntregadas = (req, res) => {
    try {
        const { departamento } = req.query;

        let query = `
            SELECT 
                he.id,
                he.folio,
                he.herramienta,
                he.descripcion,
                he.departamento,
                he.fecha_entrega,
                he.estado,
                he.observaciones,
                e.id as empleado_id,
                e.nombre,
                e.numero_empleado,
                e.email
            FROM herramientas_entregadas he
            JOIN empleados e ON he.empleado_id = e.id
        `;

        const params = [];

        if (departamento && departamento.trim() !== '') {
            query += ' WHERE he.departamento = ?';
            params.push(departamento);
        }

        query += ' ORDER BY e.nombre, he.fecha_entrega DESC';

        conexion.query(query, params, (error, results) => {
            if (error) {
                console.error('Error al obtener herramientas entregadas:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener herramientas entregadas'
                });
            }

            // Agrupar por empleado
            const herramientasAgrupadas = {};

            results.forEach(item => {
                if (!herramientasAgrupadas[item.empleado_id]) {
                    herramientasAgrupadas[item.empleado_id] = {
                        empleado_id: item.empleado_id,
                        nombre: item.nombre,
                        numero_empleado: item.numero_empleado,
                        email: item.email,
                        entregas: []
                    };
                }

                herramientasAgrupadas[item.empleado_id].entregas.push({
                    id: item.id,
                    folio: item.folio,
                    herramienta: item.herramienta,
                    descripcion: item.descripcion,
                    departamento: item.departamento,
                    fecha_entrega: item.fecha_entrega,
                    estado: item.estado,
                    observaciones: item.observaciones
                });
            });

            const empleados = Object.values(herramientasAgrupadas);

            res.json({
                success: true,
                departamento: departamento || 'Todos',
                empleados: empleados,
                totalEntregas: results.length,
                totalEmpleados: empleados.length
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

// CREAR HERRAMIENTA ENTREGADA
exports.crearHerramientaEntregada = (req, res) => {
    try {
        const { folio, empleado_id, herramienta, descripcion, departamento, fecha_entrega, estado, observaciones } = req.body;

        if (!folio || !empleado_id || !herramienta || !departamento || !fecha_entrega) {
            return res.status(400).json({
                success: false,
                message: 'Campos requeridos: folio, empleado_id, herramienta, departamento, fecha_entrega'
            });
        }

        const query = `
            INSERT INTO herramientas_entregadas 
            (folio, empleado_id, herramienta, descripcion, departamento, fecha_entrega, estado, observaciones)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        conexion.query(
            query,
            [folio, empleado_id, herramienta, descripcion || null, departamento, fecha_entrega, estado || 'Entregado', observaciones || null],
            (error, result) => {
                if (error) {
                    console.error('Error al crear herramienta entregada:', error);
                    return res.status(500).json({
                        success: false,
                        message: error.code === 'ER_DUP_ENTRY' ? 'El folio ya existe' : 'Error al crear la entrega'
                    });
                }

                res.json({
                    success: true,
                    message: 'Herramienta entregada registrada correctamente',
                    id: result.insertId
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

// ACTUALIZAR HERRAMIENTA ENTREGADA
exports.actualizarHerramientaEntregada = (req, res) => {
    try {
        const { id } = req.params;
        const { folio, empleado_id, herramienta, descripcion, departamento, fecha_entrega, estado, observaciones } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID requerido'
            });
        }

        const query = `
            UPDATE herramientas_entregadas 
            SET folio = ?, empleado_id = ?, herramienta = ?, descripcion = ?, 
                departamento = ?, fecha_entrega = ?, estado = ?, observaciones = ?
            WHERE id = ?
        `;

        conexion.query(
            query,
            [folio, empleado_id, herramienta, descripcion || null, departamento, fecha_entrega, estado, observaciones || null, id],
            (error, result) => {
                if (error) {
                    console.error('Error al actualizar herramienta entregada:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al actualizar la entrega'
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'La entrega no existe'
                    });
                }

                res.json({
                    success: true,
                    message: 'Herramienta entregada actualizada correctamente'
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

// ELIMINAR HERRAMIENTA ENTREGADA
exports.eliminarHerramientaEntregada = (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID requerido'
            });
        }

        const query = 'DELETE FROM herramientas_entregadas WHERE id = ?';

        conexion.query(query, [id], (error, result) => {
            if (error) {
                console.error('Error al eliminar herramienta entregada:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al eliminar la entrega'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'La entrega no existe'
                });
            }

            res.json({
                success: true,
                message: 'Herramienta entregada eliminada correctamente'
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
