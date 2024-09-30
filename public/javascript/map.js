
 let MAP_URL = mapToken;

  // Create the map 

  const map = L.map('map').setView([listing.geometry.coordinates[1], listing.geometry.coordinates[0]], 9); // [lat, lng] // [lat, lng] and zoom level

  //  Add OpenStreetMap tiles 

  L.tileLayer(MAP_URL, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  

// Create a custom red marker icon using SVG
const redMarkerIcon = L.divIcon({
    className: 'custom-marker',
    html: `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="39" viewBox="0 0 24 36">
            <!-- Red teardrop shape -->
            <path fill="#C00000" d="M12 0C6.48 0 2 4.48 2 10c0 3.72 3.42 9.27 10 15.35C18.58 19.27 22 13.72 22 10c0-5.52-4.48-10-10-10z"/>
            <!-- White circle in the center -->
            <circle cx="12" cy="10" r="4" fill="white"/>
        </svg>
    `,
    iconSize: [18, 30],  // Size of the icon
    iconAnchor: [12, 36], // Anchor point of the icon
});

// Create a marker using the custom red icon
const marker = L.marker([listing.geometry. coordinates[1], listing.geometry.coordinates[0]], { icon: redMarkerIcon }) // [lat, lng]
.bindPopup(`<h3>${listing.title}</h3>
    Exact location will be Provided after Booking`)
    .addTo(map)
