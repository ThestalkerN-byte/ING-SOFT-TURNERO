import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "https://whhrlxgavbqxnhdbcfjb.supabase.co";
// Usar SERVICE_ROLE_KEY para bypass RLS (solo para backend)
// Si prefieres usar anon key, configura las políticas RLS en Supabase
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY o SUPABASE_KEY debe estar definida en las variables de entorno");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export default supabase;