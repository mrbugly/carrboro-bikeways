

var identifyEnabled = true;

// Initialize map
var map = L.map('map').setView([35.9106, -79.0755], 14);

// Base Carto basemap (as in your original file)
var basemap = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }
).addTo(map);

// ESRI Dynamic Map Layer
var bikeLayer = L.esri.dynamicMapLayer({
  url: "https://gis.carrboronc.gov/server/rest/services/SP/BikeSP/MapServer",
  layers: [0,20,30,40,50,60,70,80],
  opacity: 1
}).addTo(map);

// Layer control
// L.control.layers(null, { "Bike Facilities": bikeLayer }, { collapsed: true }).addTo(map);

// Print function
function printMap() {
  window.print();
}

function closeSplash() {
  document.getElementById("splashScreen").style.display = "none";
}

function openSplash() {
  document.getElementById("splashScreen").style.display = "flex";
}
