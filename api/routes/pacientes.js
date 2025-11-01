import express from "express";
import supabase from "../db.js";

const router = express.Router();

// GET /api/pacientes - Obtener lista única de pacientes desde los turnos
// Retorna un array de pacientes únicos basados en su DNI
router.get("/", async (req, res) => {
    try {
        // Obtener todos los turnos y extraer información única de pacientes
        const { data: turnos, error } = await supabase
            .from("appointments")
            .select("dni, name, surname, phone, medical_insurance")
            .order("surname", { ascending: true })
            .order("name", { ascending: true });

        if (error) throw error;

        // Crear un Map para obtener pacientes únicos por DNI
        const pacientesMap = new Map();
        
        turnos.forEach(turno => {
            if (!pacientesMap.has(turno.dni)) {
                pacientesMap.set(turno.dni, {
                    dni: turno.dni,
                    name: turno.name,
                    surname: turno.surname,
                    phone: turno.phone,
                    medical_insurance: turno.medical_insurance
                });
            }
        });

        // Convertir Map a Array
        const pacientes = Array.from(pacientesMap.values());

        res.json({ success: true, data: pacientes });
    } catch (error) {
        console.error("Error al obtener pacientes:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// GET /api/pacientes/:dni - Obtener información de un paciente por DNI
router.get("/:dni", async (req, res) => {
    try {
        const { dni } = req.params;
        
        // Buscar el primer turno de este paciente para obtener su información
        const { data, error } = await supabase
            .from("appointments")
            .select("dni, name, surname, phone, medical_insurance")
            .eq("dni", parseInt(dni))
            .limit(1)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return res.status(404).json({ 
                    success: false, 
                    error: "Paciente no encontrado" 
                });
            }
            throw error;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error("Error al obtener paciente:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// GET /api/pacientes/buscar/:dni - Buscar paciente por DNI (alias del endpoint anterior)
router.get("/buscar/:dni", async (req, res) => {
    try {
        const { dni } = req.params;
        
        const { data, error } = await supabase
            .from("appointments")
            .select("dni, name, surname, phone, medical_insurance")
            .eq("dni", parseInt(dni))
            .limit(1)
            .single();

        if (error && error.code !== "PGRST116") throw error;

        res.json({ success: true, data: data || null });
    } catch (error) {
        console.error("Error al buscar paciente:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// GET /api/pacientes/:dni/turnos - Obtener todos los turnos de un paciente
router.get("/:dni/turnos", async (req, res) => {
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
        console.error("Error al obtener turnos del paciente:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// POST /api/pacientes - Este endpoint no crea pacientes directamente
// Los pacientes se crean al crear un turno (appointment)
// Este endpoint solo actualiza la información del paciente en todos sus turnos
router.post("/", async (req, res) => {
    try {
        const { dni, name, surname, phone, medical_insurance } = req.body;

        // Validaciones
        if (!dni || !name || !surname || !medical_insurance) {
            return res.status(400).json({ 
                success: false, 
                error: "dni, name, surname y medical_insurance son campos requeridos" 
            });
        }

        // Buscar si existe algún turno con este DNI
        const { data: turnosExistentes } = await supabase
            .from("appointments")
            .select("_id")
            .eq("dni", parseInt(dni))
            .limit(1);

        // Si no hay turnos, no podemos crear un "paciente" porque los pacientes
        // se crean junto con los turnos
        if (!turnosExistentes || turnosExistentes.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: "Los pacientes se crean automáticamente al crear un turno. Use POST /api/turnos para crear un turno con un nuevo paciente." 
            });
        }

        // Si existe, actualizar todos los turnos de este paciente
        const { data, error } = await supabase
            .from("appointments")
            .update({
                name: name,
                surname: surname,
                phone: phone || null,
                medical_insurance: medical_insurance
            })
            .eq("dni", parseInt(dni))
            .select();

        if (error) throw error;

        res.json({ 
            success: true, 
            message: "Información del paciente actualizada en todos sus turnos",
            data: { dni, name, surname, phone, medical_insurance }
        });
    } catch (error) {
        console.error("Error al actualizar paciente:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// PUT /api/pacientes/:dni - Actualizar información de un paciente en todos sus turnos
router.put("/:dni", async (req, res) => {
    try {
        const { dni } = req.params;
        const { name, surname, phone, medical_insurance } = req.body;

        // Validaciones
        if (!name || !surname || !medical_insurance) {
            return res.status(400).json({ 
                success: false, 
                error: "name, surname y medical_insurance son campos requeridos" 
            });
        }

        // Actualizar todos los turnos de este paciente
        const { data, error } = await supabase
            .from("appointments")
            .update({
                name: name,
                surname: surname,
                phone: phone !== undefined ? phone : null,
                medical_insurance: medical_insurance
            })
            .eq("dni", parseInt(dni))
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: "Paciente no encontrado" 
            });
        }

        res.json({ 
            success: true, 
            message: "Información del paciente actualizada en todos sus turnos",
            data: { dni: parseInt(dni), name, surname, phone, medical_insurance }
        });
    } catch (error) {
        console.error("Error al actualizar paciente:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// DELETE /api/pacientes/:dni - Eliminar un paciente (elimina todos sus turnos)
router.delete("/:dni", async (req, res) => {
    try {
        const { dni } = req.params;

        // Eliminar todos los turnos del paciente
        const { error } = await supabase
            .from("appointments")
            .delete()
            .eq("dni", parseInt(dni));

        if (error) throw error;

        res.json({ 
            success: true, 
            message: "Paciente y todos sus turnos eliminados correctamente" 
        });
    } catch (error) {
        console.error("Error al eliminar paciente:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

export default router;
