function toggleLegend() {
  var panel = document.getElementById("legend");
  panel.style.display = (panel.style.display === "block") ? "none" : "block";
}

function showTOCHPopup() {
  var popup = document.getElementById("tochNotice");
  if (popup) popup.style.display = "flex";
}

function closeTOCHPopup() {
  var popup = document.getElementById("tochNotice");
  if (popup) popup.style.display = "none";
}

// Fetch real legend from MapServer and use the imageData
const legendDiv = document.getElementById("legend");
const includeLayers = [0,20,30,40,50,60,70,80];
let visible = [0]; // Start with only Bike Facilities (layer 0) visible
let tochTrailsVisible = false; // Off by default for the TOCH Trails service
let jurisVisible = false; // Off by default for the Planning Jurisdiction service
let cityLimitsVisible = false; // Off by default for the Chapel Hill City Limits service

function createLineSwatch(color, width) {
  const swatch = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  swatch.setAttribute("width", "24");
  swatch.setAttribute("height", "14");
  swatch.style.marginRight = "8px";
  swatch.style.verticalAlign = "middle";

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", "2");
  line.setAttribute("y1", "7");
  line.setAttribute("x2", "22");
  line.setAttribute("y2", "7");
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", width);
  line.setAttribute("stroke-linecap", "round");

  swatch.appendChild(line);
  return swatch;
}

fetch("https://gis.carrboronc.gov/server/rest/services/SP/BikeSP/MapServer/legend?f=pjson")
  .then(r => r.json())
  .then(data => {
    legendDiv.innerHTML = "";

    data.layers.forEach(layer => {
      if (!includeLayers.includes(layer.layerId)) return;

      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.marginTop = "10px";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = visible.includes(layer.layerId);
      checkbox.style.marginRight = "6px";

      checkbox.addEventListener("change", function () {
        if (this.checked) {
          if (!visible.includes(layer.layerId)) visible.push(layer.layerId);
        } else {
          visible = visible.filter(id => id !== layer.layerId);
        }
        bikeLayer.setLayers(visible);
      });

      const chevron = document.createElement("span");
      chevron.className = "legend-chevron";
      
      // Create SVG chevron
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("width", "12");
      svg.setAttribute("height", "12");
      svg.style.display = "inline-block";
      svg.style.verticalAlign = "middle";
      
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M 8 4 L 16 12 L 8 20");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "currentColor");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      
      svg.appendChild(path);
      chevron.appendChild(svg);

      const header = document.createElement("div");
      header.className = "legend-header";
      header.textContent = layer.layerName || `Layer ${layer.layerId}`;

      const headerWrapper = document.createElement("div");
      headerWrapper.style.display = "flex";
      headerWrapper.style.alignItems = "center";
      headerWrapper.appendChild(chevron);
      headerWrapper.appendChild(header);

      row.appendChild(checkbox);
      row.appendChild(headerWrapper);
      legendDiv.appendChild(row);

      const content = document.createElement("div");
      content.style.display = "none";
      content.style.marginLeft = "26px";

      layer.legend.forEach(item => {
        const entry = document.createElement("div");
        entry.className = "legend-item";

        const img = document.createElement("img");
        img.src = "data:image/png;base64," + item.imageData;
        img.style.marginRight = "8px";

        const label = document.createElement("span");
        label.textContent = item.label || "(no label)";

        entry.appendChild(img);
        entry.appendChild(label);
        content.appendChild(entry);
      });

      legendDiv.appendChild(content);
      if (layer.layerId === 0) {
        content.style.display = "block";
        chevron.classList.add("expanded");
      }

      headerWrapper.addEventListener("click", () => {
        const isOpen = content.style.display === "block";
        content.style.display = isOpen ? "none" : "block";

        if (isOpen) {
          chevron.classList.remove("expanded");
        } else {
          chevron.classList.add("expanded");
        }
      });
    });

    // Add Planning Jurisdiction layer below Bike Facilities
    const jurisRow = document.createElement("div");
    jurisRow.style.display = "flex";
    jurisRow.style.alignItems = "center";
    jurisRow.style.marginTop = "10px";

    const jurisCheckbox = document.createElement("input");
    jurisCheckbox.type = "checkbox";
    jurisCheckbox.checked = jurisVisible;
    jurisCheckbox.style.marginRight = "6px";

    jurisCheckbox.addEventListener("change", function () {
      jurisVisible = this.checked;
      if (jurisVisible) {
        jurisLayer.addTo(map);
      } else {
        map.removeLayer(jurisLayer);
      }
    });

    const jurisLabel = document.createElement("div");
    jurisLabel.className = "legend-header";
    jurisLabel.textContent = "Planning Jurisdiction";

    jurisRow.appendChild(jurisCheckbox);
    jurisRow.appendChild(jurisLabel);
    legendDiv.appendChild(jurisRow);

    // Add Chapel Hill City Limits layer below Planning Jurisdiction
    const cityLimitsRow = document.createElement("div");
    cityLimitsRow.style.display = "flex";
    cityLimitsRow.style.alignItems = "center";
    cityLimitsRow.style.marginTop = "10px";

    const cityLimitsCheckbox = document.createElement("input");
    cityLimitsCheckbox.type = "checkbox";
    cityLimitsCheckbox.checked = cityLimitsVisible;
    cityLimitsCheckbox.style.marginRight = "6px";

    cityLimitsCheckbox.addEventListener("change", function () {
      cityLimitsVisible = this.checked;
      if (cityLimitsVisible) {
        cityLimitsLayer.addTo(map);
      } else {
        map.removeLayer(cityLimitsLayer);
      }
    });

    const cityLimitsLabel = document.createElement("div");
    cityLimitsLabel.className = "legend-header";
    cityLimitsLabel.textContent = "Chapel Hill City Limits";

    cityLimitsRow.appendChild(cityLimitsCheckbox);
    cityLimitsRow.appendChild(cityLimitsLabel);
    legendDiv.appendChild(cityLimitsRow);

    return fetch("https://services2.arcgis.com/7KRXAKALbBGlCW77/arcgis/rest/services/TOCH_Trails/FeatureServer/0?f=pjson");
  })
  .then(r => r.json())
  .then(trailData => {
    const trailRow = document.createElement("div");
    trailRow.style.display = "flex";
    trailRow.style.alignItems = "center";
    trailRow.style.marginTop = "10px";

    const trailCheckbox = document.createElement("input");
    trailCheckbox.type = "checkbox";
    trailCheckbox.checked = tochTrailsVisible;
    trailCheckbox.style.marginRight = "6px";

    trailCheckbox.addEventListener("change", function () {
      tochTrailsVisible = this.checked;
      if (tochTrailsVisible) {
        tochTrailsLayer.addTo(map);
        showTOCHPopup();
      } else {
        map.removeLayer(tochTrailsLayer);
      }
    });

    const trailLabel = document.createElement("div");
    trailLabel.className = "legend-header";
    trailLabel.textContent = "TOCH Trails";

    trailRow.appendChild(trailCheckbox);
    trailRow.appendChild(trailLabel);
    legendDiv.appendChild(trailRow);

    const trailContent = document.createElement("div");
    trailContent.style.display = "block";
    trailContent.style.marginLeft = "26px";
    trailContent.style.marginTop = "4px";

    const renderer = trailData.drawingInfo && trailData.drawingInfo.renderer;
    const infos = renderer && (renderer.uniqueValueInfos || (renderer.uniqueValueGroups && renderer.uniqueValueGroups[0] && renderer.uniqueValueGroups[0].classes));

    if (infos && infos.length) {
      infos.forEach(info => {
        const entry = document.createElement("div");
        entry.className = "legend-item";

        const symbol = info.symbol;
        const colorArray = symbol && symbol.color;
        const color = colorArray ? `rgba(${colorArray[0]},${colorArray[1]},${colorArray[2]},${colorArray[3] / 255})` : "#1f78b4";
        const width = symbol && symbol.width ? symbol.width + 2 : 4;

        const swatch = createLineSwatch(color, width);
        const label = document.createElement("span");
        label.textContent = info.label || info.value || "Trail type";

        entry.appendChild(swatch);
        entry.appendChild(label);
        trailContent.appendChild(entry);
      });
    } else {
      const noSym = document.createElement("div");
      noSym.textContent = "No legend categories available.";
      noSym.style.fontSize = "12px";
      noSym.style.color = "#555";
      trailContent.appendChild(noSym);
    }

    legendDiv.appendChild(trailContent);
  })
  .then(() => {
    // Set initial layer visibility after legend is built
    bikeLayer.setLayers(visible);
  })
  .catch(err => {
    console.error("Legend fetch error:", err);
  });

