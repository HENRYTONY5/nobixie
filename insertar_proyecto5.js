require('dotenv').config({ path: './env/.env' });
const db = require('./database/db');

const proyecto_id = 5;
console.log(`Insertando datos para proyecto ID: ${proyecto_id}`);

// Verificar que el proyecto existe
db.query('SELECT id, nombre_proyecto FROM proyectos_activos WHERE id = ?', [proyecto_id], (err, proyectos) => {
    if (err) {
        console.error('Error:', err);
        db.end();
        return;
    }
    
    if (proyectos.length === 0) {
        console.error(`❌ No existe el proyecto con ID ${proyecto_id}`);
        db.end();
        return;
    }
    
    console.log(`✓ Proyecto encontrado: ${proyectos[0].nombre_proyecto}`);
    
    // Eliminar hitos y actividades anteriores de este proyecto
    db.query('DELETE FROM actividades_proyecto WHERE proyecto_id = ?', [proyecto_id], (err) => {
        if (err) console.error('Error limpiando actividades:', err);
        
        db.query('DELETE FROM hitos_proyecto WHERE proyecto_id = ?', [proyecto_id], (err) => {
            if (err) console.error('Error limpiando hitos:', err);
            
            console.log('✓ Datos anteriores eliminados');
            
            // Insertar Hitos
            const hitosData = [
                [proyecto_id, 'Análisis de Requerimientos', 'Reunión inicial con el cliente para entender necesidades', '2026-02-15', 'En progreso', null],
                [proyecto_id, 'Diseño de Arquitectura', 'Diseño técnico y propuesta de solución', '2026-03-15', 'No iniciado', null],
                [proyecto_id, 'Desarrollo Backend', 'Implementación de APIs y bases de datos', '2026-04-30', 'No iniciado', null],
                [proyecto_id, 'Testing y QA', 'Pruebas y control de calidad', '2026-05-15', 'No iniciado', null]
            ];
            
            const queryHitos = 'INSERT INTO hitos_proyecto (proyecto_id, nombre, descripcion, fecha_objetivo, estado, fecha_completacion) VALUES ?';
            
            db.query(queryHitos, [hitosData], (error, results) => {
                if (error) {
                    console.error('Error al insertar hitos:', error);
                    db.end();
                    return;
                }
                
                console.log(`✓ ${results.affectedRows} hitos insertados`);
                
                // Insertar Actividades (incluyendo "Liberación del AST")
                const actividadesData = [
                    // ACTIVIDAD CRÍTICA: Liberación del AST
                    [proyecto_id, 'Liberación del AST', 'Pendiente', 'Urgente', 1, 0, 'Actividad crítica: Al completarse el proyecto pasará automáticamente a "En Ejecución"', '2026-01-30', 'Administrativa', 1],
                    // Actividades regulares
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
                
                db.query(queryActividades, [actividadesData], (error, results) => {
                    if (error) {
                        console.error('Error al insertar actividades:', error);
                        db.end();
                        return;
                    }
                    
                    console.log(`✓ ${results.affectedRows} actividades insertadas`);
                    console.log('\n✅ Datos insertados correctamente para proyecto ID 5');
                    console.log('⚠️  IMPORTANTE: Actividad "Liberación del AST" incluida (vence 30/Ene)');
                    console.log('    → Al completarla, el proyecto cambiará automáticamente a "En Ejecución"');
                    console.log('\n📍 Ahora puedes acceder a:');
                    console.log('   http://localhost:3000/proyectos#proyecto-5-hitos');
                    console.log('   http://localhost:3000/proyectos#proyecto-5-actividades');
                    
                    db.end();
                });
            });
        });
    });
});
