const express = require('express')
const PDFDocument = require('pdfkit'); // Asegúrate de tener esto
const fs = require('fs');
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
const path = require('path');
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
router.get('/api/resg2/total_gran_totales', (req, res) => {
    const query = `SELECT sum_gran_totales() AS total_gran_total`;

    conexion.query(query, (err, result) => {
        if (err) throw err;
        res.json(result[0]);
    });
});
router.get('/api/resueltos', (req, res) => {
    const query = `
        SELECT 
            COUNT(CASE WHEN gran_total > 0 THEN 1 END) AS empleados_que_resolvieron,
            COUNT(CASE WHEN gran_total = 0 OR gran_total IS NULL THEN 1 END) AS empleados_faltantes,
            SUM(COALESCE(gran_total, 0)) AS suma_gran_totales,
            AVG(CASE WHEN gran_total > 0 THEN gran_total END) AS promedio_gran_total
        FROM (
            SELECT 
                id_empleado,
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
                 COALESCE(pregunta46, 0)) AS gran_total
            FROM res_g2
        ) AS subquery
    `;

    conexion.query(query, (err, result) => {
        if (err) throw err;
        res.json(result[0]);
    });
});


router.get('/api/resg2', (req, res) => {
    const query = `
    SELECT id_empleado, 
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
    COALESCE(pregunta46, 0)) AS gran_total 
    FROM res_g2`;

    conexion.query(query, (err, result) => {
        if (err) throw err;

        const updatedResult = result.map(row => {
            let calificacion = '';
            let color = '';
            let accion = '';

            if (row.gran_total < 20) {
                calificacion = 'Nulo o despreciable';
                color = 'blue';
                accion = 'No se requiere medidas adicionales';
            } else if (row.gran_total < 45) {
                calificacion = 'Bajo';
                color = 'green';
                accion = 'Se recomienda la prevención de riesgos psicosociales';
            } else if (row.gran_total < 70) {
                calificacion = 'Medio';
                color = 'yellow';
                accion = 'Es necesario una intervención con enfoque preventivo';
            } else if (row.gran_total < 90) {
                calificacion = 'Alto';
                color = 'orange';
                accion = 'Se debe revisar la política de prevención de riesgos';
            } else {
                calificacion = 'Muy alto';
                color = 'red';
                accion = 'Se requiere un análisis y plan de acción urgente';
            }

            return { 
                id_empleado: row.id_empleado, 
                gran_total: row.gran_total, 
                calificacion, 
                color, 
                accion 
            };
        });

        res.json(updatedResult);
    });
});


    router.get('/api/resg3', (req, res) => {
        const query = `SELECT *, 
        -- Suma de las primeras 3 preguntas para "Condiciones peligrosas e inseguras"
        (COALESCE(pregunta1, 0) + COALESCE(pregunta2, 0) + COALESCE(pregunta3, 0)) AS cate_ambiente_trabajo,
        -- Suma de las preguntas correspondientes para "Factores propios de la actividad"
        (COALESCE(pregunta4, 0) + COALESCE(pregunta5, 0) + COALESCE(pregunta6, 0) + COALESCE(pregunta7, 0) + COALESCE(pregunta8, 0) + COALESCE(pregunta9, 0) + COALESCE(pregunta41, 0)+ COALESCE(pregunta42, 0)+ COALESCE(pregunta43, 0)) AS factores_actividad,
        -- Añadir más dominios y dimensiones según la tabla
        (COALESCE(pregunta4, 0) + COALESCE(pregunta9, 0)) AS dom_Cargas_cuantitativas,
        (COALESCE(pregunta5, 0) + COALESCE(pregunta6, 0)) AS dom_Ritmos_de_trabajo_acelerado,
        (COALESCE(pregunta7, 0) + COALESCE(pregunta8, 0)) AS dom_Cargas_mental,
        (COALESCE(pregunta5, 0) + COALESCE(pregunta6, 0)) AS dom_Ritmos_de_trabajo_acelerado,
        (COALESCE(pregunta41, 0) + COALESCE(pregunta42, 0) + COALESCE(pregunta43, 0)) AS dom_cargas_psicolog_emocionales,
        -- Suma de las preguntas correspondientes para "Cargas de trabajo"
        (COALESCE(pregunta4, 0) + COALESCE(pregunta5, 0) + COALESCE(pregunta6, 0) + COALESCE(pregunta7, 0) + COALESCE(pregunta8, 0) + COALESCE(pregunta9, 0) + COALESCE(pregunta41, 0)+ COALESCE(pregunta42, 0)+ COALESCE(pregunta43, 0)) AS carga_trabajo,
        -- Suma para "Cargas psicológicas emocionales"
        (COALESCE(pregunta7, 0) + COALESCE(pregunta8, 0) + COALESCE(pregunta41, 0) + COALESCE(pregunta42, 0) + COALESCE(pregunta43, 0)) AS cargas_psicologicas,
        -- Añadir más dominios y dimensiones según la tabla
        (COALESCE(pregunta11, 0) + COALESCE(pregunta10, 0)) AS cate_Cargas_de_alta_responsabilidad,
        (COALESCE(pregunta12, 0) + COALESCE(pregunta13, 0)) AS cate_Cargas_contradictorias_inconsistentes,
        -- Falta de control sobre el trabajo"
        (COALESCE(pregunta18, 0) + COALESCE(pregunta19, 0) + COALESCE(pregunta20, 0) + COALESCE(pregunta21, 0) + COALESCE(pregunta22, 0) + COALESCE(pregunta26, 0) + COALESCE(pregunta27, 0)) AS cate_falta_control_st,
        -- Suma para "Cargas psicológicas emocionales"
        (COALESCE(pregunta7, 0) + COALESCE(pregunta8, 0) + COALESCE(pregunta41, 0) + COALESCE(pregunta42, 0) + COALESCE(pregunta43, 0)) AS cargas_psicologicas_emos,
        

        -- Organización del tiempo de trabajo"
        (COALESCE(pregunta14, 0) + COALESCE(pregunta15, 0) + COALESCE(pregunta16, 0) + COALESCE(pregunta17, 0) ) AS cate_Organización_tiempo_trabajo,
        (COALESCE(pregunta16, 0)) AS Influencia_del_trabajo_fuera_del_centro_laboral,
        (COALESCE(pregunta17, 0)) AS Limitada_o_inexistente_capacitacion,

        (COALESCE(pregunta23, 0) + COALESCE(pregunta24, 0) + COALESCE(pregunta25, 0) + COALESCE(pregunta28, 0) + COALESCE(pregunta29, 0)) AS dom_liderazgo,
        (COALESCE(pregunta23, 0) + COALESCE(pregunta24, 0) + COALESCE(pregunta25, 0)) AS dim_Escasa_claridad_de_funciones,
        (COALESCE(pregunta28, 0) + COALESCE(pregunta29, 0)) AS dim_cate_liderazgo,

        (COALESCE(pregunta30, 0) + COALESCE(pregunta31, 0) + COALESCE(pregunta32, 0) + COALESCE(pregunta44, 0) + COALESCE(pregunta45, 0) + COALESCE(pregunta46, 0)) AS dom_Relaciones_trabajo,
        (COALESCE(pregunta30, 0) + COALESCE(pregunta31, 0) + COALESCE(pregunta32, 0)) AS dim_Relaciones_sociales_trabajo, 
        (COALESCE(pregunta44, 0) + COALESCE(pregunta45, 0) + COALESCE(pregunta46, 0)) AS dim_Deficiente_relación_los_colaboradores_que_supervisa,

        (COALESCE(pregunta33, 0) + COALESCE(pregunta34, 0) + COALESCE(pregunta35, 0) + COALESCE(pregunta36, 0) + COALESCE(pregunta37, 0) + COALESCE(pregunta38, 0) + COALESCE(pregunta39, 0) + COALESCE(pregunta40, 0)) AS diom_violencia_laboral
        FROM res_g2`;
                        
        conexion.query(query, (err, result) => {
            if (err) throw err;
            res.json(result);
        });
    });
    
// Ruta para descargar el reporte

router.get('/reporte1/:id_empleado', (req, res) => {
    const idEmpleado = req.params.id_empleado;
    const query = `SELECT *, 
    -- Suma de las primeras 3 preguntas para "Condiciones peligrosas e inseguras"
        (COALESCE(pregunta1, 0) + COALESCE(pregunta2, 0) + COALESCE(pregunta3, 0)) AS cate_ambiente_trabajo,
        -- Suma de las preguntas correspondientes para "Factores propios de la actividad"
        (COALESCE(pregunta4, 0) + COALESCE(pregunta5, 0) + COALESCE(pregunta6, 0) + COALESCE(pregunta7, 0) + COALESCE(pregunta8, 0) + COALESCE(pregunta9, 0) + COALESCE(pregunta41, 0)+ COALESCE(pregunta42, 0)+ COALESCE(pregunta43, 0)) AS factores_actividad,
        -- Añadir más dominios y dimensiones según la tabla
        (COALESCE(pregunta4, 0) + COALESCE(pregunta9, 0)) AS dom_Cargas_cuantitativas,
        (COALESCE(pregunta5, 0) + COALESCE(pregunta6, 0)) AS dom_Ritmos_de_trabajo_acelerado,
        (COALESCE(pregunta7, 0) + COALESCE(pregunta8, 0)) AS dom_Cargas_mental,
        (COALESCE(pregunta5, 0) + COALESCE(pregunta6, 0)) AS dom_Ritmos_de_trabajo_acelerado,
        (COALESCE(pregunta41, 0) + COALESCE(pregunta42, 0) + COALESCE(pregunta43, 0)) AS dom_cargas_psicolog_emocionales,
        -- Suma de las preguntas correspondientes para "Cargas de trabajo"
        (COALESCE(pregunta4, 0) + COALESCE(pregunta5, 0) + COALESCE(pregunta6, 0) + COALESCE(pregunta7, 0) + COALESCE(pregunta8, 0) + COALESCE(pregunta9, 0) + COALESCE(pregunta41, 0)+ COALESCE(pregunta42, 0)+ COALESCE(pregunta43, 0)) AS carga_trabajo,
        -- Suma para "Cargas psicológicas emocionales"
        (COALESCE(pregunta7, 0) + COALESCE(pregunta8, 0) + COALESCE(pregunta41, 0) + COALESCE(pregunta42, 0) + COALESCE(pregunta43, 0)) AS cargas_psicologicas,
        -- Añadir más dominios y dimensiones según la tabla
        (COALESCE(pregunta11, 0) + COALESCE(pregunta10, 0)) AS cate_Cargas_de_alta_responsabilidad,
        (COALESCE(pregunta12, 0) + COALESCE(pregunta13, 0)) AS cate_Cargas_contradictorias_inconsistentes,
        -- Falta de control sobre el trabajo"
        (COALESCE(pregunta18, 0) + COALESCE(pregunta19, 0) + COALESCE(pregunta20, 0) + COALESCE(pregunta21, 0) + COALESCE(pregunta22, 0) + COALESCE(pregunta26, 0) + COALESCE(pregunta27, 0)) AS cate_falta_control_st,
        -- Suma para "Cargas psicológicas emocionales"
        (COALESCE(pregunta7, 0) + COALESCE(pregunta8, 0) + COALESCE(pregunta41, 0) + COALESCE(pregunta42, 0) + COALESCE(pregunta43, 0)) AS cargas_psicologicas_emos,
        

        -- Organización del tiempo de trabajo"
        (COALESCE(pregunta14, 0) + COALESCE(pregunta15, 0) + COALESCE(pregunta16, 0) + COALESCE(pregunta17, 0) ) AS cate_Organización_tiempo_trabajo,
        (COALESCE(pregunta16, 0)) AS Influencia_del_trabajo_fuera_del_centro_laboral,
        (COALESCE(pregunta17, 0)) AS Limitada_o_inexistente_capacitacion,

        (COALESCE(pregunta23, 0) + COALESCE(pregunta24, 0) + COALESCE(pregunta25, 0) + COALESCE(pregunta28, 0) + COALESCE(pregunta29, 0)) AS dom_liderazgo,
        (COALESCE(pregunta23, 0) + COALESCE(pregunta24, 0) + COALESCE(pregunta25, 0)) AS dim_Escasa_claridad_de_funciones,
        (COALESCE(pregunta28, 0) + COALESCE(pregunta29, 0)) AS dim_cate_liderazgo,

        (COALESCE(pregunta30, 0) + COALESCE(pregunta31, 0) + COALESCE(pregunta32, 0) + COALESCE(pregunta44, 0) + COALESCE(pregunta45, 0) + COALESCE(pregunta46, 0)) AS dom_Relaciones_trabajo,
        (COALESCE(pregunta30, 0) + COALESCE(pregunta31, 0) + COALESCE(pregunta32, 0)) AS dim_Relaciones_sociales_trabajo, 
        (COALESCE(pregunta44, 0) + COALESCE(pregunta45, 0) + COALESCE(pregunta46, 0)) AS dim_Deficiente_relación_los_colaboradores_que_supervisa,

        (COALESCE(pregunta33, 0) + COALESCE(pregunta34, 0) + COALESCE(pregunta35, 0) + COALESCE(pregunta36, 0) + COALESCE(pregunta37, 0) + COALESCE(pregunta38, 0) + COALESCE(pregunta39, 0) + COALESCE(pregunta40, 0)) AS diom_violencia_laboral
        FROM res_g2`;
           
        conexion.query(query, [idEmpleado], (err, result) => {
            if (err) {
                return res.status(500).send("Error en la consulta");
            }
        
            //console.log(result); // Verifica los resultados
        
            if (result.length === 0) {
                return res.status(404).send("Empleado no encontrado");
            }
        
            const datos = result[idEmpleado-1]; // Obtenemos la primera fila de resultados
            //console.log(datos);
            const categories = [
                { name: '1.- Condiciones peligrosas e inseguras', value: datos.cate_ambiente_trabajo },
                { name: '2.-Factores propios de la actividad', value: datos.factores_actividad },
                { name: '3.-Dominio cargas cuantitativas', value: datos.dom_cargas_cuantitativas },
                { name: '4.-Dominio Ritmos de trabajo acelerado', value: datos.dom_Ritmos_de_trabajo_acelerado },
                { name: '5.-Carga mental', value: datos.dom_Cargas_mental },
                { name: '6.-Cargas psicológicas emocionales', value: datos.dom_cargas_psicolog_emocionales },
                { name: '7.-Carga de trabajo', value: datos.carga_trabajo },
                { name: '8.-Cargas psicológicas', value: datos.cargas_psicologicas },
                { name: '9.-Cargas de alta responsabilidad', value: datos.cate_Cargas_de_alta_responsabilidad },
                { name: '10.-Cargas contradictorias/inconsistentes', value: datos.cate_Cargas_contradictorias_inconsistentes },
                { name: '11.-Falta control ST', value: datos.cargas_psicologicas_emos },
                { name: '12.-Organización tiempo de trabajo', value: datos.cate_Organización_tiempo_trabajo },
                { name: '13.-Influencia del trabajo fuera del centro laboral', value: datos.Influencia_del_trabajo_fuera_del_centro_labora },
                { name: '.-Limitada o inexistente capacitación', value: datos.Limitada_o_inexistente_capacitacion },
                { name: '.-Liderazgo', value: datos.dom_liderazgo },
                { name: '.-Escasa claridad de funciones', value: datos.dim_Escasa_claridad_de_funciones },
                { name: '.-Liderazgo (dimensión)', value: datos.dim_cate_liderazgo },
                { name: '.-Relaciones en el trabajo', value: datos.dim_Relaciones_sociales_trabajo },
                { name: '.-Deficiente relación con los colaboradores supervisados', value: datos.dim_Deficiente_relación_los_colaboradores_que_supervisa },
                { name: '.-Violencia laboral (dimensión)', value: datos.diom_violencia_laboral },
                { name: '.-Dominio de violencia laboral', value: datos.diom_violencia_laboral }
            ];
        
            const dirPath = path.join(__dirname, '../reportes');
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        
            const filePath = path.join(dirPath, `reporte_empleado_${idEmpleado}.pdf`);
            const doc = new PDFDocument();
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);
        
            // Título
            doc.fontSize(25).text(`Reporte de Empleado ${idEmpleado}`, { underline: true });
            doc.moveDown();
        
            // Encabezado de la tabla
            doc.fontSize(12).text('Resultado por ', { continued: true }).text('Categoría Y Dominio sin ordenar pero si sumadas', { underline: true });
            doc.moveDown();
        
            // Dibuja la tabla
            categories.forEach((category, index) => {
                const color = getCategoryScore(category.value, category.name); // Usar 0 si category.value es undefined
                const yPosition = doc.y; // Guarda la posición Y actual
        
                // Establece el color de fondo para la fila
                doc.fillColor(color)
                    .rect(50, yPosition, 500, 20) // Ajusta el tamaño del rectángulo según sea necesario
                    .fill();
        
                // Establece el color de texto y dibuja el texto
                doc.fillColor('black')
                    .text(category.name, 50, yPosition, { continued: true }) // Posición X, Y
                    .text((category.value !== undefined ? category.value.toString() : 'N/A'), { align: 'right' }); // Alinea el texto a la derecha
        
                // Dibuja la línea inferior de la fila
                doc.strokeColor('black').lineWidth(1).moveTo(50, yPosition + 20).lineTo(550, yPosition + 20).stroke(); // Ajusta el ancho según sea necesario
                doc.moveDown();
            });
        
            doc.end();
        
            writeStream.on('finish', () => {
                res.download(filePath, (err) => {
                    if (err) {
                        console.error("Error al enviar el PDF:", err);
                    }
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error al eliminar el PDF:", err);
                    });
                });
            });
        
            writeStream.on('error', (err) => {
                console.error("Error al crear el PDF:", err);
                res.status(500).send("Error al crear el PDF");
            });
        });
        });
        

// Función para determinar el color basado en el valor
function getColorForValue(value) {
    if (value < 0) return 'blue'; // Despreciable
    else if (value > 20 && value <= 45) return 'green'; // Bajo
    else if (value > 45 && value <= 70) return 'yellow'; // Medio
    else if (value > 70 && value <= 90) return 'gray'; // Medio

    else return 'red'; // Alto
}
function getCategoryScore(value, category) {
    switch (category) {
        case '1.- Condiciones peligrosas e inseguras':
            if (value < 3) return 'blue';
            else if (value >= 3 && value < 5) return 'green';
            else if (value >= 5 && value < 7) return 'yellow';
            else if (value >= 7 && value < 9) return 'gray';
            else return 'red';
        case '2.-Factores propios de la actividad':
            if (value < 10) return 'blue';
            else if (value >= 10 && value < 20) return 'green';
            else if (value >= 20 && value < 30) return 'yellow';
            else if (value >= 30 && value < 40) return 'gray';
            else return 'red';
        case '9.-Cargas de alta responsabilidad':
            if (value < 4) return 'blue';
            else if (value >= 4 && value < 6) return 'green';
            else if (value >= 6 && value < 9) return 'yellow';
            else if (value >= 9 && value < 12) return 'gray';
            else return 'red';
        case '10.-Cargas contradictorias/inconsistentes':
            if (value < 10) return 'blue';
            else if (value >= 10 && value < 18) return 'green';
            else if (value >= 18 && value < 28) return 'yellow';
            else if (value >= 28 && value < 38) return 'gray';
            else return 'red';
        default:
            return 'pink';
    }
}
router.get('/reporte/:id_empleado', (req, res) => {
    const idEmpleado = req.params.id_empleado;
    const query = `SELECT * FROM res_g2 WHERE id_empleado = ?`;
    
    conexion.query(query, [idEmpleado], (err, result) => {
        if (err) {
            return res.status(500).send("Error en la consulta");
        }

        if (result.length === 0) {
            return res.status(404).send("Empleado no encontrado");
        }

        const empleado = result[0];
        const dirPath = path.join(__dirname, '../reportes'); // Asegúrate de que la ruta sea correcta

        // Crear el directorio si no existe
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const filePath = path.join(dirPath, `reporte_empleado_${idEmpleado}.pdf`);
        const doc = new PDFDocument();

        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream); // Guardar en el sistema de archivos

        // Agregar contenido al PDF
        doc.fontSize(25).text(`Reporte de Empleado ${idEmpleado}`, { underline: true });
        doc.text(`Gran Total: ${empleado.gran_total}`);
        // Agrega más detalles según sea necesario

        doc.end(); // Terminar el PDF

        writeStream.on('finish', () => {
            // Enviar el archivo PDF generado al cliente
            res.download(filePath, (err) => {
                if (err) {
                    console.error("Error al enviar el PDF:", err);
                }
                // Opcional: Eliminar el archivo después de enviarlo
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error al eliminar el PDF:", err);
                });
            });
        });

        writeStream.on('error', (err) => {
            console.error("Error al crear el PDF:", err);
            res.status(500).send("Error al crear el PDF");
        });
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
    const { id_empleado7, pregunta28, pregunta29, pregunta30, pregunta31, pregunta32, pregunta33, pregunta34, pregunta35, pregunta36, pregunta37, pregunta38, pregunta39, pregunta40 } = req.body;
    console.log(req.body);
    // Verifica si el empleado ya tiene una fila en la tabla
    const checkQuery = 'SELECT id_empleado FROM res_g2 WHERE id_empleado = ?';
    
    conexion.query(checkQuery, [id_empleado7], (err, results) => {
        if (err) {
            console.log('Error consultando id_empleado:', err);
            res.status(500).send('Error al verificar el empleado.');
        } else if (results.length > 0) {
            // Si el empleado ya tiene una fila, actualizamos las respuestas
            const updateQuery = `
                UPDATE res_g2 
                SET pregunta28 = ?, pregunta29 = ?, pregunta30 = ?, pregunta31 = ?, pregunta32 = ?, pregunta33 = ?, pregunta34 = ?, pregunta35 = ?, pregunta36 = ?, pregunta37 = ?, pregunta38 = ?, pregunta39 = ?, pregunta40 = ?
                WHERE id_empleado = ?
            `;
            conexion.query(updateQuery, [ pregunta28, pregunta29, pregunta30, pregunta31, pregunta32, pregunta33, pregunta34, pregunta35, pregunta36, pregunta37, pregunta38, pregunta39, pregunta40, id_empleado7], (err, result) => {
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
                INSERT INTO res_g2(id_empleado, pregunta28, pregunta29, pregunta30, pregunta31, pregunta32, pregunta33, pregunta34, pregunta35, pregunta36, pregunta37, pregunta38, pregunta39, pregunta40) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            conexion.query(insertQuery, [id_empleado7, pregunta28, pregunta29, pregunta30, pregunta31, pregunta32, pregunta33, pregunta34, pregunta35, pregunta36, pregunta37, pregunta38, pregunta39, pregunta40], (err, result) => {
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
    const { id_empleado8, pregunta41, pregunta42, pregunta43, pregunta44, pregunta45, pregunta46 } = req.body;
    console.log(req.body);
    // Verifica si el empleado ya tiene una fila en la tabla
    const checkQuery = 'SELECT id_empleado FROM res_g2 WHERE id_empleado = ?';
    
    conexion.query(checkQuery, [id_empleado8], (err, results) => {
        if (err) {
            console.log('Error consultando id_empleado:', err);
            res.status(500).send('Error al verificar el empleado.');
        } else if (results.length > 0) {
            // Si el empleado ya tiene una fila, actualizamos las respuestas
            const updateQuery = `
                UPDATE res_g2 
                SET pregunta41 = ?, pregunta42 = ?, pregunta43 = ?, pregunta44 = ?, pregunta45 = ?, pregunta46 = ?
                WHERE id_empleado = ?
            `;
            conexion.query(updateQuery, [ pregunta41, pregunta42, pregunta43, pregunta44, pregunta45, pregunta46, id_empleado8], (err, result) => {
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
                INSERT INTO res_g2(id_empleado, pregunta41, pregunta42, pregunta43, pregunta44, pregunta45, pregunta46) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            conexion.query(insertQuery, [id_empleado8, pregunta41, pregunta42, pregunta43, pregunta44, pregunta45, pregunta46], (err, result) => {
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
router.post('/submit88', (req, res) => {
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