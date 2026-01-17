// VALIDACIONES EMPLEADOS - Test Script
// Este archivo prueba todas las validaciones

const validaciones = {
  
  // Validar RFC
  validarRFC: (rfc) => {
    if (!rfc) return { valido: true, mensaje: "RFC opcional" };
    if (rfc.length !== 13) {
      return { 
        valido: false, 
        mensaje: `RFC debe tener 13 caracteres. Actual: ${rfc.length}` 
      };
    }
    return { valido: true, mensaje: "RFC válido ✓" };
  },

  // Validar Puesto
  validarPuesto: (puesto) => {
    const puestosValidos = ['Ayudante general', 'Especialista', 'Ingeniero'];
    if (!puesto) return { valido: false, mensaje: "Puesto es obligatorio" };
    if (!puestosValidos.includes(puesto)) {
      return { 
        valido: false, 
        mensaje: `Puesto inválido. Opciones: ${puestosValidos.join(', ')}`
      };
    }
    return { valido: true, mensaje: "Puesto válido ✓" };
  },

  // Validar Departamento
  validarDepartamento: (departamento) => {
    const departamentosValidos = ['Pailería', 'Administración', 'Eléctricos', 'Mantenimiento'];
    if (!departamento) return { valido: false, mensaje: "Departamento es obligatorio" };
    if (!departamentosValidos.includes(departamento)) {
      return { 
        valido: false, 
        mensaje: `Departamento inválido. Opciones: ${departamentosValidos.join(', ')}`
      };
    }
    return { valido: true, mensaje: "Departamento válido ✓" };
  },

  // Validar Email
  validarEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return { valido: false, mensaje: "Email es obligatorio" };
    if (!emailRegex.test(email)) {
      return { valido: false, mensaje: "Email inválido" };
    }
    return { valido: true, mensaje: "Email válido ✓" };
  },

  // Validar Tipo Empleado
  validarTipoEmpleado: (tipo) => {
    const tiposValidos = ['Administrativo', 'Supervisor', 'Técnico'];
    if (!tipo) return { valido: false, mensaje: "Tipo de empleado es obligatorio" };
    if (!tiposValidos.includes(tipo)) {
      return { 
        valido: false, 
        mensaje: `Tipo inválido. Opciones: ${tiposValidos.join(', ')}`
      };
    }
    return { valido: true, mensaje: "Tipo de empleado válido ✓" };
  }
};

// PRUEBAS
console.log("=== VALIDADOR DE EMPLEADOS ===\n");

// Test 1: RFC válido
console.log("Test 1: RFC con 13 caracteres");
console.log(validaciones.validarRFC('GALN850315ABC'));

// Test 2: RFC inválido
console.log("\nTest 2: RFC con 12 caracteres");
console.log(validaciones.validarRFC('GALN85031ABC'));

// Test 3: Puesto válido
console.log("\nTest 3: Puesto 'Ingeniero'");
console.log(validaciones.validarPuesto('Ingeniero'));

// Test 4: Puesto inválido
console.log("\nTest 4: Puesto 'Director'");
console.log(validaciones.validarPuesto('Director'));

// Test 5: Departamento válido (Pailería)
console.log("\nTest 5: Departamento 'Pailería'");
console.log(validaciones.validarDepartamento('Pailería'));

// Test 6: Departamento inválido
console.log("\nTest 6: Departamento 'Panadería'");
console.log(validaciones.validarDepartamento('Panadería'));

// Test 7: Email válido
console.log("\nTest 7: Email 'juan@soltec.com'");
console.log(validaciones.validarEmail('juan@soltec.com'));

// Test 8: Tipo empleado válido
console.log("\nTest 8: Tipo 'Supervisor'");
console.log(validaciones.validarTipoEmpleado('Supervisor'));

console.log("\n=== FIN DE PRUEBAS ===");
