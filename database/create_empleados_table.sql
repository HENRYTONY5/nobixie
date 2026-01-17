-- =====================================================
-- TABLA EMPLEADOS - Con toda la información necesaria
-- =====================================================

CREATE TABLE empleados (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `telefono` VARCHAR(20),
  `rfc` VARCHAR(13) UNIQUE,
  
  -- DOMICILIO
  `calle` VARCHAR(150),
  `numero` VARCHAR(10),
  `ciudad` VARCHAR(100),
  `estado` VARCHAR(100),
  `codigo_postal` VARCHAR(10),
  
  -- INFORMACIÓN PERSONAL
  `genero` ENUM('Masculino', 'Femenino', 'Otro'),
  `fecha_nacimiento` DATE,
  `estado_civil` ENUM('Soltero', 'Casado', 'Divorciado', 'Viudo', 'Otro'),
  `escolaridad` VARCHAR(50),
  
  -- INFORMACIÓN LABORAL
  `puesto` ENUM('Ayudante general', 'Especialista', 'Ingeniero') NOT NULL DEFAULT 'Ayudante general',
  `tipo_empleado` ENUM('Administrativo', 'Supervisor', 'Técnico') NOT NULL DEFAULT 'Técnico',
  `departamento` ENUM('Pailería', 'Administración', 'Eléctricos', 'Mantenimiento') NOT NULL DEFAULT 'Administración',
  `fecha_ingreso` DATE,
  `numero_empleado` VARCHAR(20) UNIQUE,
  
  -- AUDITORÍA
  `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `activo` BOOLEAN DEFAULT TRUE,
  
  INDEX idx_email (email),
  INDEX idx_rfc (rfc),
  INDEX idx_numero_empleado (numero_empleado),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =====================================================

INSERT INTO empleados (
  nombre, email, telefono, rfc, 
  calle, numero, ciudad, estado, codigo_postal,
  genero, fecha_nacimiento, estado_civil, escolaridad,
  puesto, tipo_empleado, departamento, numero_empleado, fecha_ingreso
) VALUES
(
  'Juan García López',
  'juan.garcia@soltec.com',
  '5551234567',
  'GALN850315ABC',
  'Calle Principal',
  '123',
  'México',
  'Ciudad de México',
  '06500',
  'Masculino',
  '1985-03-15',
  'Casado',
  'Licenciatura',
  'Ingeniero',
  'Técnico',
  'Pailería',
  'EMP001',
  '2023-01-15'
);