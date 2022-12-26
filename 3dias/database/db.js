const mysql = require('mysql')
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    pass: process.env.PASS,
    database: process.env.DB_DATABASE

})

connection.connect((error) => {
    if(error) {     console.error('the connection error is' + error)    }

    console.log('MYSQL connected successfully')
}) 

module.exports = connection