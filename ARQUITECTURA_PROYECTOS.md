# 🏗️ ARQUITECTURA Y FLUJO DE DATOS - MÓDULO PROYECTOS SCRUM

## 📊 ESTRUCTURA DE TABLAS

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROYECTOS_ACTIVOS (Raíz)                     │
│  • id, nombre, cliente, encargado_id (Supervisor)               │
│  • estado, porcentaje_avance, presupuesto_estimado              │
│  • fechas: levantamiento, ejecución, término_prevista           │
│  • horas: estimadas, invertidas                                 │
└─────────────────────────────────────────────────────────────────┘
           │                              │
           ▼                              ▼
    ┌────────────────────┐      ┌────────────────────────┐
    │ HITOS_PROYECTO     │      │ ACTIVIDADES_PROYECTO   │
    │ (Milestones)       │      │ (Tareas SCRUM)         │
    │                    │      │                        │
    │ • nombre           │      │ • titulo               │
    │ • fecha_objetivo   │      │ • tipo (Feature/Bug)   │
    │ • estado           │      │ • prioridad            │
    │ • fecha_completacion│      │ • estado               │
    └────────────────────┘      │ • responsable_id       │
                                │ • horas_estimadas      │
                                │ • horas_invertidas     │
                                │ • fecha_vencimiento    │
                                └────────────────────────┘
```

## 🔄 FLUJO DE DATOS - CRUD COMPLETO

### 1️⃣ CREAR PROYECTO
```
Usuario → Formulario Proyecto
   ↓
POST /api/proyectos
   ↓
Crear registro en PROYECTOS_ACTIVOS
   ↓
Retornar proyecto con ID
```

### 2️⃣ AGREGAR HITOS AL PROYECTO
```
Usuario → Ver Proyecto → Agregar Hito
   ↓
POST /api/hitos-proyecto
   ↓
Crear registro en HITOS_PROYECTO
   ↓
Actualizar PROYECTOS_ACTIVOS (recalcular avance)
   ↓
Retornar hito creado
```

### 3️⃣ AGREGAR ACTIVIDADES AL PROYECTO
```
Usuario → Ver Proyecto → Agregar Actividad
   ↓
POST /api/actividades-proyecto
   ↓
Crear registro en ACTIVIDADES_PROYECTO
   ↓
Actualizar PROYECTOS_ACTIVOS (recalcular avance)
   ↓
Retornar actividad creada
```

### 4️⃣ ACTUALIZAR ESTADO DE ACTIVIDAD
```
Usuario → Cambiar estado de actividad
   ↓
PUT /api/actividades-proyecto/:id
   ↓
Actualizar ACTIVIDADES_PROYECTO
   ↓
Recalcular avance de proyecto:
   • % completadas = (actividades completadas / total) × 100
   • Horas invertidas = suma de todas las actividades
   ↓
Actualizar PROYECTOS_ACTIVOS (porcentaje_avance, horas_invertidas)
   ↓
Verificar si HITOS están completados:
   • Si todas las actividades vinculadas → Marcar hito como completado
   ↓
Retornar éxito
```

### 5️⃣ LEER/OBTENER DETALLES DEL PROYECTO
```
Usuario → Hacer clic en proyecto
   ↓
GET /api/proyectos/:id
   ↓
Obtener PROYECTOS_ACTIVOS
   ↓
Obtener relaciones:
   • HITOS_PROYECTO (WHERE proyecto_id = :id)
   • ACTIVIDADES_PROYECTO (WHERE proyecto_id = :id)
   ↓
Enriquecer con:
   • Nombre encargado (JOIN empleados)
   • Nombre responsables actividades (JOIN empleados)
   • Estadísticas calculadas:
     - % avance total
     - Tareas pendientes / en progreso / completadas
     - Hitos completados / pendientes
   ↓
Retornar objeto completo con relaciones
```

### 6️⃣ ACTUALIZAR PROYECTO
```
Usuario → Editar proyecto (nombre, descripción, estado, etc)
   ↓
PUT /api/proyectos/:id
   ↓
Actualizar PROYECTOS_ACTIVOS
   ↓
Si cambió estado a "Finalizado":
   • Registrar fecha_termino_real = NOW()
   • Recalcular presupuesto_real
   ↓
Retornar éxito
```

### 7️⃣ ELIMINAR (Soft Delete)
```
Usuario → Eliminar proyecto
   ↓
DELETE /api/proyectos/:id
   ↓
Actualizar PROYECTOS_ACTIVOS:
   • activo = FALSE
   • (Las relaciones se mantienen pero se ocultan)
   ↓
O CASCADE: Eliminar también HITOS y ACTIVIDADES si se desea
   ↓
Retornar éxito
```

## 📋 ENDPOINTS API REQUERIDOS

### PROYECTOS
```
GET    /api/proyectos              → Listar todos (solo activos)
GET    /api/proyectos/:id          → Obtener con hitos y actividades
POST   /api/proyectos              → Crear
PUT    /api/proyectos/:id          → Actualizar
DELETE /api/proyectos/:id          → Soft delete (activo=false)
GET    /api/proyectos/:id/estadisticas → Estadísticas del proyecto
```

### HITOS
```
GET    /api/hitos-proyecto?proyecto_id=:id → Listar hitos
POST   /api/hitos-proyecto                  → Crear
PUT    /api/hitos-proyecto/:id              → Actualizar estado
DELETE /api/hitos-proyecto/:id              → Eliminar
```

### ACTIVIDADES
```
GET    /api/actividades-proyecto?proyecto_id=:id  → Listar actividades
POST   /api/actividades-proyecto                   → Crear
PUT    /api/actividades-proyecto/:id               → Actualizar (estado, horas)
DELETE /api/actividades-proyecto/:id               → Eliminar
GET    /api/actividades-proyecto/:id/detalle       → Obtener con responsable
```

## 🎯 LÓGICA DE CÁLCULO DE AVANCE

### Fórmula Principal:
```javascript
porcentaje_avance = (actividades_completadas / total_actividades) × 100

// Ejemplo:
// 3 actividades completadas de 10 = 30% avance
// 10 actividades completadas de 10 = 100% avance
```

### Horas Invertidas:
```javascript
total_horas_invertidas = SUM(actividades_proyecto.horas_invertidas)

// Se actualiza cada vez que cambia horas_invertidas en una actividad
```

### Estado Hito:
```javascript
// Auto-calcular basado en actividades asociadas
Si todas_actividades_completadas THEN
    hito.estado = 'Completado'
    hito.fecha_completacion = NOW()
Else Si alguna_actividad_en_progreso THEN
    hito.estado = 'En progreso'
Else
    hito.estado = 'No iniciado' O 'Retrasado'
```

## 🗂️ ESTRUCTURA DE CONTROLLERS

### proyectoController.js
```javascript
// Proyectos
- obtenerProyectos()           // GET todos
- obtenerProyecto()            // GET :id con relaciones
- crearProyecto()              // POST
- actualizarProyecto()         // PUT :id
- eliminarProyecto()           // DELETE :id
- obtenerEstadisticasProyecto() // GET :id/estadisticas

// Métodos auxiliares privados
- _recalcularAvance()          // Actualiza % avance y horas
- _verificarHitosCompletados() // Verifica hitos automáticamente
```

### hitoController.js
```javascript
- obtenerHitos()               // GET ?proyecto_id=:id
- crearHito()                  // POST
- actualizarHito()             // PUT :id
- eliminarHito()               // DELETE :id
```

### actividadController.js
```javascript
- obtenerActividades()         // GET ?proyecto_id=:id
- obtenerActividad()           // GET :id/detalle
- crearActividad()             // POST
- actualizarActividad()        // PUT :id (triggers recalcular avance)
- eliminarActividad()          // DELETE :id
```

## 📊 QUERIES OPTIMIZADAS SQL

### Obtener Proyecto con Todo (Dashboard)
```sql
SELECT 
    pa.*,
    e.nombre as encargado_nombre,
    COUNT(DISTINCT hp.id) as total_hitos,
    SUM(CASE WHEN hp.estado = 'Completado' THEN 1 ELSE 0 END) as hitos_completados,
    COUNT(DISTINCT ap.id) as total_actividades,
    SUM(CASE WHEN ap.estado = 'Completada' THEN 1 ELSE 0 END) as actividades_completadas,
    SUM(ap.horas_invertidas) as total_horas_invertidas
FROM proyectos_activos pa
LEFT JOIN empleados e ON pa.encargado_id = e.id
LEFT JOIN hitos_proyecto hp ON pa.id = hp.proyecto_id
LEFT JOIN actividades_proyecto ap ON pa.id = ap.proyecto_id
WHERE pa.id = ? AND pa.activo = TRUE
GROUP BY pa.id;
```

### Obtener Hitos con Progreso
```sql
SELECT 
    hp.*,
    COUNT(ap.id) as total_actividades,
    SUM(CASE WHEN ap.estado = 'Completada' THEN 1 ELSE 0 END) as actividades_completadas
FROM hitos_proyecto hp
LEFT JOIN actividades_proyecto ap ON hp.id = (
    -- Vincular actividades a hitos por fechas o asignación directa
)
WHERE hp.proyecto_id = ?
GROUP BY hp.id;
```

## 🎨 VISTA INTEGRADA - DASHBOARD DEL PROYECTO

```
┌─────────────────────────────────────────────────────────────┐
│                   PROYECTO: Nombre                          │
│  Cliente: X | Encargado: Supervisor Y | Estado: En Ejecución│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📊 ESTADÍSTICAS                                            │
│  Avance: 45% | Horas: 120/200 | Presupuesto: $50k/$80k    │
│  Actividades: 9/20 | Hitos: 2/5                            │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  🎯 HITOS                          🎯 AGREGAR HITO          │
├──────────────────────────────────────────────────────────────┤
│ ✓ Hito 1: Fase Levantamiento  [Completado]  (20%)          │
│ ⏳ Hito 2: Diseño              [En progreso] (60%)          │
│ ◻ Hito 3: Desarrollo           [No iniciado]               │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  📋 ACTIVIDADES                    ➕ AGREGAR ACTIVIDAD     │
├──────────────────────────────────────────────────────────────┤
│ [Responsable] [Título] [Prioridad] [Estado] [Horas] [Acciones]
│ [Juan]       [Login]   [Alta]      [✓]      [12h]   [✏ 🗑]    │
│ [María]      [API]     [Alta]      [⏳]      [8h]    [✏ 🗑]    │
│ [Carlos]     [Testing] [Media]     [◻]      [0h]    [✏ 🗑]    │
└──────────────────────────────────────────────────────────────┘
```

## 🔐 VALIDACIONES CRUD

### Al Crear Proyecto
- ✅ Nombre y cliente requeridos
- ✅ Encargado debe ser Supervisor válido
- ✅ Presupuesto ≥ 0
- ✅ Horas estimadas ≥ 0

### Al Crear Hito
- ✅ Proyecto existe y está activo
- ✅ Nombre requerido
- ✅ Fecha objetivo ≥ hoy
- ✅ Máximo 10 hitos por proyecto

### Al Crear Actividad
- ✅ Proyecto existe y activo
- ✅ Título requerido
- ✅ Responsable es empleado válido
- ✅ Horas estimadas ≥ 0
- ✅ Fecha vencimiento ≥ fecha_inicio

### Al Actualizar Estado Actividad
- ✅ Transiciones válidas:
  - Pendiente → En Progreso
  - En Progreso → En Revisión
  - En Revisión → Completada
- ✅ Si Completada: registrar fecha_completacion
- ✅ Recalcular avance proyecto automáticamente

## 🚀 ROADMAP DE IMPLEMENTACIÓN

1. **Fase 1**: Endpoints básicos CRUD (Proyectos, Hitos, Actividades)
2. **Fase 2**: Cálculo automático de avance
3. **Fase 3**: Dashboard integrado con estadísticas
4. **Fase 4**: Reportes y exportación PDF
5. **Fase 5**: Notificaciones por cambios de estado
6. **Fase 6**: Análisis de rendimiento (horas reales vs estimadas)

---

**Nota**: Esta arquitectura permite escalabilidad y mantenimiento fácil del módulo de proyectos.
