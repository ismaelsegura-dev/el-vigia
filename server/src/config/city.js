export const CITY_CONFIG = {
  name: process.env.CITY_NAME || 'Sevilla',
  lat: parseFloat(process.env.CITY_LAT) || 37.3891,
  lng: parseFloat(process.env.CITY_LNG) || -5.9845,
  aemetMunicipioId: process.env.AEMET_MUNICIPIO_ID || '41091',
};
