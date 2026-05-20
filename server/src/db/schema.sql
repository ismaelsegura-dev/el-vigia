-- ==========================================
-- EL VIGIA DEL IMBORNAL - Database Schema
-- ==========================================

-- Extension para funciones de distancia (haversine)
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;
CREATE EXTENSION IF NOT EXISTS cube;

-- Tabla de sensores/nodos
CREATE TABLE IF NOT EXISTS sensors (
  id VARCHAR(10) PRIMARY KEY,
  location_name VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  battery_level INTEGER DEFAULT 100 CHECK (battery_level BETWEEN 0 AND 100),
  firmware_version VARCHAR(20),
  installed_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  notes TEXT
);

-- Tabla de lecturas de sensores (inmutable)
CREATE TABLE IF NOT EXISTS sensor_readings (
  id SERIAL PRIMARY KEY,
  sensor_id VARCHAR(10) REFERENCES sensors(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 100),
  humidity DECIMAL(5, 2),
  battery INTEGER CHECK (battery BETWEEN 0 AND 100),
  temperature DECIMAL(5, 2),
  received_at TIMESTAMP DEFAULT NOW(),
  signal_strength INTEGER,
  raw_payload JSONB
);

-- Indice para consultas rapidas por sensor y tiempo
CREATE INDEX IF NOT EXISTS idx_readings_sensor_time
  ON sensor_readings (sensor_id, received_at DESC);

-- Tabla de alertas
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  sensor_id VARCHAR(10) REFERENCES sensors(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('critical', 'warning', 'info', 'success')),
  message TEXT NOT NULL,
  level_value INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP,
  acknowledged_by VARCHAR(100)
);

-- Tabla de datos meteorologicos (AEMET)
CREATE TABLE IF NOT EXISTS weather_data (
  id SERIAL PRIMARY KEY,
  city_id VARCHAR(10) NOT NULL,
  forecast_date DATE NOT NULL,
  precipitation_mm DECIMAL(6, 2),
  precipitation_prob INTEGER CHECK (precipitation_prob BETWEEN 0 AND 100),
  temperature_min DECIMAL(4, 1),
  temperature_max DECIMAL(4, 1),
  wind_speed DECIMAL(5, 1),
  description TEXT,
  fetched_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(city_id, forecast_date)
);

-- Tabla de scoring/priorizacion
CREATE TABLE IF NOT EXISTS sensor_scores (
  id SERIAL PRIMARY KEY,
  sensor_id VARCHAR(10) REFERENCES sensors(id) ON DELETE CASCADE,
  score DECIMAL(5, 2) NOT NULL,
  level_weight DECIMAL(5, 2),
  weather_weight DECIMAL(5, 2),
  battery_weight DECIMAL(5, 2),
  trend_weight DECIMAL(5, 2),
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(sensor_id, calculated_at)
);

-- Tabla de rutas de limpieza
CREATE TABLE IF NOT EXISTS cleaning_routes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  total_sensors INTEGER,
  estimated_time_min INTEGER,
  estimated_distance_km DECIMAL(6, 2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

-- Tabla de orden de ruta (sensores en una ruta)
CREATE TABLE IF NOT EXISTS route_stops (
  id SERIAL PRIMARY KEY,
  route_id INTEGER REFERENCES cleaning_routes(id) ON DELETE CASCADE,
  sensor_id VARCHAR(10) REFERENCES sensors(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  score DECIMAL(5, 2),
  UNIQUE(route_id, sensor_id)
);

-- Funcion para calcular score de prioridad
CREATE OR REPLACE FUNCTION calculate_sensor_score(
  p_sensor_id VARCHAR(10),
  p_level INTEGER,
  p_battery INTEGER,
  p_precipitation_prob INTEGER,
  p_trend DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  v_score DECIMAL;
  v_level_weight DECIMAL;
  v_weather_weight DECIMAL;
  v_battery_weight DECIMAL;
  v_trend_weight DECIMAL;
BEGIN
  -- Peso del nivel de obstruccion (0-40 puntos)
  v_level_weight := (p_level::DECIMAL / 100) * 40;

  -- Peso de probabilidad de lluvia (0-30 puntos)
  v_weather_weight := (p_precipitation_prob::DECIMAL / 100) * 30;

  -- Peso inverso de bateria (0-15 puntos) - bateria baja = mas urgente
  v_battery_weight := ((100 - p_battery)::DECIMAL / 100) * 15;

  -- Peso de tendencia (0-15 puntos) - tendencia positiva = mas urgente
  v_trend_weight := LEAST(GREATEST(p_trend, 0), 100)::DECIMAL / 100 * 15;

  v_score := v_level_weight + v_weather_weight + v_battery_weight + v_trend_weight;

  INSERT INTO sensor_scores (sensor_id, score, level_weight, weather_weight, battery_weight, trend_weight)
  VALUES (p_sensor_id, v_score, v_level_weight, v_weather_weight, v_battery_weight, v_trend_weight);

  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar last_seen del sensor al recibir lectura
CREATE OR REPLACE FUNCTION update_sensor_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sensors
  SET last_seen = NEW.received_at,
      battery_level = COALESCE(NEW.battery, battery_level)
  WHERE id = NEW.sensor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_last_seen
  AFTER INSERT ON sensor_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_sensor_last_seen();

-- Funcion para generar alerta automatica si el nivel es critico
CREATE OR REPLACE FUNCTION check_critical_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.level >= 80 THEN
    INSERT INTO alerts (sensor_id, type, message, level_value)
    VALUES (
      NEW.sensor_id,
      'critical',
      'Nivel critico en sensor ' || NEW.sensor_id || ': ' || NEW.level || '%',
      NEW.level
    );
  ELSIF NEW.level >= 60 THEN
    INSERT INTO alerts (sensor_id, type, message, level_value)
    VALUES (
      NEW.sensor_id,
      'warning',
      'Nivel elevado en sensor ' || NEW.sensor_id || ': ' || NEW.level || '%',
      NEW.level
    );
  END IF;

  IF NEW.battery IS NOT NULL AND NEW.battery <= 20 THEN
    INSERT INTO alerts (sensor_id, type, message, level_value)
    VALUES (
      NEW.sensor_id,
      'warning',
      'Bateria baja en sensor ' || NEW.sensor_id || ': ' || NEW.battery || '%',
      NEW.battery
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_critical
  AFTER INSERT ON sensor_readings
  FOR EACH ROW
  EXECUTE FUNCTION check_critical_level();

-- Datos iniciales de sensores (ejemplo: Sevilla)
INSERT INTO sensors (id, location_name, lat, lng, battery_level, firmware_version) VALUES
  ('01', 'Plaza Espana', 37.3891, -5.9845, 92, '1.0.0'),
  ('02', 'Av. Constitucion', 37.3850, -5.9900, 88, '1.0.0'),
  ('03', 'C/ San Fernando', 37.3820, -5.9930, 95, '1.0.0'),
  ('04', 'C/ Mairena', 37.3870, -5.9810, 12, '1.0.0'),
  ('05', 'Alameda', 37.4000, -5.9950, 78, '1.0.0'),
  ('06', 'Triana', 37.3840, -6.0020, 99, '1.0.0'),
  ('07', 'Puerta Jerez', 37.3830, -5.9920, 85, '1.0.0'),
  ('08', 'Macarena', 37.4030, -5.9890, 65, '1.0.0'),
  ('09', 'Prado de San Sebastian', 37.3790, -5.9900, 90, '1.0.0'),
  ('10', 'C/ Sierpes', 37.3880, -5.9930, 72, '1.0.0'),
  ('11', 'Plaza de Armas', 37.3920, -6.0010, 88, '1.0.0'),
  ('12', 'Nervion', 37.3800, -5.9750, 15, '1.0.0')
ON CONFLICT (id) DO NOTHING;
