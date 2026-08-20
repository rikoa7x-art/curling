/* ==========================================================================
   LEO-CURLING (CUKUR KELILING) - MAIN APPLICATION CONTROLLER
   Admin Contact: Bang Leo (WhatsApp: 0877 0069 2352)
   FIX: unique order ID, WA validation, date min, pin validation, form reset,
   ADD: add-on services, real-time price estimate, operating hours notice
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

let currentGenderTab = 'pria';
let selectedAddons = []; // Track selected additional services

function initApp() {
  // 1. Render Catalog
  renderCatalog('pria');

  // 2. Populate Form Options
  populateBarberSelect();

  // 3. Render Add-on Services
  renderAddonServices();

  // 4. Initialize Booking Map
  if (typeof initBookingMap === 'function') {
    initBookingMap();
  }

  // 5. Set minimum date to today (FIX: prevent past-date bookings)
  const dateInput = document.getElementById('inputDate');
  if (dateInput) {
    const todayStr = new Date().toISOString().split('T')[0];
    dateInput.min = todayStr;
    dateInput.value = todayStr; // Default to today
  }

  // 6. Setup Event Listeners
  setupEventListeners();

  // 7. Initial Admin Load
  if (typeof renderAdminDashboard === 'function') {
    renderAdminDashboard();
  }

  // 8. Show operating hours notice
  showOperatingHoursNotice();
}

/**
 * Show operating hours notice in hero or booking section
 */
function showOperatingHoursNotice() {
  const now = new Date();
  const hour = now.getHours();
  const isOpen = hour >= 7 && hour < 18; // 07:00 – 18:00 WIB

  const heroBadge = document.querySelector('.hero-badge');
  if (heroBadge) {
    const statusDot = isOpen
      ? `<span style="display:inline-block;width:8px;height:8px;background:#4ade80;border-radius:50%;margin-right:6px;box-shadow:0 0 6px #4ade80;"></span>`
      : `<span style="display:inline-block;width:8px;height:8px;background:#f87171;border-radius:50%;margin-right:6px;"></span>`;
    const statusText = isOpen ? 'BUKA (07.00–18.00 WIB)' : 'TUTUP (Buka 07.00 WIB)';
    heroBadge.innerHTML = `<i class="fa-solid fa-scissors"></i> LEO-CURLING • ${statusDot}${statusText}`;
  }
}

/**
 * Render Hairstyle Catalog Grid
 */
function renderCatalog(gender) {
  currentGenderTab = gender;
  const grid = document.getElementById('hairstyleGrid');
  if (!grid) return;

  const styles = gender === 'pria' ? MALE_STYLES : FEMALE_STYLES;

  grid.innerHTML = styles.map(item => {
    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price);
    const genderBadge = item.gender === 'pria' ? 'Pria Modern' : 'Wanita Modern';

    return `
      <div class="hairstyle-card">
        <div class="card-img-wrapper">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          <span class="card-badge-gender">${genderBadge}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${item.name}</h3>
          <p class="card-desc">${item.description}</p>
          <div class="card-details">
            <span class="card-price">${formattedPrice}</span>
            <span class="card-time"><i class="fa-regular fa-clock"></i> ${item.duration}</span>
          </div>
          <button class="btn-vintage-outline" onclick="selectStyleForBooking('${item.id}', '${item.name.replace(/'/g, "\\'")}', ${item.price})">
            <i class="fa-solid fa-scissors"></i> Pilih Gaya Ini
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Populate Barber Select dropdown
 */
function populateBarberSelect() {
  const barberSelect = document.getElementById('selectBarber');
  if (!barberSelect) return;

  barberSelect.innerHTML = BARBERS.map(b =>
    `<option value="${b.name}">${b.name} (${b.rating})</option>`
  ).join('');
}

/**
 * Render Add-on Services checkboxes in booking form
 */
function renderAddonServices() {
  const container = document.getElementById('addonServicesContainer');
  if (!container || !ADDITIONAL_SERVICES) return;

  container.innerHTML = ADDITIONAL_SERVICES.map(svc => {
    const price = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(svc.price);
    return `
      <label class="addon-checkbox-label" for="addon_${svc.id}">
        <input
          type="checkbox"
          id="addon_${svc.id}"
          class="addon-checkbox"
          value="${svc.id}"
          onchange="handleAddonChange()"
        >
        <span class="addon-checkbox-custom"></span>
        <span class="addon-name">${svc.name}</span>
        <span class="addon-price">+${price}</span>
      </label>
    `;
  }).join('');
}

/**
 * Handle add-on checkbox change — recalculate price estimate
 */
function handleAddonChange() {
  selectedAddons = [];
  ADDITIONAL_SERVICES.forEach(svc => {
    const cb = document.getElementById(`addon_${svc.id}`);
    if (cb && cb.checked) {
      selectedAddons.push(svc);
    }
  });
  updatePriceEstimate();
}

/**
 * Update real-time price estimate display
 */
function updatePriceEstimate() {
  const basePrice = parseInt(document.getElementById('inputStylePrice').value) || 0;
  const addonTotal = selectedAddons.reduce((sum, s) => sum + s.price, 0);
  const total = basePrice + addonTotal;

  const estimateEl = document.getElementById('priceEstimateBox');
  if (!estimateEl) return;

  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  let breakdown = `<div class="price-row"><span>Gaya Rambut:</span><span>${fmt(basePrice)}</span></div>`;
  selectedAddons.forEach(s => {
    breakdown += `<div class="price-row addon-row"><span>+ ${s.name}:</span><span>${fmt(s.price)}</span></div>`;
  });
  breakdown += `<div class="price-row total-row"><span>Total Estimasi:</span><span>${fmt(total)}</span></div>`;

  estimateEl.innerHTML = breakdown;
  estimateEl.style.display = 'block';
}

/**
 * Handle Tab Switching between Pria & Wanita
 */
function switchGenderTab(gender) {
  const tabPria   = document.getElementById('tabPria');
  const tabWanita = document.getElementById('tabWanita');

  if (gender === 'pria') {
    tabPria.classList.add('active');
    tabWanita.classList.remove('active');
  } else {
    tabWanita.classList.add('active');
    tabPria.classList.remove('active');
  }

  renderCatalog(gender);
}

/**
 * When user clicks "Pilih Gaya Ini" from catalog card
 */
function selectStyleForBooking(styleId, styleName, stylePrice) {
  const styleInput = document.getElementById('inputStyleName');
  const priceInput = document.getElementById('inputStylePrice');

  if (styleInput) styleInput.value = styleName;
  if (priceInput) {
    priceInput.value = stylePrice;
    updatePriceEstimate();
  }

  // Uncheck all add-ons on style change
  selectedAddons = [];
  document.querySelectorAll('.addon-checkbox').forEach(cb => cb.checked = false);
  updatePriceEstimate();

  // Scroll smoothly to booking section
  const bookingSec = document.getElementById('bookingSection');
  if (bookingSec) {
    bookingSec.scrollIntoView({ behavior: 'smooth' });
  }

  showToast(`Gaya "${styleName}" dipilih! Sesuaikan tambahan layanan di bawah.`, 'info');
}

/**
 * Setup event listeners for forms, buttons, geolocation, etc.
 */
function setupEventListeners() {
  // GPS Button
  const btnGps = document.getElementById('btnUseGps');
  if (btnGps) {
    btnGps.addEventListener('click', () => {
      btnGps.disabled = true;
      btnGps.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mendeteksi GPS...';
      locateCurrentGPS(
        (lat, lng) => {
          btnGps.disabled = false;
          btnGps.innerHTML = '<i class="fa-solid fa-crosshairs"></i> Gunakan Lokasi Saya (GPS)';
          showToast('Lokasi GPS berhasil ditemukan!', 'success');
        },
        (err) => {
          btnGps.disabled = false;
          btnGps.innerHTML = '<i class="fa-solid fa-crosshairs"></i> Gunakan Lokasi Saya (GPS)';
          let msg = 'Gagal mendeteksi GPS. Silakan tentukan pin lokasi di peta.';
          if (err && err.code === 1) msg = 'Izin lokasi ditolak. Aktifkan lokasi di pengaturan browser Anda.';
          showToast(msg, 'error');
        }
      );
    });
  }

  // Booking Form Submission
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleBookingSubmission();
    });
  }

  // Real-time price update when style input changes (edge case)
  const stylePrice = document.getElementById('inputStylePrice');
  if (stylePrice) {
    stylePrice.addEventListener('change', updatePriceEstimate);
  }

  // Mode Switcher Buttons (Customer vs Admin)
  const btnModeCustomer = document.getElementById('btnModeCustomer');
  const btnModeAdmin    = document.getElementById('btnModeAdmin');

  if (btnModeCustomer && btnModeAdmin) {
    btnModeCustomer.addEventListener('click', () => switchViewMode('customer'));
    btnModeAdmin.addEventListener('click', () => switchViewMode('admin'));
  }

  // Initialize price estimate display on page load
  updatePriceEstimate();
}

/**
 * Switch view mode between Customer and Barber Team Admin
 */
function switchViewMode(mode) {
  const btnModeCustomer = document.getElementById('btnModeCustomer');
  const btnModeAdmin    = document.getElementById('btnModeAdmin');
  const customerView    = document.getElementById('customerView');
  const adminView       = document.getElementById('adminView');

  if (mode === 'customer') {
    btnModeCustomer.classList.add('active');
    btnModeAdmin.classList.remove('active');
    customerView.classList.remove('hidden');
    adminView.classList.remove('active');
  } else {
    btnModeAdmin.classList.add('active');
    btnModeCustomer.classList.remove('active');
    customerView.classList.add('hidden');
    adminView.classList.add('active');

    // Trigger Admin Map resize & refresh
    if (typeof initAdminMap === 'function') {
      initAdminMap(getOrders());
    }
    if (typeof renderAdminDashboard === 'function') {
      renderAdminDashboard();
    }
  }
}

/**
 * Validate phone number format (Indonesian mobile: 08xx / 628xx, 10-15 digits)
 */
function isValidPhone(phone) {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length < 10 || digits.length > 15) return false;
  return /^(08|628|8)\d{8,12}$/.test(digits);
}

/**
 * Handle new Booking submission
 */
function handleBookingSubmission() {
  const name      = document.getElementById('inputName').value.trim();
  const phone     = document.getElementById('inputPhone').value.trim();
  const address   = document.getElementById('inputAddress').value.trim();
  const lat       = parseFloat(document.getElementById('inputLat').value);
  const lng       = parseFloat(document.getElementById('inputLng').value);
  const notes     = document.getElementById('inputNotes').value.trim();
  const styleName = document.getElementById('inputStyleName').value.trim() || 'Gaya Ksatria Ciung Wanara (Low Taper Fade)';
  const stylePrice = parseInt(document.getElementById('inputStylePrice').value) || 25000;
  const barber    = document.getElementById('selectBarber').value;
  const date      = document.getElementById('inputDate').value;
  const time      = document.getElementById('inputTime').value || '10:00';

  // --- Validation ---
  if (!name) {
    showToast('Mohon isi Nama Lengkap Anda!', 'error');
    document.getElementById('inputName').focus();
    return;
  }

  if (!phone) {
    showToast('Mohon isi Nomor WhatsApp Anda!', 'error');
    document.getElementById('inputPhone').focus();
    return;
  }

  // FIX: Validate WA phone format
  if (!isValidPhone(phone)) {
    showToast('Format nomor WhatsApp tidak valid. Contoh: 081234567890', 'error');
    document.getElementById('inputPhone').focus();
    return;
  }

  if (!address) {
    showToast('Mohon isi Alamat Rumah / Tempat Anda!', 'error');
    document.getElementById('inputAddress').focus();
    return;
  }

  if (!date) {
    showToast('Mohon pilih Tanggal kunjungan!', 'error');
    return;
  }

  // FIX: Validate that pin has been moved from default location
  if (typeof hasUserMovedPin !== 'undefined' && !hasUserMovedPin) {
    showToast('Mohon tentukan titik lokasi Anda di peta (geser pin atau klik peta)!', 'error');
    document.getElementById('bookingSection').scrollIntoView({ behavior: 'smooth' });
    // Highlight map
    const mapWrapper = document.querySelector('.map-container-wrapper');
    if (mapWrapper) {
      mapWrapper.style.boxShadow = '0 0 0 3px #ef4444';
      setTimeout(() => { mapWrapper.style.boxShadow = ''; }, 3000);
    }
    return;
  }

  // FIX: Generate unique ID using timestamp + random suffix
  const orderId = 'LC-' + Date.now().toString(36).toUpperCase().slice(-4) + Math.floor(10 + Math.random() * 90);

  const addonTotal = selectedAddons.reduce((sum, s) => sum + s.price, 0);

  const newOrder = {
    id: orderId,
    customerName: name,
    phone: phone,
    address: address,
    lat: lat || DEFAULT_LAT,
    lng: lng || DEFAULT_LNG,
    notes: notes,
    hairStyle: styleName,
    barber: barber,
    date: date,
    time: time,
    totalPrice: stylePrice + addonTotal,
    addons: selectedAddons.map(a => ({ id: a.id, name: a.name, price: a.price })),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Save to localStorage
  saveNewOrder(newOrder);

  // Show Vintage Receipt Modal
  showReceiptModal(newOrder);

  // FIX: Reset form properly — restore default style name after reset
  document.getElementById('bookingForm').reset();
  const todayStr = new Date().toISOString().split('T')[0];
  document.getElementById('inputDate').value = todayStr;
  document.getElementById('inputDate').min   = todayStr;
  document.getElementById('inputStyleName').value = 'Gaya Ksatria Ciung Wanara (Low Taper Fade)';
  document.getElementById('inputStylePrice').value = '25000';

  // Reset add-ons & price estimate
  selectedAddons = [];
  document.querySelectorAll('.addon-checkbox').forEach(cb => cb.checked = false);
  updatePriceEstimate();

  showToast('✅ Pesanan berhasil! Bang Leo akan segera meluncur ke lokasi Anda.', 'success');
}

/**
 * Display Vintage Struk Receipt Modal
 */
function showReceiptModal(order) {
  const modal = document.getElementById('receiptModal');
  if (!modal) return;

  const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.totalPrice);

  // Build add-on lines for WA message
  const addonLines = (order.addons && order.addons.length > 0)
    ? `\n*Layanan Tambahan:* ${order.addons.map(a => a.name).join(', ')}`
    : '';

  // Format WhatsApp message to Bang Leo
  const waText = encodeURIComponent(
    `Halo Bang Leo (Leo-Curling), saya ingin konfirmasi order cukur keliling!\n\n` +
    `*No Order:* ${order.id}\n` +
    `*Nama:* ${order.customerName}\n` +
    `*No HP:* ${order.phone}\n` +
    `*Alamat:* ${order.address}\n` +
    `*Gaya Rambut:* ${order.hairStyle}${addonLines}\n` +
    `*Total Tarif:* ${formattedPrice}\n` +
    `*Jadwal:* ${order.date} ${order.time} WIB\n` +
    `*Lokasi Maps:* https://www.google.com/maps?q=${order.lat},${order.lng}`
  );

  modal.querySelector('.receipt-order-id').textContent = `ORDER ID: #${order.id}`;
  modal.querySelector('#receiptCustomer').textContent   = order.customerName;
  modal.querySelector('#receiptPhone').textContent      = order.phone;
  modal.querySelector('#receiptAddress').textContent    = order.address;
  modal.querySelector('#receiptStyle').textContent      = order.hairStyle;
  modal.querySelector('#receiptBarber').textContent     = order.barber;
  modal.querySelector('#receiptTime').textContent       = `${order.date} @ ${order.time} WIB`;
  modal.querySelector('#receiptTotal').textContent      = formattedPrice;

  // Show add-on in receipt if any
  const receiptAddonRow = modal.querySelector('#receiptAddonRow');
  if (receiptAddonRow) {
    if (order.addons && order.addons.length > 0) {
      receiptAddonRow.style.display = 'flex';
      modal.querySelector('#receiptAddons').textContent = order.addons.map(a => a.name).join(', ');
    } else {
      receiptAddonRow.style.display = 'none';
    }
  }

  const waBtn = modal.querySelector('#btnWaSend');
  if (waBtn) {
    waBtn.href = `https://wa.me/6287700692352?text=${waText}`;
  }

  modal.classList.add('active');
}

function closeReceiptModal() {
  const modal = document.getElementById('receiptModal');
  if (modal) modal.classList.remove('active');
}

/**
 * Simple Vintage Toast Notification System
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error')   icon = 'fa-circle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 350);
  }, 4500);
}
