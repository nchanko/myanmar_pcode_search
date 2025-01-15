// Initialize map centered on Nay Pyi Taw
const map = L.map('map').setView([19.7475, 96.115], 6);

// Add OpenStreetMap layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Custom marker icon
const customIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Store markers layer group
let markersLayer = L.layerGroup().addTo(map);

// Function to add markers from search results
function addMarkers(locations) {
    // Clear existing markers
    markersLayer.clearLayers();
}

// Function to add a single marker
function addSingleMarker(location) {
    markersLayer.clearLayers();
    
    if (location.Latitude && location.Longitude) {
        const marker = L.marker([location.Latitude, location.Longitude], {icon: customIcon})
            .bindPopup(`
                <div style="min-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; color: #2c3e50;">${location.Town_Name_Eng}</h3>
                    <p style="margin: 0 0 5px 0;"><strong>Myanmar Name:</strong> ${location.Town_Name_MMR}</p>
                    <p style="margin: 0 0 5px 0;"><strong>Township:</strong> ${location.Township_Name_Eng}</p>
                    <p style="margin: 0 0 5px 0;"><strong>District:</strong> ${location['District/SAZ_Name_Eng']}</p>
                    <p style="margin: 0;"><strong>State/Region:</strong> ${location.SR_Name_Eng}</p>
                </div>
            `, {
                maxWidth: 300
            });
        markersLayer.addLayer(marker);
        marker.openPopup();
    }
}

// When a search result is clicked, zoom to that location
function zoomToLocation(lat, lng) {
    map.setView([lat, lng], 12);
}
