const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
const { promisify } = require('util')
const nodemailer = require('nodemailer')

//procedure to register
exports.register = async (req, res) => {   
    try {
        const name = req.body.name
        const email = req.body.email
        const pass = req.body.pass
        const rol = req.body.rol
        
        let passHash = await bcryptjs.hash(pass, 10)
        //console.log(name + " - " + email + " - " + passHash)
        conexion.query('INSERT INTO users SET ?', {user: name, email: email, pass: passHash, rol:rol}, (error, results) => {
            if(error) {
                //console.error(error)
                res.render('register', {
                    alert: true,
                    alertMessage: 'This email already exists'
                })
                console.error(error)
            } else {   
                
                //create email body
                contentHTML = `
                    <h1>User Information</h1>
                    <ul>
                        <li>Username: ${name} </li>
                        <li>User Email: ${email} </li>
                        <li>Password: ${pass} </li>
                        <li>Rol: ${rol} </li>
                    </ul>
                `;
                //set email configuration, sender and server
                /*const transporter = nodemailer.createTransport({
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
                });*/
            

                res.redirect('/')
            }
        }) 
    } catch (error) {
        console.error(error)
    }
}

//procedure to logout
exports.logout = (req, res) => {
    res.clearCookie('jwt')   
    return res.redirect('/')
}

//procedure to login
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
exports.validarEmpleado = (req, res) => {
    const { idEmpleado } = req.body;

    // Verifica que el campo idEmpleado esté presente
    if (!idEmpleado) {
        return res.status(400).json({ success: false, message: "ID de empleado es obligatorio." });
    }

    // Consulta para verificar si existe el id_empleado
    const query = 'SELECT * FROM encuesta_trabajadores WHERE id_empleado = ?';
    conexion.query(query, [idEmpleado], (error, results) => {
        if (error) {
            console.error("Error en la consulta:", error);
            return res.status(500).json({ success: false, message: "Error en el servidor." });
        }

        if (results.length > 0) {
            res.json({ success: true });  // ID encontrado
        } else {
            res.json({ success: false, message: "ID de empleado no encontrado." });  // ID no encontrado
        }
    });
};



exports.isAuthenticated = async (req, res, next)=>{
    if (req.cookies.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
            conexion.query('SELECT * FROM users WHERE id = ?', [decodificada.id], (error, results)=>{
                if(!results){return next()}

                row = results[0]
                return next()
            })
        } catch (error) {
            console.log(error)
            return next()
        }
    }else{
        res.redirect('/login')        
    }
} 

//register encuesta
exports.registrarEncuesta = (req, res) => {
    const id_empleado = req.body.categoria_puesto;
    const razon_social = req.body.antiguedad;
    const genero = req.body.genero;
    const edad = req.body.edad;
    const estado_civil = req.body.estado_civil;
    const escolaridad = req.body.escolaridad;
    const tipo_puesto = req.body.tipo_puesto;
    const categoria_puesto = req.body.categoria_puesto;
    const antiguedad = req.body.antiguedad;
    
    

    // Verifica que todos los campos obligatorios estén presentes
    if (!id_empleado || !razon_social || !genero || !edad || !estado_civil || !escolaridad || !tipo_puesto || !categoria_puesto || !antiguedad) {
        return res.status(400).send('Todos los campos son obligatorios');
    }

    const encuestaData = {
        id_empleado: id_empleado,
        razon_social: razon_social,
        genero: genero,
        edad: edad,
        estado_civil: estado_civil,
        escolaridad: escolaridad,
        tipo_puesto: tipo_puesto,
        categoria_puesto: categoria_puesto,
        antiguedad: antiguedad
        

    };

    // Inserta los datos en la base de datos
    conexion.query('INSERT INTO encuesta_trabajadores SET ?', encuestaData, (error, results) => {
        if (error) {
            console.error('Error al registrar la encuesta:', error);
            res.status(500).send('Error al registrar la encuesta');
        } else {
            res.redirect('/data');  // Redirecciona después de la inserción exitosa
        }
    });
};
exports.obtenerDatosParaGraficas = (req, res) => {
    const sql = 'SELECT genero, COUNT(*) AS cantidad FROM encuesta_trabajadores GROUP BY genero';
    
    conexion.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener datos:', err);
            return res.status(500).send('Error al obtener datos');
        }
        res.json(results);
    });
};

exports.obtenerDatosParaGraficas1 = (req, res) => {
    const sql = 'SELECT edad, COUNT(*) AS cantidad FROM encuesta_trabajadores GROUP BY edad';
    
    conexion.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener datos:', err);
            return res.status(500).send('Error al obtener datos');
        }
        res.json(results);
    });
};

// Obtener datos de frecuencia y porcentaje para gráficos
exports.obtenerDatosGraficos = (req, res) => {
    const sql = `
        SELECT 
            genero, 
            COUNT(*) AS cantidadGenero,
            edad, 
            COUNT(*) AS cantidadEdad,
            estado_civil,
            COUNT(*) AS cantidadEstadoCivil,
            escolaridad,
            COUNT(*) AS cantidadEscolaridad,
            tipo_puesto,
            COUNT(*) AS cantidadPuesto,
            categoria_puesto,
            COUNT(*) AS cantidadCategoria,
            antiguedad,
            COUNT(*) AS cantidadAntiguedad
        FROM 
            encuesta_trabajadores
        GROUP BY 
            genero, edad, estado_civil, escolaridad, tipo_puesto, categoria_puesto, antiguedad
    `;

    conexion.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener datos:', err);
            return res.status(500).send('Error al obtener datos');
        }

        // Devolver los datos en formato JSON
        res.json(results);
    });
};



exports.guardarRespuestas = (req, res) => {
    const { pregunta1 } = req.body;  // Obtener la respuesta desde el formulario
     // Suponiendo que tienes un sistema de autenticación
  
    const sql = 'INSERT INTO res_g2 (pregunta_id, respuesta) VALUES (?, ?)';
    const values = [1, pregunta1];  // Valores para la consulta SQL
  
    // Ejecutar la consulta
    conexion.query(sql, values, (err, results) => {
      if (err) {
        console.error('Error al insertar la respuesta:', err);
        return res.status(500).json({ message: 'Error al guardar la respuesta' });
      }
      
      // Respuesta exitosa
      res.json({ message: 'Respuesta guardada correctamente', results });
    });
  };
