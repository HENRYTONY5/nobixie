//invoke the DB connection
const conexion = require('../database/db')
const bcryptjs = require('bcryptjs')

//procedure to save
exports.saveUser = async(req, res) => {
    const email = req.body.email
    const name = req.body.name
   // const status = req.body.status
    const rol = req.body.rol
    const pass = req.body.pass
    
       
    let passHash = await bcryptjs.hash(pass, 10)

    // console.log(email + " - " + name + " - " + rol)
    conexion.query('INSERT INTO users SET ?', {email:email, user:name, rol:rol,pass:passHash }, (error, results) => {
        
        if(error) {
            //console.error(error)
            res.render('createUser', {
                alert: true,
                alertMessage: 'This email already exists'
            })
        } else {   
            
            //create email body
            contentHTML = `
                <h1>User Information</h1>
                <ul>
                    <li>Username: ${name} </li>
                    <li>User Email: ${email} </li>
                    <li>Password: ${password} </li>
                </ul>
            `;
            //set email configuration, sender and server
            const transporter = nodemailer.createTransport({
                host: 'mail.gustabin.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'demo@gustabin.com',
                    pass: 'password'
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            //send email                
            const info =  transporter.sendMail({
                from: "'Gustabin Server' <demo@gustabin.com>",
                to: email,
                subject: 'Website contact form',
                html: contentHTML
            });
            

            res.redirect('/')
        }
    });
};

//procedure to update
exports.updateUser = (req, res) => {
    const id = req.body.id
    const name = req.body.name
    const email = req.body.email
    const pass = req.body.pass
    const rol = req.body.rol
    //const status = req.body.status

    conexion.query('UPDATE users SET ? WHERE id = ?', [{ user:name, email:email, rol:rol, pass:pass}, id ], (error, results) => {
        if(error) {
            console.error(error)
        } else {
            res.redirect('/');
        }
    })
}