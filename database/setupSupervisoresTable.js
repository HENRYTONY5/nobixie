const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../env/.env') });

const conexion = require('./db');

console.log('🔧 Creando tabla supervisores_empleados...\n');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS supervisores_empleados (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  supervisor_id INT(11) NOT NULL,
  empleado_id INT(11) NOT NULL,
  departamento ENUM('Pailería', 'Administración', 'Eléctricos', 'Mantenimiento') NOT NULL,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (supervisor_id) REFERENCES empleados(id) ON DELETE CASCADE,
  FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
  
  INDEX idx_supervisor (supervisor_id),
  INDEX idx_empleado (empleado_id),
  INDEX idx_departamento (departamento),
  UNIQUE KEY unique_asignacion (supervisor_id, empleado_id, departamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
`;

conexion.query(createTableQuery, (error, result) => {
    if (error) {
        console.error('❌ Error al crear tabla:', error);
        process.exit(1);
    }

    console.log('✅ Tabla supervisores_empleados creada/verificada correctamente');
    
    // Verificar supervisores existentes
    conexion.query(`
        SELECT 
            e.id,
            e.nombre,
            e.tipo_empleado,
            e.departamento
        FROM empleados e
        WHERE e.tipo_empleado = 'Supervisor' AND e.activo = TRUE
    `, (error, supervisores) => {
        if (error) {
            console.error('Error al obtener supervisores:', error);
        } else {
            console.log(`\n📊 Supervisores encontrados: ${supervisores.length}`);
            if (supervisores.length > 0) {
                supervisores.forEach(s => {
                    console.log(`   - ${s.nombre} (ID: ${s.id}) - Departamento: ${s.departamento}`);
                });
            } else {
                console.log('   ⚠️  No hay supervisores registrados aún');
            }
        }
        
        // Verificar asignaciones existentes
        conexion.query('SELECT COUNT(*) as total FROM supervisores_empleados', (error, result) => {
            if (error) {
                console.error('Error al contar asignaciones:', error);
            } else {
                console.log(`\n👥 Asignaciones existentes: ${result[0].total}`);
            }
            
            console.log('\n✨ Setup completado!\n');
            process.exit(0);
        });
    });
});
