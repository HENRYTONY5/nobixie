const connection = require('../database/db')
const nodemailer = require('nodemailer')
const bcryptjs = require('bcryptjs')

exports.save = async(req,res) =>{
    const email = req.body.email
    const name = req.body.name
    const rol = req.body.rol
    const password =req.body.pass
    let passHash = await bcryptjs.hash(password,10)
    const status = req.body.status
    
    console.log(email + " - " + name + " - " + rol + " - " + passHash + " - " + status)

    connection.query('INSERT INTO users SET ?', {user:name,rol:rol,status:status,email:email,pass:passHash }, (err, result) => {
        if (err) {
            console.error(err)

        }
        else {
            contentHTML = `<h1>User information </h1>
            <ul>
                <li>Username: ${name}</li>
                <li>User Email: ${email}</li>
                <li>Password: ${password}</li>

            </ul>`;
            //set
            const transporter = nodemailer.createTransport({

                host: 'mail.gustabin.com',
                port: 587,
                secure: false,
                auth: {
                    user: "demo@gustabin.com",
                    pass: 'password'
                }, tls: { rejectUnauthorized: false }
            });

            //send mail
            const info = transporter.sendMail({
                from: "'Gustabin Server' <demo@gustabin.com",
                to: email,
                subject: 'Gustabin Server',
                html: contentHTML
            });
            res.redirect('/');
        }
    })

}

exports.update = (req ,res) => {
    const id = req.body.id
    const name = req.body.name
    const email = req.body.email
    const password = req.body.pass
    const rol = req.body.rol
    const status = req.body.status

    connection.query('UPDATE users SET ? WHERE id = ?', [{user:name,rol:rol,status:status,email:email,password:password}, id], (error, result) => {

        if (error) {console.error(error)
        } else { res.redirect('/')}
    })
}

//gook
