const express = require('express')
const router = express.Router()

//Invoke the database connection
const conexion = require('../database/db')

router.get('/users', (req, res) => {
    // res.send('hola mundo')    
    conexion.query('SELECT * FROM users', (error, results) => {
        if(error){
            throw error;
        } else {
            // res.send(results);
            res.render('users', { results: results })
        }
    })
})

router.get('/createUser', (req, res) => {
    res.render('createUser')
})
router.get('/asistencia', (req, res) => {
    res.render('asistencia')
})

router.get('/editUser/:id', (req, res) => {
    const id = req.params.id;
    conexion.query('SELECT * FROM users WHERE id= ?', [id], (error, results) => {
        if(error){
            throw error;
        } else {
            res.render('editUser', { user: results[0] })
        }
    })
})

//to invoke the methods for the CRUD of users
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const { Router } = require('express')

router.post('/saveUser', userController.saveUser)
router.post('/updateUser', userController.updateUser)

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

//router for views
router.get('/', (req, res) => {
    res.render('index')
})

router.get('/logout', authController.logout)

router.get('/login', (req, res) => {
    res.render('login', { alert:false })
})

router.get('/register', (req, res) => {
    res.render('register', { alert:false })
})

router.post('/register', authController.register)

router.post('/login', authController.login)

module.exports = router;