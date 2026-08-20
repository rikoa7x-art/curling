/* ==========================================================================
   LEO-CURLING (CUKUR KELILING) - MAIN APPLICATION CONTROLLER
   Admin Contact: Bang Leo (WhatsApp: 0877 0069 2352)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

let currentGenderTab = 'pria';

function initApp() {
  // 1. Render Catalog
  renderCatalog('pria');

  // 2. Populate Form Options
  populateBarberSelect();

  // 3. Initialize Booking Map
  if (typeof initBookingMap === 'function') {
    initBookingMap();
  }

  // 4. Setup Event Listeners
  setupEventListeners();

  // 5. Initial Admin Load
  if (typeof renderAdminDashboard === 'function') {
    renderAdminDashboard();
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
          <button class="btn-vintage-outline" onclick="selectStyleForBooking('${item.name}', ${item.price})">
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
 * Handle Tab Switching between Pria & Wanita
 */
function switchGenderTab(gender) {
  const tabPria = document.getElementById('tabPria');
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
function selectStyleForBooking(styleName, stylePrice) {
  const styleInput = document.getElementById('inputStyleName');
  const priceInput = document.getElementById('inputStylePrice');

  if (styleInput) styleInput.value = styleName;
  if (priceInput) priceInput.value = stylePrice;

  // Scroll smoothly to booking section
  const bookingSec = document.getElementById('bookingSection');
  if (bookingSec) {
    bookingSec.scrollIntoView({ behavior: 'smooth' });
  }

  showToast(`Gaya "${styleName}" dipilih untuk pemesanan!`, 'info');
}

/**
 * Setup event listeners for forms, buttons, geolocation, etc.
 */
function setupEventListeners() {
  // GPS Button
  const btnGps = document.getElementById('btnUseGps');
  if (btnGps) {
    btnGps.addEventListener('click', () => {
      btnGps.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mendeteksi GPS...';
      locateCurrentGPS(
        (lat, lng) => {
          btnGps.innerHTML = '<i class="fa-solid fa-crosshairs"></i> Gunakan Lokasi Saya (GPS)';
          showToast('Lokasi GPS berhasil ditemukan!', 'success');
        },
        (err) => {
          btnGps.innerHTML = '<i class="fa-solid fa-crosshairs"></i> Gunakan Lokasi Saya (GPS)';
          showToast('Gagal mendeteksi GPS. Silakan tentukan pin lokasi di peta.', 'error');
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

  // Mode Switcher Buttons (Customer vs Admin)
  const btnModeCustomer = document.getElementById('btnModeCustomer');
  const btnModeAdmin = document.getElementById('btnModeAdmin');

  if (btnModeCustomer && btnModeAdmin) {
    btnModeCustomer.addEventListener('click', () => switchViewMode('customer'));
    btnModeAdmin.addEventListener('click', () => switchViewMode('admin'));
  }
}

/**
 * Switch view mode between Customer and Barber Team Admin
 */
function switchViewMode(mode) {
  const btnModeCustomer = document.getElementById('btnModeCustomer');
  const btnModeAdmin = document.getElementById('btnModeAdmin');
  const customerView = document.getElementById('customerView');
  const adminView = document.getElementById('adminView');

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

    // Trigger Admin Map resize
    if (typeof initAdminMap === 'function') {
      initAdminMap(getOrders());
    }
  }
}

/**
 * Handle new Booking submission
 */
function handleBookingSubmission() {
  const name = document.getElementById('inputName').value.trim();
  const phone = document.getElementById('inputPhone').value.trim();
  const address = document.getElementById('inputAddress').value.trim();
  const lat = parseFloat(document.getElementById('inputLat').value) || DEFAULT_LAT;
  const lng = parseFloat(document.getElementById('inputLng').value) || DEFAULT_LNG;
  const notes = document.getElementById('inputNotes').value.trim();
  const styleName = document.getElementById('inputStyleName').value.trim() || 'Gaya Ksatria Ciung Wanara (Low Taper Fade)';
  const stylePrice = parseInt(document.getElementById('inputStylePrice').value) || 25000;
  const barber = document.getElementById('selectBarber').value;
  const date = document.getElementById('inputDate').value || new Date().toISOString().split('T')[0];
  const time = document.getElementById('inputTime').value || '10:00';

  if (!name || !phone || !address) {
    showToast('Mohon lengkapi Nama, WhatsApp, dan Alamat Anda!', 'error');
    return;
  }

  const orderId = 'LC-' + Math.floor(100 + Math.random() * 900);

  const newOrder = {
    id: orderId,
    customerName: name,
    phone: phone,
    address: address,
    lat: lat,
    lng: lng,
    notes: notes,
    hairStyle: styleName,
    barber: barber,
    date: date,
    time: time,
    totalPrice: stylePrice,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Save to localStorage
  saveNewOrder(newOrder);

  // Show Vintage Receipt Modal
  showReceiptModal(newOrder);

  // Reset Form
  document.getElementById('bookingForm').reset();

  showToast('Pesanan berhasil dibuat! Bang Leo akan segera meluncur ke lokasi Anda.', 'success');
}

/**
 * Display Vintage Struk Receipt Modal
 */
function showReceiptModal(order) {
  const modal = document.getElementById('receiptModal');
  if (!modal) return;

  const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.totalPrice);
  
  // Format WhatsApp message to Bang Leo (087700692352)
  const waText = encodeURIComponent(
    `Halo Bang Leo (Leo-Curling), saya ingin konfirmasi order cukur keliling!\n\n` +
    `*No Order:* ${order.id}\n` +
    `*Nama:* ${order.customerName}\n` +
    `*No HP:* ${order.phone}\n` +
    `*Alamat:* ${order.address}\n` +
    `*Gaya Rambut:* ${order.hairStyle}\n` +
    `*Tarif:* ${formattedPrice}\n` +
    `*Jadwal:* ${order.date} ${order.time} WIB\n` +
    `*Lokasi Maps:* https://www.google.com/maps?q=${order.lat},${order.lng}`
  );

  modal.querySelector('.receipt-order-id').textContent = `ORDER ID: #${order.id}`;
  modal.querySelector('#receiptCustomer').textContent = order.customerName;
  modal.querySelector('#receiptPhone').textContent = order.phone;
  modal.querySelector('#receiptAddress').textContent = order.address;
  modal.querySelector('#receiptStyle').textContent = order.hairStyle;
  modal.querySelector('#receiptBarber').textContent = order.barber;
  modal.querySelector('#receiptTime').textContent = `${order.date} @ ${order.time} WIB`;
  modal.querySelector('#receiptTotal').textContent = formattedPrice;

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
  if (type === 'error') icon = 'fa-circle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
