
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for status
const getMarkerIcon = (status) => {
    let color = '#00ff00'; // Default OK
    if (status === 'CRITICAL') color = '#ff0000';
    if (status === 'WARNING') color = '#ffff00';

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 10px ${color}, 0 0 20px ${color}; border: 2px solid white;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });
};

const MapController = ({ focusedSensor }) => {
    const map = useMap();

    useEffect(() => {
        if (focusedSensor) {
            map.flyTo([focusedSensor.lat, focusedSensor.lng], 16, {
                duration: 1.5
            });
        }
    }, [focusedSensor, map]);

    return null;
};

const LeafletMap = ({ sensors, focusedSensor, theme = 'dark' }) => {
    // Seville coordinates
    const center = [37.3891, -5.9845];
    const markerRefs = React.useRef({});
    const isLight = theme === 'light';

    useEffect(() => {
        if (focusedSensor) {
            // Add a small delay to ensure the map has loaded and refs are set
            // also waits for the flyTo animation to start
            const timer = setTimeout(() => {
                const marker = markerRefs.current[focusedSensor.id];
                if (marker) {
                    marker.openPopup();
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [focusedSensor]);

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%', background: isLight ? '#e2e8f0' : '#0f172a' }}
            zoomControl={false}
        >
            <MapController focusedSensor={focusedSensor} />

            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url={isLight
                    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                }
            />

            {sensors.map((sensor) => {
                const level = sensor.current_level ?? sensor.level ?? 0;
                const location = sensor.location_name ?? sensor.location ?? 'Desconocida';
                const battery = sensor.battery_level ?? sensor.battery ?? 0;
                const status = sensor.status ?? 'OK';

                return (
                <React.Fragment key={sensor.id}>
                    <Marker
                        position={[sensor.lat, sensor.lng]}
                        icon={getMarkerIcon(status)}
                        ref={el => markerRefs.current[sensor.id] = el}
                    >
                        <Popup className="custom-popup">
                            <div className="p-2 min-w-[150px]">
                                <h3 className="font-bold text-slate-900">{location} (ID: {sensor.id})</h3>
                                <div className="mt-2 text-sm flex flex-col gap-1">
                                    <span className={status === 'CRITICAL' ? 'text-red-600 font-bold' : 'text-slate-700'}>
                                        Estado: {status}
                                    </span>
                                    <span className="text-slate-600">Nivel Agua: {level}%</span>
                                    <span className="text-slate-600">Bateria: {battery}%</span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                </React.Fragment>
                );
            })}
        </MapContainer>
    );
};

export default LeafletMap;
