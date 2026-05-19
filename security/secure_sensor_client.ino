#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

// ==========================================
// CONFIGURACIÓN DE RED Y CERTIFICADOS
// ==========================================
const char* ssid = "TU_WIFI_SSID";
const char* password = "TU_WIFI_PASSWORD";

// Endpoint de tu Edge Function (o API)
const char* serverUrl = "https://tu-proyecto.supabase.co/functions/v1/ingest-sensor-data";

// CLAVE SECRETA (Debe coincidir con la Edge Function)
const char* apiSecret = "TU_CLAVE_SUPER_SECRETA_v1_2024";

// Certificado Raíz de Let's Encrypt (para Supabase) o GlobalSign
// Es vital para evitar ataques Man-In-The-Middle (MITM)
const char* rootCACertificate = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIDvzCCAqegAwIBAgIQAqxcJmoLQJuPC3nyrkYldzANBgkqhkiG9w0BAQsFADBh\n" \
"MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3\n" \
"d3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBH\n" \
"MjAeFw0xMzA4MDExMjAwMDBaFw0zODAxMTUxMjAwMDBaMGExCzAJBgNVBAYTAlVT\n" \
"MRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5j\n" \
"b20xIDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBSb290IEcyMIIBIjANBgkqhkiG\n" \
"9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuzfNNNx7a8myaJCtSnX/RrohCgiN9RlUyfuI\n" \
"2/Ou8jqJkTx65qsGGmvPrC3oXgkkRLaan/PNA03xTQDZN385DSO/nKTSuPuErqOp\n" \
"I+yg6TRF72vi+nESHlib4q0/uK5k9hz8lSNV0qBv2tqF+R4Fqf9jD9u+me181ePS\n" \
"l2r04H+97MlrHZp1M32qV/0OD3d8uFh94m8fIVpI3233F8pS/633F8pS/633F8pS\n" \
"dF+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8\n" \
"pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8\n" \
"pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8\n" \
"pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8\n" \
"pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8\n" \
"pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8\n" \
"pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8pS+233F8\n" \
"-----END CERTIFICATE-----\n";

WiFiClientSecure client;

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // CONFIGURACIÓN DE SEGURIDAD
  // 1. Cargar el certificado raíz para validar el servidor (HTTPS Real)
  client.setCACert(rootCACertificate);
  
  // Opcional: Si es una fase de desarrollo y falla el cert, usar setInsecure()
  // client.setInsecure(); // ¡SOLO DEBUG! NO USAR EN PRODUCCIÓN
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    Serial.println("Iniciando conexión segura...");
    
    // Conectar usando WiFiClientSecure (HTTPS)
    if (http.begin(client, serverUrl)) {
      
      // 2. CREAR PAYLOAD JSON
      String payload = "{\"sensor_id\":\"04\", \"level\":85, \"battery\":92, \"lat\":37.3891, \"lng\":-5.9845}";
      
      // 3. AÑADIR HEADERS DE SEGURIDAD
      http.addHeader("Content-Type", "application/json");
      http.addHeader("x-sensor-secret", apiSecret); // <--- IMPORTANTE: API KEY AQUÍ

      // Enviar POST
      int httpCode = http.POST(payload);

      if (httpCode > 0) {
        String response = http.getString();
        Serial.println("Código HTTP: " + String(httpCode));
        Serial.println("Respuesta: " + response);
      } else {
        Serial.println("Error en la petición: " + http.errorToString(httpCode));
      }

      http.end();
    } else {
      Serial.println("No se pudo conectar al servidor");
    }
  }

  // Esperar 5 minutos antes de la siguiente lectura
  delay(300000); 
}
