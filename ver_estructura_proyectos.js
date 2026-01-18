require('dotenv').config({ path: './env/.env' });
const db = require('./database/db');

db.query('DESCRIBE proyectos_activos', (err, columns) => {
    if (err) {
        console.error('Error:', err);
        db.end();
        return;
    }
    
    console.log('Columnas de la tabla proyectos_activos:\n');
    columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? `[${col.Key}]` : ''}`);
    });
    
    db.end();
});
