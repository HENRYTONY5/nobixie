const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcryptjs = require('bcryptjs');
const conexion = require('../database/db');
const nodemailer = require('nodemailer');

/**
 * Configuración de email - CAMBIAR CON TUS DATOS
 */
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: process.env.MAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

/**
 * GET - Formulario para solicitar reset de contraseña
 */
router.get('/forgot-password', (req, res) => {
    res.render('forgotPassword', {
        titleWeb: "Recuperar Contraseña",
        alert: false
    });
});

/**
 * POST - Enviar link de reset de contraseña
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).render('forgotPassword', {
                titleWeb: "Recuperar Contraseña",
                alert: true,
                alertMessage: 'Por favor ingresa tu email'
            });
        }

        // Verificar que el email existe
        conexion.query('SELECT id FROM users WHERE email = ?', [email], async (error, results) => {
            if (error) {
                console.error('Error en consulta:', error);
                return res.status(500).render('forgotPassword', {
                    titleWeb: "Recuperar Contraseña",
                    alert: true,
                    alertMessage: 'Error del servidor'
                });
            }

            if (results.length === 0) {
                // Por seguridad, no revelar si el email existe o no
                return res.status(200).render('forgotPassword', {
                    titleWeb: "Recuperar Contraseña",
                    alert: true,
                    alertMessage: 'Si el email existe, recibirás un link para resetear tu contraseña',
                    alertIcon: 'info'
                });
            }

            // Generar token de reset
            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

            // Guardar token hasheado en la BD (necesitas agregar columnas a la tabla users)
            conexion.query(
                'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
                [hashedToken, tokenExpiry, email],
                async (error) => {
                    if (error) {
                        console.error('Error al guardar token:', error);
                        return res.status(500).render('forgotPassword', {
                            titleWeb: "Recuperar Contraseña",
                            alert: true,
                            alertMessage: 'Error al procesar solicitud'
                        });
                    }

                    // Crear link de reset
                    const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

                    // Enviar email
                    const mailOptions = {
                        from: process.env.MAIL_FROM || 'noreply@soltec.com',
                        to: email,
                        subject: 'Recuperar Contraseña - Soltec',
                        html: `
                            <h2>Solicitud de Recuperación de Contraseña</h2>
                            <p>Recibimos una solicitud para resetear tu contraseña.</p>
                            <p>Haz click en el siguiente link para continuar:</p>
                            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Resetear Contraseña
                            </a>
                            <p><strong>Este link expirará en 30 minutos.</strong></p>
                            <p>Si no solicitaste esto, ignora este email.</p>
                            <hr>
                            <p>O copia y pega este link: ${resetLink}</p>
                        `
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error('Error enviando email:', error);
                            return res.status(500).render('forgotPassword', {
                                titleWeb: "Recuperar Contraseña",
                                alert: true,
                                alertMessage: 'Error al enviar email'
                            });
                        }

                        res.status(200).render('forgotPassword', {
                            titleWeb: "Recuperar Contraseña",
                            alert: true,
                            alertMessage: 'Email enviado. Revisa tu bandeja de entrada',
                            alertIcon: 'success'
                        });
                    });
                }
            );
        });
    } catch (error) {
        console.error('Error en forgot-password:', error);
        res.status(500).render('forgotPassword', {
            titleWeb: "Recuperar Contraseña",
            alert: true,
            alertMessage: 'Error interno del servidor'
        });
    }
});

/**
 * GET - Formulario para resetear contraseña (con token)
 */
router.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    conexion.query(
        'SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
        [hashedToken],
        (error, results) => {
            if (error || results.length === 0) {
                return res.status(400).render('resetPassword', {
                    titleWeb: "Resetear Contraseña",
                    alert: true,
                    alertMessage: 'Link inválido o expirado',
                    invalidToken: true
                });
            }

            res.render('resetPassword', {
                titleWeb: "Resetear Contraseña",
                token: token,
                email: results[0].email,
                alert: false,
                invalidToken: false
            });
        }
    );
});

/**
 * POST - Procesar reset de contraseña
 */
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { email, password, passwordConfirm } = req.body;

        if (!password || !passwordConfirm) {
            return res.status(400).render('resetPassword', {
                titleWeb: "Resetear Contraseña",
                alert: true,
                alertMessage: 'Por favor completa todos los campos',
                token,
                email,
                invalidToken: false
            });
        }

        if (password !== passwordConfirm) {
            return res.status(400).render('resetPassword', {
                titleWeb: "Resetear Contraseña",
                alert: true,
                alertMessage: 'Las contraseñas no coinciden',
                token,
                email,
                invalidToken: false
            });
        }

        if (password.length < 8) {
            return res.status(400).render('resetPassword', {
                titleWeb: "Resetear Contraseña",
                alert: true,
                alertMessage: 'La contraseña debe tener mínimo 8 caracteres',
                token,
                email,
                invalidToken: false
            });
        }

        // Validar token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        conexion.query(
            'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW() AND email = ?',
            [hashedToken, email],
            async (error, results) => {
                if (error || results.length === 0) {
                    return res.status(400).render('resetPassword', {
                        titleWeb: "Resetear Contraseña",
                        alert: true,
                        alertMessage: 'Link inválido o expirado',
                        token,
                        email,
                        invalidToken: true
                    });
                }

                // Hashear nueva contraseña
                const passwordHash = await bcryptjs.hash(password, 10);
                const userId = results[0].id;

                // Actualizar contraseña y limpiar token
                conexion.query(
                    'UPDATE users SET pass = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
                    [passwordHash, userId],
                    (error) => {
                        if (error) {
                            console.error('Error actualizando contraseña:', error);
                            return res.status(500).render('resetPassword', {
                                titleWeb: "Resetear Contraseña",
                                alert: true,
                                alertMessage: 'Error al resetear contraseña',
                                token,
                                email,
                                invalidToken: false
                            });
                        }

                        res.status(200).render('resetPassword', {
                            titleWeb: "Resetear Contraseña",
                            alert: true,
                            alertMessage: '¡Contraseña actualizada correctamente! Redirigiendo al login...',
                            alertIcon: 'success',
                            token,
                            email,
                            invalidToken: false,
                            success: true
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error en reset-password:', error);
        res.status(500).render('resetPassword', {
            titleWeb: "Resetear Contraseña",
            alert: true,
            alertMessage: 'Error interno del servidor',
            invalidToken: false
        });
    }
});

module.exports = router;
