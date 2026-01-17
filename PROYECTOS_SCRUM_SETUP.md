# Sistema de Gestión de Proyectos SCRUM
## Para Empresa de Ingeniería

---

## 📋 Descripción General

Sistema completo para gestionar proyectos activos de una empresa de ingeniería utilizando metodología SCRUM con seguimiento de:
- Fases del proyecto (Levantamiento → Facturación)
- Documentos técnicos (APU, Cotización, etc.)
- Avance del proyecto en porcentaje
- Asignación de responsables
- Tareas y hitos

---

## 🗂️ Tablas de Base de Datos

### 1. `proyectos_activos` - Tabla Principal

```sql
CREATE TABLE proyectos_activos (
  id INT PRIMARY KEY AUTO_INCREMENT
  nombre_proyecto VARCHAR(200) - Nombre del proyecto
  cliente VARCHAR(150) - Cliente del proyecto
  encargado_id INT - FK a empleados (Supervisor)
  
  -- FECHAS CLAVE
  fecha_levantamiento DATE
  fecha_cotizacion DATE
  fecha_ejecucion DATE
  fecha_termino_prevista DATE
  fecha_termino_real DATE
  
  -- ESTADO DEL PROYECTO
  estado ENUM - Levantamiento, Cotización, Aprobado, En Ejecución, Pausa, Finalizado, Cancelado
  
  -- DATOS FINANCIEROS
  presupuesto_estimado DECIMAL(12,2)
  presupuesto_real DECIMAL(12,2)
  orden_compra VARCHAR(50)
  estatus_oc ENUM - Pendiente, Generada, Recibida, Rechazada
  
  -- DOCUMENTOS
  tiene_apu BOOLEAN - Análisis de Precios Unitarios
  tiene_factura BOOLEAN
  numero_factura VARCHAR(50)
  
  -- SCRUM
  porcentaje_avance INT - 0 a 100%
  horas_invertidas DECIMAL(8,2)
  horas_estimadas DECIMAL(8,2)
  
  -- AUDITORÍA
  fecha_creacion TIMESTAMP
  creado_por INT - FK a users
  activo BOOLEAN
)
```

### 2. `actividades_proyecto` - Tareas SCRUM

```sql
CREATE TABLE actividades_proyecto (
  id INT PRIMARY KEY AUTO_INCREMENT
  proyecto_id INT - FK a proyectos_activos
  
  titulo VARCHAR(200)
  responsable_id INT - FK a empleados
  
  -- SCRUM
  tipo ENUM - Feature, Bug, Tarea, Mejora
  prioridad ENUM - Baja, Media, Alta, Urgente
  estado ENUM - Pendiente, En Progreso, En Revisión, Completada
  
  -- ESTIMACIÓN
  horas_estimadas DECIMAL(8,2)
  horas_invertidas DECIMAL(8,2)
  
  -- FECHAS
  fecha_inicio DATE
  fecha_vencimiento DATE
  fecha_completacion DATE
)
```

### 3. `hitos_proyecto` - Milestones

```sql
CREATE TABLE hitos_proyecto (
  id INT PRIMARY KEY AUTO_INCREMENT
  proyecto_id INT - FK a proyectos_activos
  
  nombre VARCHAR(200)
  fecha_objetivo DATE
  estado ENUM - No iniciado, En progreso, Completado, Retrasado
)
```

---

## 🔗 Endpoints API

### Proyectos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/proyectos` | Lista todos los proyectos |
| GET | `/api/proyectos/:id` | Obtiene detalle de un proyecto |
| POST | `/api/proyectos` | Crea nuevo proyecto |
| PUT | `/api/proyectos/:id` | Actualiza proyecto |
| GET | `/api/resumen-proyectos` | Resumen para dashboard |

### Actividades

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/proyectos/:proyecto_id/actividades` | Lista tareas del proyecto |
| POST | `/api/proyectos/:proyecto_id/actividades` | Crea nueva actividad |

### Hitos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/proyectos/:proyecto_id/hitos` | Lista hitos del proyecto |

---

## 🎯 Estados del Proyecto

```
┌─────────────────────────────────────────┐
│  LEVANTAMIENTO                          │
│  - Se recopila información del cliente  │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  COTIZACIÓN                             │
│  - Se prepara presupuesto               │
│  - Se genera APU (Análisis Precios)    │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  APROBADO                               │
│  - Cliente aprueba cotización           │
│  - Se genera Orden de Compra            │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  EN EJECUCIÓN                           │
│  - Inicia trabajo real                  │
│  - Se registran horas invertidas        │
└──────────────┬──────────────────────────┘
               ↓
       ┌───────┴────────┐
       ↓                ↓
    PAUSA          FINALIZADO
    (Temporal)     - Proyecto completado
                   - Se genera factura
                   - Se cierra APU
```

---

## 📊 Vista de Proyectos (`/proyectos`)

### Resumen (Cards con Gradientes)
- 📦 Total de proyectos
- ▶️ En ejecución
- ✅ Finalizados
- ⏸️ En pausa
- 📈 Avance promedio

### Tabla Principal
Columnas:
- ID
- Nombre del Proyecto
- Cliente
- Encargado
- Estado (con badges de color)
- Avance (barra de progreso)
- Fechas (Ejecución y Término)
- Presupuesto estimado
- Acciones (Ver, Editar)

### Herramientas DataTables
- Buscar
- Copiar
- Exportar (CSV, Excel, PDF)
- Imprimir
- Mostrar/Ocultar columnas

---

## 🔐 Seguridad

- ✅ Todas las rutas requieren autenticación
- ✅ Solo administradores pueden acceder
- ✅ Validación de campos obligatorios
- ✅ Validación de relaciones (FK)

---

## 📝 Flujo de Uso

### 1. Crear Proyecto
```
Dashboard (/asistencia) 
  → Click en "Proyectos (SCRUM)" 
  → Click en "Nuevo Proyecto"
  → Llenar formulario
  → Crear Proyecto
```

### 2. Agregar Actividades
```
Ver proyecto 
  → Ir a "Actividades"
  → Crear nueva actividad
  → Asignar responsable
  → Establecer fechas y horas
```

### 3. Registrar Avance
```
Editar proyecto
  → Actualizar porcentaje de avance
  → Actualizar horas invertidas
  → Cambiar estado si corresponde
  → Guardar cambios
```

### 4. Generar Documentos
```
En la vista del proyecto:
  - Marcar como "Tiene APU"
  - Marcar como "Tiene Factura"
  - Cargar números de OC y factura
```

---

## 🎨 Diseño UI

### Colores por Estado
- **Levantamiento**: Gris (Secundario)
- **Cotización**: Azul claro (Info)
- **Aprobado**: Azul oscuro (Primary)
- **En Ejecución**: Amarillo (Warning)
- **Pausa**: Rojo (Danger)
- **Finalizado**: Verde (Success)
- **Cancelado**: Negro (Dark)

### Cards de Resumen
Gradientes modernos con iconos Font Awesome:
- Degradados direccionales (135°)
- Textos en blanco
- Sombras sutiles
- Responsive design

---

## 📊 Métricas SCRUM

### Seguimiento
- **Horas Estimadas vs Invertidas**: Comparar estimación con realidad
- **Avance**: Porcentaje visual con barra de progreso
- **Tareas Completadas**: Número y porcentaje

### Dashboard
- Promedio de avance de todos los proyectos
- Presupuesto total estimado vs invertido
- Cantidad de proyectos por estado

---

## 🚀 Próximas Mejoras

- [ ] Vista detallada de proyecto
- [ ] Gráficos de Gantt para cronograma
- [ ] Burndown chart para SCRUM
- [ ] Notificaciones de hitos próximos
- [ ] Reporte de desviaciones presupuestarias
- [ ] Integración con calendario
- [ ] Asignación múltiple de tareas
- [ ] Comentarios en actividades

---

## 📚 Para Ejecutar el SQL

1. Abre **PhpMyAdmin**
2. Selecciona BD `crud_nods`
3. Pestaña **SQL**
4. Copia contenido de [database/create_proyectos_table.sql](database/create_proyectos_table.sql)
5. Ejecuta ✅

---

**Metodología**: SCRUM
**Tipo de Empresa**: Ingeniería
**Año**: 2026
**Estado**: En desarrollo
