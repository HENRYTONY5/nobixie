const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../env/.env') });

const conexion = require('./db');

console.log('🔄 Reseteando tabla herramientas_entregadas...\n');

// Primero eliminar la tabla si existe
const dropTableQuery = 'DROP TABLE IF EXISTS herramientas_entregadas;';

conexion.query(dropTableQuery, (error, result) => {
    if (error) {
        console.error('❌ Error al eliminar tabla:', error);
        process.exit(1);
    }

    console.log('✅ Tabla eliminada (si existía)\n');

    // Ahora crear la tabla nueva
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS herramientas_entregadas (
      id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      folio VARCHAR(50) UNIQUE NOT NULL,
      empleado_id INT(11) NOT NULL,
      herramienta VARCHAR(150) NOT NULL,
      cantidad INT(11) DEFAULT 1,
      descripcion TEXT,
      departamento ENUM('Pailería', 'Administración', 'Eléctricos', 'Mantenimiento') NOT NULL,
      fecha_entrega DATE NOT NULL,
      estado ENUM('Entregado', 'Pendiente', 'Devuelto') DEFAULT 'Entregado',
      observaciones TEXT,
      
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
      
      INDEX idx_empleado (empleado_id),
      INDEX idx_departamento (departamento),
      INDEX idx_estado (estado),
      INDEX idx_fecha_entrega (fecha_entrega)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
    `;

    conexion.query(createTableQuery, (error, result) => {
        if (error) {
            console.error('❌ Error al crear tabla:', error);
            process.exit(1);
        }

        console.log('✅ Tabla herramientas_entregadas creada correctamente\n');
        
        // Insertar datos de prueba
        const insertDataQuery = `
            INSERT INTO herramientas_entregadas (folio, empleado_id, herramienta, cantidad, departamento, fecha_entrega, estado) VALUES
            ('ENT-001', 1, 'Multímetro Digital', 1, 'Eléctricos', '2025-01-10', 'Entregado'),
            ('ENT-002', 1, 'Destornillador Phillips', 2, 'Eléctricos', '2025-01-12', 'Entregado'),
            ('ENT-003', 2, 'Herramienta de Crimping', 1, 'Eléctricos', '2025-01-08', 'Entregado'),
            ('ENT-004', 3, 'Soldadora MIG', 1, 'Pailería', '2025-01-11', 'Entregado'),
            ('ENT-005', 3, 'Esmeril Angular', 1, 'Pailería', '2025-01-13', 'Entregado'),
            ('ENT-006', 3, 'Juego de Brocas', 12, 'Pailería', '2025-01-14', 'Entregado'),
            ('ENT-007', 4, 'Perforadora de Papel', 1, 'Administración', '2025-01-09', 'Entregado'),
            ('ENT-008', 4, 'Grapadora', 3, 'Administración', '2025-01-15', 'Entregado');
        `;

        conexion.query(insertDataQuery, (error, result) => {
            if (error) {
                console.error('❌ Error al insertar datos de prueba:', error);
            } else {
                console.log(`✅ Datos de prueba insertados: ${result.affectedRows} registros\n`);
            }

            // Obtener resumen
            conexion.query(`
                SELECT 
                    departamento,
                    COUNT(*) as total_entregas,
                    COUNT(DISTINCT empleado_id) as total_empleados
                FROM herramientas_entregadas
                GROUP BY departamento
                ORDER BY departamento
            `, (error, stats) => {
                if (error) {
                    console.error('Error al obtener estadísticas:', error);
                } else {
                    console.log('📊 Estadísticas de entregas por departamento:');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    stats.forEach(row => {
                        console.log(`  ${row.departamento}: ${row.total_entregas} entregas | ${row.total_empleados} empleados`);
                    });
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                }

                console.log('✨ Reset completado correctamente\n');
                process.exit(0);
            });
        });
    });
});
