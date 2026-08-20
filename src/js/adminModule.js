/* ==========================================================================
   LEO-CURLING (CUKUR KELILING) - ADMIN DASHBOARD MODULE
   FIX: WA phone format, delete order, status filter, search, cancelled status
   ========================================================================== */

const STORAGE_KEY = 'VINTAGE_BARBER_ORDERS_V1';

// State: current filter & search in admin view
let adminFilterStatus = 'all';
let adminSearchQuery = '';

/**
 * Get stored orders or initialize default mock data
 */
function getOrders() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_INITIAL_ORDERS));
    return MOCK_INITIAL_ORDERS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return MOCK_INITIAL_ORDERS;
  }
}

/**
 * Save new order into localStorage
 */
function saveNewOrder(newOrder) {
  const orders = getOrders();
  orders.unshift(newOrder); // Put latest order first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  return orders;
}

/**
 * Update order status
 */
function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index].status = newStatus;
    orders[index].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }
  return orders;
}

/**
 * Delete an order by ID
 */
function deleteOrder(orderId) {
  const orders = getOrders();
  const filtered = orders.filter(o => o.id !== orderId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
}

/**
 * Render Admin Dashboard Table & Stats
 */
function renderAdminDashboard() {
  const allOrders = getOrders();

  // Render Stats (always based on ALL orders)
  const statTotal    = document.getElementById('statTotalOrders');
  const statPending  = document.getElementById('statPending');
  const statEnroute  = document.getElementById('statEnroute');
  const statCompleted = document.getElementById('statCompleted');

  if (statTotal)    statTotal.textContent    = allOrders.length;
  if (statPending)  statPending.textContent  = allOrders.filter(o => o.status === 'pending').length;
  if (statEnroute)  statEnroute.textContent  = allOrders.filter(o => o.status === 'enroute' || o.status === 'progress').length;
  if (statCompleted) statCompleted.textContent = allOrders.filter(o => o.status === 'completed').length;

  // Apply filter + search
  let displayOrders = allOrders;
  if (adminFilterStatus !== 'all') {
    displayOrders = displayOrders.filter(o => o.status === adminFilterStatus);
  }
  if (adminSearchQuery.length > 0) {
    const q = adminSearchQuery.toLowerCase();
    displayOrders = displayOrders.filter(o =>
      o.customerName.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.id.toLowerCase().includes(q)
    );
  }

  // Render Filter & Search Bar (only once, or update state values)
  renderAdminFilterBar();

  // Render Table Rows
  const tableBody = document.getElementById('ordersTableBody');
  if (!tableBody) return;

  if (displayOrders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted);">
          <i class="fa-solid fa-inbox" style="font-size:2rem;display:block;margin-bottom:8px;opacity:0.4;"></i>
          ${adminSearchQuery || adminFilterStatus !== 'all' ? 'Tidak ada pesanan sesuai filter.' : 'Belum ada pesanan masuk.'}
        </td>
      </tr>
    `;
  } else {
    tableBody.innerHTML = displayOrders.map(order => renderOrderRow(order)).join('');
  }

  // Also update Admin Map markers
  if (typeof renderAdminMarkers === 'function') {
    renderAdminMarkers(allOrders);
  }
}

/**
 * Render the filter bar once (or update the select value)
 */
function renderAdminFilterBar() {
  const existingBar = document.getElementById('adminFilterBar');
  if (existingBar) {
    // Just sync values
    const sel = document.getElementById('adminStatusFilter');
    const inp = document.getElementById('adminSearchInput');
    if (sel) sel.value = adminFilterStatus;
    if (inp && document.activeElement !== inp) inp.value = adminSearchQuery;
    return;
  }

  // Create the filter bar
  const wrapper = document.querySelector('.orders-table-wrapper');
  if (!wrapper) return;

  const bar = document.createElement('div');
  bar.id = 'adminFilterBar';
  bar.innerHTML = `
    <div class="admin-filter-bar">
      <div class="admin-search-group">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input
          type="text"
          id="adminSearchInput"
          class="admin-search-input"
          placeholder="Cari nama / no HP / ID..."
          value="${adminSearchQuery}"
          oninput="handleAdminSearch(this.value)"
        >
      </div>
      <select id="adminStatusFilter" class="admin-status-filter" onchange="handleAdminFilterChange(this.value)">
        <option value="all">Semua Status</option>
        <option value="pending" ${adminFilterStatus === 'pending' ? 'selected' : ''}>⏳ Pending</option>
        <option value="enroute" ${adminFilterStatus === 'enroute' ? 'selected' : ''}>🛵 Dalam Perjalanan</option>
        <option value="progress" ${adminFilterStatus === 'progress' ? 'selected' : ''}>✂️ Sedang Dicukur</option>
        <option value="completed" ${adminFilterStatus === 'completed' ? 'selected' : ''}>✅ Selesai</option>
        <option value="cancelled" ${adminFilterStatus === 'cancelled' ? 'selected' : ''}>❌ Dibatalkan</option>
      </select>
      <button class="btn-admin-clear-filter" onclick="handleAdminClearFilter()" title="Reset Filter">
        <i class="fa-solid fa-rotate-left"></i> Reset
      </button>
    </div>
  `;
  wrapper.insertBefore(bar, wrapper.firstChild);
}

/**
 * Render a single order table row
 */
function renderOrderRow(order) {
  const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.totalPrice);
  const googleMapsUrl  = `https://www.google.com/maps?q=${order.lat},${order.lng}`;

  // FIX: Properly format WA link for customer phone (0xxx -> 62xxx)
  const waLink = `https://wa.me/${formatPhoneForWA(order.phone)}`;

  const formattedDate = (() => {
    try {
      const d = new Date(order.date + 'T00:00:00');
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return order.date; }
  })();

  const createdTime = (() => {
    try {
      return new Date(order.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch { return '-'; }
  })();

  // Add-on display
  const addonHtml = (order.addons && order.addons.length > 0)
    ? `<div style="font-size:0.75rem;color:#9333ea;margin-top:3px;">+ ${order.addons.map(a => a.name).join(', ')}</div>`
    : '';

  return `
    <tr id="row-${order.id}">
      <td>
        <strong style="color: var(--accent-gold); font-family: monospace;">${order.id}</strong><br>
        <small style="color: var(--text-muted);">${createdTime}</small>
      </td>
      <td>
        <strong>${escapeHtml(order.customerName)}</strong><br>
        <a href="${waLink}" target="_blank" style="color: #25d366; text-decoration: none; font-size: 0.85rem;">
          <i class="fa-brands fa-whatsapp"></i> ${escapeHtml(order.phone)}
        </a>
      </td>
      <td style="max-width: 250px;">
        <div style="font-size: 0.85rem; margin-bottom: 5px; white-space: normal;">${escapeHtml(order.address)}</div>
        ${order.notes ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:5px;font-style:italic;">📌 ${escapeHtml(order.notes)}</div>` : ''}
        <a href="${googleMapsUrl}" target="_blank" class="btn-action-maps">
          <i class="fa-solid fa-location-dot"></i> Peta Navigasi
        </a>
      </td>
      <td>
        <div style="font-weight: 600; color: var(--accent-gold-light); white-space: normal;">${escapeHtml(order.hairStyle)}</div>
        ${addonHtml}
        <small style="color: var(--text-muted);">${escapeHtml(order.barber)}</small><br>
        <strong style="color: var(--accent-gold);">${formattedPrice}</strong>
      </td>
      <td>
        <div>${formattedDate}</div>
        <strong style="color: var(--accent-gold);">${order.time} WIB</strong>
      </td>
      <td>
        <span class="status-badge ${order.status}">${getStatusLabel(order.status)}</span>
      </td>
      <td>
        <select class="status-select" onchange="handleAdminStatusChange('${order.id}', this.value)">
          <option value="pending"    ${order.status === 'pending'    ? 'selected' : ''}>⏳ Pending</option>
          <option value="enroute"   ${order.status === 'enroute'   ? 'selected' : ''}>🛵 Perjalanan</option>
          <option value="progress"  ${order.status === 'progress'  ? 'selected' : ''}>✂️ Dicukur</option>
          <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>✅ Selesai</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>❌ Batal</option>
        </select>
      </td>
      <td>
        <button
          class="btn-delete-order"
          onclick="handleDeleteOrder('${order.id}', '${escapeHtml(order.customerName)}')"
          title="Hapus Pesanan ${order.id}"
        >
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `;
}

/**
 * Get readable status text in Indonesian
 */
function getStatusLabel(status) {
  switch (status) {
    case 'pending':   return 'Menunggu Tim';
    case 'enroute':   return 'Dalam Perjalanan';
    case 'progress':  return 'Sedang Dicukur';
    case 'completed': return 'Selesai ✓';
    case 'cancelled': return 'Dibatalkan';
    default: return status;
  }
}

/**
 * Change status handler called from dropdown
 */
function handleAdminStatusChange(orderId, newStatus) {
  updateOrderStatus(orderId, newStatus);
  renderAdminDashboard();
  if (typeof showToast === 'function') {
    showToast(`Status pesanan ${orderId} diperbarui: "${getStatusLabel(newStatus)}"`, 'success');
  }
}

/**
 * Delete order handler — with inline confirmation
 */
function handleDeleteOrder(orderId, customerName) {
  if (!confirm(`Yakin hapus pesanan ${orderId} (${customerName})?\nTindakan ini tidak bisa dibatalkan.`)) return;
  deleteOrder(orderId);
  renderAdminDashboard();
  if (typeof showToast === 'function') {
    showToast(`Pesanan ${orderId} telah dihapus.`, 'info');
  }
}

/**
 * Filter change handler
 */
function handleAdminFilterChange(status) {
  adminFilterStatus = status;
  renderAdminDashboard();
}

/**
 * Search input handler (debounced)
 */
let _searchDebounce = null;
function handleAdminSearch(query) {
  clearTimeout(_searchDebounce);
  _searchDebounce = setTimeout(() => {
    adminSearchQuery = query.trim();
    renderAdminDashboard();
  }, 300);
}

/**
 * Clear filter and search
 */
function handleAdminClearFilter() {
  adminFilterStatus = 'all';
  adminSearchQuery  = '';
  renderAdminDashboard();
}

/**
 * Escape HTML to prevent XSS in dynamically rendered content
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
