import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pacientesRoutes from "./routes/pacientes.js";
import turnosRoutes from "./routes/turnos.js";

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging para debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    next();
});

// Rutas
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/turnos", turnosRoutes);

// Ruta de prueba
app.get("/api", (req, res) => {
    res.json({ 
        message: "API del Sistema de Turnero funcionando correctamente",
        endpoints: {
            pacientes: "/api/pacientes",
            turnos: "/api/turnos"
        }
    });
});

// Ruta de prueba para verificar que el servidor está funcionando
app.get("/", (req, res) => {
    res.json({ 
        message: "Servidor funcionando",
        timestamp: new Date().toISOString()
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: "Error interno del servidor",
        message: err.message 
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📡 API disponible en http://localhost:${PORT}/api`);
});

