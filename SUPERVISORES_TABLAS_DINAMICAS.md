# SISTEMA DE TABLAS DINÁMICAS POR SUPERVISOR

## 📋 Descripción
Sistema que crea automáticamente una tabla en la base de datos por cada supervisor.
Cada tabla contendrá:
- **empleados**: Array JSON con IDs de empleados asignados
- **proyectos**: Array JSON con IDs de todos los proyectos

---

## 🚀 Uso del Sistema

### 1. CREAR TABLA PARA UN SUPERVISOR

**Endpoint:** `POST /api/supervisores/crear-tabla`

**Body:**
```json
{
  "supervisor_id": 1
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Tabla supervisor_1 creada correctamente",
  "tableName": "supervisor_1",
  "supervisor": {
    "id": 1,
    "nombre": "Juan Pérez",
    "tipo_empleado": "Supervisor"
  }
}
```

**Qué hace:**
- Crea tabla `supervisor_1` en la base de datos
- Inicializa con arrays vacíos de empleados y proyectos

---

### 2. AGREGAR EMPLEADOS AL SUPERVISOR

**Endpoint:** `POST /api/supervisores/agregar-empleados`

**Body:**
```json
{
  "supervisor_id": 1,
  "empleados_ids": [5, 8, 12, 15]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Empleados agregados correctamente",
  "empleados": [5, 8, 12, 15]
}
```

**Qué hace:**
- Agrega los IDs de empleados a la columna `empleados` (JSON)
- No permite duplicados
- Se pueden agregar más empleados llamando de nuevo al endpoint

---

### 3. AGREGAR PROYECTOS AL SUPERVISOR

**Endpoint:** `POST /api/supervisores/agregar-proyectos`

**Body:**
```json
{
  "supervisor_id": 1,
  "proyectos_ids": [1, 2, 3, 7, 10]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Proyectos agregados correctamente",
  "proyectos": [1, 2, 3, 7, 10]
}
```

**Qué hace:**
- Agrega los IDs de proyectos a la columna `proyectos` (JSON)
- No permite duplicados
- Puedes agregar todos los proyectos de la empresa

---

### 4. OBTENER DATOS DEL SUPERVISOR

**Endpoint:** `GET /api/supervisores/:supervisor_id/datos`

**Ejemplo:** `GET /api/supervisores/1/datos`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "empleados": [5, 8, 12, 15],
    "proyectos": [1, 2, 3, 7, 10],
    "fecha_actualizacion": "2026-01-17T14:30:00.000Z"
  }
}
```

**Qué hace:**
- Obtiene los empleados y proyectos asignados al supervisor
- Devuelve arrays de IDs que puedes usar para hacer JOIN con las tablas principales

---

## 💡 Ejemplo de Flujo Completo

### Paso 1: Crear tabla para supervisor con ID 1
```javascript
// POST /api/supervisores/crear-tabla
{
  "supervisor_id": 1
}
```

### Paso 2: Asignar empleados
```javascript
// POST /api/supervisores/agregar-empleados
{
  "supervisor_id": 1,
  "empleados_ids": [5, 8, 12]
}
```

### Paso 3: Asignar proyectos
```javascript
// POST /api/supervisores/agregar-proyectos
{
  "supervisor_id": 1,
  "proyectos_ids": [1, 2, 3]
}
```

### Paso 4: Consultar datos
```javascript
// GET /api/supervisores/1/datos

// Respuesta:
{
  "success": true,
  "data": {
    "empleados": [5, 8, 12],
    "proyectos": [1, 2, 3],
    "fecha_actualizacion": "2026-01-17T14:30:00.000Z"
  }
}
```

---

## 📊 Estructura de la Tabla Dinámica

Cada supervisor tendrá su tabla: `supervisor_1`, `supervisor_2`, etc.

```sql
CREATE TABLE supervisor_1 (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  empleados JSON DEFAULT NULL,          -- Array de IDs: [5, 8, 12]
  proyectos JSON DEFAULT NULL,          -- Array de IDs: [1, 2, 3]
  fecha_creacion TIMESTAMP,
  fecha_actualizacion TIMESTAMP
);
```

---

## 🔍 Consultas SQL Útiles

### Ver todas las tablas de supervisores
```sql
SHOW TABLES LIKE 'supervisor_%';
```

### Ver datos de un supervisor específico
```sql
SELECT * FROM supervisor_1;
```

### Consultar empleados con sus datos completos
```sql
SELECT e.* 
FROM empleados e
WHERE JSON_CONTAINS('[5, 8, 12]', CAST(e.id AS JSON));
```

### Consultar proyectos con sus datos completos
```sql
SELECT p.* 
FROM proyectos_activos p
WHERE JSON_CONTAINS('[1, 2, 3]', CAST(p.id AS JSON));
```

---

## ⚠️ Notas Importantes

1. **Primero crea la tabla** antes de agregar empleados/proyectos
2. **Los IDs deben existir** en las tablas `empleados` y `proyectos_activos`
3. **No se permiten duplicados** - si agregas el mismo ID dos veces, solo se guarda una vez
4. **Cada supervisor tiene su propia tabla** independiente
5. **Los arrays se almacenan como JSON** en MySQL

---

## 🎯 Próximos Pasos

Para usar esto en tu frontend, puedes:
1. Crear un botón "Crear Tabla" en la vista de supervisores
2. Agregar formularios para asignar empleados y proyectos
3. Mostrar los datos del supervisor en una tabla o lista

---

## 🛠️ Testing

Usa Postman o cualquier cliente HTTP para probar estos endpoints.
Recuerda incluir las cookies de autenticación en cada request.

