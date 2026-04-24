// Measure tool
var measuring = false;
var measureLine = null;
var measurePoints = [];
var measureMarkers = [];

function toggleMeasure() {
  measuring = !measuring;

  var btn = document.getElementById("measureBtn");

  if (measuring) {
    identifyEnabled = false;   // <-- disable identify
    btn.classList.add("active");
    map.getContainer().classList.add("crosshair-cursor");
  } else {
    identifyEnabled = true;    // <-- re-enable identify
    btn.classList.remove("active");
    map.getContainer().classList.remove("crosshair-cursor");

    if (measureLine) map.removeLayer(measureLine);
    measureLine = null;

    measureMarkers.forEach(m => map.removeLayer(m));
    measureMarkers = [];

    measurePoints = [];
    map.closePopup();
  }
}


map.on("click", function (e) {
  if (!measuring) return;

  measurePoints.push(e.latlng);

  var marker = L.marker(e.latlng, {
    icon: L.divIcon({
      className: "measure-point",
      iconSize: [10, 10]
    })
  }).addTo(map);

  measureMarkers.push(marker);

  if (measurePoints.length > 1) {
    if (measureLine) map.removeLayer(measureLine);

    measureLine = L.polyline(measurePoints, {
      color: "red",
      weight: 3
    }).addTo(map);

    var total = 0;
    for (var i = 1; i < measurePoints.length; i++) {
      total += measurePoints[i - 1].distanceTo(measurePoints[i]);
    }

    var meters = total.toFixed(1);
    var miles = (total / 1609.34).toFixed(2);

    L.popup({ offset: [0, -10] })
      .setLatLng(e.latlng)
      .setContent(
        "<b>Distance</b><br>" +
        meters + " m<br>" +
        miles + " mi"
      )
      .openOn(map);
  }
});
