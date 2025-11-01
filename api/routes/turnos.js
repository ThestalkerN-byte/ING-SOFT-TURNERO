import express from "express";
import supabase from "../db.js";

const router = express.Router();

// GET /api/turnos - Obtener todos los turnos (appointments)
router.get("/", async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin, dni } = req.query;

        let query = supabase
            .from("appointments")
            .select("*")
            .order("assigned_schedule", { ascending: true });

        // Filtros opcionales
        if (fecha_inicio) {
            query = query.gte("assigned_schedule", fecha_inicio);
        }
        if (fecha_fin) {
            query = query.lte("assigned_schedule", fecha_fin);
        }
        if (dni) {
            query = query.eq("dni", parseInt(dni));
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error("Error al obtener turnos:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// GET /api/turnos/:id - Obtener un turno por ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from("appointments")
            .select("*")
            .eq("_id", id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ 
                success: false, 
                error: "Turno no encontrado" 
            });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error("Error al obtener turno:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// GET /api/turnos/fecha/:fecha - Obtener turnos de una fecha específica
// La fecha debe estar en formato YYYY-MM-DD
router.get("/fecha/:fecha", async (req, res) => {
    try {
        const { fecha } = req.params;
        
        // Construir el rango de fechas para el día completo
        const fechaInicio = `${fecha}T00:00:00`;
        const fechaFin = `${fecha}T23:59:59`;

        const { data, error } = await supabase
            .from("appointments")
            .select("*")
            .gte("assigned_schedule", fechaInicio)
            .lte("assigned_schedule", fechaFin)
            .order("assigned_schedule", { ascending: true });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error("Error al obtener turnos por fecha:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// GET /api/turnos/dni/:dni - Obtener turnos de un paciente por DNI
router.get("/dni/:dni", async (req, res) => {
    try {
        const { dni } = req.params;
        const { data, error } = await supabase
            .from("appointments")
            .select("*")
            .eq("dni", parseInt(dni))
            .order("assigned_schedule", { ascending: true });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error("Error al obtener turnos por DNI:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// POST /api/turnos - Crear un nuevo turno (appointment)
router.post("/", async (req, res) => {
    try {
        console.log("📥 POST /api/turnos recibido");
        console.log("Body recibido:", JSON.stringify(req.body, null, 2));
        
        const { assigned_schedule, description, dni, name, surname, phone, medical_insurance } = req.body;

        // Validaciones detalladas
        const camposFaltantes = [];
        if (!assigned_schedule) camposFaltantes.push("assigned_schedule (fecha y hora del turno)");
        if (!dni) camposFaltantes.push("dni");
        if (!name) camposFaltantes.push("name (nombre)");
        if (!surname) camposFaltantes.push("surname (apellido)");
        if (!medical_insurance) camposFaltantes.push("medical_insurance (obra social)");

        if (camposFaltantes.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: `Los siguientes campos son requeridos: ${camposFaltantes.join(", ")}` 
            });
        }

        // Validar que assigned_schedule sea una fecha válida
        const scheduleDate = new Date(assigned_schedule);
        if (isNaN(scheduleDate.getTime())) {
            return res.status(400).json({ 
                success: false, 
                error: "assigned_schedule debe ser una fecha válida en formato ISO 8601 (ej: 2024-01-15T10:00:00)" 
            });
        }

        // Validar que dni sea un número válido
        const dniNumber = parseInt(dni);
        if (isNaN(dniNumber) || dniNumber <= 0) {
            return res.status(400).json({ 
                success: false, 
                error: "dni debe ser un número válido mayor a 0" 
            });
        }

        // Verificar si ya existe un turno en esa fecha y hora
        // Convertir assigned_schedule a formato comparable
        const fechaInicio = new Date(scheduleDate);
        fechaInicio.setMinutes(fechaInicio.getMinutes() - 39); // 39 minutos antes
        const fechaFin = new Date(scheduleDate);
        fechaFin.setMinutes(fechaFin.getMinutes() + 39); // 39 minutos después

        const { data: turnoExistente } = await supabase
            .from("appointments")
            .select("_id")
            .gte("assigned_schedule", fechaInicio.toISOString())
            .lte("assigned_schedule", fechaFin.toISOString())
            .limit(1);

        if (turnoExistente && turnoExistente.length > 0) {
            return res.status(409).json({ 
                success: false, 
                error: "Ya existe un turno en ese horario" 
            });
        }

        const { data, error } = await supabase
            .from("appointments")
            .insert([
                {
                    assigned_schedule: assigned_schedule,
                    description: description || null,
                    dni: dniNumber,
                    name: name.trim(),
                    surname: surname.trim(),
                    phone: phone ? phone.trim() : null,
                    medical_insurance: medical_insurance.trim()
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error("Error al crear turno:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// PUT /api/turnos/:id - Actualizar un turno
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { assigned_schedule, description, dni, name, surname, phone, medical_insurance } = req.body;

        // Validaciones
        if (!assigned_schedule || !dni || !name || !surname || !medical_insurance) {
            return res.status(400).json({ 
                success: false, 
                error: "assigned_schedule, dni, name, surname y medical_insurance son campos requeridos" 
            });
        }

        // Verificar si el nuevo horario ya está ocupado por otro turno
        const scheduleDate = new Date(assigned_schedule);
        const fechaInicio = new Date(scheduleDate);
        fechaInicio.setMinutes(fechaInicio.getMinutes() - 39);
        const fechaFin = new Date(scheduleDate);
        fechaFin.setMinutes(fechaFin.getMinutes() + 39);

        const { data: turnoExistente } = await supabase
            .from("appointments")
            .select("_id")
            .gte("assigned_schedule", fechaInicio.toISOString())
            .lte("assigned_schedule", fechaFin.toISOString())
            .neq("_id", id)
            .limit(1);

        if (turnoExistente && turnoExistente.length > 0) {
            return res.status(409).json({ 
                success: false, 
                error: "Ya existe otro turno en ese horario" 
            });
        }

        const updateData = {
            assigned_schedule: assigned_schedule,
            description: description !== undefined ? description : null,
            dni: parseInt(dni),
            name: name,
            surname: surname,
            phone: phone !== undefined ? phone : null,
            medical_insurance: medical_insurance
        };

        const { data, error } = await supabase
            .from("appointments")
            .update(updateData)
            .eq("_id", id)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ 
                success: false, 
                error: "Turno no encontrado" 
            });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error("Error al actualizar turno:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// DELETE /api/turnos/:id - Eliminar un turno
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from("appointments")
            .delete()
            .eq("_id", id);

        if (error) throw error;

        res.json({ 
            success: true, 
            message: "Turno eliminado correctamente" 
        });
    } catch (error) {
        console.error("Error al eliminar turno:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

export default router;
