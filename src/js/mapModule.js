/* ==========================================================================
   LEO-CURLING (CUKUR KELILING) - INTERACTIVE MAP MODULE (LEAFLET.JS)
   Center: Wanayasa & Surrounding Area
   ========================================================================== */

let bookingMap = null;
let bookingMarker = null;
let adminMap = null;
let adminMarkersGroup = null;

// Default Coords: Kecamatan Wanayasa, Purwakarta / West Java (-6.6976, 107.5628)
const DEFAULT_LAT = -6.6976;
const DEFAULT_LNG = 107.5628;

/**
 * Initialize Booking Map for Customer Location Selection
 */
function initBookingMap(onLocationSelectedCallback) {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  // Initialize Leaflet Map
  bookingMap = L.map('map', {
    center: [DEFAULT_LAT, DEFAULT_LNG],
    zoom: 15,
    zoomControl: true
  });

  // Vintage Style Map Tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(bookingMap);

  // Custom Vintage Marker Icon
  const vintageIcon = L.divIcon({
    className: 'custom-vintage-pin',
    html: `
      <div style="
        background: #4a1f18;
        border: 2px solid #d4af37;
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      ">
        <i class="fa-solid fa-scissors" style="
          color: #d4af37;
          transform: rotate(45deg);
          font-size: 16px;
        "></i>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38]
  });

  // Create Draggable Marker
  bookingMarker = L.marker([DEFAULT_LAT, DEFAULT_LNG], {
    icon: vintageIcon,
    draggable: true
  }).addTo(bookingMap);

  // Update Coords Display & Callbacks on Drag End
  bookingMarker.on('dragend', function (e) {
    const coord = e.target.getLatLng();
    updateLocationCoords(coord.lat, coord.lng);
    if (onLocationSelectedCallback) onLocationSelectedCallback(coord.lat, coord.lng);
  });

  // Update Coords Display & Move Marker on Map Click
  bookingMap.on('click', function (e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    bookingMarker.setLatLng([lat, lng]);
    updateLocationCoords(lat, lng);
    if (onLocationSelectedCallback) onLocationSelectedCallback(lat, lng);
  });

  // Set initial inputs
  updateLocationCoords(DEFAULT_LAT, DEFAULT_LNG);
}

/**
 * Update UI text & hidden inputs with selected Lat/Lng
 */
function updateLocationCoords(lat, lng) {
  const latInput = document.getElementById('inputLat');
  const lngInput = document.getElementById('inputLng');
  const coordDisplay = document.getElementById('coordsText');

  if (latInput) latInput.value = lat.toFixed(6);
  if (lngInput) lngInput.value = lng.toFixed(6);
  if (coordDisplay) {
    coordDisplay.innerHTML = `<i class="fa-solid fa-location-dot"></i> Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
  }
}

/**
 * Use Browser Geolocation to pinpoint user's current GPS location
 */
function locateCurrentGPS(successCallback, errorCallback) {
  if (!navigator.geolocation) {
    alert('Browser Anda tidak mendukung fitur lokasi GPS.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      if (bookingMap && bookingMarker) {
        bookingMap.setView([lat, lng], 17);
        bookingMarker.setLatLng([lat, lng]);
        updateLocationCoords(lat, lng);
      }

      if (successCallback) successCallback(lat, lng);
    },
    (err) => {
      console.warn('Geolocation Error:', err.message);
      if (errorCallback) errorCallback(err);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

/**
 * Initialize Admin Portal Map showing all customer orders
 */
function initAdminMap(ordersList) {
  const mapElement = document.getElementById('adminMap');
  if (!mapElement) return;

  if (!adminMap) {
    adminMap = L.map('adminMap', {
      center: [DEFAULT_LAT, DEFAULT_LNG],
      zoom: 14
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(adminMap);

    adminMarkersGroup = L.layerGroup().addTo(adminMap);
  }

  renderAdminMarkers(ordersList);
}

/**
 * Render Markers for all incoming orders on Admin Map
 */
function renderAdminMarkers(ordersList) {
  if (!adminMap || !adminMarkersGroup) return;

  adminMarkersGroup.clearLayers();
  const bounds = [];

  ordersList.forEach(order => {
    if (!order.lat || !order.lng) return;

    let markerColor = '#d97706'; // pending
    if (order.status === 'enroute') markerColor = '#2563eb';
    if (order.status === 'progress') markerColor = '#9333ea';
    if (order.status === 'completed') markerColor = '#16a34a';

    const orderIcon = L.divIcon({
      className: 'admin-order-pin',
      html: `
        <div style="
          background: ${markerColor};
          border: 2px solid #ffffff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.5);
        ">
          <i class="fa-solid fa-user"></i>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const googleMapsUrl = `https://www.google.com/maps?q=${order.lat},${order.lng}`;

    const popupContent = `
      <div style="font-family: sans-serif; padding: 5px; max-width: 220px;">
        <strong style="color: #4a1f18; font-size: 14px;">${order.customerName}</strong><br>
        <small style="color: #666;">${order.phone}</small>
        <hr style="margin: 6px 0; border: none; border-top: 1px dashed #ccc;">
        <div style="font-size: 12px; margin-bottom: 5px;"><strong>Gaya:</strong> ${order.hairStyle}</div>
        <div style="font-size: 11px; color: #444; margin-bottom: 8px;">${order.address}</div>
        <a href="${googleMapsUrl}" target="_blank" style="
          display: inline-block;
          background: #1e3a8a;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          text-decoration: none;
          font-size: 11px;
          font-weight: bold;
        ">
          <i class="fa-solid fa-location-arrow"></i> Navigasi Google Maps
        </a>
      </div>
    `;

    const marker = L.marker([order.lat, order.lng], { icon: orderIcon })
      .bindPopup(popupContent);

    adminMarkersGroup.addLayer(marker);
    bounds.push([order.lat, order.lng]);
  });

  if (bounds.length > 0) {
    adminMap.fitBounds(bounds, { padding: [40, 40] });
  }
}
