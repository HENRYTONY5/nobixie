const path = require('path');
const dotenv = require('dotenv');

// Cargar .env primero
dotenv.config({ path: path.join(__dirname, './env/.env') });

console.log('📋 Variables de entorno cargadas:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('');

const conexion = require('./database/db');

console.log('🔍 Verificando tabla empleados...\n');

// Verificar si tabla existe
conexion.query("SHOW TABLES LIKE 'empleados'", (error, result) => {
    if (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
    
    if (result.length === 0) {
        console.log('❌ La tabla empleados NO existe');
        process.exit(1);
    }
    
    console.log('✅ La tabla empleados EXISTE\n');
    
    // Ver estructura
    conexion.query('DESCRIBE empleados', (error, columns) => {
        if (error) {
            console.error('❌ Error al ver estructura:', error.message);
            process.exit(1);
        }
        
        console.log('📋 Estructura de la tabla:');
        console.table(columns);
        
        // Ver datos
        conexion.query('SELECT COUNT(*) as total FROM empleados', (error, result) => {
            if (error) {
                console.error('❌ Error al contar registros:', error.message);
                process.exit(1);
            }
            
            console.log(`\n📊 Total de registros: ${result[0].total}\n`);
            
            // Ver primeros registros
            if (result[0].total > 0) {
                conexion.query('SELECT id, nombre, email, departamento FROM empleados LIMIT 5', (error, empleados) => {
                    if (error) {
                        console.error('❌ Error:', error.message);
                        process.exit(1);
                    }
                    
                    console.log('👥 Primeros 5 empleados:');
                    console.table(empleados);
                    process.exit(0);
                });
            } else {
                console.log('⚠️  No hay empleados registrados');
                process.exit(0);
            }
        });
    });
});
