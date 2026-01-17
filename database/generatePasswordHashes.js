/**
 * Script para generar hashes de contraseña con bcrypt
 * Ejecutar: node database/generatePasswordHashes.js
 */

const bcryptjs = require('bcryptjs');

const password = 'Soltec123!'; // Cambiar si es necesario

async function generateHash() {
    try {
        const hash = await bcryptjs.hash(password, 10);
        console.log('\n========== HASH BCRYPT GENERADO ==========');
        console.log(`Contraseña: ${password}`);
        console.log(`Hash: ${hash}`);
        console.log('\nCopia este hash en el script SQL de reset_users.sql');
        console.log('==========================================\n');
    } catch (error) {
        console.error('Error generando hash:', error);
    }
}

generateHash();
