const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usercontrollers')
const authController = require('../controllers/authcontroller')
const conne = require('../database/db')

router.get('/users',(req, res) => {
    conne.query('select * from users', (error, results) => {

    //     if (error){ throw error; } else{  if(row.rol=="Admin"){ res.render('users',{results, titleWeb:"Lista usuarios."})
    
    // }else  {res.render('users', {results: results})}
        
    // }
        res.render('users', {results: results});
    })
})

//authController.isAuthenticated,
router.get('/create',  (req, res) => { 
    // if(row.rol=="Admin"){
    //     res.render('create', {titleEWb:"Create user"})
    // } else{
    //     res.render('index', {userName: row.name, titleWeb: "Control DachBoard"})

    // }
    
            res.render('create', {titleEWb:"Create user"})
})

router.get('/login', (req, res) => { 
    res.render('login', {alert:false})
})

router.get('/register', (req, res) => { 
    res.render('register')
})

// router.get('/edit/:id', authController.isAuthenticated, (req, res) => {
//     const id = req.params.id
//     conne.query('select * from users WHERE id= ?', [id], (error, results) =>{
//         if (error){ throw error; } else{ if(row.rol=="Admin"){  
//             res.render('edit', {user: results[0]  })
//         }else{
//             res.render('index', {userName: row.name, titleWeb: "Control DachBoard"})

//         }  }        
//     })

// } )
router.get('/edit/:id',  (req, res) => {
    const id = req.params.id
    conne.query('select * from users WHERE id= ?', [id], (error, results) =>{
    res.render('edit', {user: results[0]  })
    })
})


router.get('/delete/:id', (req, res) => {
    const id = req.params.id;
    conne.query('DELETE FROM users WHERE id =?',[id], (error,result) => {
        if (error){ throw error; } else{  res.redirect('/') }
    })
})


router.get('/',authController.isAuthenticated, (req, res) => { 
    res.render('index', {userName: row.name, titleWeb: "Control DachBoard"})
})


router.post('/save', usersController.save)
router.post('/update', usersController.update)
router.post('/register', authController.register)
router.get('/logout', authController.logout)
router.post('/login', authController.login)
router.post('/upload/:id', (req,res) => {
    const id = req.params.id
    const image = req.files.filename
    conne.query('UPDATE users SET ? WHERE id = ?', [{image:image},id], (error, results) => {
        if(error){   console.log(error)} else {    res.redirect('/users')}
    }) 
})

module.exports = router;  