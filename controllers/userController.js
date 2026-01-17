//invoke the DB connection
const conexion = require('../database/db');
const bcryptjs = require('bcryptjs');

// GUARDAR USUARIO
exports.saveUser = async (req, res) => {
    try {
        const { email, name, pass, rol } = req.body;

        // Validar campos obligatorios
        if (!email || !name || !pass) {
            return res.status(400).render('createUser', {
                alert: true,
                alertMessage: 'Por favor completa todos los campos obligatorios'
            });
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).render('createUser', {
                alert: true,
                alertMessage: 'Email inválido'
            });
        }

        // Validar fortaleza de contraseña
        if (pass.length < 8) {
            return res.status(400).render('createUser', {
                alert: true,
                alertMessage: 'La contraseña debe tener mínimo 8 caracteres'
            });
        }

        // Verificar si el email ya existe
        conexion.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
            if (error) {
                console.error('Error al verificar email:', error);
                return res.status(500).render('createUser', {
                    alert: true,
                    alertMessage: 'Error del servidor'
                });
            }

            if (results.length > 0) {
                return res.status(400).render('createUser', {
                    alert: true,
                    alertMessage: 'Este email ya está registrado'
                });
            }

            // Hashear contraseña
            const passHash = await bcryptjs.hash(pass, 10);
            const userRole = rol || 'User';

            // Insertar usuario
            conexion.query('INSERT INTO users SET ?', {
                email: email,
                user: name,
                rol: userRole,
                pass: passHash
            }, (error, results) => {
                if (error) {
                    console.error('Error al crear usuario:', error);
                    return res.status(500).render('createUser', {
                        alert: true,
                        alertMessage: 'Error al crear el usuario'
                    });
                }

                return res.status(201).render('createUser', {
                    alert: true,
                    alertMessage: '¡Usuario creado exitosamente!'
                });
            });
        });
    } catch (error) {
        console.error('Error en saveUser:', error);
        res.status(500).render('createUser', {
            alert: true,
            alertMessage: 'Error interno del servidor'
        });
    }
};

// ACTUALIZAR USUARIO
exports.updateUser = async (req, res) => {
    try {
        const { id, name, email, pass, rol } = req.body;

        // Validar campos obligatorios
        if (!id || !name || !email) {
            return res.status(400).redirect('/users');
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).redirect('/editUser/' + id);
        }

        // Verificar si el id existe
        conexion.query('SELECT id FROM users WHERE id = ?', [id], async (error, userExists) => {
            if (error) {
                console.error('Error al verificar usuario:', error);
                return res.status(500).redirect('/users');
            }

            if (userExists.length === 0) {
                return res.status(404).redirect('/users');
            }

            // Verificar si el email ya está en uso por otro usuario
            conexion.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id], async (error, results) => {
                if (error) {
                    console.error('Error al verificar email:', error);
                    return res.status(500).redirect('/users');
                }

                if (results.length > 0) {
                    return res.status(400).redirect('/editUser/' + id);
                }

                // Preparar objeto de actualización
                const updateData = {
                    user: name,
                    email: email,
                    rol: rol || 'User'
                };

                // Si se proporciona una nueva contraseña, hashearla
                if (pass && pass.trim() !== '') {
                    if (pass.length < 8) {
                        return res.status(400).redirect('/editUser/' + id);
                    }
                    updateData.pass = await bcryptjs.hash(pass, 10);
                }

                // Actualizar usuario
                conexion.query('UPDATE users SET ? WHERE id = ?', [updateData, id], (error) => {
                    if (error) {
                        console.error('Error al actualizar usuario:', error);
                        return res.status(500).redirect('/users');
                    }

                    res.redirect('/users');
                });
            });
        });
    } catch (error) {
        console.error('Error en updateUser:', error);
        res.status(500).redirect('/users');
    }
};
