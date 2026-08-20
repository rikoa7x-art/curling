/* ==========================================================================
   VINTAGE BARBER & HOME SERVICE - ADMIN DASHBOARD MODULE
   ========================================================================== */

const STORAGE_KEY = 'VINTAGE_BARBER_ORDERS_V1';

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }
  return orders;
}

/**
 * Render Admin Dashboard Table & Stats
 */
function renderAdminDashboard() {
  const orders = getOrders();
  
  // Render Stats
  const statTotal = document.getElementById('statTotalOrders');
  const statPending = document.getElementById('statPending');
  const statEnroute = document.getElementById('statEnroute');
  const statCompleted = document.getElementById('statCompleted');

  if (statTotal) statTotal.textContent = orders.length;
  if (statPending) statPending.textContent = orders.filter(o => o.status === 'pending').length;
  if (statEnroute) statEnroute.textContent = orders.filter(o => o.status === 'enroute').length;
  if (statCompleted) statCompleted.textContent = orders.filter(o => o.status === 'completed').length;

  // Render Table Rows
  const tableBody = document.getElementById('ordersTableBody');
  if (!tableBody) return;

  if (orders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">
          Belum ada pesanan masuk.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = orders.map(order => {
    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.totalPrice);
    const googleMapsUrl = `https://www.google.com/maps?q=${order.lat},${order.lng}`;

    return `
      <tr>
        <td>
          <strong style="color: var(--accent-gold); font-family: monospace;">${order.id}</strong><br>
          <small style="color: var(--text-muted);">${new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</small>
        </td>
        <td>
          <strong>${order.customerName}</strong><br>
          <a href="https://wa.me/${order.phone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #25d366; text-decoration: none; font-size: 0.85rem;">
            <i class="fa-brands fa-whatsapp"></i> ${order.phone}
          </a>
        </td>
        <td style="max-width: 250px;">
          <div style="font-size: 0.85rem; margin-bottom: 5px;">${order.address}</div>
          <a href="${googleMapsUrl}" target="_blank" class="btn-action-maps">
            <i class="fa-solid fa-location-dot"></i> Peta Navigasi
          </a>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--accent-gold-light);">${order.hairStyle}</div>
          <small style="color: var(--text-muted);">${order.barber}</small>
        </td>
        <td>
          <div>${order.date}</div>
          <small style="color: var(--accent-gold); font-weight: bold;">${order.time} WIB</small>
        </td>
        <td>
          <span class="status-badge ${order.status}">${getStatusLabel(order.status)}</span>
        </td>
        <td>
          <select class="status-select" onchange="handleAdminStatusChange('${order.id}', this.value)">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Menunggu (Pending)</option>
            <option value="enroute" ${order.status === 'enroute' ? 'selected' : ''}>Dalam Perjalanan</option>
            <option value="progress" ${order.status === 'progress' ? 'selected' : ''}>Sedang Dicukur</option>
            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Selesai</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');

  // Also update Admin Map markers!
  if (typeof renderAdminMarkers === 'function') {
    renderAdminMarkers(orders);
  }
}

/**
 * Get readable status text in Indonesian
 */
function getStatusLabel(status) {
  switch (status) {
    case 'pending': return 'Menunggu Tim';
    case 'enroute': return 'Dalam Perjalanan';
    case 'progress': return 'Sedang Dicukur';
    case 'completed': return 'Selesai';
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
    showToast(`Status pesanan ${orderId} diperbarui ke "${getStatusLabel(newStatus)}"`, 'success');
  }
}
