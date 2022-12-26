
const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conne = require('../database/db')
const {promisify} = require('util')
const nodemailer = require('nodemailer')


//procedure to register
exports.register = async(req, res) => {
    try{
    const name = req.body.name  
    const email = req.body.email
    const pass = req.body.pass 
    let passHash = await bcryptjs.hash(pass,10)
    conne.query('INSERT INTO users SET ?', {name:name, email:email, pass:passHash   }, (error, results) =>
    {
        if(error) { console.error(error) } res.redirect('/')
    })
    } catch(error){
        console.error(error)

    }

}
exports.isAuthenticated = async (req, res, next) => {
    if(req.cookies.jwt){
        try{
        const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
        conne.query('SELECT * FROM users WHERE id= ?',[decodificada.id],(error, results) =>{
            if(!results){   return next()}
            req.name = results[0]
            return next()


        }) 
        }catch(error){
        console.log(error)
        return next()
        }
    }else { res.redirect('/login')}
}

// exports.login = async (req, res)=>{
//     try{
//         const email = req.body.email
//         const pass = req.body.pass
//         if(!email || !pass ){
//             res.render('login', {
//                 alert: true,
//                 alertTitle:"Warning",
//                 alertMessage:"Enter your email and password",
//                 alertIcon:'info',
//                 showConfirmButton: true,
//                 timer: false,
//                 ruta:'login'

//             })
//         }else { conne.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
//             if(results.length ==0 || ! (await bcryptjs.compare(pass, results[0].pass)) ){
//                 res.render('login', {
//                     alert: true,
//                     alertTitle:"Error",
//                     alertMessage:"Email or password incorrect",
//                     alertIcon:'error',
//                     showConfirmButton: true,
//                     timer: false,
//                     ruta: 'login'

//                 })
            
        

                
//         }else {
//             const id = results[0].id;
//             const token  = jwt.sign({id:id}, process.env.JWT_SECRETO, {
//             expiresIn: process.env.JWT_EXPIRATION_TIME
            
//         }) 
//         const cookiesOptions={
//             expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60* 1000),
//             httpOnly: true


//         } 
//         res.cookie('jwt',token, cookiesOptions)
//         res.render('login',{
//             alert: true,
//             alertTitle:"Successful connection",
//             alertMessage: "Correct login",
//             alertIcon: 'success',
//             showConfirmButton: false,
//             timer: 800,
//             ruta:''       
//     })
        
//     }
        
//     })
//         }
//     }catch(error){ console.log(error) } }

exports.login = async (req, res)=>{
    try {
        const email = req.body.email
        const pass = req.body.pass        
        if(!email || !pass ){
            res.render('login',{
                alert:true,
                alertTitle: "Warning",
                alertMessage: "Enter your email and password",
                alertIcon:'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            })
        }else{
            conexion.query('SELECT * FROM users WHERE email = ?', [email], async (error, results)=>{
                if( results.length == 0 || ! (await bcryptjs.compare(pass, results[0].pass)) ){
                    res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Email or Password invalid",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'    
                    })
                }else{
                    //login OK
                    const id = results[0].id
                    const token = jwt.sign({id:id}, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_EXPIRATION_TIME
                    })
                    const cookiesOptions = {
                        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    }
                    res.cookie('jwt', token, cookiesOptions)
                    res.render('login', {
                            alert: true,
                            alertTitle: "Successful connection",
                            alertMessage: "¡CORRECT LOGIN!",
                            alertIcon:'success',
                            showConfirmButton: false,
                            timer: 800,
                            ruta: ''
                    })
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}

exports.logout = (req, res) =>{
    return res.redirect('/login')
}
