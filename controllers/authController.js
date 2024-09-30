const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
const { promisify } = require('util')
const nodemailer = require('nodemailer')
//jspdf
const { jsPDF } = require('jspdf');
const { ChartJS } = require('chart.js'); // Si estás usando gráficos
//const pdfBase64 = doc.output('datauristring');
// Importar express-validator
const { body, validationResult } = require('express-validator');


exports.previsualizarPDF = (req, res) => {
    const doc = new jsPDF();

    // Generar contenido del PDF
    doc.text("Previsualización de Reporte", 10, 10);
    // Añadir tabla
    doc.autoTable({ 
        head: [['Columna 1', 'Columna 2', 'Columna 3', 'Columna 4', 'Columna 5']], 
        body: [['Dato 1', 'Dato 2', 'Dato 3', 'Dato 4', 'Dato 5']]
    });

    // Convertir el PDF a base64
    const pdfBase64 = doc.output('datauristring');

    // Renderizar la vista e insertar el PDF
    res.render('previsualizarPDF', { pdf: pdfBase64 });
};

exports.descargarPDF = (req, res) => {
    const doc = new jsPDF();
    doc.text("Reporte descargado", 10, 10);

    // Enviar el PDF como descarga
    res.setHeader('Content-disposition', 'attachment; filename="reporte.pdf"');
    res.setHeader('Content-type', 'application/pdf');
    const pdf = doc.output();

    // Redirigir a una vista de éxito
    res.render('success', { message: 'El PDF fue descargado exitosamente' });
};



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
    const id_empleado = req.body.id_empleado;
    const razon_social = req.body.razon_social;
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
//register empresa
exports.registrarEnterprise = (req, res) => {
    const nombre = req.body.nombre;
    const rfc = req.body.rfc;
    const giro = req.body.giro;
    const domicilio = req.body.domicilio;
    const fecha = req.body.fecha;
    const vigencia = req.body.vigencia;
    
    

    // Verifica que todos los campos obligatorios estén presentes
    if (!nombre || !rfc || !giro || !domicilio || !fecha || !vigencia) {
        console.log(res)
        return res.status(400).send('Todos los campos son obligatorios');
    }

    const encuestaData = {
        nombre: nombre,
        rfc: rfc,
        giro: giro,
        domicilio: domicilio,
        fecha: fecha,
        vigencia: vigencia
        
        

    };

    // Inserta los datos en la base de datos
    conexion.query('INSERT INTO data_enterprise SET ?', encuestaData, (error, results) => {
        if (error) {
            console.error('Error al registrar la encuesta:', error);
            res.status(500).send('Error al registrar la encuesta');
        } else {
            res.redirect('/results');  // Redirecciona después de la inserción exitosa
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

exports.obtenerDatosParaGraficas2 = (req, res) => {
    const sql = 'SELECT estado_civil, COUNT(*) AS cantidad FROM encuesta_trabajadores GROUP BY estado_civil';
    
    conexion.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener datos:', err);
            return res.status(500).send('Error al obtener datos');
        }
        res.json(results);
    });
};
exports.obtenerDatosParaGraficas3 = (req, res) => {
    const sql = 'SELECT escolaridad, COUNT(*) AS cantidad FROM encuesta_trabajadores GROUP BY escolaridad';
    
    conexion.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener datos:', err);
            return res.status(500).send('Error al obtener datos');
        }
        res.json(results);
    });
};
exports.obtenerDatosParaGraficas4 = (req, res) => {
    const sql = 'SELECT tipo_puesto, COUNT(*) AS cantidad FROM encuesta_trabajadores GROUP BY tipo_puesto';
    
    conexion.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener datos:', err);
            return res.status(500).send('Error al obtener datos');
        }
        res.json(results);
    });
};
exports.obtenerDatosParaGraficas5 = (req, res) => {
    const sql = 'SELECT antiguedad, COUNT(*) AS cantidad FROM encuesta_trabajadores GROUP BY antiguedad';
    
    conexion.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener datos:', err);
            return res.status(500).send('Error al obtener datos');
        }
        res.json(results);
    });
};
exports.obtenerDatosParaGraficas6 = (req, res) => {
    const sql = 'SELECT categoria_puesto, COUNT(*) AS cantidad FROM encuesta_trabajadores GROUP BY categoria_puesto';
    
    conexion.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener datos:', err);
            return res.status(500).send('Error al obtener datos');
        }
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

    /*exports.obtenerDatosEncuesta = (req, res) => {
        const sql = 'SELECT seccion, total FROM encuesta';
        
        conexion.query(sql, (err, results) => {
            if (err) {
                console.error('Error al obtener datos:', err);
                return res.status(500).json({ error: 'Error al obtener datos' });
            }
            res.json(results);  // Enviar los datos de la encuesta al frontend
        });
    };*/

    exports.obtenerYActualizarGranTotal = (req, res) => {
        const sql = `
            SELECT id, id_empleado, 
                   (pregunta1 + pregunta2 + pregunta3 + pregunta4 + pregunta5 + pregunta6 +
                    pregunta7 + pregunta8 + pregunta9 + pregunta10 + pregunta11 + pregunta12 +
                    pregunta13 + pregunta14 + pregunta15 + pregunta16 + pregunta17 + pregunta18 +
                    pregunta19 + pregunta20 + pregunta21 + pregunta22 + pregunta23 + pregunta24 +
                    pregunta25 + pregunta26 + pregunta27 + pregunta28 + pregunta29 + pregunta30 +
                    pregunta31 + pregunta32 + pregunta33 + pregunta34 + pregunta35 + pregunta36 +
                    pregunta37 + pregunta38 + pregunta39 + pregunta40 + pregunta41 + pregunta42 +
                    pregunta43 + pregunta44 + pregunta45 + pregunta46 + pregunta47 + pregunta48 +
                    pregunta49 + pregunta50) AS gran_total
            FROM res_g2;
        `;
        
        conexion.query(sql, (err, results) => {
            if (err) {
                console.error('Error al obtener datos:', err);
                return res.status(500).send('Error al obtener datos');
            }
    
            results.forEach(row => {
                const updateSql = `
                    UPDATE res_g2 
                    SET gran_total = ?
                    WHERE id = ?;
                `;
                conexion.query(updateSql, [row.gran_total, row.id], (err, updateResult) => {
                    if (err) {
                        console.error('Error al actualizar gran_total:', err);
                    }
                });
            });
    
            res.json(results);
        });
    };
    exports.actualizarGranTotal = (req, res) => {
        // Seleccionar todas las filas de la tabla res_g2
        const sqlSelect = 'SELECT * FROM res_g2';
        
        conexion.query(sqlSelect, (err, results) => {
            if (err) {
                console.error('Error al obtener datos:', err);
                return res.status(500).send('Error al obtener datos');
            }
    
            results.forEach(row => {
                // Calcular la suma de todas las preguntas de la fila actual
                const sumaTotal = (row.pregunta1 || 0) + (row.pregunta2 || 0) + (row.pregunta3 || 0) +
                                  (row.pregunta4 || 0) + (row.pregunta5 || 0) + (row.pregunta6 || 0) +
                                  (row.pregunta7 || 0) + (row.pregunta8 || 0) + (row.pregunta9 || 0) +
                                  (row.pregunta10 || 0) + (row.pregunta11 || 0) + (row.pregunta12 || 0) +
                                  (row.pregunta13 || 0) + (row.pregunta14 || 0) + (row.pregunta15 || 0) +
                                  (row.pregunta16 || 0) + (row.pregunta17 || 0) + (row.pregunta18 || 0) +
                                  (row.pregunta19 || 0) + (row.pregunta20 || 0) + (row.pregunta21 || 0) +
                                  (row.pregunta22 || 0) + (row.pregunta23 || 0) + (row.pregunta24 || 0) +
                                  (row.pregunta25 || 0) + (row.pregunta26 || 0) + (row.pregunta27 || 0) +
                                  (row.pregunta28 || 0) + (row.pregunta29 || 0) + (row.pregunta30 || 0) +
                                  (row.pregunta31 || 0) + (row.pregunta32 || 0) + (row.pregunta33 || 0) +
                                  (row.pregunta34 || 0) + (row.pregunta35 || 0) + (row.pregunta36 || 0) +
                                  (row.pregunta37 || 0) + (row.pregunta38 || 0) + (row.pregunta39 || 0) +
                                  (row.pregunta40 || 0) + (row.pregunta41 || 0) + (row.pregunta42 || 0) +
                                  (row.pregunta43 || 0) + (row.pregunta44 || 0) + (row.pregunta45 || 0) +
                                  (row.pregunta46 || 0) + (row.pregunta47 || 0) + (row.pregunta48 || 0) +
                                  (row.pregunta49 || 0) + (row.pregunta50 || 0);
    
                // Actualizar la columna gran_total en la tabla con la suma calculada
                const sqlUpdate = 'UPDATE res_g2 SET gran_total = ? WHERE id = 49';
                conexion.query(sqlUpdate, [sumaTotal, row.id], (err, updateResult) => {
                    if (err) {
                        console.error('Error al actualizar gran_total:', err);
                    }
                });
            });
    
            res.render('success', { message: 'Gran total actualizado correctamente' });

        });
    };
    
    

exports.saveData = [
    // Validación de campos
    body('nombre').notEmpty().withMessage('El nombre o razón social es requerido'),
    body('rfc').notEmpty().withMessage('El RFC es requerido'),
    body('giro').notEmpty().withMessage('El giro o actividad es requerido'),
    body('domicilio').notEmpty().withMessage('El domicilio es requerido'),
    body('fecha').notEmpty().withMessage('La fecha del estudio es requerida'),
    body('vigencia').notEmpty().withMessage('La vigencia es requerida'),

    // Procesar los datos después de la validación
    (req, res) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            // Si hay errores de validación, devolver la vista del formulario con los errores
            return res.render('results', {
                errors: errors.array(),
                data: req.body // Para devolver los datos introducidos al formulario
            });
        }

        // Si los datos son válidos, se pueden guardar en la base de datos
        const data = {
            nombre: req.body.nombre,
            rfc: req.body.rfc,
            giro: req.body.giro,
            domicilio: req.body.domicilio,
            fecha: req.body.fecha,
            vigencia: req.body.vigencia
        };

        // Aquí podrías insertar los datos en la base de datos
        // Por ejemplo: 
        // db.collection('empresas').insertOne(data, (err, result) => {
        //     if (err) {
        //         return res.status(500).send('Error al guardar los datos');
        //     }
        //     // Redirigir o mostrar los datos guardados
        //     res.render('results', { data });
        // });

        // Por ahora, solo mostramos los datos ingresados
        res.render('results', { data });
    }
];

    


  };
