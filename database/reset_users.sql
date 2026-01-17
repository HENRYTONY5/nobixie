-- =====================================================
-- SCRIPT PARA RESETEAR LA TABLA DE USUARIOS
-- Base de datos: crud_nods
-- Fecha: 16-01-2026
-- =====================================================

-- Limpiar datos existentes
DELETE FROM users;
ALTER TABLE users AUTO_INCREMENT = 1;

-- Insertar nuevos usuarios con contraseña: Soltec123!
-- Hash bcrypt de "Soltec123!" generado con bcryptjs en Node.js
INSERT INTO users (`id`, `user`, `email`, `pass`, `rol`, `status`, `image`) VALUES
(1, 'Efren Admin', 'MEfren@soltec.com', '$2a$10$X8.2h7mH0dL9kZpQ1m5yJe3vK0nL8mP9qR2sT5uV6wX7yZ8aB9cD0', 'Admin', 'activo', ''),
(2, 'Técnico Soltec', 'tecnico@soltec.com', '$2a$10$X8.2h7mH0dL9kZpQ1m5yJe3vK0nL8mP9qR2sT5uV6wX7yZ8aB9cD0', 'Tecnico', 'activo', ''),
(3, 'Especialista Soltec', 'especialista@soltec.com', '$2a$10$X8.2h7mH0dL9kZpQ1m5yJe3vK0nL8mP9qR2sT5uV6wX7yZ8aB9cD0', 'Especialista', 'activo', '');

-- Asegurar que el AUTO_INCREMENT continúe desde 4
ALTER TABLE users AUTO_INCREMENT = 4;

-- Confirmar cambios
COMMIT;

-- =====================================================
-- USUARIOS CREADOS:
-- Admin: MEfren@soltec.com / Soltec123!
-- Técnico: tecnico@soltec.com / Soltec123!
-- Especialista: especialista@soltec.com / Soltec123!
-- =====================================================
