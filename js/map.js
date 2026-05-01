

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
  layers: [0], // Start with only Bike Facilities visible
  opacity: 1
}).addTo(map);

// TOCH Trails feature service (off by default)
var tochTrailStyles = {
  "Bike Lane": { color: "#38A800", weight: 3, opacity: 0.8 },
  "Paved Greenway": { color: "#98E600", weight: 3, opacity: 0.8 },
  "Sharrows": { color: "#F5CA7A", weight: 3, opacity: 0.8 },
  "Unpaved Greenway": { color: "#734C00", weight: 3, opacity: 0.8 }
};

var tochTrailsLayer = L.esri.featureLayer({
  url: "https://services2.arcgis.com/7KRXAKALbBGlCW77/arcgis/rest/services/TOCH_Trails/FeatureServer/0",
  style: function (feature) {
    var type = feature.properties && feature.properties.FeatureTyp;
    return tochTrailStyles[type] || { color: "#1f78b4", weight: 3, opacity: 0.8 };
  }
});

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
