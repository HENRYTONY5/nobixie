const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../env/.env') });

const conexion = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});

function insertarDatos() {
    // Usar proyecto_id 5 directamente
    const proyecto_id = 5;
    console.log(`Insertando datos de ejemplo para proyecto ID: ${proyecto_id}`);

    // Verificar si ya existen hitos
    conexion.query('SELECT COUNT(*) as count FROM hitos_proyecto WHERE proyecto_id = ?', [proyecto_id], (error, result) => {
        if (error) {
            console.error('Error:', error);
            return;
        }

        if (result[0].count > 0) {
            console.log('Ya existen hitos. No se insertarán duplicados.');
            conexion.end();
            return;
        }

        // Insertar Hitos
        const hitosData = [
            [proyecto_id, 'Análisis de Requerimientos', 'Reunión inicial con el cliente para entender necesidades', '2026-02-15', 'En progreso', null],
            [proyecto_id, 'Diseño de Arquitectura', 'Diseño técnico y propuesta de solución', '2026-03-15', 'No iniciado', null],
            [proyecto_id, 'Desarrollo Backend', 'Implementación de APIs y bases de datos', '2026-04-30', 'No iniciado', null],
            [proyecto_id, 'Testing y QA', 'Pruebas y control de calidad', '2026-05-15', 'No iniciado', null]
        ];

        const queryHitos = 'INSERT INTO hitos_proyecto (proyecto_id, nombre, descripcion, fecha_objetivo, estado, fecha_completacion) VALUES ?';

        conexion.query(queryHitos, [hitosData], (error, results) => {
            if (error) {
                console.error('Error al insertar hitos:', error);
                conexion.end();
                return;
            }

            console.log(`✓ ${results.affectedRows} hitos insertados`);

            // Insertar Actividades
            const actividadesData = [
                [proyecto_id, 'Entrevista con cliente', 'Completada', 'Urgente', 2, 2, null, '2026-01-25', null, 1],
                [proyecto_id, 'Documentar requerimientos', 'En Progreso', 'Alta', 4, 3, null, '2026-02-01', null, 1],
                [proyecto_id, 'Crear diagrama de flujo', 'En Progreso', 'Media', 3, 1.5, null, '2026-02-10', null, null],
                [proyecto_id, 'Revisar propuesta con cliente', 'Pendiente', 'Alta', 2, 0, null, '2026-02-20', null, 1],
                [proyecto_id, 'Configurar ambiente de desarrollo', 'En Progreso', 'Alta', 5, 3, null, '2026-03-01', null, 1],
                [proyecto_id, 'Diseñar base de datos', 'Pendiente', 'Media', 6, 0, null, '2026-03-15', null, 1],
                [proyecto_id, 'Implementar autenticación', 'Pendiente', 'Urgente', 8, 0, null, '2026-04-10', null, 1],
                [proyecto_id, 'Crear endpoints de API', 'Pendiente', 'Alta', 10, 0, null, '2026-04-20', null, 1],
                [proyecto_id, 'Ejecutar pruebas unitarias', 'Pendiente', 'Media', 6, 0, null, '2026-05-05', null, null],
                [proyecto_id, 'Realizar testing integración', 'Pendiente', 'Media', 8, 0, null, '2026-05-10', null, null]
            ];

            const queryActividades = 'INSERT INTO actividades_proyecto (proyecto_id, titulo, estado, prioridad, horas_estimadas, horas_invertidas, descripcion, fecha_vencimiento, tipo, responsable_id) VALUES ?';

            conexion.query(queryActividades, [actividadesData], (error, results) => {
                if (error) {
                    console.error('Error al insertar actividades:', error);
                    conexion.end();
                    return;
                }

                console.log(`✓ ${results.affectedRows} actividades insertadas`);
                console.log('\n✅ Datos de ejemplo insertados correctamente');
                conexion.end();
        });
    });
}

insertarDatos();
