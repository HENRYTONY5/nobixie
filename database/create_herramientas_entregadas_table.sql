-- =====================================================
-- TABLA HERRAMIENTAS_ENTREGADAS
-- =====================================================

CREATE TABLE IF NOT EXISTS herramientas_entregadas (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `folio` VARCHAR(50) UNIQUE NOT NULL,
  `empleado_id` INT(11) NOT NULL,
  `herramienta` VARCHAR(150) NOT NULL,
  `descripcion` TEXT,
  `departamento` ENUM('Pailería', 'Administración', 'Eléctricos', 'Mantenimiento') NOT NULL,
  `fecha_entrega` DATE NOT NULL,
  `estado` ENUM('Entregado', 'Pendiente', 'Devuelto') DEFAULT 'Entregado',
  `observaciones` TEXT,
  
  -- Auditoría
  `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Relaciones
  FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_empleado (empleado_id),
  INDEX idx_departamento (departamento),
  INDEX idx_estado (estado),
  INDEX idx_fecha_entrega (fecha_entrega)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =====================================================

INSERT INTO herramientas_entregadas (folio, empleado_id, herramienta, departamento, fecha_entrega, estado) VALUES
('ENT-001', 1, 'Multímetro Digital', 'Eléctricos', '2025-01-10', 'Entregado'),
('ENT-002', 1, 'Destornillador Phillips', 'Eléctricos', '2025-01-12', 'Entregado'),
('ENT-003', 2, 'Herramienta de Crimping', 'Eléctricos', '2025-01-08', 'Entregado'),
('ENT-004', 3, 'Soldadora MIG', 'Pailería', '2025-01-11', 'Entregado'),
('ENT-005', 3, 'Esmeril Angular', 'Pailería', '2025-01-13', 'Entregado'),
('ENT-006', 3, 'Juego de Brocas', 'Pailería', '2025-01-14', 'Entregado'),
('ENT-007', 4, 'Perforadora de Papel', 'Administración', '2025-01-09', 'Entregado'),
('ENT-008', 4, 'Grapadora', 'Administración', '2025-01-15', 'Entregado');
