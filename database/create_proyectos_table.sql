-- =====================================================
-- TABLA PROYECTOS_ACTIVOS - Para empresa de ingeniería
-- Metodología SCRUM con estados de proyecto
-- =====================================================

CREATE TABLE proyectos_activos (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  
  -- INFORMACIÓN BÁSICA
  `nombre_proyecto` VARCHAR(200) NOT NULL,
  `descripcion` TEXT,
  `cliente` VARCHAR(150) NOT NULL,
  `encargado_id` INT(11),
  
  -- FECHAS CLAVE
  `fecha_levantamiento` DATE,
  `fecha_cotizacion` DATE,
  `fecha_ejecucion` DATE,
  `fecha_termino_prevista` DATE,
  `fecha_termino_real` DATE,
  
  -- ESTADOS DEL PROYECTO
  `estado` ENUM(
    'Levantamiento',
    'Cotización',
    'Aprobado',
    'En Ejecución',
    'Pausa',
    'Finalizado',
    'Cancelado'
  ) NOT NULL DEFAULT 'Levantamiento',
  
  -- DETALLES TÉCNICOS Y FINANCIEROS
  `presupuesto_estimado` DECIMAL(12, 2),
  `presupuesto_real` DECIMAL(12, 2),
  `orden_compra` VARCHAR(50),
  `estatus_oc` ENUM(
    'Pendiente',
    'Generada',
    'Recibida',
    'Rechazada'
  ) DEFAULT 'Pendiente',
  
  -- DOCUMENTOS
  `tiene_apu` BOOLEAN DEFAULT FALSE COMMENT 'Análisis de Precios Unitarios',
  `archivo_apu` VARCHAR(255),
  `tiene_factura` BOOLEAN DEFAULT FALSE,
  `numero_factura` VARCHAR(50),
  `archivo_factura` VARCHAR(255),
  `fecha_factura` DATE,
  
  -- AVANCE (SCRUM)
  `porcentaje_avance` INT(3) DEFAULT 0 CHECK (porcentaje_avance BETWEEN 0 AND 100),
  `horas_invertidas` DECIMAL(8, 2) DEFAULT 0,
  `horas_estimadas` DECIMAL(8, 2),
  
  -- AUDITORÍA
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creado_por` INT(11),
  `activo` BOOLEAN DEFAULT TRUE,
  
  -- RELACIONES
  FOREIGN KEY (encargado_id) REFERENCES empleados(id),
  FOREIGN KEY (creado_por) REFERENCES users(id),
  
  -- ÍNDICES
  INDEX idx_estado (estado),
  INDEX idx_cliente (cliente),
  INDEX idx_encargado (encargado_id),
  INDEX idx_fecha_ejecucion (fecha_ejecucion),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =====================================================
-- TABLA ACTIVIDADES_PROYECTO - Tareas SCRUM del proyecto
-- =====================================================

CREATE TABLE actividades_proyecto (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `proyecto_id` INT(11) NOT NULL,
  
  -- INFORMACIÓN
  `titulo` VARCHAR(200) NOT NULL,
  `descripcion` TEXT,
  `responsable_id` INT(11),
  
  -- SCRUM
  `tipo` ENUM('Feature', 'Bug', 'Tarea', 'Mejora') DEFAULT 'Tarea',
  `prioridad` ENUM('Baja', 'Media', 'Alta', 'Urgente') DEFAULT 'Media',
  `estado` ENUM('Pendiente', 'En Progreso', 'En Revisión', 'Completada') DEFAULT 'Pendiente',
  
  -- ESTIMACIÓN Y SEGUIMIENTO
  `horas_estimadas` DECIMAL(8, 2),
  `horas_invertidas` DECIMAL(8, 2) DEFAULT 0,
  
  -- FECHAS
  `fecha_inicio` DATE,
  `fecha_vencimiento` DATE,
  `fecha_completacion` DATE,
  
  -- AUDITORÍA
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- RELACIONES
  FOREIGN KEY (proyecto_id) REFERENCES proyectos_activos(id) ON DELETE CASCADE,
  FOREIGN KEY (responsable_id) REFERENCES empleados(id),
  
  -- ÍNDICES
  INDEX idx_proyecto (proyecto_id),
  INDEX idx_responsable (responsable_id),
  INDEX idx_estado (estado),
  INDEX idx_prioridad (prioridad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =====================================================
-- TABLA HITOS_PROYECTO - Milestones del proyecto
-- =====================================================

CREATE TABLE hitos_proyecto (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `proyecto_id` INT(11) NOT NULL,
  
  `nombre` VARCHAR(200) NOT NULL,
  `descripcion` TEXT,
  `fecha_objetivo` DATE NOT NULL,
  `fecha_completacion` DATE,
  `estado` ENUM('No iniciado', 'En progreso', 'Completado', 'Retrasado') DEFAULT 'No iniciado',
  
  -- AUDITORÍA
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- RELACIONES
  FOREIGN KEY (proyecto_id) REFERENCES proyectos_activos(id) ON DELETE CASCADE,
  
  -- ÍNDICES
  INDEX idx_proyecto (proyecto_id),
  INDEX idx_fecha_objetivo (fecha_objetivo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
