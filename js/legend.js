function toggleLegend() {
  var panel = document.getElementById("legend");
  panel.style.display = (panel.style.display === "block") ? "none" : "block";
}

// Fetch real legend from MapServer and use the imageData
fetch("https://gis.carrboronc.gov/server/rest/services/SP/BikeSP/MapServer/legend?f=pjson")
  .then(r => r.json())
  .then(data => {
    var legendDiv = document.getElementById("legend");
    legendDiv.innerHTML = "";

    const includeLayers = [0,20,30,40,50,60,70,80];
    let visible = [0]; // Start with only Bike Facilities (layer 0) visible

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
// --- Auto-expand Bike Facilities (layer 0) ---
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
  })
  .then(() => {
    // Set initial layer visibility after legend is built
    bikeLayer.setLayers(visible);
  });

