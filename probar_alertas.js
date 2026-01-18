require('dotenv').config({ path: './env/.env' });
const { verificarActividadesAST } = require('./utils/alertasAST');

console.log('🔍 Verificando actividades de Liberación del AST...\n');
verificarActividadesAST();

setTimeout(() => {
    process.exit(0);
}, 5000);
