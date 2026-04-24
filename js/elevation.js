// Elevation tool
var elevMode = false;
var elevPoints = [];
var elevMarkers = [];
var elevRouteLine = null;
var elevChart = null;

function toggleElevation() {
  elevMode = !elevMode;

  var btn = document.getElementById("elevBtn");
  var panel = document.getElementById("elevPanel");

  if (elevMode) {
	identifyEnabled = false;   // <-- disable identify
    btn.classList.add("active");
    map.getContainer().classList.add("crosshair-cursor");

    panel.style.display = "block";
    panel.innerHTML = `
      <div style="padding:8px; font-weight:bold;">
        Elevation Profile<br>
        <span style="font-weight:normal;">Select points along a route</span>
      </div>
    `;
  } else {
	identifyEnabled = true;    // <-- re-enable identify
    btn.classList.remove("active");
    map.getContainer().classList.remove("crosshair-cursor");

    elevMarkers.forEach(m => map.removeLayer(m));
    elevMarkers = [];

    if (elevRouteLine) map.removeLayer(elevRouteLine);
    elevRouteLine = null;

    elevPoints = [];

    panel.style.display = "none";
    panel.innerHTML = "";

    if (elevChart) elevChart.destroy();
    elevChart = null;
  }
}

map.on("click", function (e) {
  if (!elevMode) return;

  elevPoints.push(e.latlng);

  var marker = L.marker(e.latlng, {
    icon: L.divIcon({
      className: "elev-point",
      html: elevPoints.length,
      iconSize: [18, 18]
    })
  }).addTo(map);

  elevMarkers.push(marker);

  if (elevRouteLine) map.removeLayer(elevRouteLine);
  elevRouteLine = L.polyline(elevPoints, { color: "red", weight: 3 }).addTo(map);

  if (elevPoints.length < 2) return;

  var line = L.polyline(elevPoints);
  var samples = sampleLine(line, 80);

  fetchElevation(samples).then(elevations => {
    var smoothed = smoothElevations(elevations, 5);
    var slopes = computeSlopes(smoothed);
    showElevationChart(smoothed, slopes);
  });
});

// Interpolate a point at a given distance along a polyline
function interpolateAlong(line, distance) {
  var latlngs = line.getLatLngs();
  var accumulated = 0;

  for (var i = 1; i < latlngs.length; i++) {
    var p1 = latlngs[i - 1];
    var p2 = latlngs[i];
    var segment = p1.distanceTo(p2);

    if (accumulated + segment >= distance) {
      var ratio = (distance - accumulated) / segment;
      return L.latLng(
        p1.lat + (p2.lat - p1.lat) * ratio,
        p1.lng + (p2.lng - p1.lng) * ratio
      );
    }

    accumulated += segment;
  }

  return latlngs[latlngs.length - 1];
}

// Sample a polyline into N evenly spaced points
function sampleLine(line, count) {
  var pts = [];
  var latlngs = line.getLatLngs();

  var total = 0;
  for (var i = 1; i < latlngs.length; i++) {
    total += latlngs[i - 1].distanceTo(latlngs[i]);
  }

  for (var i = 0; i < count; i++) {
    var dist = (i / (count - 1)) * total;
    pts.push(interpolateAlong(line, dist));
  }

  return pts;
}

// Fetch elevation from Open-Elevation
async function fetchElevation(points) {
  var locations = points.map(p => ({ latitude: p.lat, longitude: p.lng }));

  var response = await fetch("https://api.open-elevation.com/api/v1/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locations })
  });

  var data = await response.json();
  return data.results.map(r => r.elevation);
}

// Smooth elevation using moving average
function smoothElevations(arr, window) {
  var smoothed = [];
  for (var i = 0; i < arr.length; i++) {
    var start = Math.max(0, i - window);
    var end = Math.min(arr.length - 1, i + window);
    var slice = arr.slice(start, end + 1);
    smoothed.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return smoothed;
}

// Compute slope between points
function computeSlopes(elevations) {
  var slopes = [];
  for (var i = 1; i < elevations.length; i++) {
    var rise = elevations[i] - elevations[i - 1];
    var run = 1;
    slopes.push((rise / run) * 100);
  }
  slopes.unshift(0);
  return slopes;
}

// Display elevation chart
function showElevationChart(elevations, slopes) {
  var panel = document.getElementById("elevPanel");
  panel.style.display = "block";

  var elevFeet = elevations.map(m => m * 3.28084);

  var ascent = 0;
  var descent = 0;

  for (var i = 1; i < elevFeet.length; i++) {
    var diff = elevFeet[i] - elevFeet[i - 1];
    if (diff > 0) ascent += diff;
    else descent += Math.abs(diff);
  }

  var totalChange = ascent + descent;

  panel.innerHTML = `
    <div style="font-weight:bold; margin-bottom:6px;">
      Total ascent: ${ascent.toFixed(0)} ft<br>
      Total descent: ${descent.toFixed(0)} ft<br>
      Total elevation change: ${totalChange.toFixed(0)} ft
    </div>
    <canvas id="elevChart"></canvas>
  `;

  var ctx = document.getElementById("elevChart").getContext("2d");

  if (elevChart) elevChart.destroy();

  var totalSamples = elevations.length;
  var miles = [];
  var totalDist = 0;

  for (var i = 1; i < elevPoints.length; i++) {
    totalDist += elevPoints[i - 1].distanceTo(elevPoints[i]);
  }

  for (var j = 0; j < totalSamples; j++) {
    miles.push(((j / (totalSamples - 1)) * totalDist) / 1609.34);
  }

  var colors = slopes.map(s => {
    if (s > 8) return "red";
    if (s > 4) return "orange";
    if (s > 1) return "yellow";
    return "green";
  });

  elevChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: miles.map(m => m.toFixed(2)),
      datasets: [{
        label: "Elevation (ft)",
        data: elevFeet,
        borderColor: "black",
        pointBackgroundColor: colors,
        pointRadius: 3,
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        x: {
          title: { display: true, text: "Distance (miles)" }
        },
        y: {
          title: { display: true, text: "Elevation (ft)" }
        }
      }
    }
  });
}
