-- =====================================================
-- AGREGAR COLUMNAS PARA RESET DE CONTRASEÑA
-- Ejecutar esto en tu BD antes de usar la funcionalidad
-- =====================================================

ALTER TABLE users 
ADD COLUMN reset_token VARCHAR(255) NULL DEFAULT NULL AFTER image,
ADD COLUMN reset_token_expiry DATETIME NULL DEFAULT NULL AFTER reset_token;

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_reset_token ON users(reset_token);
CREATE INDEX idx_reset_token_expiry ON users(reset_token_expiry);

-- =====================================================
-- COLUMNAS AGREGADAS:
-- - reset_token: Token hasheado para resetear contraseña
-- - reset_token_expiry: Expiración del token (30 minutos)
-- =====================================================
