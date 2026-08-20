/* ==========================================================================
   LEO-CURLING (CUKUR KELILING) - INTERACTIVE MAP MODULE (LEAFLET.JS)
   Center: Wanayasa & Surrounding Area
   FIX: invalidateSize, pin-moved tracking, GPS high accuracy
   ========================================================================== */

let bookingMap = null;
let bookingMarker = null;
let adminMap = null;
let adminMarkersGroup = null;

// Default Coords: Kecamatan Wanayasa, Purwakarta / West Java (-6.6976, 107.5628)
const DEFAULT_LAT = -6.6976;
const DEFAULT_LNG = 107.5628;

// FIX: Track whether user has intentionally moved the pin from the default location
let hasUserMovedPin = false;

/**
 * Initialize Booking Map for Customer Location Selection
 */
function initBookingMap(onLocationSelectedCallback) {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  // Destroy existing map instance if any (prevents double-init issues)
  if (bookingMap) {
    bookingMap.remove();
    bookingMap = null;
    bookingMarker = null;
    hasUserMovedPin = false;
  }

  // Initialize Leaflet Map
  bookingMap = L.map('map', {
    center: [DEFAULT_LAT, DEFAULT_LNG],
    zoom: 15,
    zoomControl: true
  });

  // Vintage Style Map Tiles (CartoDB Voyager)
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

  // Add a pulsing circle to indicate the default center area
  const defaultCircle = L.circle([DEFAULT_LAT, DEFAULT_LNG], {
    color: 'rgba(212, 175, 55, 0.6)',
    fillColor: 'rgba(212, 175, 55, 0.1)',
    fillOpacity: 0.4,
    radius: 300,
    weight: 1,
    dashArray: '6 4'
  }).addTo(bookingMap);

  // Update Coords Display & Callbacks on Drag End
  bookingMarker.on('dragend', function (e) {
    const coord = e.target.getLatLng();
    hasUserMovedPin = true;
    defaultCircle.remove(); // Remove hint circle once user interacts
    updateLocationCoords(coord.lat, coord.lng);
    if (onLocationSelectedCallback) onLocationSelectedCallback(coord.lat, coord.lng);
  });

  // Update Coords Display & Move Marker on Map Click
  bookingMap.on('click', function (e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    bookingMarker.setLatLng([lat, lng]);
    hasUserMovedPin = true;
    defaultCircle.remove();
    updateLocationCoords(lat, lng);
    if (onLocationSelectedCallback) onLocationSelectedCallback(lat, lng);
  });

  // Set initial inputs (keep at default until user moves)
  updateLocationCoords(DEFAULT_LAT, DEFAULT_LNG);

  // FIX: Force Leaflet to recalculate map size after render
  // This fixes the blank map issue when the container was hidden on init
  setTimeout(() => {
    if (bookingMap) {
      bookingMap.invalidateSize();
    }
  }, 200);
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
    if (hasUserMovedPin) {
      coordDisplay.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#16a34a;"></i> Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
    } else {
      coordDisplay.innerHTML = `<i class="fa-solid fa-location-dot"></i> Geser pin atau klik peta titik tempat Anda`;
    }
  }
}

/**
 * Use Browser Geolocation to pinpoint user's current GPS location
 */
function locateCurrentGPS(successCallback, errorCallback) {
  if (!navigator.geolocation) {
    if (typeof showToast === 'function') {
      showToast('Browser Anda tidak mendukung fitur lokasi GPS.', 'error');
    }
    if (errorCallback) errorCallback(new Error('Geolocation not supported'));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      if (bookingMap && bookingMarker) {
        bookingMap.setView([lat, lng], 17);
        bookingMarker.setLatLng([lat, lng]);
        hasUserMovedPin = true;
        updateLocationCoords(lat, lng);
      }

      if (successCallback) successCallback(lat, lng);
    },
    (err) => {
      console.warn('Geolocation Error:', err.message);
      if (errorCallback) errorCallback(err);
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
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
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19
    }).addTo(adminMap);

    adminMarkersGroup = L.layerGroup().addTo(adminMap);
  }

  // FIX: Force re-render in case admin panel was hidden on init
  setTimeout(() => {
    if (adminMap) adminMap.invalidateSize();
  }, 250);

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
    if (order.status === 'completed' || order.status === 'cancelled') return; // Skip done orders

    let markerColor = '#d97706'; // pending
    let markerIcon = 'fa-clock';
    if (order.status === 'enroute') { markerColor = '#2563eb'; markerIcon = 'fa-motorcycle'; }
    if (order.status === 'progress') { markerColor = '#9333ea'; markerIcon = 'fa-scissors'; }

    const orderIcon = L.divIcon({
      className: 'admin-order-pin',
      html: `
        <div style="
          background: ${markerColor};
          border: 2px solid #ffffff;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 13px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.5);
        ">
          <i class="fa-solid ${markerIcon}"></i>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const googleMapsUrl = `https://www.google.com/maps?q=${order.lat},${order.lng}`;
    const waLink = `https://wa.me/${formatPhoneForWA(order.phone)}`;

    const popupContent = `
      <div style="font-family: sans-serif; padding: 5px; max-width: 240px;">
        <strong style="color: #4a1f18; font-size: 14px;">${order.customerName}</strong><br>
        <small style="color: #666;">${order.phone}</small>
        <hr style="margin: 6px 0; border: none; border-top: 1px dashed #ccc;">
        <div style="font-size: 12px; margin-bottom: 3px;"><strong>Gaya:</strong> ${order.hairStyle}</div>
        <div style="font-size: 11px; color: #444; margin-bottom: 8px;">${order.address}</div>
        <div style="display:flex; gap:6px;">
          <a href="${googleMapsUrl}" target="_blank" style="
            flex:1; background: #1e3a8a; color: white; padding: 6px 8px;
            border-radius: 4px; text-decoration: none; font-size: 11px;
            font-weight: bold; text-align: center;
          "><i class="fa-solid fa-location-arrow"></i> Navigasi</a>
          <a href="${waLink}" target="_blank" style="
            flex:1; background: #16a34a; color: white; padding: 6px 8px;
            border-radius: 4px; text-decoration: none; font-size: 11px;
            font-weight: bold; text-align: center;
          "><i class="fa-brands fa-whatsapp"></i> WA</a>
        </div>
      </div>
    `;

    const marker = L.marker([order.lat, order.lng], { icon: orderIcon })
      .bindPopup(popupContent);

    adminMarkersGroup.addLayer(marker);
    bounds.push([order.lat, order.lng]);
  });

  if (bounds.length > 0) {
    adminMap.fitBounds(bounds, { padding: [50, 50] });
  } else {
    adminMap.setView([DEFAULT_LAT, DEFAULT_LNG], 14);
  }
}

/**
 * Helper: Format phone number for WhatsApp link (0xxx -> 62xxx)
 */
function formatPhoneForWA(phone) {
  let digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1);
  } else if (!digits.startsWith('62')) {
    digits = '62' + digits;
  }
  return digits;
}
