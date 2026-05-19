// ==========================================
// SUPABASE EDGE FUNCTION (Deno / TypeScript)
// ==========================================
// Despliega esto en Supabase Functions para actuar como "Gatekeeper".

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sensor-secret',
};

serve(async (req) => {
    // 1. Manejo de CORS (Preflight)
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 2. VERIFICACIÓN DE SEGURIDAD (API KEY)
        // El ESP32 debe enviar este header: "x-sensor-secret": "TU_CLAVE_SUPER_SECRETA"
        const sensorSecret = req.headers.get('x-sensor-secret');
        const EXPECTED_SECRET = Deno.env.get('SENSOR_API_SECRET'); // Configura esto en Supabase Secrets

        if (!sensorSecret || sensorSecret !== EXPECTED_SECRET) {
            console.warn(`Intento de acceso no autorizado desde: ${req.headers.get('x-forwarded-for')}`);
            return new Response(
                JSON.stringify({ error: 'Unauthorized: Invalid Sensor Credentials' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 3. Parsear datos del ESP32
        const { sensor_id, level, battery, lat, lng } = await req.json();

        // Validar datos mínimos
        if (!sensor_id || level === undefined) {
            return new Response(
                JSON.stringify({ error: 'Bad Request: Missing data' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 4. INSERCIÓN DE DATOS (Usando Service Role para bypass RLS de lectura, pero respetando inserción)
        // Inicializar cliente con Service Role para tener permisos de escritura privilegiados
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data, error } = await supabaseAdmin
            .from('sensor_readings')
            .insert([
                {
                    sensor_id,
                    level,
                    battery,
                    lat,
                    lng,
                    timestamp: new Date().toISOString()
                }
            ]);

        if (error) throw error;

        return new Response(
            JSON.stringify({ message: 'Data secured and stored successfully', id: sensor_id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
