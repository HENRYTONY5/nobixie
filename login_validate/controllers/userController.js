//invoke the DB connection
const conexion = require('../database/db')

//procedure to save
exports.saveUser = (req, res) => {
    const email = req.body.email
    const name = req.body.name
    const rol = req.body.rol

    // console.log(email + " - " + name + " - " + rol)
    conexion.query('INSERT INTO users SET ?', {email:email, name:name, rol:rol}, (error, results) => {
        if(error) {
            console.error(error)
            
        } else {
            res.redirect('/');
        }
    });
};

//procedure to update
exports.updateUser = (req, res) => {
    const id = req.body.id
    const name = req.body.name
    const email = req.body.email
    const rol = req.body.rol

    conexion.query('UPDATE users SET ? WHERE id = ?', [{ name:name, email:email, rol:rol}, id ], (error, results) => {
        if(error) {
            console.error(error)
        } else {
            res.redirect('/');
        }
    })
}