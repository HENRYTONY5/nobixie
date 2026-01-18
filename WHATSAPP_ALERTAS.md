# 📱 Sistema de Alertas por WhatsApp - Liberación del AST

## ✅ ¿Qué hace el sistema?

1. **Detecta automáticamente** cuando se completa la actividad "Liberación del AST"
2. **Cambia el proyecto** automáticamente a estado "En Ejecución"
3. **Envía alertas por WhatsApp** cuando:
   - La actividad vence en 3 días o menos
   - La actividad ya venció
   - El proyecto no ha avanzado (< 5% de progreso)

## 🚀 Configuración Rápida

### Paso 1: Insertar actividades con AST

```bash
# Para proyecto 5
node insertar_proyecto5.js

# Para proyectos 2, 3, 4
node insertar_multiples_proyectos.js
```

### Paso 2: Probar alertas (sin WhatsApp)

```bash
node utils/alertasAST.js
```

Esto mostrará en consola las alertas encontradas.

### Paso 3: Configurar WhatsApp (Opcional)

#### Opción A: Twilio (Recomendado - Más fácil)

1. **Crear cuenta en Twilio**
   - Ir a: https://www.twilio.com/try-twilio
   - Registrarse (da $15 USD de crédito gratis)

2. **Obtener credenciales**
   - Account SID
   - Auth Token
   - WhatsApp Sender (sandbox): `whatsapp:+14155238886`

3. **Activar WhatsApp Sandbox**
   - En Twilio Console → Messaging → Try it out → Send a WhatsApp message
   - Enviar desde tu WhatsApp: `join <tu-codigo>` al número de sandbox

4. **Configurar .env**
   ```bash
   # Agregar al archivo env/.env
   TWILIO_ACCOUNT_SID=tu_account_sid_aqui
   TWILIO_AUTH_TOKEN=tu_auth_token_aqui
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

5. **Instalar dependencia**
   ```bash
   npm install twilio
   ```

6. **Probar**
   ```bash
   node utils/alertasAST.js
   ```

#### Opción B: WhatsApp Business API (Producción)

- Más complejo pero oficial
- Requiere cuenta de empresa verificada
- Costo: $0.005 - $0.01 por mensaje
- Info: https://developers.facebook.com/docs/whatsapp/

### Paso 4: Activar monitoreo automático

Agregar al inicio de `app.js`:

```javascript
// Sistema de alertas AST
const alertasAST = require('./utils/alertasAST');
alertasAST.iniciarMonitoreo(); // Verifica cada hora
```

## 📋 Cómo funciona

### 1. Actividad "Liberación del AST"

Cuando creas un proyecto, se inserta automáticamente esta actividad:

```javascript
{
  titulo: "Liberación del AST",
  estado: "Pendiente",
  prioridad: "Urgente",
  fecha_vencimiento: "2026-01-30", // 30 de enero
  descripcion: "Al completarse → proyecto pasa a 'En Ejecución'"
}
```

### 2. Cambio automático de estado

Cuando marcas la actividad como "Completada":
- ✅ El proyecto cambia a "En Ejecución"
- ✅ Se registra `fecha_ejecucion = hoy`
- ✅ Se muestra en consola del servidor

### 3. Alertas automáticas

El sistema verifica cada hora si:
- ❌ La actividad AST no está completada
- ❌ Vence en ≤ 3 días (o ya venció)
- ❌ El proyecto tiene < 5% de avance
- ❌ El proyecto NO está en "En Ejecución"

Si se cumple, envía alerta a WhatsApp del responsable.

## 🧪 Probar el sistema

### 1. Ver actividades del proyecto 5

```bash
# Abrir en navegador
http://localhost:3000/proyectos#proyecto-5-actividades
```

### 2. Completar "Liberación del AST"

1. Hacer clic en el botón **Editar** (lápiz) de la actividad
2. Cambiar estado a **"Completada"**
3. Guardar

### 3. Verificar cambio automático

El proyecto debe cambiar de estado a "En Ejecución" instantáneamente.

Verificar en consola del servidor:
```
✓ Actividad "Liberación del AST" completada - Cambiando proyecto 5 a "En Ejecución"
✓ Proyecto 5 ahora en "En Ejecución"
```

### 4. Probar alertas

```bash
# Ejecutar script de alertas
node utils/alertasAST.js
```

Verás algo como:
```
⚠️  1 alertas de Liberación del AST encontradas:

⏰ ALERTA - LIBERACIÓN DEL AST ⏰

Proyecto: conexion de algomucho mas gradnde
Estado actual: Levantamiento (0% avance)
Actividad: Liberación del AST
Vence en 2 días (30/01/2026)

Responsable: Juan Pérez

⚠️ El proyecto debe iniciar ejecución completando esta actividad.
```

## 💰 Costos de WhatsApp

### Twilio (Desarrollo)
- Sandbox: GRATIS
- Producción: ~$0.005 USD por mensaje
- Crédito inicial: $15 USD

### WhatsApp Business API (Producción)
- Costo: $0.005 - $0.01 USD por mensaje
- Sin cargo mensual
- Verificación empresarial requerida

## ⚙️ Personalización

### Cambiar frecuencia de alertas

En `utils/alertasAST.js`, línea 159:

```javascript
// Cada hora (3600000 ms)
setInterval(verificarActividadesAST, 3600000);

// Cada 30 minutos
setInterval(verificarActividadesAST, 1800000);

// Cada día a las 9am (usar cron en producción)
```

### Cambiar días de anticipación

En `utils/alertasAST.js`, línea 27:

```javascript
// Alertar 3 días antes
DATEDIFF(ap.fecha_vencimiento, CURDATE()) <= 3

// Alertar 7 días antes
DATEDIFF(ap.fecha_vencimiento, CURDATE()) <= 7
```

### Agregar más destinatarios

Modificar `generarMensajeAlerta()` para incluir:
- Supervisor del proyecto
- Gerente de área
- Email adicional

## 🔧 Troubleshooting

### No envía WhatsApp

1. Verificar que Twilio esté instalado: `npm list twilio`
2. Verificar credenciales en `.env`
3. Verificar que el teléfono tenga código de país: `+52XXXXXXXXXX`
4. Verificar que hayas hecho "join" al sandbox de Twilio

### No detecta actividades

1. Verificar que la actividad se llame exactamente "Liberación del AST"
2. Verificar que tenga `fecha_vencimiento` asignada
3. Ejecutar manualmente: `node utils/alertasAST.js`

### No cambia estado del proyecto

1. Verificar consola del servidor al completar actividad
2. Verificar que el título incluya "liberación del ast" (case-insensitive)
3. Verificar que el estado sea exactamente "Completada"

## 📚 Recursos

- Twilio WhatsApp: https://www.twilio.com/whatsapp
- WhatsApp Business: https://developers.facebook.com/docs/whatsapp
- Documentación Twilio Node: https://www.twilio.com/docs/libraries/node

---

**¿Necesitas ayuda?** Consulta los logs del servidor o ejecuta:
```bash
node utils/alertasAST.js
```
