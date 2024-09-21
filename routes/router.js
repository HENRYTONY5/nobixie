const express = require('express')
const router = express.Router()

//to invoke the methods for the CRUD of users
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const { Router } = require('express')


//path to send the data in json format
const { json } = require('express');

//Invoke the database connection
const conexion = require('../database/db')

//path to retrieve all users
router.get('/users', authController.isAuthenticated, (req, res) => {
    // res.send('hola mundo')    
    conexion.query('SELECT * FROM users', (error, results) => {
        if(error){
            throw error;
        } else {
            // res.send(results);
            if (row.rol=="Admin") { 
                res.render('users', { results: results, titleWeb: "Lista de usuarios" })
            } else {
                res.render('index', { userName: row.name, image: row.image, titleWeb: "Control Dashboard"})
            }
        }
    })
})

//path to create a record
router.get('/createUser', authController.isAuthenticated, (req, res) => {
    if (row.rol=="Admin") {        
        res.render('createUser', { titleWeb: "Crear Usuario"})
    } else {
        res.render('index', { userName: row.name, image: row.image, titleWeb: "Control Dashboard"})
    }
})
//crear Usuario
router.get('/createData', authController.isAuthenticated, (req, res) => {
    if (row.rol=="Admin") {        
        res.render('createData', { titleWeb: "Crear Estadisticas"})
    } else {
        res.render('index', { userName: row.name, image: row.image, titleWeb: "Control de Datos"})
    }
})
//insertar Info del usuario
router.get('/createData', authController.isAuthenticated, (req, res) => {
    if (row.rol=="Admin") {        
        res.render('createData', { titleWeb: "Crear Datos de Usuario"})
    } else {
        res.render('index', { userName: row.name, image: row.image, titleWeb: "Control de Datos"})
    }
})
//path to edit a selected record
router.get('/editUser/:id', authController.isAuthenticated, (req, res) => {
    const id = req.params.id;
    conexion.query('SELECT * FROM users WHERE id= ?', [id], (error, results) => {
        if(error){
            throw error;
        } else {
            if(row.rol=="Admin") {
                res.render('editUser', { user: results[0], titleWeb: "Edit user" })
            } else {
                res.render('index', { userName: row.name, image: row.image, titleWeb: "Control Dashboard"})
            }
        }
    })
})

//path to delete a selected record
router.get('/deleteUser/:id', (req, res) => {
    const id = req.params.id
    conexion.query('DELETE FROM users WHERE id= ?', [id], (error, results) => {
        if(error){
            throw error;
        } else {
            res.redirect('/users')
        }
    })
});


router.post('/saveUser', userController.saveUser)
router.post('/updateUser', userController.updateUser)


//router for views
router.get('/', authController.isAuthenticated, (req, res) => {
    res.render('index', { userName: row.name, image: row.image, titleWeb: "Control Dashboard"})
})

router.get('/logout', authController.logout)

router.get('/login', (req, res) => {
    res.render('login', { alert:false })
})

router.get('/register', (req, res) => {
    res.render('register', { alert:false })
})
router.get('/asistencia', (req, res) => {
    res.render('asistencia', { alert:false })
})
router.get('/results', (req, res) => {
    res.render('results', { alert:false })
})
router.get('/estadio', (req, res) => {
    res.render('estadio', { alert:false })
})
router.get('/contacto', (req, res) => {
    res.render('contacto', { alert:false })
})
router.get('/events', (req, res) => {
    res.render('events', { alert:false })
})
router.get('/res_events', (req, res) => {
    res.render('res_events', { alert:false })
})
router.get('/data', (req, res) => {
    res.render('resdata', { alert:false })
})
router.get('/guia2', (req, res) => {
    res.render('res_guia2', { alert:false })
})
router.get('/guia3', (req, res) => {
    res.render('res_guia3', { alert:false })
})
router.get('/datos-graficas', authController.obtenerDatosParaGraficas);

router.post('/submit', (req, res) => {
    console.log('Ruta /submit llamada');
    authController.registrarEncuesta(req, res);
});
router.get('/api/datos-graficos', (req, res) => {
    authController.obtenerDatosGraficos(req, res);
});

router.post('/register', authController.register)
router.post('/login', authController.login)

router.post('/upload/:id', (req, res) => {
    const id = req.params.id
    const image = req.file.filename

    conexion.query('UPDATE users SET ? WHERE id= ?', [{image:image}, id], (error, results) => {
        if(error){
            console.error(error);
        } else {
            res.redirect('/users')
        }
    })
})

module.exports = router;