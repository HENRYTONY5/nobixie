-- =====================================================
-- SCRIPT COMPLETO PARA SISTEMA DE SUPERVISORES
-- Ejecuta este script en tu base de datos
-- =====================================================

USE nobixie;

-- 1. VERIFICAR/CREAR TABLA supervisores_empleados
CREATE TABLE IF NOT EXISTS supervisores_empleados (
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

-- 2. VERIFICAR QUE LA TABLA EMPLEADOS TENGA LAS COLUMNAS CORRECTAS
-- (Si ya existe, esto solo verificará)
-- Si necesitas actualizar la tabla empleados, ejecuta esto:
-- ALTER TABLE empleados 
-- MODIFY COLUMN puesto ENUM('Ayudante general', 'Especialista', 'Ingeniero') NOT NULL DEFAULT 'Ayudante general',
-- MODIFY COLUMN departamento ENUM('Pailería', 'Administración', 'Eléctricos', 'Mantenimiento') NOT NULL DEFAULT 'Administración';

-- 3. VERIFICAR ESTADO
SELECT 'Tabla supervisores_empleados creada/verificada' as status;

-- 4. VERIFICAR DATOS EXISTENTES
SELECT 
    COUNT(*) as total_asignaciones,
    COUNT(DISTINCT supervisor_id) as total_supervisores,
    COUNT(DISTINCT empleado_id) as total_empleados
FROM supervisores_empleados;

-- 5. VER SUPERVISORES CON SUS EMPLEADOS
SELECT 
    s.id as supervisor_id,
    s.nombre as supervisor_nombre,
    COUNT(se.empleado_id) as total_empleados,
    GROUP_CONCAT(DISTINCT se.departamento) as departamentos
FROM empleados s
LEFT JOIN supervisores_empleados se ON s.id = se.supervisor_id
WHERE s.tipo_empleado = 'Supervisor'
GROUP BY s.id, s.nombre
ORDER BY s.nombre;
