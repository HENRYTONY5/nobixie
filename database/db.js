const mysql = require('mysql2')

const conexion = mysql.createPool({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_DATABASE
})

// conexion.connect ((error) => {
//     if(error) {
//         console.error('The connection error is:' + error)
//         return
//     }
//     console.log('Connected to the database MySQL!')
// })


module.exports = conexion


