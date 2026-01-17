// Controlador para Supervisores de Empleados
const conexion = require('../database/db');

// ASIGNAR EMPLEADO A SUPERVISOR
exports.asignarEmpleadoASupervisor = async (req, res) => {
    try {
        const {
            supervisor_id,
            empleado_id,
            departamento
        } = req.body;

        // Validar campos obligatorios
        if (!supervisor_id || !empleado_id || !departamento) {
            return res.status(400).json({
                success: false,
                message: 'Campos obligatorios faltantes'
            });
        }

        // Validar que el supervisor existe y es supervisor
        conexion.query(
            'SELECT id, tipo_empleado FROM empleados WHERE id = ?',
            [supervisor_id],
            (error, supervisorResult) => {
                if (error) {
                    console.error('Error al verificar supervisor:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Error del servidor'
                    });
                }

                if (supervisorResult.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'El supervisor no existe'
                    });
                }

                if (supervisorResult[0].tipo_empleado !== 'Supervisor') {
                    return res.status(400).json({
                        success: false,
                        message: 'El usuario seleccionado no es un supervisor'
                    });
                }

                // Validar que el empleado existe
                conexion.query(
                    'SELECT id FROM empleados WHERE id = ?',
                    [empleado_id],
                    (error, empleadoResult) => {
                        if (error) {
                            console.error('Error al verificar empleado:', error);
                            return res.status(500).json({
                                success: false,
                                message: 'Error del servidor'
                            });
                        }

                        if (empleadoResult.length === 0) {
                            return res.status(404).json({
                                success: false,
                                message: 'El empleado no existe'
                            });
                        }

                        // Validar departamento
                        const departamentosValidos = ['Pailería', 'Administración', 'Eléctricos', 'Mantenimiento'];
                        if (!departamentosValidos.includes(departamento)) {
                            return res.status(400).json({
                                success: false,
                                message: 'Departamento inválido'
                            });
                        }

                        // Insertar asignación
                        const query = 'INSERT INTO supervisores_empleados (supervisor_id, empleado_id, departamento) VALUES (?, ?, ?)';
                        conexion.query(query, [supervisor_id, empleado_id, departamento], (error, result) => {
                            if (error) {
                                if (error.code === 'ER_DUP_ENTRY') {
                                    return res.status(400).json({
                                        success: false,
                                        message: 'Esta asignación ya existe'
                                    });
                                }
                                console.error('Error al asignar empleado:', error);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Error al asignar empleado'
                                });
                            }

                            res.json({
                                success: true,
                                message: 'Empleado asignado correctamente al supervisor',
                                data: { id: result.insertId }
                            });
                        });
                    }
                );
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

// OBTENER EMPLEADOS DE UN SUPERVISOR
exports.obtenerEmpleadosSupervisor = (req, res) => {
    try {
        const { supervisor_id } = req.params;

        const query = `
            SELECT 
                se.id,
                se.departamento,
                se.fecha_asignacion,
                e.id as empleado_id,
                e.nombre,
                e.email,
                e.puesto,
                e.tipo_empleado
            FROM supervisores_empleados se
            JOIN empleados e ON se.empleado_id = e.id
            WHERE se.supervisor_id = ? AND e.activo = TRUE
            ORDER BY se.departamento, e.nombre
        `;

        conexion.query(query, [supervisor_id], (error, results) => {
            if (error) {
                console.error('Error al obtener empleados:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener empleados'
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

// OBTENER SUPERVISORES CON SUS EMPLEADOS
exports.obtenerSupervisores = (req, res) => {
    try {
        // Primero obtener todos los supervisores
        const querysupervisores = `
            SELECT 
                e.id,
                e.nombre as nombre_supervisor,
                e.email,
                e.numero_empleado
            FROM empleados e
            WHERE e.tipo_empleado = 'Supervisor' AND e.activo = TRUE
            ORDER BY e.nombre
        `;

        conexion.query(querysupervisores, (error, supervisores) => {
            if (error) {
                console.error('Error al obtener supervisores:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener supervisores'
                });
            }

            if (supervisores.length === 0) {
                return res.json({
                    success: true,
                    supervisores: []
                });
            }

            // Para cada supervisor, obtener sus empleados
            let supervisoresConEmpleados = [];
            let procesados = 0;

            supervisores.forEach(supervisor => {
                const queryEmpleados = `
                    SELECT 
                        e.id,
                        e.nombre,
                        e.numero_empleado,
                        e.email,
                        e.puesto,
                        e.departamento
                    FROM supervisores_empleados se
                    JOIN empleados e ON se.empleado_id = e.id
                    WHERE se.supervisor_id = ? AND e.activo = TRUE
                    ORDER BY e.nombre
                `;

                conexion.query(queryEmpleados, [supervisor.id], (error, empleados) => {
                    if (error) {
                        console.error('Error al obtener empleados del supervisor:', error);
                        empleados = [];
                    }

                    supervisoresConEmpleados.push({
                        ...supervisor,
                        empleados: empleados || []
                    });

                    procesados++;

                    // Cuando se procesen todos los supervisores, enviar respuesta
                    if (procesados === supervisores.length) {
                        res.json({
                            success: true,
                            supervisores: supervisoresConEmpleados
                        });
                    }
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

// ELIMINAR ASIGNACIÓN
exports.eliminarAsignacion = (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM supervisores_empleados WHERE id = ?';
        conexion.query(query, [id], (error, result) => {
            if (error) {
                console.error('Error al eliminar asignación:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al eliminar asignación'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'La asignación no existe'
                });
            }

            res.json({
                success: true,
                message: 'Asignación eliminada correctamente'
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

// ELIMINAR EMPLEADO DE SUPERVISOR (por supervisor_id y empleado_id)
exports.eliminarAsignacionPorSupervisorEmpleado = (req, res) => {
    try {
        const { supervisor_id, empleado_id } = req.body;

        if (!supervisor_id || !empleado_id) {
            return res.status(400).json({
                success: false,
                message: 'Supervisor ID y Empleado ID son requeridos'
            });
        }

        const query = 'DELETE FROM supervisores_empleados WHERE supervisor_id = ? AND empleado_id = ?';
        conexion.query(query, [supervisor_id, empleado_id], (error, result) => {
            if (error) {
                console.error('Error al eliminar asignación:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al eliminar asignación'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'La asignación no existe'
                });
            }

            res.json({
                success: true,
                message: 'Asignación eliminada correctamente'
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

// ASIGNAR DEPARTAMENTO COMPLETO A SUPERVISOR
exports.asignarDepartamentoASupervisor = async (req, res) => {
    try {
        const { supervisor_id, departamento } = req.body;

        // Validar campos obligatorios
        if (!supervisor_id || !departamento) {
            return res.status(400).json({
                success: false,
                message: 'Supervisor y departamento son obligatorios'
            });
        }

        // Validar departamento
        const departamentosValidos = ['Pailería', 'Administración', 'Eléctricos', 'Mantenimiento'];
        if (!departamentosValidos.includes(departamento)) {
            return res.status(400).json({
                success: false,
                message: 'Departamento inválido'
            });
        }

        // Validar que el supervisor existe y es supervisor
        conexion.query(
            'SELECT id, tipo_empleado FROM empleados WHERE id = ?',
            [supervisor_id],
            (error, supervisorResult) => {
                if (error) {
                    console.error('Error al verificar supervisor:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Error del servidor'
                    });
                }

                if (supervisorResult.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'El supervisor no existe'
                    });
                }

                if (supervisorResult[0].tipo_empleado !== 'Supervisor') {
                    return res.status(400).json({
                        success: false,
                        message: 'El usuario seleccionado no es un supervisor'
                    });
                }

                // Insertar asignaciones usando INSERT ... SELECT
                const query = `
                    INSERT INTO supervisores_empleados (supervisor_id, empleado_id, departamento)
                    SELECT ?, id, ?
                    FROM empleados
                    WHERE departamento = ? AND activo = TRUE AND tipo_empleado = 'Empleado'
                    ON DUPLICATE KEY UPDATE departamento = VALUES(departamento)
                `;
                
                conexion.query(query, [supervisor_id, departamento, departamento], (error, result) => {
                    if (error) {
                        console.error('Error al asignar departamento:', error);
                        return res.status(500).json({
                            success: false,
                            message: 'Error al asignar departamento'
                        });
                    }

                    res.json({
                        success: true,
                        message: `${result.affectedRows} empleado(s) asignado(s) correctamente al supervisor`,
                        cantidad: result.affectedRows
                    });
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
