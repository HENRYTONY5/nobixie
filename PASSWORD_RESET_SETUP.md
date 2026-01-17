# 🔐 Sistema de Recuperación de Contraseña

## 📋 Instrucciones para configurar

### 1️⃣ Actualizar la Base de Datos

Ejecuta el siguiente SQL en tu BD para agregar las columnas necesarias:

```sql
ALTER TABLE users 
ADD COLUMN reset_token VARCHAR(255) NULL DEFAULT NULL AFTER image,
ADD COLUMN reset_token_expiry DATETIME NULL DEFAULT NULL AFTER reset_token;

CREATE INDEX idx_reset_token ON users(reset_token);
CREATE INDEX idx_reset_token_expiry ON users(reset_token_expiry);
```

Archivo de referencia: `database/add_password_reset_columns.sql`

### 2️⃣ Resetear Usuarios (Opcional)

Si quieres empezar con usuarios limpios, ejecuta:

```bash
# Este script resetea todos los usuarios
# database/reset_users.sql
```

**Usuarios creados:**
- Email: `MEfren@soltec.com` | Rol: Admin | Pass: `Soltec123!`
- Email: `tecnico@soltec.com` | Rol: Técnico | Pass: `Soltec123!`
- Email: `especialista@soltec.com` | Rol: Especialista | Pass: `Soltec123!`

### 3️⃣ Configurar Variables de Entorno

Actualiza `env/.env` con tu configuración de email:

```env
# Para Gmail:
MAIL_HOST = smtp.gmail.com
MAIL_PORT = 587
MAIL_USER = tu_email@gmail.com
MAIL_PASSWORD = tu_app_password  # Ver nota abajo
MAIL_FROM = noreply@soltec.com

# URL de tu aplicación
APP_URL = http://localhost:3000

# Entorno
NODE_ENV = development
```

#### ⚠️ Cómo obtener App Password en Gmail:
1. Ve a https://myaccount.google.com/
2. Seguridad → Verificación de dos pasos (habilitar si no está)
3. Contraseñas de aplicación
4. Selecciona "Correo" y "Windows"
5. Copia la contraseña generada en `MAIL_PASSWORD`

### 4️⃣ Rutas Disponibles

#### Solicitar Reset de Contraseña:
```
GET /forgot-password
POST /forgot-password
```

#### Resetear Contraseña con Token:
```
GET /reset-password/:token
POST /reset-password/:token
```

### 5️⃣ Flujo de Uso

1. **Usuario olvida contraseña**
   ```
   GET /forgot-password → Formulario
   POST /forgot-password → Envía email
   ```

2. **Usuario recibe email con link**
   ```
   Link contiene: /reset-password/[TOKEN]
   ```

3. **Usuario resetea contraseña**
   ```
   GET /reset-password/[TOKEN] → Formulario
   POST /reset-password/[TOKEN] → Actualiza en BD
   ```

### 6️⃣ Personalizar Email

El email se envía desde `routes/passwordReset.js`. Puedes modificar el template HTML en la línea donde dice:

```javascript
html: `
    <h2>Solicitud de Recuperación de Contraseña</h2>
    // Aquí personaliza el contenido
`
```

### 7️⃣ Seguridad

- ✅ Token expira en 30 minutos
- ✅ Token se hashea en la BD (no se guarda en texto plano)
- ✅ Validación de email antes de resetear
- ✅ Contraseña mínima de 8 caracteres
- ✅ No revela si el email existe o no

## 🛠️ Archivos Agregados/Modificados

### Nuevos:
- `routes/passwordReset.js` - Lógica de reset
- `views/forgotPassword.ejs` - Formulario solicitud
- `views/resetPassword.ejs` - Formulario reset
- `database/reset_users.sql` - Script para resetear BD
- `database/add_password_reset_columns.sql` - Agregar columnas
- `database/generatePasswordHashes.js` - Generar hashes bcrypt

### Modificados:
- `routes/router.js` - Incluir rutas de password reset
- `env/.env` - Agregar variables de email

## 🧪 Prueba Local

1. Ejecuta tu servidor: `npm start`
2. Ve a `http://localhost:3000/forgot-password`
3. Ingresa un email registrado
4. Revisa la consola para el link (en modo development)

---

Si tienes dudas, avísame 💬
