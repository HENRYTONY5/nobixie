-- =====================================================
-- TABLA SUPERVISORES_EMPLEADOS - Relación supervisor-empleado
-- =====================================================

CREATE TABLE supervisores_empleados (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `supervisor_id` INT(11) NOT NULL,
  `empleado_id` INT(11) NOT NULL,
  `departamento` ENUM('Pailería', 'Administración', 'Eléctricos', 'Mantenimiento') NOT NULL,
  `fecha_asignacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relaciones
  FOREIGN KEY (supervisor_id) REFERENCES empleados(id) ON DELETE CASCADE,
  FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_supervisor (supervisor_id),
  INDEX idx_empleado (empleado_id),
  INDEX idx_departamento (departamento),
  UNIQUE KEY unique_asignacion (supervisor_id, empleado_id, departamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =====================================================
-- ACTUALIZAR TABLA EMPLEADOS - Agregar Mantenimiento y cambiar puesto a ENUM
-- =====================================================

-- Primero cambiar puesto de VARCHAR a ENUM
ALTER TABLE empleados 
MODIFY COLUMN puesto ENUM('Ayudante general', 'Especialista', 'Ingeniero') NOT NULL DEFAULT 'Ayudante general',
MODIFY COLUMN departamento ENUM('Pailería', 'Administración', 'Eléctricos', 'Mantenimiento') NOT NULL DEFAULT 'Administración';
