

let map;
const cursorEl = document.getElementById("cursor");
const messageBox = document.getElementById("messageBox");
const infoBox = document.getElementById("infoBox");
const lotSelect = document.getElementById("lotSelect");
const lotSubmit = document.getElementById("lotSubmit");
const dimensionSelection = document.getElementById("dimensionSelection");
const dimensionSubmit = document.getElementById("dimensionSubmit");
const lengthInput = document.getElementById("length");
const breadthInput = document.getElementById("breadth");
let redDots = [];
let totalOverlaps = 0;

function initMap() {
  map = L.map('map', { zoomControl: false }).setView([28.6139, 77.2090], 13);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: '© Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }).addTo(map);
}

function drawPolygon() {
  const polygonCoordinates = [
    [18.156294, 75.827700],
    [18.156204, 75.830797],
    [18.153727, 75.830794],
    [18.153755, 75.827717]
  ];

  const polygon = L.polygon(polygonCoordinates, { color: 'green' }).addTo(map);
  map.fitBounds(polygon.getBounds());
  addGridPoints(polygon);
}

function addGridPoints(polygon) {
  const bounds = polygon.getBounds();
  const latDiff = (bounds.getNorth() - bounds.getSouth()) / 10;
  const lngDiff = (bounds.getEast() - bounds.getWest()) / 10;

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const lat = bounds.getSouth() + latDiff * (i + 0.5);
      const lng = bounds.getWest() + lngDiff * (j + 0.5);

      const redDot = L.circleMarker([lat, lng], {
        radius: 5,
        color: 'yellow',
        fillColor: 'yellow',
        fillOpacity: 1
      }).addTo(map);

      redDot.overlapped = false;
      redDots.push(redDot);
    }
  }
  updateInfoBox();
}

function updateCursor(event) {
  cursorEl.style.top = `${event.clientY}px`;
  cursorEl.style.left = `${event.clientX}px`;
  const cursorLatLng = map.containerPointToLatLng([event.clientX, event.clientY]);
  checkOverlap(cursorLatLng);
}

function checkOverlap(cursorLatLng) {
  let isOverlapping = false;
  let newOverlapCount = 0;

  redDots.forEach(dot => {
    const dotLatLng = dot.getLatLng();
    const distance = cursorLatLng.distanceTo(dotLatLng);

    if (distance <= 1 && !dot.overlapped) {
      dot.setStyle({ color: "green", fillColor: "green" });
      dot.overlapped = true;
      isOverlapping = true;
      newOverlapCount++;
    }
  });

  totalOverlaps += newOverlapCount;
  const remainingOverlaps = redDots.length - totalOverlaps;

  if (isOverlapping) {
    messageBox.textContent = "Overlapped: Plant here";
  } else {
    messageBox.textContent = "Not in the spot, move towards yellow dot to plant.";
  }
  updateInfoBox();
}

function updateInfoBox() {
  const totalRedSpots = redDots.length;
  const totalGreenSpots = totalOverlaps;
  const remainingSpots = totalRedSpots - totalGreenSpots;
  infoBox.innerHTML = `🌍 Total Red Spots: ${totalRedSpots} | ✅ Total Green Spots: ${totalGreenSpots} | 🔴 Remaining: ${remainingSpots}`;
}

lotSubmit.addEventListener("click", () => {
  const selectedLot = lotSelect.value;

  if (selectedLot) {
    document.getElementById("plotSelection").style.display = "none";
    dimensionSelection.style.display = "block";
  } else {
    alert("Please select a valid lot.");
  }
});

dimensionSubmit.addEventListener("click", () => {
  const length = parseInt(lengthInput.value, 10);
  const breadth = parseInt(breadthInput.value, 10);

  if (length > 0 && breadth > 0) {
    document.getElementById("dimensionSelection").style.display = "none";
    initMap();
    drawPolygon();
  } else {
    alert("Please enter valid dimensions.");
  }
});

document.addEventListener("mousemove", updateCursor);
