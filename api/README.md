# Backend API - Sistema de Turnero

Backend construido con Express.js y Supabase para el sistema de turnero del consultorio médico.

## 📋 Estructura de la Base de Datos

La base de datos utiliza una **única tabla** `appointments` que almacena tanto los turnos como la información del paciente:

**Tabla: `appointments`**
- `_id` (UUID) - Identificador único del turno
- `created_at` (timestamp) - Fecha de creación
- `assigned_schedule` (timestamp) - Fecha y hora del turno
- `description` (text) - Descripción/motivo de la consulta
- `dni` (bigint) - DNI del paciente
- `name` (text) - Nombre del paciente
- `surname` (text) - Apellido del paciente
- `phone` (text) - Teléfono (opcional)
- `medical_insurance` (text) - Obra social

## 🚀 Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
SUPABASE_URL=https://whhrlxgavbqxnhdbcfjb.supabase.co
SUPABASE_KEY=tu_supabase_key_aqui
PORT=3000
```

**Obtener las credenciales de Supabase:**
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** > **API**
3. Copia la **Project URL** → `SUPABASE_URL`
4. Copia la **anon/public key** → `SUPABASE_KEY`

### 3. Verificar la tabla en Supabase

La tabla `appointments` debería ya estar creada en tu proyecto de Supabase. Si necesitas crearla o verificarla, puedes usar el archivo `api/schema.sql` en el SQL Editor de Supabase.

### 4. Iniciar el servidor

```bash
# Modo producción
npm start

# Modo desarrollo (con auto-reload)
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 📡 Endpoints de la API

### Turnos (Appointments)

#### Obtener todos los turnos
```
GET /api/turnos
```

**Query parameters opcionales:**
- `fecha_inicio`: Filtrar desde una fecha (timestamp ISO)
- `fecha_fin`: Filtrar hasta una fecha (timestamp ISO)
- `dni`: Filtrar por DNI del paciente

**Ejemplo:**
```
GET /api/turnos?dni=12345678
GET /api/turnos?fecha_inicio=2024-01-01T00:00:00&fecha_fin=2024-01-31T23:59:59
```

#### Obtener un turno por ID
```
GET /api/turnos/:id
```

#### Obtener turnos de una fecha específica
```
GET /api/turnos/fecha/:fecha
```

**Ejemplo:**
```
GET /api/turnos/fecha/2024-01-15
```
Nota: La fecha debe estar en formato `YYYY-MM-DD`

#### Obtener turnos de un paciente por DNI
```
GET /api/turnos/dni/:dni
```

#### Crear un nuevo turno
```
POST /api/turnos
Content-Type: application/json

{
  "assigned_schedule": "2024-01-15T10:00:00",
  "description": "Consulta general",
  "dni": 12345678,
  "name": "Juan",
  "surname": "Pérez",
  "phone": "1234567890",
  "medical_insurance": "OSDE"
}
```

**Campos requeridos:**
- `assigned_schedule` (string ISO timestamp) - Fecha y hora del turno
- `dni` (number) - DNI del paciente
- `name` (string) - Nombre del paciente
- `surname` (string) - Apellido del paciente
- `medical_insurance` (string) - Obra social

**Campos opcionales:**
- `description` (string) - Descripción/motivo
- `phone` (string) - Teléfono

#### Actualizar un turno
```
PUT /api/turnos/:id
Content-Type: application/json

{
  "assigned_schedule": "2024-01-15T11:00:00",
  "description": "Control",
  "dni": 12345678,
  "name": "Juan",
  "surname": "Pérez",
  "phone": "1234567890",
  "medical_insurance": "OSDE"
}
```

#### Eliminar un turno
```
DELETE /api/turnos/:id
```

### Pacientes

Los endpoints de pacientes trabajan con datos extraídos de los turnos (appointments).

#### Obtener lista única de pacientes
```
GET /api/pacientes
```
Retorna un array de pacientes únicos basados en su DNI, extraídos de todos los turnos.

#### Obtener información de un paciente por DNI
```
GET /api/pacientes/:dni
```

#### Buscar paciente por DNI
```
GET /api/pacientes/buscar/:dni
```
(Alias del endpoint anterior)

#### Obtener todos los turnos de un paciente
```
GET /api/pacientes/:dni/turnos
```

#### Actualizar información de un paciente
```
PUT /api/pacientes/:dni
Content-Type: application/json

{
  "name": "Juan",
  "surname": "Pérez",
  "phone": "1234567890",
  "medical_insurance": "OSDE"
}
```
**Nota:** Esto actualizará la información del paciente en **todos sus turnos**.

#### Eliminar un paciente
```
DELETE /api/pacientes/:dni
```
**Nota:** Esto eliminará **todos los turnos** del paciente.

## 📝 Estructura del Proyecto

```
api/
├── db.js              # Configuración del cliente Supabase
├── server.js          # Servidor Express principal
├── routes/
│   ├── pacientes.js   # Rutas para gestión de pacientes
│   └── turnos.js      # Rutas para gestión de turnos
├── schema.sql         # Script SQL de la tabla (referencia)
└── README.md          # Esta documentación
```

## 🔍 Respuestas de la API

Todas las respuestas siguen este formato:

**Éxito:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Mensaje de error"
}
```

## 🛠️ Códigos de Estado HTTP

- `200` - Éxito
- `201` - Recurso creado exitosamente
- `400` - Solicitud incorrecta (validación fallida)
- `404` - Recurso no encontrado
- `409` - Conflicto (turno duplicado en el mismo horario)
- `500` - Error interno del servidor

## 🧪 Probar la API

### Ejemplo con curl:

```bash
# Obtener todos los turnos
curl http://localhost:3000/api/turnos

# Crear un turno
curl -X POST http://localhost:3000/api/turnos \
  -H "Content-Type: application/json" \
  -d '{
    "assigned_schedule": "2024-01-15T10:00:00",
    "description": "Consulta general",
    "dni": 12345678,
    "name": "Juan",
    "surname": "Pérez",
    "phone": "1234567890",
    "medical_insurance": "OSDE"
  }'

# Obtener pacientes
curl http://localhost:3000/api/pacientes

# Obtener turnos de un paciente
curl http://localhost:3000/api/turnos/dni/12345678
```

## 📌 Notas Importantes

1. **Estructura de datos:** Los pacientes no tienen una tabla propia; se extraen de los turnos.
2. **DNI:** El DNI se almacena como `bigint` en la base de datos.
3. **Fechas:** El campo `assigned_schedule` es un timestamp completo (fecha + hora).
4. **Validación de horarios:** El sistema previene turnos duplicados en el mismo horario (±39 minutos).
5. **Actualización de pacientes:** Al actualizar un paciente, se actualizan todos sus turnos.

## 🔒 Seguridad

- En producción, asegúrate de configurar CORS adecuadamente
- Implementa autenticación si es necesario
- Nunca subas el archivo `.env` a un repositorio público

## 📞 Soporte

Si tienes problemas o preguntas, revisa:
- Los logs del servidor en la consola
- La consola de Supabase para errores de base de datos
- La documentación de [Supabase](https://supabase.com/docs)
