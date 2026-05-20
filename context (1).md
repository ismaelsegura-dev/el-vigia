# El Vigía del Imbornal — Project Context

> Este archivo es el punto de entrada para la IA programadora. Contiene todo el contexto necesario para continuar el desarrollo del proyecto sin historial previo.

---

## 1. ¿Qué es este proyecto?

**El Vigía del Imbornal** es un sistema IoT + IA de bajo coste para monitorizar en tiempo real el nivel de suciedad/obstrucción de imbornales (alcantarillas pluviales) en entornos urbanos. El objetivo es **predecir riesgos de inundación** antes de que ocurran y **optimizar las rutas de limpieza** de los camiones de saneamiento.

---

## 2. El Problema que Resuelve

Las inundaciones repentinas en episodios de lluvia intensa (DANA, gota fría) no se producen únicamente por exceso de agua, sino porque los imbornales están **taponados por hojas, plástico y tierra acumulada en seco** durante los meses previos. El modelo actual de mantenimiento es ineficiente: los camiones limpian rutas fijas predefinidas, limpiando imbornales que ya están limpios e ignorando los que están críticos.

---

## 3. La Solución

### 3.1 Hardware (por nodo/imbornal)
- **Microcontrolador:** ESP32
- **Comunicación:** LoRaWAN (sin tarjeta SIM, usando The Things Network u otras redes LoRa municipales)
- **Sensor principal:** Ultrasonidos o LiDAR de bajo coste (mide distancia al fondo → nivel de acumulación)
- **Sensor secundario:** Humedad
- **Alimentación:** Batería de larga duración (objetivo: 3-5 años)
- **Carcasa:** IP68 (sumergible/resistente a entorno hostil)
- **Posición:** Colgado bajo la rejilla del imbornal
- **Firmware:** C++ (código en `/security` o dentro de `/src` del repo)
- **Coste objetivo de materiales:** <20€/nodo

### 3.2 Software / IA
- El sistema **no solo lee el nivel**; cruza los datos del sensor con:
  - Previsión meteorológica de la **AEMET** (API pública)
  - Histórico de datos de cada imbornal
- La IA genera **alertas anticipadas** (ej: "en 48h lloverá, estos 50 imbornales están críticos")
- La IA genera **rutas optimizadas** para los camiones de limpieza (solo los nodos críticos, ignorando los que están bien)

---

## 4. Modelo de Negocio

- **Cliente objetivo (B2B):** Empresas concesionarias de saneamiento y agua (ej: Aqualia, Hidralia, Emasesa). Se evita vender directamente a ayuntamientos para esquivar burocracia y licitaciones.
- **Modelo:** Hardware as a Service (HaaS) — instalación incluida, cobro mensual por punto de control.
- **Propuesta de valor:** Ahorro en operativa de limpieza (menos camiones, rutas más eficientes) + reducción de riesgo reputacional por inundaciones.
- **Precio hardware objetivo:** <50€/nodo (margen suficiente para el modelo HaaS).

---

## 5. Stack Tecnológico (Software)

### Frontend / Dashboard
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.x | Framework principal |
| Vite | 7.x | Bundler / dev server |
| Tailwind CSS | 3.x | Estilos |
| Leaflet + react-leaflet | 1.9 / 5.0 | Mapa interactivo de nodos |
| Recharts | 3.x | Gráficas de datos de sensores |
| Framer Motion | 12.x | Animaciones UI |
| lucide-react | 0.56x | Iconografía |
| clsx + tailwind-merge | — | Gestión de clases CSS |

### Backend / Base de Datos
- **PLpgSQL** presente en el repo → PostgreSQL con lógica de negocio en stored procedures
- Estado actual: **mock data** (datos simulados en el frontend, sin backend real conectado)

### Firmware
- **C++** (Arduino/ESP32) — presente en el repo

### Estructura de carpetas (repo)
```
el-vigia/
├── public/          # Assets estáticos
├── security/        # (posiblemente firmware o certificados)
├── src/             # Código fuente React
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 6. Estado Actual del Proyecto

| Componente | Estado |
|---|---|
| Dashboard React (frontend) | ✅ Beta con mock data |
| Mapa de nodos (Leaflet) | ✅ Implementado (con datos simulados) |
| Gráficas de sensores (Recharts) | ✅ Implementado (con datos simulados) |
| Backend / API real | ❌ No implementado |
| Integración AEMET | ❌ No implementada |
| Lógica de IA / rutas optimizadas | ❌ No implementada |
| Firmware ESP32 | 🔄 En desarrollo / parcial |
| Base de datos PostgreSQL | 🔄 Esquema parcial (PLpgSQL presente) |
| Conexión LoRaWAN → Backend | ❌ No implementada |

---

## 7. Objetivo Inmediato

Desarrollar un **MVP funcional presentable** (versión beta demo) que incluya como mínimo:
1. Backend con API real (conectada al dashboard)
2. Integración con AEMET para datos meteorológicos reales
3. Lógica básica de priorización de imbornales (algoritmo de scoring)
4. Persistencia de datos en PostgreSQL
5. Simulador de nodos IoT (para demo sin hardware físico)

---

## 8. Repositorio

- **GitHub:** https://github.com/ismaelsegura-dev/el-vigia
- **Rama principal:** `master`
- **Lenguajes:** JavaScript 84.6% · C++ 5.3% · TypeScript 4.5% · PLpgSQL 2.9% · CSS 2.2% · HTML 0.5%

---

## 9. Contexto de Negocio Adicional

- **Competencia directa:** Libelium, Lacroix, Xylem (soluciones caras, >500€/nodo). La ventaja competitiva es el **bajo coste** y el foco en **obstrucción mecánica en seco** (no caudal ni calidad de agua).
- **Competencia real a batir:** La inacción — la mayoría de ayuntamientos usan Excel y esperan llamadas de vecinos.
- **Oportunidades de financiación:** Fondos Europeos Next Generation (digitalización del ciclo del agua).
- **Riesgos principales:** Vandalismo (mitigado con carcasa IP68), conectividad subterránea (mitigado con diseño de antena), lentitud burocrática (mitigado vendiendo a concesionarias).

---

*Generado el 20/05/2026. Actualizar este archivo conforme avance el desarrollo.*
