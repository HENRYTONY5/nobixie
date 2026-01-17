-- =====================================================
-- TEMPLATE PARA CREAR TABLA DINÁMICA POR SUPERVISOR
-- Se ejecutará automáticamente al crear un supervisor
-- =====================================================

-- Ejemplo: supervisor_1, supervisor_2, etc.

CREATE TABLE IF NOT EXISTS supervisor_{SUPERVISOR_ID} (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  
  -- EMPLEADOS ASIGNADOS (JSON array de IDs de empleados)
  `empleados` JSON DEFAULT NULL COMMENT 'Array de IDs de empleados asignados',
  
  -- PROYECTOS (JSON array de IDs de proyectos)
  `proyectos` JSON DEFAULT NULL COMMENT 'Array de IDs de todos los proyectos',
  
  -- METADATA
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_fecha_actualizacion (fecha_actualizacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Insertar registro inicial vacío
INSERT INTO supervisor_{SUPERVISOR_ID} (empleados, proyectos) 
VALUES ('[]', '[]');
