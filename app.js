const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const multer = require('multer');

// Cargar variables de entorno ANTES de usarlas
dotenv.config({ path: path.join(__dirname, './env/.env') });

// Sistema de alertas para Liberación del AST
const alertasAST = require('./utils/alertasAST');

const app = express();

// Configuración de la app
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

// Configuración de multer para subida de imágenes
const uploadDir = path.join(__dirname, 'public/uploads');
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isMimeValid = allowedTypes.test(file.mimetype);
    const isExtValid = allowedTypes.test(path.extname(file.originalname));
    
    if (isMimeValid && isExtValid) {
        return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF)'));
};

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
    fileFilter
});

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(upload.single('image'));
app.use(express.static(path.join(__dirname, '/public')));

// Rutas
app.use('/', require('./routes/router'));

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).render('404', { 
        titleWeb: 'Página no encontrada'
    });
});

// Manejo global de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', { 
        titleWeb: 'Error del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✓ Servidor ejecutándose en puerto: ${PORT}`);
    
    // Iniciar monitoreo de alertas AST (verifica cada hora)
    console.log('🔍 Iniciando monitoreo de actividades "Liberación del AST"...');
    alertasAST.iniciarMonitoreo();
});