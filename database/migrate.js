require('dotenv').config({ path: require('path').join(__dirname, '../env/.env') });

const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

console.log('🔄 Iniciando migración de base de datos...\n');
console.log('📍 Variables de entorno cargadas:');
console.log('   Host:', process.env.DB_HOST);
console.log('   Usuario:', process.env.DB_USER);
console.log('   Base de datos:', process.env.DB_DATABASE);
console.log('');

const conexion = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});

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

console.log(`📋 Total de sentencias SQL a ejecutar: ${statements.length}\n`);

// Ejecutar cada sentencia SQL
statements.forEach((statement, index) => {
  conexion.query(statement, (error, results) => {
    if (error) {
      console.error(`❌ Error en sentencia ${index + 1}:`);
      console.error('   ' + error.message);
    } else {
      console.log(`✅ Sentencia ${index + 1} ejecutada exitosamente`);
    }
    
    processedCount++;
    
    // Cuando todas las sentencias se han procesado, cerrar la conexión
    if (processedCount === statements.length) {
      console.log('\n✨ Migración completada exitosamente');
      conexion.end((error) => {
        if (error) {
          console.error('❌ Error al cerrar conexión:', error);
        }
        process.exit(0);
      });
    }
  });
});
