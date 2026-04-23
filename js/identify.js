// Identify tool
var identifyMode = false;

function toggleIdentify() {
  identifyMode = !identifyMode;

  var btn = document.getElementById("infoBtn");
  var mapDiv = document.getElementById("map");

  if (identifyMode) {
    btn.classList.add("active");
    mapDiv.classList.add("info-cursor");
  } else {
    btn.classList.remove("active");
    mapDiv.classList.remove("info-cursor");
    map.closePopup();
  }
}

// Tap-to-identify only when enabled
map.on("click", function (e) {
  if (!identifyMode) return;

  L.esri
    .identifyFeatures({
      url: "https://gis.carrboronc.gov/server/rest/services/SP/BikeSP/MapServer"
    })
    .on(map)
    .at(e.latlng)
    .layers("visible:0,20,30,40,50,60,70,80,90")
    .run(function (error, featureCollection) {
      if (error || !featureCollection || !featureCollection.features.length) {
        return;
      }

      var f = featureCollection.features[0];
      var props = f.properties;
      var layerId = f.layerId;

      var html = "";

      if (layerId === 0) {
        var name = props.Name || "Unnamed";
        var type = props.Type || "N/A";
        var miles = props.Miles ? Number(props.Miles).toFixed(3) : "N/A";
        var bikeFac = props["Bike Facility"] || "N/A";

        html =
          "<b>" + name + "</b><br>" +
          "Type: " + type + "<br>" +
          "Miles: " + miles + "<br>" +
          "Bike Facility: " + bikeFac + "<br>";
      } else {
        html = "<b>Attributes</b><br>";
        for (var key in props) {
          if (props[key] !== null && props[key] !== "" && props[key] !== undefined) {
            html += key + ": " + props[key] + "<br>";
          }
        }
      }

      L.popup()
        .setLatLng(e.latlng)
        .setContent(html)
        .openOn(map);
    });
});
