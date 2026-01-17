# 📋 Sistema de Empleados - Documentación

## Paso 1: Crear la Tabla en BD

Ejecuta en PhpMyAdmin el siguiente script:

```sql
database/create_empleados_table.sql
```

Esto crea la tabla `empleados` con toda la información necesaria.

## Paso 2: Archivos Agregados

### Backend:
- `controllers/empleadoController.js` - Lógica CRUD de empleados
- `database/create_empleados_table.sql` - Script para crear tabla
- `views/createData.ejs` - Formulario mejorado para registro

### Rutas API:
```
POST   /api/empleados          - Crear empleado
GET    /api/empleados          - Obtener todos
GET    /api/empleados/:id      - Obtener uno
PUT    /api/empleados/:id      - Actualizar
DELETE /api/empleados/:id      - Desactivar (soft delete)
```

## Paso 3: Acceder al Formulario

1. Inicia sesión
2. Ve a: `/createData`
3. Completa el formulario (campos con * son obligatorios)
4. Click en "Registrar Empleado"

## Paso 4: Información que Guarda

### Personal:
- Nombre Completo
- Email (único)
- Teléfono
- RFC (único)
- Fecha Nacimiento
- Género
- Estado Civil
- Escolaridad

### Domicilio:
- Calle
- Número
- Ciudad
- Estado
- Código Postal

### Laboral:
- Número Empleado (único)
- Puesto
- Departamento
- Fecha Ingreso
- Timestamp auto de registro

## Validaciones

✅ Email único por empleado
✅ Email validado
✅ RFC único
✅ Número empleado único
✅ Campos obligatorios: nombre, email, puesto, departamento
✅ Soft delete (desactiva sin borrar)

## Uso de API

### Registrar empleado:
```bash
POST /api/empleados
Content-Type: application/x-www-form-urlencoded

nombre=Juan&email=juan@soltec.com&puesto=Ing&departamento=Sistemas
```

### Obtener todos:
```bash
GET /api/empleados
```

### Obtener uno:
```bash
GET /api/empleados/1
```

## Notas

- Los empleados tienen un campo `activo` (TRUE por defecto)
- Al desactivar no se borra, solo marca como inactivo
- Las fechas se guardan en formato ISO (YYYY-MM-DD)
- Todos requieren autenticación (JWT)

---

¿Necesitas agregar más campos o funcionalidades?
