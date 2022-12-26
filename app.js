const express = require('express')
const app = express()
const path = require('path')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const { json } = require('express')

app.set('view engine', 'ejs')
dotenv.config({path: './env/.env'})


app.use(express.urlencoded({extended:false}))
//app.use(express(json))
//app.use(cookieParser)

// import the router
app.use('/', require('./routes/router'))

app.use(express.static(path.join(__dirname, '/public')))
const PORT = process.env.PORT || 8000
app.listen(PORT, ()=>{
    console.log('Server running in port:',PORT)
});