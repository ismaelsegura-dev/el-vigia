-- ==========================================
-- ESTRATEGIA DE SEGURIDAD (CYBERSECURITY HARDENING)
-- ==========================================

-- 1. Habilitar RLS en la tabla de lecturas
ALTER TABLE "public"."sensor_readings" ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICA DE INSERCIÓN (Para ESP32 / Sensores)
-- Permite insertar solo si el usuario está autenticado (vía Service Role o Token válido)
-- En un escenario ideal, el ESP32 usaría un JWT, pero para simplificar con API Key, 
-- a menudo se usa una Edge Function intermedia que tiene permisos de "service_role".
-- Si se conecta directo a la DB:
CREATE POLICY "Sensores pueden insertar lecturas"
ON "public"."sensor_readings"
FOR INSERT
TO authenticated, service_role
WITH CHECK (true); 
-- Nota: 'true' porque la validación de datos se hace en el backend/API, 
-- y la autenticación garantiza que es un emisor válido.

-- 3. POLÍTICA DE LECTURA (Solo Admins)
-- Solo los usuarios con rol 'admin' o 'service_role' pueden ver el historial completo.
CREATE POLICY "Admins pueden ver todo"
ON "public"."sensor_readings"
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
  OR 
  (auth.jwt() ->> 'email') LIKE '%@admin.com' -- Ejemplo simple
);

-- 4. POLÍTICA DE BLOQUEO DE BORRADO/MODIFICACIÓN (Irrevocabilidad)
-- Nadie (ni siquiera el admin insertando por error) debería poder modificar un log histórico.
-- No creamos políticas FOR UPDATE ni FOR DELETE. 
-- Al no haber políticas, la acción se deniega por defecto (Deny All).

-- 5. AUDITORÍA (Opcional)
-- Trigger para asegurar inmutabilidad incluso si alguien bypass RLS.
CREATE OR REPLACE FUNCTION prevent_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Los registros de sensores son inmutables por seguridad.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_immutability
BEFORE UPDATE OR DELETE ON "public"."sensor_readings"
FOR EACH ROW EXECUTE FUNCTION prevent_modification();
