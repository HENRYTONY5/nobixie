# Sistema de Supervisores y Empleados - Actualización

## Cambios Realizados

### 1. **Nueva Tabla: `supervisores_empleados`**
```sql
CREATE TABLE supervisores_empleados (
  id INT(11) PRIMARY KEY AUTO_INCREMENT
  supervisor_id INT(11) - FK a empleados (Supervisor)
  empleado_id INT(11) - FK a empleados (Empleado)
  departamento ENUM - Pailería, Administración, Eléctricos, Mantenimiento
  fecha_asignacion TIMESTAMP
)
```

**Permite:**
- Vincular múltiples empleados a un supervisor
- Múltiples supervisores por departamento
- Relación N:M flexible

### 2. **Tabla `empleados` - Actualizaciones**

#### Campo `puesto` (antes VARCHAR → ahora ENUM):
- Ayudante general
- Especialista
- Ingeniero

#### Campo `departamento` - Nuevo valor:
- Pailería
- Administración
- Eléctricos
- **Mantenimiento** (NUEVO)

#### Número de Empleado - Ahora Auto-generado:
- Formato: `EMP0001`, `EMP0002`, etc.
- Se genera automáticamente en el servidor
- No puede ser escrito por el usuario

### 3. **Controlador `supervisorController.js` (NUEVO)**

**Endpoints:**

#### POST `/api/supervisores/asignar`
Asigna un empleado a un supervisor
```json
{
  "supervisor_id": 1,
  "empleado_id": 2,
  "departamento": "Pailería"
}
```

#### GET `/api/supervisores`
Lista todos los supervisores con contador de empleados

#### GET `/api/supervisores/:supervisor_id/empleados`
Obtiene todos los empleados asignados a un supervisor

#### DELETE `/api/supervisores/:id/asignacion`
Elimina una asignación supervisor-empleado

### 4. **Formulario `createData.ejs` - Cambios**

- ✅ Número de empleado: **READ-ONLY** (auto-generado)
- ✅ Puesto: **SELECT** con 3 opciones (antes era TEXT)
- ✅ Departamento: **SELECT** con 4 opciones (agregado Mantenimiento)

### 5. **Script SQL para Migración**

Ubicación: `database/create_supervisores_table.sql`

```sql
-- Crear tabla supervisores_empleados
-- Modificar campo puesto a ENUM
-- Modificar campo departamento para incluir Mantenimiento
```

## Validaciones Implementadas

1. **Supervisor:** Solo usuarios con `tipo_empleado = 'Supervisor'` pueden tener empleados
2. **Puesto:** Solo valores ENUM permitidos
3. **Departamento:** Solo valores ENUM permitidos
4. **Email:** Única por empleado
5. **RFC:** Única por empleado (si aplica)
6. **Asignación:** No se pueden duplicar (supervisor + empleado + departamento)

## Flujo de Uso

### Registrar un Empleado:
1. Ir a `/createData`
2. Llenar formulario (número de empleado se auto-genera)
3. Seleccionar puesto del dropdown
4. Seleccionar departamento (incluyendo Mantenimiento)
5. Enviar formulario

### Asignar Empleados a Supervisor:
1. El empleado debe ser de tipo "Supervisor"
2. Usar endpoint `POST /api/supervisores/asignar`
3. Especificar supervisor, empleado y departamento

### Consultar Empleados de un Supervisor:
1. Usar endpoint `GET /api/supervisores/:supervisor_id/empleados`
2. Retorna lista de empleados por departamento

## Próximos Pasos

- [ ] Crear vista para asignar empleados a supervisores
- [ ] Dashboard de supervisores con sus empleados
- [ ] Reporte de estructura organizacional
- [ ] Validaciones del lado del cliente en formulario
