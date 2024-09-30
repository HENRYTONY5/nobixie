const express = require('express')
const router = express.Router()
const multer = require('multer'); // Para manejar la carga de archivos
const session = require('express-session');
router.use(session({
    secret: 'mi_secreto',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
// Configuración de Multer para la carga de imágenes
const storage = multer.memoryStorage(); // Guardar las imágenes en memoria temporalmente


//to invoke the methods for the CRUD of users
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const { Router } = require('express')


//path to send the data in json format
const { json } = require('express');

//Invoke the database connection
const conexion = require('../database/db');
const { body } = require('express-validator');

//path to retrieve all users
router.get('/users', authController.isAuthenticated, (req, res) => {
    // res.send('hola mundo')    
    conexion.query('SELECT * FROM users', (error, results) => {
        if(error){
            throw error;
        } else {
            // res.send(results);
            if (row.rol=="Admin") { 
                res.render('users', { results: results, titleWeb: "Lista de usuarios" })
            } else {
                res.render('index', { userName: row.name, image: row.image, titleWeb: "Control Dashboard"})
            }
        }
    })
})

router.get('/tabledata', authController.isAuthenticated, (req, res) => {
    // res.send('hola mundo')    
    conexion.query('SELECT * FROM encuesta_trabajadores', (error, results) => {
        if(error){
            throw error;
        } else {
            // res.send(results);
            if (row.rol=="Admin") { 
                res.render('tabledata', { results: results, titleWeb: "Lista de Colaboradores" })
            } else {
                res.render('index', { userName: row.name, image: row.image, titleWeb: "Control Dashboard"})
            }
        }
    })
})
/*router.get('/actualizargrantotal', authController.actualizarGranTotal);
console.log(authController);
router.get('/previsualizar-pdf', authController.previsualizarPDF);
router.get('/descargar-pdf', authController.descargarPDF);
*/
//path to create a record with auth

// Ruta para guardar datos
router.get('/data-enterprise', (req, res) => {
    const query = 'SELECT * FROM data_enterprise WHERE id = ?'; // Ajusta la consulta según tu necesidad
    const id = req.query.id; // Suponiendo que recibes un ID como parámetro en la URL

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error fetching data: ', err);
            return res.status(500).json({ error: 'Error al obtener los datos' });
        }
        res.render('data-enterprise', { data: result[0] }); // Renderiza la vista con los datos obtenidos
    });
});
router.post('/asistencia/store-session', (req, res) => {
    const { id_empleado } = req.body;
    req.session.id_empleado = id_empleado; // Guarda el id_empleado en la sesión
    res.status(200).json({ success: true });
});


router.post('/save-datae', (req, res) => {
    console.log('Ruta /submit-e llamada');
    authController.registrarEnterprise(req, res);
});
// Ruta para obtener los datos de res_g2 
router.get('/api/resg2', (req, res) => {
        const query = `SELECT *, 
                       (COALESCE(pregunta1, 0) + COALESCE(pregunta2, 0) + COALESCE(pregunta3, 0) + 
                        COALESCE(pregunta4, 0) + COALESCE(pregunta5, 0) + COALESCE(pregunta6, 0) + 
                        COALESCE(pregunta7, 0) + COALESCE(pregunta8, 0) + COALESCE(pregunta9, 0) + 
                        COALESCE(pregunta10, 0) + COALESCE(pregunta11, 0) + COALESCE(pregunta12, 0) + 
                        COALESCE(pregunta13, 0) + COALESCE(pregunta14, 0) + COALESCE(pregunta15, 0) + 
                        COALESCE(pregunta16, 0) + COALESCE(pregunta17, 0) + COALESCE(pregunta18, 0) + 
                        COALESCE(pregunta19, 0) + COALESCE(pregunta20, 0) + COALESCE(pregunta21, 0) + 
                        COALESCE(pregunta22, 0) + COALESCE(pregunta23, 0) + COALESCE(pregunta24, 0) + 
                        COALESCE(pregunta25, 0) + COALESCE(pregunta26, 0) + COALESCE(pregunta27, 0) + 
                        COALESCE(pregunta28, 0) + COALESCE(pregunta29, 0) + COALESCE(pregunta30, 0) + 
                        COALESCE(pregunta31, 0) + COALESCE(pregunta32, 0) + COALESCE(pregunta33, 0) + 
                        COALESCE(pregunta34, 0) + COALESCE(pregunta35, 0) + COALESCE(pregunta36, 0) + 
                        COALESCE(pregunta37, 0) + COALESCE(pregunta38, 0) + COALESCE(pregunta39, 0) + 
                        COALESCE(pregunta40, 0) + COALESCE(pregunta41, 0) + COALESCE(pregunta42, 0) + 
                        COALESCE(pregunta43, 0) + COALESCE(pregunta44, 0) + COALESCE(pregunta45, 0) + 
                        COALESCE(pregunta46, 0) + COALESCE(pregunta47, 0) + COALESCE(pregunta48, 0) + 
                        COALESCE(pregunta49, 0) + COALESCE(pregunta50, 0)) AS gran_total 
                       FROM res_g2`;
                        
        conexion.query(query, (err, result) => {
            if (err) throw err;
            res.json(result);
        });
    });
    
    


router.get('/createUser', authController.isAuthenticated, (req, res) => {
    if (row.rol=="Admin") {        
        res.render('createUser', { titleWeb: "Crear Usuario"})
    } else {
        res.render('index', { userName: row.name, image: row.image, titleWeb: "Control Dashboard"})
    }
})
//crear Usuario
router.get('/createData', authController.isAuthenticated, (req, res) => {
    if (row.rol=="Admin") {        
        res.render('createData', { titleWeb: "Crear Estadisticas"})
    } else {
        res.render('index', { userName: row.name, image: row.image, titleWeb: "Control de Datos"})
    }
})
//insertar Info del usuario
router.get('/createUser', authController.isAuthenticated, (req, res) => {
    if (row.rol=="Admin") {        
        res.render('creatUser', { titleWeb: "Crear Datos de Usuario"})
    } else {
        res.render('index', { userName: row.name, image: row.image, titleWeb: "Control de Datos"})
    }
})
//path to edit a selected record
router.get('/editUser/:id', authController.isAuthenticated, (req, res) => {
    const id = req.params.id;
    conexion.query('SELECT * FROM users WHERE id= ?', [id], (error, results) => {
        if(error){
            throw error;
        } else {
            if(row.rol=="Admin") {
                res.render('editUser', { user: results[0], titleWeb: "Edit user" })
            } else {
                res.render('index', { userName: row.name, image: row.image, titleWeb: "Control Dashboard"})
            }
        }
    })
})

//path to delete a selected record
router.get('/deleteUser/:id', (req, res) => {
    const id = req.params.id
    conexion.query('DELETE FROM users WHERE id= ?', [id], (error, results) => {
        if(error){
            throw error;
        } else {
            res.redirect('/users')
        }
    })
});


router.post('/saveUser', userController.saveUser)
router.post('/updateUser', userController.updateUser)
router.post('/guardarRespuestas', authController.guardarRespuestas);



//router for views
router.get('/', authController.isAuthenticated, (req, res) => {
    res.render('index', { userName: row.name, image: row.image, titleWeb: "Control Dashboard"})
})

router.get('/logout', authController.logout)

router.get('/login', (req, res) => {
    res.render('login', { alert:false })
})

router.get('/register', (req, res) => {
    res.render('register', { alert:false })
})
router.get('/asistencia', (req, res) => {
    res.render('asistencia', { alert:false })
})
/*
router.post('/asistencia-auth', (req, res) => {
    const { id_empleado } = req.body; // Suponiendo que el id_empleado viene en el body de la petición

    const query = 'SELECT * FROM res_g2 WHERE id_empleado = ?'; // Ajusta la consulta según tu tabla

    conexion.query(query, [id_empleado], (err, result) => {
        if (err) {
            console.error('Error al obtener los datos: ', err);
            return res.status(500).json({ success: false, message: 'Error al consultar la base de datos' });
        }

        if (result.length > 0) {
            // Si se encuentra el empleado, devuelve una respuesta de éxito
            res.json({ success: true, message: 'Empleado encontrado' });
        } else {
            // Si no se encuentra, devuelve un mensaje de error
            res.json({ success: false, message: 'ID de empleado no encontrado' });
        }
    });
});*/
router.get('/asistencia-auth', (req, res) => {
    const query = 'SELECT id_empleado FROM res_g2'; // Consulta para obtener todos los id_empleado
    
    conexion.query(query, (err, result) => {
        if (err) {
            console.error('Error al obtener los datos: ', err);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }

        res.json(result); // Devolver todos los id_empleado en formato JSON
    });
});
router.post('/asistencia-auth1', (req, res) => {
    const { id_empleado } = req.body; // Asegúrate de obtener el id_empleado correctamente

    console.log("ID Empleado recibido:", id_empleado); // Verificar que estamos recibiendo el dato

    if (!id_empleado) {
        return res.status(400).json({ success: false, message: 'ID de empleado no proporcionado.' });
    }

    const query = 'SELECT * FROM res_g2 WHERE id_empleado = ?';
    db.query(query, [id_empleado], (err, result) => {
        if (err) {
            console.error('Error fetching data: ', err);
            return res.status(500).json({ success: false, message: 'Error al consultar el empleado.' });
        }

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'ID de empleado no encontrado.' });
        }
        

        // Guardar el id_empleado en la sesión
        req.session.id_empleado = id_empleado;
        console.log('ID de empleado guardado en sesión:', req.session.id_empleado);

        return res.status(200).json({ success: true, message: 'Empleado encontrado.' });
    });
});



router.get('/results', (req, res) => {
    res.render('results', { alert:false })
})
router.get('/estadio', (req, res) => {
    res.render('estadio', { alert:false })
})
router.get('/contacto', (req, res) => {
    res.render('contacto', { alert:false })
})
router.get('/events', (req, res) => {
    res.render('events', { alert:false })
})
router.get('/res_events', (req, res) => {
    res.render('res_events', { alert:false })
})
router.get('/data', (req, res) => {
    res.render('resdata', { alert:false })
})

router.get('/guia2', (req, res) => {
    const id_empleado = req.session.id_empleado; // o de donde estés obteniendo el id_empleado
   
    

    // Renderizando la vista y pasando id_empleado
    res.render('guia2', { id_empleado: id_empleado });
});

router.get('/guia3', (req, res) => {
    res.render('guia3', { alert:false })
})
router.get('/datos-graficas', authController.obtenerDatosParaGraficas);
router.get('/edad-graficas', authController.obtenerDatosParaGraficas1);
router.get('/civil-graficas', authController.obtenerDatosParaGraficas2);
router.get('/escolar-graficas', authController.obtenerDatosParaGraficas3);
router.get('/puesto-graficas', authController.obtenerDatosParaGraficas4);
router.get('/age-graficas', authController.obtenerDatosParaGraficas5);
router.get('/cate-graficas', authController.obtenerDatosParaGraficas6);





router.post('/submit', (req, res) => {
    console.log('Ruta /submit llamada');
    authController.registrarEncuesta(req, res);
});


router.post('/register', authController.register)
router.post('/login', authController.login)

router.post('/upload/:id', (req, res) => {
    const id = req.params.id
    const image = req.file.filename

    conexion.query('UPDATE users SET ? WHERE id= ?', [{image:image}, id], (error, results) => {
        if(error){
            console.error(error);
        } else {
            res.redirect('/users')
        }
    })
})
router.post('/submit1', (req, res) => {
    const { pregunta1, pregunta2, pregunta3, pregunta4 } = req.body;
    
    const query = 'INSERT INTO respuestas (pregunta1, pregunta2, pregunta3, pregunta4) VALUES (?, ?, ?, ?)';
    conexion.query(query, [pregunta1, pregunta2, pregunta3, pregunta4], (err, result) => {
        if (err) {
            console.log('Error insertando datos:', err);
            res.status(500).send('Error al registrar las respuestas.');
        } else {
            res.send('Respuestas registradas exitosamente.');
        }
    });
    res.redirect('/events')
});

router.post('/submit2', (req, res) => {
    const { pregunta1, pregunta2, pregunta3, pregunta4, pregunta5, pregunta6, pregunta7, pregunta8, pregunta9 } = req.body;
    
    const query = 'INSERT INTO res_g2(pregunta1, pregunta2, pregunta3, pregunta4, pregunta5, pregunta6, pregunta7, pregunta8, pregunta9) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    conexion.query(query, [id_empleado, pregunta1, pregunta2, pregunta3, pregunta4, pregunta5, pregunta6, pregunta7, pregunta8, pregunta9], (err, result) => {
        if (err) {
            console.log('Error insertando datos:', err);
            res.status(500).send('Error al registrar las respuestas. submit2');
        } else {
            
            res.redirect('/guia2')
           
        }
        
    });
    
});

router.post('/submitdos', (req, res) => {
    const { id_empleado2,  pregunta1, pregunta2, pregunta3, pregunta4, pregunta5, pregunta6, pregunta7, pregunta8, pregunta9 } = req.body;
    console.log(req.body);
    // Verifica si el empleado ya tiene una fila en la tabla
    const checkQuery = 'SELECT id_empleado FROM res_g2 WHERE id_empleado = ?';
    
    conexion.query(checkQuery, [id_empleado2], (err, results) => {
        if (err) {
            console.log('Error consultando id_empleado:', err);
            res.status(500).send('Error al verificar el empleado.');
        } else if (results.length > 0) {
            // Si el empleado ya tiene una fila, actualizamos las respuestas
            const updateQuery = `
                UPDATE res_g2
                SET pregunta1 = ?, pregunta2 = ?, pregunta3 = ?, pregunta4 = ?, pregunta5 = ?, pregunta6 = ?, pregunta7 = ?, pregunta8 = ?, pregunta9 = ?
                WHERE id_empleado = ?
            `;
            conexion.query(updateQuery, [pregunta1, pregunta2, pregunta3, pregunta4, pregunta5, pregunta6, pregunta7, pregunta8, pregunta9, id_empleado2], (err, result) => {
                if (err) {
                    console.log('Error actualizando datos:', err);
                    res.status(500).send('Error al actualizar las respuestas.');
                } else {
                    res.redirect('/guia2');
                }
            });
        } else {
            // Si no hay fila para el id_empleado, insertamos una nueva
            const insertQuery = `
            INSERT INTO res_g2(id_empleado, pregunta1, pregunta2, pregunta3, pregunta4, pregunta5, pregunta6, pregunta7, pregunta8, pregunta9) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            conexion.query(insertQuery, [id_empleado2, pregunta1, pregunta2, pregunta3, pregunta4,  pregunta5, pregunta6, pregunta7, pregunta8, pregunta9], (err, result) => {
                if (err) {
                    console.log('Error insertando datos:', err);
                    res.status(500).send('Error al registrar las respuestas.');
                } else {
                    res.redirect('/guia2');
                }
            });
        }
    });
});
router.post('/submit3', (req, res) => {
    const { id_empleado3, pregunta10, pregunta11, pregunta12, pregunta13 } = req.body;
    console.log(req.body);
    // Verifica si el empleado ya tiene una fila en la tabla
    const checkQuery = 'SELECT id_empleado FROM res_g2 WHERE id_empleado = ?';
    
    conexion.query(checkQuery, [id_empleado3], (err, results) => {
        if (err) {
            console.log('Error consultando id_empleado:', err);
            res.status(500).send('Error al verificar el empleado.');
        } else if (results.length > 0) {
            // Si el empleado ya tiene una fila, actualizamos las respuestas
            const updateQuery = `
                UPDATE res_g2 
                SET pregunta10 = ?, pregunta11 = ?, pregunta12 = ?, pregunta13 = ?
                WHERE id_empleado = ?
            `;
            conexion.query(updateQuery, [pregunta10, pregunta11, pregunta12, pregunta13, id_empleado3], (err, result) => {
                if (err) {
                    console.log('Error actualizando datos:', err);
                    res.status(500).send('Error al actualizar las respuestas.');
                } else {
                    res.redirect('/guia2');
                }
            });
        } else {
            // Si no hay fila para el id_empleado, insertamos una nueva
            const insertQuery = `
                INSERT INTO res_g2(id_empleado, pregunta10, pregunta11, pregunta12, pregunta13) 
                VALUES (?, ?, ?, ?, ?)
            `;
            conexion.query(insertQuery, [id_empleado3, pregunta10, pregunta11, pregunta12, pregunta13], (err, result) => {
                if (err) {
                    console.log('Error insertando datos:', err);
                    res.status(500).send('Error al registrar las respuestas.');
                } else {
                    res.redirect('/guia2');
                }
            });
        }
    });
});
router.post('/submit4', (req, res) => {
    const { id_empleado4, pregunta14, pregunta15, pregunta16, pregunta17 } = req.body;
    console.log(req.body);
    // Verifica si el empleado ya tiene una fila en la tabla
    const checkQuery = 'SELECT id_empleado FROM res_g2 WHERE id_empleado = ?';
    
    conexion.query(checkQuery, [id_empleado4], (err, results) => {
        if (err) {
            console.log('Error consultando id_empleado:', err);
            res.status(500).send('Error al verificar el empleado.');
        } else if (results.length > 0) {
            // Si el empleado ya tiene una fila, actualizamos las respuestas
            const updateQuery = `
                UPDATE res_g2 
                SET pregunta14 = ?, pregunta15 = ?, pregunta16 = ?, pregunta17 = ?
                WHERE id_empleado = ?
            `;
            conexion.query(updateQuery, [pregunta14, pregunta15, pregunta16, pregunta17, id_empleado4], (err, result) => {
                if (err) {
                    console.log('Error actualizando datos:', err);
                    res.status(500).send('Error al actualizar las respuestas.');
                } else {
                    res.redirect('/guia2');
                }
            });
        } else {
            // Si no hay fila para el id_empleado, insertamos una nueva
            const insertQuery = `
                INSERT INTO res_g2(id_empleado, pregunta14, pregunta15, pregunta16, pregunta17) 
                VALUES (?, ?, ?, ?, ?)
            `;
            conexion.query(insertQuery, [id_empleado4, pregunta14, pregunta15, pregunta16, pregunta17], (err, result) => {
                if (err) {
                    console.log('Error insertando datos:', err);
                    res.status(500).send('Error al registrar las respuestas.');
                } else {
                    res.redirect('/guia2');
                }
            });
        }
    });
});
router.post('/submit5', (req, res) => {
    const { id_empleado5, pregunta18, pregunta19, pregunta20, pregunta21, pregunta22 } = req.body;
    console.log(req.body);
    // Verifica si el empleado ya tiene una fila en la tabla
    const checkQuery = 'SELECT id_empleado FROM res_g2 WHERE id_empleado = ?';
    
    conexion.query(checkQuery, [id_empleado5], (err, results) => {
        if (err) {
            console.log('Error consultando id_empleado:', err);
            res.status(500).send('Error al verificar el empleado.');
        } else if (results.length > 0) {
            // Si el empleado ya tiene una fila, actualizamos las respuestas
            const updateQuery = `
                UPDATE res_g2 
                SET pregunta18 = ?, pregunta19 = ?, pregunta20 = ?, pregunta21 = ?, pregunta22 = ?
                WHERE id_empleado = ?
            `;
            conexion.query(updateQuery, [ pregunta18, pregunta19, pregunta20, pregunta21, pregunta22, id_empleado5], (err, result) => {
                if (err) {
                    console.log('Error actualizando datos:', err);
                    res.status(500).send('Error al actualizar las respuestas.');
                } else {
                    res.redirect('/guia2');
                }
            });
        } else {
            // Si no hay fila para el id_empleado, insertamos una nueva
            const insertQuery = `
                INSERT INTO res_g2(id_empleado,  pregunta18, pregunta19, pregunta20, pregunta21, pregunta22) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            conexion.query(insertQuery, [id_empleado5, pregunta18, pregunta19, pregunta20, pregunta21, pregunta22], (err, result) => {
                if (err) {
                    console.log('Error insertando datos:', err);
                    res.status(500).send('Error al registrar las respuestas.');
                } else {
                    res.redirect('/guia2');
                }
            });
        }
    });
});
router.post('/submit6', (req, res) => {
    const { id_empleado6, pregunta23, pregunta24, pregunta25, pregunta26, pregunta27 } = req.body;
    console.log(req.body);
    // Verifica si el empleado ya tiene una fila en la tabla
    const checkQuery = 'SELECT id_empleado FROM res_g2 WHERE id_empleado = ?';
    
    conexion.query(checkQuery, [id_empleado6], (err, results) => {
        if (err) {
            console.log('Error consultando id_empleado:', err);
            res.status(500).send('Error al verificar el empleado.');
        } else if (results.length > 0) {
            // Si el empleado ya tiene una fila, actualizamos las respuestas
            const updateQuery = `
                UPDATE res_g2 
                SET pregunta23 = ?, pregunta24 = ?, pregunta25 = ?, pregunta26 = ?, pregunta27 = ?
                WHERE id_empleado = ?
            `;
            conexion.query(updateQuery, [ pregunta23, pregunta24, pregunta25, pregunta26, pregunta27, id_empleado6], (err, result) => {
                if (err) {
                    console.log('Error actualizando datos:', err);
                    res.status(500).send('Error al actualizar las respuestas.');
                } else {
                    res.redirect('/guia2');
                }
            });
        } else {
            // Si no hay fila para el id_empleado, insertamos una nueva
            const insertQuery = `
                INSERT INTO res_g2(id_empleado,  pregunta23, pregunta24, pregunta25, pregunta26, pregunta27) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            conexion.query(insertQuery, [id_empleado6, pregunta23, pregunta24, pregunta25, pregunta26, pregunta27], (err, result) => {
                if (err) {
                    console.log('Error insertando datos:', err);
                    res.status(500).send('Error al registrar las respuestas.');
                } else {
                    res.redirect('/guia2');
                }
            });
        }
    });
});
router.post('/submit7', (req, res) => {
    const { id_empleado7, pregunta23, pregunta24, pregunta25, pregunta26, pregunta27 } = req.body;
    console.log(req.body);
    // Verifica si el empleado ya tiene una fila en la tabla
    const checkQuery = 'SELECT id_empleado FROM res_g2 WHERE id_empleado = ?';
    
    conexion.query(checkQuery, [id_empleado6], (err, results) => {
        if (err) {
            console.log('Error consultando id_empleado:', err);
            res.status(500).send('Error al verificar el empleado.');
        } else if (results.length > 0) {
            // Si el empleado ya tiene una fila, actualizamos las respuestas
            const updateQuery = `
                UPDATE res_g2 
                SET pregunta23 = ?, pregunta24 = ?, pregunta25 = ?, pregunta26 = ?, pregunta27 = ?
                WHERE id_empleado = ?
            `;
            conexion.query(updateQuery, [ pregunta23, pregunta24, pregunta25, pregunta26, pregunta27, id_empleado6], (err, result) => {
                if (err) {
                    console.log('Error actualizando datos:', err);
                    res.status(500).send('Error al actualizar las respuestas.');
                } else {
                    res.redirect('/guia2');
                }
            });
        } else {
            // Si no hay fila para el id_empleado, insertamos una nueva
            const insertQuery = `
                INSERT INTO res_g2(id_empleado,  pregunta23, pregunta24, pregunta25, pregunta26, pregunta27) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            conexion.query(insertQuery, [id_empleado6, pregunta23, pregunta24, pregunta25, pregunta26, pregunta27], (err, result) => {
                if (err) {
                    console.log('Error insertando datos:', err);
                    res.status(500).send('Error al registrar las respuestas.');
                } else {
                    res.redirect('/guia2');
                }
            });
        }
    });
});
router.post('/submit8', (req, res) => {
    const { pregunta41, pregunta42, pregunta43, pregunta44, pregunta45, pregunta46 } = req.body;
    
    const query = 'INSERT INTO res_g2(pregunta41, pregunta42, pregunta43, pregunta44, pregunta45, pregunta46) VALUES (?, ?, ?, ?, ?, ?)';
    conexion.query(query, [pregunta41, pregunta42, pregunta43, pregunta44, pregunta45, pregunta46], (err, result) => {
        if (err) {
            console.log('Error insertando datos:', err);
            res.status(500).send('Error al registrar las respuestas.');
        } else {
            
            res.redirect('/guia2')
           
        }
        
    });
    
});
module.exports = router;