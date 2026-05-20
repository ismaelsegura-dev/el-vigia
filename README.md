# El Vigia del Imbornal

Sistema IoT + IA de bajo coste para monitorizar en tiempo real el nivel de suciedad/obstruccion de imbornales en entornos urbanos. Predice riesgos de inundacion y optimiza rutas de limpieza.

## Arquitectura

```
el-vigia/
├── server/               # Backend Express + PostgreSQL
│   ├── src/
│   │   ├── controllers/  # Logica de negocio
│   │   ├── routes/       # Endpoints API
│   │   ├── db/           # Schema y conexion PostgreSQL
│   │   ├── simulator/    # Simulador LoRaWAN de sensores
│   │   └── app.js        # Servidor Express
│   └── package.json
├── src/                  # Frontend React + Vite
│   ├── components/       # Componentes UI
│   ├── services/         # Cliente API
│   └── App.jsx           # Componente principal
└── security/             # Firmware ESP32 y SQL de seguridad
```

## Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS 3, Leaflet, Recharts, Framer Motion
- **Backend:** Node.js, Express, PostgreSQL
- **Hardware:** ESP32 + LoRaWAN (firmware en `/security`)

## Desarrollo

### Backend
```bash
cd server
npm install
npm run db:init    # Inicializar PostgreSQL
npm run dev        # Servidor en localhost:3000
npm run simulate   # Simulador LoRaWAN
```

### Frontend
```bash
npm install
npm run dev        # Vite en localhost:5173
```

## API Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/health` | Estado del servidor |
| GET | `/api/sensors` | Lista de sensores |
| GET | `/api/sensors/:id/history` | Historial de un sensor |
| POST | `/api/sensors/reading` | Enviar lectura (requiere `x-sensor-secret`) |
| GET | `/api/alerts` | Alertas del sistema |
| GET | `/api/dashboard/kpis` | KPIs del dashboard |
| GET | `/api/dashboard/scores` | Scoring de prioridad |
| POST | `/api/dashboard/route` | Generar ruta optima |
| GET | `/api/weather` | Prediccion meteorologica AEMET |

## Configuracion

Crear `server/.env` desde `server/.env.example`:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/el_vigia
SENSOR_API_SECRET=tu_clave_secreta
AEMET_API_KEY=tu_api_key_aemet
```

## Modelo de Negocio

Hardware as a Service (HaaS) para empresas concesionarias de saneamiento. Coste objetivo <20€/nodo.

- **Cliente:** Aqualia, Hidralia, Emasesa
- **Ventaja:** Bajo coste + foco en obstruccion mecanica en seco
- **Financiacion:** Fondos Next Generation
