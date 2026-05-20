export const CITY_CONFIG = {
  name: import.meta.env.VITE_CITY_NAME || 'Sevilla',
  lat: parseFloat(import.meta.env.VITE_CITY_LAT) || 37.3891,
  lng: parseFloat(import.meta.env.VITE_CITY_LNG) || -5.9845,
  zoom: parseInt(import.meta.env.VITE_CITY_ZOOM) || 13,
};
