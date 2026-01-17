-- =====================================================
-- TABLA HERRAMIENTAS_PRESTADAS
-- =====================================================

CREATE TABLE IF NOT EXISTS herramientas_prestadas (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `folio` VARCHAR(50) UNIQUE NOT NULL,
  `empleado_id` INT(11) NOT NULL,
  `herramienta` VARCHAR(150) NOT NULL,
  `modelo` VARCHAR(100),
  `numero_serie` VARCHAR(100),
  `marca` VARCHAR(100),
  `descripcion` TEXT,
  `departamento` ENUM('Pailería', 'Administración', 'Eléctricos', 'Mantenimiento') NOT NULL,
  `estado` ENUM('Prestado', 'En Préstamo', 'Devuelto', 'Devuelto con Daño') DEFAULT 'Prestado',
  `fecha_prestamo` DATE NOT NULL,
  `fecha_devolucion_estimada` DATE,
  `fecha_devolucion_real` DATE,
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
  INDEX idx_fecha_prestamo (fecha_prestamo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =====================================================

INSERT INTO herramientas_prestadas (folio, empleado_id, herramienta, modelo, numero_serie, marca, departamento, estado, fecha_prestamo, fecha_devolucion_estimada) VALUES
('PRS-001', 1, 'Multímetro Digital', 'UT61E', 'MS123456', 'UNI-T', 'Eléctricos', 'En Préstamo', '2025-01-10', '2025-01-17'),
('PRS-002', 1, 'Pinza Amperimétrica', 'AC-380', 'CM789012', 'Fluke', 'Eléctricos', 'Devuelto', '2025-01-08', '2025-01-15'),
('PRS-003', 2, 'Osciloscopio Portátil', 'SDS1202X-E', 'DS345678', 'SIGLENT', 'Eléctricos', 'En Préstamo', '2025-01-12', '2025-01-19'),
('PRS-004', 3, 'Soldadora Portátil', 'MMA-140', 'WD901234', 'Lincoln', 'Pailería', 'En Préstamo', '2025-01-11', '2025-01-18'),
('PRS-005', 3, 'Amoladadora Angular', 'AG100', 'GR567890', 'Bosch', 'Pailería', 'Devuelto', '2025-01-09', '2025-01-16'),
('PRS-006', 4, 'Engrapadora Industrial', 'HD-110', 'ST123456', '3M', 'Administración', 'En Préstamo', '2025-01-13', '2025-01-20'),
('PRS-007', 4, 'Perforadora Neumática', 'PN-25', 'PN456789', 'Atlas Copco', 'Administración', 'Devuelto', '2025-01-07', '2025-01-14');
