// static/app.js

const L = window.L; // Leaflet global

// ==== Logik-Functions (ohne DOM-Zugriff) ====
class AppError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

async function geocode(address, apiKey) {
  let res;
  try {
    res = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(address)}`
    );
  } catch (err) {
    throw new AppError('GEOCODE_FETCH', err.message);
  }
  if (!res.ok) {
    throw new AppError(`GEOCODE_HTTP_${res.status}`, `HTTP ${res.status}`);
  }
  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new AppError('GEOCODE_JSON', 'Invalid JSON');
  }
  if (!data.features || !data.features.length) {
    throw new AppError('GEOCODE_NO_RESULTS', 'No results');
  }
  const [lng, lat] = data.features[0].geometry.coordinates;
  return [lat, lng];
}

async function calculateRoute(startAddr, endAddr, apiKey) {
  let sLat, sLng, eLat, eLng;
  try {
    [sLat, sLng] = await geocode(startAddr, apiKey);
  } catch (err) {
    err.code = err.code || 'START_GEOCODE';
    throw err;
  }
  try {
    [eLat, eLng] = await geocode(endAddr, apiKey);
  } catch (err) {
    err.code = err.code || 'END_GEOCODE';
    throw err;
  }
  const body = { coordinates: [[sLng, sLat], [eLng, eLat]] };
  let res;
  try {
    res = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new AppError('ROUTE_FETCH', err.message);
  }
  if (!res.ok) {
    throw new AppError(`ROUTE_HTTP_${res.status}`, `HTTP ${res.status}`);
  }
  let json;
  try {
    json = await res.json();
  } catch (err) {
    throw new AppError('ROUTE_JSON', 'Invalid JSON');
  }
  if (!json.features || !json.features[0]) {
    throw new AppError('ROUTE_NO_GEOM', 'No geometry');
  }
  return json.features[0].geometry;
}

if (typeof module !== 'undefined') {
  module.exports = { geocode, calculateRoute, AppError };
}

// ==== Browser-Init (Leaflet + DOM events) ====
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const apiKey  = (typeof window !== 'undefined' && window.orsKey) || (typeof process !== 'undefined' && process.env.ORS_API_KEY) || '';
    const map     = L.map('map').setView([47.3769, 8.5417], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const startEl  = document.getElementById('start');
    const endEl    = document.getElementById('end');
    const goBtn    = document.getElementById('go');

    goBtn.addEventListener('click', async () => {
      const start = startEl.value.trim();
      const end   = endEl.value.trim();
      if (!start || !end) {
        alert('Bitte Start und Ziel eingeben.');
        return;
      }
      try {
        const routeGeom = await calculateRoute(start, end, apiKey);
        const layer     = L.geoJSON(routeGeom);
        layer.addTo(map);
        map.fitBounds(layer.getBounds());
      } catch (err) {
        const code = err.code ? ` [${err.code}]` : '';
        alert('Route konnte nicht berechnet werden' + code + ': ' + err.message);
      }
    });
  });
}
