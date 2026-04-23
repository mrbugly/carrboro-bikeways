// Basemap layers
var basemapStreets = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Esri" }
);

var basemapSat = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Esri, Maxar" }
);

var basemapTopo = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  { attribution: "OpenTopoMap" }
);

// Add default basemap (matches your original behavior)
basemapStreets.addTo(map);

var currentBasemap = basemapStreets;

function toggleBasemaps() {
  var panel = document.getElementById("basemapPanel");
  var btn = document.getElementById("basemapBtn");

  if (panel.style.display === "none") {
    panel.style.display = "block";
    btn.classList.add("active");
  } else {
    panel.style.display = "none";
    btn.classList.remove("active");
  }
}

function setBasemap(type) {
  map.removeLayer(currentBasemap);

  if (type === "streets") currentBasemap = basemapStreets;
  if (type === "sat") currentBasemap = basemapSat;
  if (type === "topo") currentBasemap = basemapTopo;

  currentBasemap.addTo(map);

  document.getElementById("basemapPanel").style.display = "none";
  document.getElementById("basemapBtn").classList.remove("active");
}
