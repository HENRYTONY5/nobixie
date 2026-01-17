const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const conexion = require('../database/db');
const { promisify } = require('util');

// REGISTRO
exports.register = async (req, res) => {
    try {
        const { name, email, pass, pass_confirm, rol } = req.body;

        // Validar campos
        if (!name || !email || !pass || !pass_confirm) {
            return res.status(400).render('register', {
                alert: true,
                alertMessage: 'Por favor completa todos los campos'
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).render('register', {
                alert: true,
                alertMessage: 'Email inválido'
            });
        }

        // Validar que las contraseñas coincidan
        if (pass !== pass_confirm) {
            return res.status(400).render('register', {
                alert: true,
                alertMessage: 'Las contraseñas no coinciden'
            });
        }

        // Validar fortaleza de contraseña (mínimo 8 caracteres)
        if (pass.length < 8) {
            return res.status(400).render('register', {
                alert: true,
                alertMessage: 'La contraseña debe tener mínimo 8 caracteres'
            });
        }

        // Hashear contraseña
        const passHash = await bcryptjs.hash(pass, 10);
        const userRole = rol || 'User';

        // Verificar si el email ya existe
        conexion.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
            if (error) {
                console.error('Error en validación de email:', error);
                return res.status(500).render('register', {
                    alert: true,
                    alertMessage: 'Error del servidor'
                });
            }

            if (results.length > 0) {
                return res.status(400).render('register', {
                    alert: true,
                    alertMessage: 'Este email ya está registrado'
                });
            }

            // Insertar nuevo usuario
            conexion.query('INSERT INTO users SET ?', {
                user: name,
                email: email,
                pass: passHash,
                rol: userRole
            }, (error, results) => {
                if (error) {
                    console.error('Error al registrar usuario:', error);
                    return res.status(500).render('register', {
                        alert: true,
                        alertMessage: 'Error al crear el usuario'
                    });
                }

                return res.status(201).render('register', {
                    alert: true,
                    alertMessage: '¡Usuario registrado correctamente! Inicia sesión'
                });
            });
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).render('register', {
            alert: true,
            alertMessage: 'Error interno del servidor'
        });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, pass } = req.body;

        // Validar campos
        if (!email || !pass) {
            return res.status(400).render('login', {
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "Ingresa tu email y contraseña",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            });
        }

        // Validar email
        conexion.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            if (error) {
                console.error('Error en consulta de login:', error);
                return res.status(500).render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Error del servidor",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            }

            // Verificar si existe el usuario y validar contraseña
            if (results.length === 0 || !(await bcryptjs.compare(pass, results[0].pass))) {
                return res.status(401).render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Email o contraseña inválidos",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            }

            // Login exitoso
            const user = results[0];
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRETO, {
                expiresIn: process.env.JWT_EXPIRATION_TIME || '7d'
            });

            const cookieOptions = {
                expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES || 7) * 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production' // HTTPS en producción
            };

            res.cookie('jwt', token, cookieOptions);
            
            return res.status(200).render('login', {
                alert: true,
                alertTitle: "Login exitoso",
                alertMessage: "¡Bienvenido!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 800,
                ruta: ''
            });
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).render('login', {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Error interno del servidor",
            alertIcon: 'error',
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
        });
    }
};

// LOGOUT
exports.logout = (req, res) => {
    res.clearCookie('jwt');
    return res.redirect('/');
};

// MIDDLEWARE: VERIFICAR AUTENTICACIÓN
exports.isAuthenticated = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
            
            conexion.query('SELECT * FROM users WHERE id = ?', [decodificada.id], (error, results) => {
                if (error || !results.length) {
                    return next();
                }

                // Guardar usuario en req para usarlo en las rutas
                req.user = results[0];
                return next();
            });
        } catch (error) {
            console.error('Error verificando JWT:', error);
            return res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
};

// VALIDAR EMPLEADO
exports.validarEmpleado = (req, res) => {
    const { idEmpleado } = req.body;

    if (!idEmpleado) {
        return res.status(400).json({
            success: false,
            message: "ID de empleado es obligatorio"
        });
    }

    const query = 'SELECT id FROM empleados WHERE numero_empleado = ? AND activo = TRUE';
    conexion.query(query, [idEmpleado], (error, results) => {
        if (error) {
            console.error("Error en validación:", error);
            return res.status(500).json({
                success: false,
                message: "Error del servidor"
            });
        }

        res.json({
            success: results.length > 0,
            message: results.length > 0 ? "ID encontrado" : "ID de empleado no encontrado"
        });
    });
};








// OBTENER DATOS GRÁFICOS COMPLETOS

// GUARDAR RESPUESTAS
exports.guardarRespuestas = (req, res) => {
    try {
        const { pregunta1 } = req.body;

        if (!pregunta1) {
            return res.status(400).json({
                success: false,
                message: 'La respuesta es obligatoria'
            });
        }

        const sql = 'INSERT INTO res_g2 (pregunta_id, respuesta) VALUES (?, ?)';
        conexion.query(sql, [1, pregunta1], (err) => {
            if (err) {
                console.error('Error al guardar respuesta:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al guardar la respuesta'
                });
            }

            res.json({
                success: true,
                message: 'Respuesta guardada correctamente'
            });
        });
    } catch (error) {
        console.error('Error en guardarRespuestas:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
};
