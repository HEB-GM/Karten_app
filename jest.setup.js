// jest.setup.js

// Polyfill TextEncoder/TextDecoder:
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// jsdom mit gültiger URL für localStorage:
const { JSDOM } = require('jsdom');
const { window } = new JSDOM(
  `<body>
     <button id="go"></button>
     <input id="start"><datalist id="start-list"></datalist>
     <input id="end"><datalist id="end-list"></datalist>
     <div id="map"></div>
     <ul id="top10"></ul>
   </body>`,
  { url: 'http://localhost' }
);
global.window = window;
global.document = window.document;
global.localStorage = window.localStorage;

// Leaflet-Mock:
global.L = {
  map: () => ({ setView(){}, addLayer(){}, fitBounds(){} }),
  tileLayer: () => ({ addTo(){} }),
  geoJSON: () => ({ addTo(){}, getBounds: () => [[0,0],[1,1]] })
};
