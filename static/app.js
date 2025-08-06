// static/app.js

const L = window.L; // Leaflet global

// ==== Logik-Functions (ohne DOM-Zugriff) ====
async function geocode(address, apiKey) {
  const res = await fetch(
    `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(address)}`
  );
  const data = await res.json();
  const [lng, lat] = data.features[0].geometry.coordinates;
  return [lat, lng];
}

async function calculateRoute(startAddr, endAddr, apiKey) {
  const [sLat, sLng] = await geocode(startAddr, apiKey);
  const [eLat, eLng] = await geocode(endAddr, apiKey);
  const body = { coordinates: [[sLng, sLat], [eLng, eLat]] };
  const res = await fetch(
    `https://api.openrouteservice.org/v2/directions/driving-car`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify(body),
    }
  );
  const json = await res.json();
  return json.features[0].geometry;
}

if (typeof module !== 'undefined') {
  module.exports = { geocode, calculateRoute };
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
        alert('Route konnte nicht berechnet werden: ' + err.message);
      }
    });
  });
}
