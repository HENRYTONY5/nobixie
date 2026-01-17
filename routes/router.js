const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const empleadoController = require('../controllers/empleadoController');
const passwordResetRouter = require('./passwordReset');
const conexion = require('../database/db');

// Middleware para verificar rol de Admin
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.rol !== 'Admin') {
        return res.status(403).render('index', {
            userName: req.user ? req.user.user : 'Usuario',
            image: req.user ? req.user.image : '',
            titleWeb: "Acceso denegado",
            alert: true,
            alertMessage: "Solo administradores pueden acceder"
        });
    }
    next();
};

// USUARIOS - GET
router.get('/users', authController.isAuthenticated, isAdmin, (req, res) => {
    conexion.query('SELECT id, user, email, rol, image FROM users', (error, results) => {
        if (error) {
            console.error('Error al obtener usuarios:', error);
            return res.status(500).render('users', {
                results: [],
                titleWeb: "Lista de usuarios",
                alert: true,
                alertMessage: 'Error al cargar usuarios'
            });
        }
        res.render('users', {
            results,
            titleWeb: "Lista de usuarios",
            alert: false
        });
    });
});

// TABLEDATA - GET
router.get('/tabledata', authController.isAuthenticated, isAdmin, (req, res) => {
    conexion.query('SELECT * FROM encuesta_trabajadores', (error, results) => {
        if (error) {
            console.error('Error al obtener datos:', error);
            return res.status(500).render('tabledata', {
                results: [],
                titleWeb: "Lista de Colaboradores",
                alert: true,
                alertMessage: 'Error al cargar colaboradores'
            });
        }
        res.render('tabledata', {
            results,
            titleWeb: "Lista de Colaboradores",
            alert: false
        });
    });
});

// CREAR USUARIO - GET
router.get('/createUser', authController.isAuthenticated, isAdmin, (req, res) => {
    res.render('createUser', { titleWeb: "Crear Usuario", alert: false });
});

// CREAR DATOS - GET
router.get('/createData', authController.isAuthenticated, isAdmin, (req, res) => {
    res.render('createData', { titleWeb: "Crear Estadísticas", alert: false });
});

// EDITAR USUARIO - GET
router.get('/editUser/:id', authController.isAuthenticated, isAdmin, (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
        return res.status(400).render('index', {
            titleWeb: "Error",
            alert: true,
            alertMessage: 'ID de usuario inválido'
        });
    }

    conexion.query('SELECT * FROM users WHERE id = ?', [id], (error, results) => {
        if (error) {
            console.error('Error al obtener usuario:', error);
            return res.status(500).render('index', {
                titleWeb: "Error",
                alert: true,
                alertMessage: 'Error al cargar usuario'
            });
        }
        if (results.length === 0) {
            return res.status(404).render('index', {
                titleWeb: "No encontrado",
                alert: true,
                alertMessage: 'Usuario no encontrado'
            });
        }
        res.render('editUser', {
            user: results[0],
            titleWeb: "Editar usuario",
            alert: false
        });
    });
});

// ELIMINAR USUARIO - GET
router.get('/deleteUser/:id', authController.isAuthenticated, isAdmin, (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
        return res.status(400).redirect('/users');
    }

    conexion.query('DELETE FROM users WHERE id = ?', [id], (error) => {
        if (error) {
            console.error('Error al eliminar usuario:', error);
            return res.status(500).redirect('/users');
        }
        res.redirect('/users');
    });
});

// SUBIR IMAGEN - POST
router.post('/upload/:id', authController.isAuthenticated, (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id) || !req.file) {
        return res.status(400).redirect('/users');
    }

    conexion.query('UPDATE users SET image = ? WHERE id = ?', [req.file.filename, id], (error) => {
        if (error) {
            console.error('Error al actualizar imagen:', error);
            return res.status(500).redirect('/users');
        }
        res.redirect('/users');
    });
});

// CRUD USUARIOS - POST
router.post('/saveUser', authController.isAuthenticated, isAdmin, userController.saveUser);
router.post('/updateUser', authController.isAuthenticated, isAdmin, userController.updateUser);

// DASHBOARD Y VISTAS PÚBLICAS
router.get('/', authController.isAuthenticated, (req, res) => {
    res.render('index', {
        userName: req.user.user,
        image: req.user.image || '',
        titleWeb: "Panel de Control",
        alert: false
    });
});

router.get('/logout', authController.logout);
router.get('/login', (req, res) => {
    res.render('login', { alert: false });
});
router.get('/register', (req, res) => {
    res.render('register', { alert: false });
});

// RUTAS DE EMPLEADOS - API REST
router.post('/api/empleados', authController.isAuthenticated, empleadoController.guardarEmpleado);
router.get('/api/empleados', authController.isAuthenticated, empleadoController.obtenerEmpleados);
router.get('/api/empleados/:id', authController.isAuthenticated, empleadoController.obtenerEmpleado);
router.put('/api/empleados/:id', authController.isAuthenticated, empleadoController.actualizarEmpleado);
router.delete('/api/empleados/:id', authController.isAuthenticated, empleadoController.desactivarEmpleado);

// RUTAS DE RECUPERACIÓN DE CONTRASEÑA
router.use(passwordResetRouter);

// VISTAS PÚBLICAS (sin autenticación requerida)
router.get('/asistencia', (req, res) => {
    res.render('asistencia', { titleWeb: "Asistencia", alert: false });
});
router.get('/results', (req, res) => {
    res.render('results', { titleWeb: "Resultados", alert: false });
});
router.get('/estadio', (req, res) => {
    res.render('estadio', { titleWeb: "Estadio", alert: false });
});
router.get('/contacto', (req, res) => {
    res.render('contacto', { titleWeb: "Contacto", alert: false });
});
router.get('/events', (req, res) => {
    res.render('events', { titleWeb: "Eventos", alert: false });
});
router.get('/res_events', (req, res) => {
    res.render('res_events', { titleWeb: "Resultados de Eventos", alert: false });
});
router.get('/data', (req, res) => {
    res.render('resdata', { titleWeb: "Datos", alert: false });
});
router.get('/guia2', (req, res) => {
    res.render('guia2', { titleWeb: "Guía 2", alert: false });
});
router.get('/guia3', (req, res) => {
    res.render('guia3', { titleWeb: "Guía 3", alert: false });
});

// AUTENTICACIÓN - POST
router.post('/register', authController.register);
router.post('/login', authController.login);

// ENCUESTAS Y DATOS
router.post('/submit', authController.registrarEncuesta);
router.post('/submit1', (req, res) => {
    const { pregunta1, pregunta2, pregunta3, pregunta4 } = req.body;
    
    if (!pregunta1 || !pregunta2 || !pregunta3 || !pregunta4) {
        return res.status(400).send('Todos los campos son obligatorios');
    }

    const query = 'INSERT INTO respuestas (pregunta1, pregunta2, pregunta3, pregunta4) VALUES (?, ?, ?, ?)';
    conexion.query(query, [pregunta1, pregunta2, pregunta3, pregunta4], (err) => {
        if (err) {
            console.error('Error al insertar respuestas:', err);
            return res.status(500).send('Error al registrar respuestas');
        }
        res.redirect('/events');
    });
});

router.post('/submit2', (req, res) => {
    const { pregunta1, pregunta2, pregunta3 } = req.body;
    
    if (!pregunta1 || !pregunta2 || !pregunta3) {
        return res.status(400).send('Todos los campos son obligatorios');
    }

    const query = 'INSERT INTO res_g2 (pregunta1, pregunta2, pregunta3) VALUES (?, ?, ?)';
    conexion.query(query, [pregunta1, pregunta2, pregunta3], (err) => {
        if (err) {
            console.error('Error al insertar respuestas:', err);
            return res.status(500).send('Error al registrar respuestas');
        }
        res.redirect('/guia2');
    });
});

// APIS Y DATOS
router.post('/guardarRespuestas', authController.guardarRespuestas);
router.post('/validarEmpleado', authController.validarEmpleado);
router.get('/datos-graficas', authController.obtenerDatosParaGraficas);
router.get('/api/datos-graficos', authController.obtenerDatosGraficos);

module.exports = router;