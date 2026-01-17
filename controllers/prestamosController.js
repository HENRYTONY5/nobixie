// Controlador para Herramientas Prestadas
const conexion = require('../database/db');

// OBTENER HERRAMIENTAS PRESTADAS
exports.obtenerHerramientasPrestadas = (req, res) => {
    try {
        let query = `
            SELECT 
                hp.id,
                hp.folio,
                hp.herramienta,
                hp.modelo,
                hp.numero_serie,
                hp.marca,
                hp.descripcion,
                hp.departamento,
                hp.estado,
                hp.fecha_prestamo,
                hp.fecha_devolucion_estimada,
                hp.fecha_devolucion_real,
                hp.observaciones,
                e.id as empleado_id,
                e.nombre,
                e.numero_empleado,
                e.email
            FROM herramientas_prestadas hp
            JOIN empleados e ON hp.empleado_id = e.id
            ORDER BY e.nombre, hp.fecha_prestamo DESC
        `;

        conexion.query(query, (error, results) => {
            if (error) {
                console.error('Error al obtener herramientas prestadas:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener herramientas prestadas'
                });
            }

            // Mapear resultados
            const prestamos = results.map(item => ({
                id: item.id,
                folio: item.folio,
                herramienta: item.herramienta,
                modelo: item.modelo,
                numero_serie: item.numero_serie,
                marca: item.marca,
                descripcion: item.descripcion,
                departamento: item.departamento,
                estado: item.estado,
                fecha_prestamo: item.fecha_prestamo,
                fecha_devolucion_estimada: item.fecha_devolucion_estimada,
                fecha_devolucion_real: item.fecha_devolucion_real,
                observaciones: item.observaciones,
                empleado_id: item.empleado_id,
                nombre: item.nombre,
                numero_empleado: item.numero_empleado,
                email: item.email
            }));

            res.json({
                success: true,
                prestamos: prestamos,
                total: prestamos.length
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

// CREAR HERRAMIENTA PRESTADA
exports.crearHerramientaPrestada = (req, res) => {
    try {
        const { folio, empleado_id, herramienta, modelo, numero_serie, marca, descripcion, departamento, fecha_prestamo, fecha_devolucion_estimada, estado, observaciones } = req.body;

        if (!folio || !empleado_id || !herramienta || !departamento || !fecha_prestamo) {
            return res.status(400).json({
                success: false,
                message: 'Campos requeridos: folio, empleado_id, herramienta, departamento, fecha_prestamo'
            });
        }

        const query = `
            INSERT INTO herramientas_prestadas 
            (folio, empleado_id, herramienta, modelo, numero_serie, marca, descripcion, departamento, fecha_prestamo, fecha_devolucion_estimada, estado, observaciones)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        conexion.query(
            query,
            [folio, empleado_id, herramienta, modelo || null, numero_serie || null, marca || null, descripcion || null, departamento, fecha_prestamo, fecha_devolucion_estimada || null, estado || 'Prestado', observaciones || null],
            (error, result) => {
                if (error) {
                    console.error('Error al crear herramienta prestada:', error);
                    return res.status(500).json({
                        success: false,
                        message: error.code === 'ER_DUP_ENTRY' ? 'El folio ya existe' : 'Error al crear el préstamo'
                    });
                }

                res.json({
                    success: true,
                    message: 'Préstamo registrado correctamente',
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

// ACTUALIZAR HERRAMIENTA PRESTADA
exports.actualizarHerramientaPrestada = (req, res) => {
    try {
        const { id } = req.params;
        const { folio, empleado_id, herramienta, modelo, numero_serie, marca, descripcion, departamento, fecha_prestamo, fecha_devolucion_estimada, estado, fecha_devolucion_real, observaciones } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID requerido'
            });
        }

        const query = `
            UPDATE herramientas_prestadas 
            SET folio = ?, empleado_id = ?, herramienta = ?, modelo = ?, numero_serie = ?, marca = ?, descripcion = ?, 
                departamento = ?, fecha_prestamo = ?, fecha_devolucion_estimada = ?, estado = ?, fecha_devolucion_real = ?, observaciones = ?
            WHERE id = ?
        `;

        conexion.query(
            query,
            [folio, empleado_id, herramienta, modelo || null, numero_serie || null, marca || null, descripcion || null, departamento, fecha_prestamo, fecha_devolucion_estimada || null, estado, fecha_devolucion_real || null, observaciones || null, id],
            (error, result) => {
                if (error) {
                    console.error('Error al actualizar herramienta prestada:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al actualizar el préstamo'
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'El préstamo no existe'
                    });
                }

                res.json({
                    success: true,
                    message: 'Préstamo actualizado correctamente'
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

// ELIMINAR HERRAMIENTA PRESTADA
exports.eliminarHerramientaPrestada = (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID requerido'
            });
        }

        const query = 'DELETE FROM herramientas_prestadas WHERE id = ?';

        conexion.query(query, [id], (error, result) => {
            if (error) {
                console.error('Error al eliminar herramienta prestada:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el préstamo'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'El préstamo no existe'
                });
            }

            res.json({
                success: true,
                message: 'Préstamo eliminado correctamente'
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
