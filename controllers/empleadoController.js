// Controlador para Empleados
const conexion = require('../database/db');

// OBTENER TODOS LOS EMPLEADOS
exports.obtenerEmpleados = (req, res) => {
    const query = 'SELECT * FROM empleados WHERE activo = TRUE ORDER BY fecha_registro DESC';
    
    conexion.query(query, (error, results) => {
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
};

// GUARDAR NUEVO EMPLEADO
exports.guardarEmpleado = async (req, res) => {
    try {
        const {
            nombre,
            email,
            telefono,
            rfc,
            calle,
            numero,
            ciudad,
            estado,
            codigo_postal,
            genero,
            fecha_nacimiento,
            estado_civil,
            escolaridad,
            puesto,
            tipo_empleado,
            departamento,
            fecha_ingreso,
            numero_empleado
        } = req.body;

        // Validar campos obligatorios
        if (!nombre || !email || !puesto || !tipo_empleado || !departamento) {
            return res.status(400).json({
                success: false,
                message: 'Campos obligatorios faltantes: nombre, email, puesto, tipo_empleado, departamento'
            });
        }

        // Validar que tipo_empleado sea válido
        const tiposValidos = ['Administrativo', 'Supervisor', 'Técnico'];
        if (!tiposValidos.includes(tipo_empleado)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de empleado inválido. Debe ser: Administrativo, Supervisor o Técnico'
            });
        }

        // Validar que departamento sea válido
        const departamentosValidos = ['Panadería', 'Administración', 'Eléctricos'];
        if (!departamentosValidos.includes(departamento)) {
            return res.status(400).json({
                success: false,
                message: 'Departamento inválido. Debe ser: Panadería, Administración o Eléctricos'
            });
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
        }

        // Verificar si el email ya existe
        conexion.query('SELECT id FROM empleados WHERE email = ?', [email], (error, results) => {
            if (error) {
                console.error('Error al verificar email:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error del servidor'
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Este email ya está registrado'
                });
            }

            // Preparar datos
            const empleadoData = {
                nombre,
                email,
                telefono: telefono || null,
                rfc: rfc || null,
                calle: calle || null,
                numero: numero || null,
                ciudad: ciudad || null,
                estado: estado || null,
                codigo_postal: codigo_postal || null,
                genero: genero || null,
                fecha_nacimiento: fecha_nacimiento || null,
                estado_civil: estado_civil || null,
                escolaridad: escolaridad || null,
                puesto,
                tipo_empleado,
                departamento,
                fecha_ingreso: fecha_ingreso || null,
                numero_empleado: numero_empleado || null,
                activo: true
            };

            // Insertar empleado
            conexion.query('INSERT INTO empleados SET ?', empleadoData, (error, results) => {
                if (error) {
                    console.error('Error al crear empleado:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al crear empleado'
                    });
                }

                res.status(201).json({
                    success: true,
                    message: '¡Empleado registrado exitosamente!',
                    id: results.insertId
                });
            });
        });
    } catch (error) {
        console.error('Error en guardarEmpleado:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// OBTENER UN EMPLEADO
exports.obtenerEmpleado = (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID inválido'
        });
    }

    conexion.query('SELECT * FROM empleados WHERE id = ?', [id], (error, results) => {
        if (error) {
            console.error('Error al obtener empleado:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener empleado'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    });
};

// ACTUALIZAR EMPLEADO
exports.actualizarEmpleado = (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            email,
            telefono,
            rfc,
            calle,
            numero,
            ciudad,
            estado,
            codigo_postal,
            genero,
            fecha_nacimiento,
            estado_civil,
            escolaridad,
            puesto,
            tipo_empleado,
            departamento,
            fecha_ingreso,
            numero_empleado
        } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        if (!nombre || !puesto || !tipo_empleado || !departamento) {
            return res.status(400).json({
                success: false,
                message: 'Campos obligatorios faltantes'
            });
        }

        const updateData = {
            nombre,
            email,
            telefono: telefono || null,
            rfc: rfc || null,
            calle: calle || null,
            numero: numero || null,
            ciudad: ciudad || null,
            estado: estado || null,
            codigo_postal: codigo_postal || null,
            genero: genero || null,
            fecha_nacimiento: fecha_nacimiento || null,
            estado_civil: estado_civil || null,
            escolaridad: escolaridad || null,
            puesto,
            tipo_empleado,
            departamento,
            fecha_ingreso: fecha_ingreso || null,
            numero_empleado: numero_empleado || null
        };

        conexion.query('UPDATE empleados SET ? WHERE id = ?', [updateData, id], (error) => {
            if (error) {
                console.error('Error al actualizar empleado:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al actualizar empleado'
                });
            }

            res.json({
                success: true,
                message: 'Empleado actualizado correctamente'
            });
        });
    } catch (error) {
        console.error('Error en actualizarEmpleado:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// DESACTIVAR EMPLEADO (Soft Delete)
exports.desactivarEmpleado = (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID inválido'
        });
    }

    conexion.query('UPDATE empleados SET activo = FALSE WHERE id = ?', [id], (error) => {
        if (error) {
            console.error('Error al desactivar empleado:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al desactivar empleado'
            });
        }

        res.json({
            success: true,
            message: 'Empleado desactivado correctamente'
        });
    });
};
