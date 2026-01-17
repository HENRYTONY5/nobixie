-- =====================================================
-- MIGRACIÓN: Cambiar departamento por tipo_empleado
-- Ejecutar esto si ya tienes la tabla creada
-- =====================================================

-- Opción 1: Si ya tienes datos (mantiene la columna)
ALTER TABLE empleados 
ADD COLUMN tipo_empleado ENUM('Administrativo', 'Supervisor', 'Técnico') DEFAULT 'Técnico' AFTER departamento,
MODIFY COLUMN departamento ENUM('Pailería', 'Administración', 'Eléctricos') DEFAULT 'Administración';

-- Si quieres eliminar la columna departamento después:
-- ALTER TABLE empleados DROP COLUMN departamento;

-- =====================================================
-- TABLA NUEVA (Si es primera vez)
-- =====================================================
-- Ejecuta: database/create_empleados_table.sql
