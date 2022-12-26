const mysql = require('mysql')

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    pass: '',
    database: 'crud_nods'
})

conexion.connect ((error) => {
    if(error) {
        console.error('The connection error is:' + error)
        return
    }
    console.log('Connected to the database MySQL!')
})

module.exports = conexion