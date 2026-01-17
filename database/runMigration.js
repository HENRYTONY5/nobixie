const conexion = require('./db');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../env/.env') });

console.log('Iniciando migración de base de datos...\n');

// Leer el archivo SQL
const sqlPath = path.join(__dirname, 'create_supervisores_table.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

// Dividir el contenido en sentencias SQL individuales
const statements = sqlContent
  .split(';')
  .map(stmt => {
    // Remover comentarios de línea
    return stmt.split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .trim();
  })
  .filter(stmt => stmt.length > 0);

let processedCount = 0;

// Ejecutar cada sentencia SQL
statements.forEach((statement, index) => {
  conexion.query(statement, (error, results) => {
    if (error) {
      console.error(`❌ Error en sentencia ${index + 1}:`);
      console.error(error.message);
    } else {
      console.log(`✅ Sentencia ${index + 1} ejecutada exitosamente`);
    }
    
    processedCount++;
    
    // Cuando todas las sentencias se han procesado, cerrar la conexión
    if (processedCount === statements.length) {
      console.log('\n✨ Migración completada');
      conexion.end((error) => {
        if (error) {
          console.error('Error al cerrar conexión:', error);
        }
        process.exit(0);
      });
    }
  });
});
