// Geolocation
function locateUser() {
  map.locate({ setView: true, maxZoom: 17 });

  map.on("locationfound", function(e) {
    L.circleMarker(e.latlng, {
      radius: 8,
      color: "#007ac2",
      fillColor: "#007ac2",
      fillOpacity: 0.8
    }).addTo(map);
  });

  map.on("locationerror", function() {
    alert("Unable to access your location");
  });
}
