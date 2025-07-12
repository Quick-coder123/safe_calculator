// client.js
const info = document.getElementById('client-info');
// Отримуємо id з URL
function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchClient(id) {
  const res = await fetch(`/api/clients?id=${encodeURIComponent(id)}`);
  const data = await res.json();
  return data && data.length ? data[0] : null;
}

let currentClient = null;
let editMode = false;

async function renderClient() {
  const id = getIdFromUrl();
  if (!id) return;
  const c = await fetchClient(id);
  if (!c) return;
  currentClient = JSON.parse(JSON.stringify(c));
  
  // Update new profile display if elements exist
  const nameDisplay = document.getElementById('client-name-display');
  const contactDisplay = document.getElementById('client-contact-display');
  
  if (nameDisplay && contactDisplay) {
    displayClient(currentClient);
  } else {
    // Fallback to old rendering method
    renderClientForm();
  }
  
  renderSafes();
}

function renderClientForm() {
  const form = document.getElementById('client-form');
  form.innerHTML = `
    <div class="form-group"><label>ПІБ<input type="text" name="name" value="${currentClient.name}" readonly required></label></div>
    <div class="form-group"><label>ІПН<input type="text" name="ipn" value="${currentClient.ipn}" readonly required></label></div>
    <div class="form-group"><label>IBAN<input type="text" name="iban" value="${currentClient.iban||''}" ${editMode?'':'readonly'} required></label></div>
    <div class="form-group"><label>Email<input type="email" name="email" value="${currentClient.email||''}" ${editMode?'':'readonly'} required></label></div>
    <div class="form-group"><label>Телефон<input type="tel" name="phone" value="${currentClient.phone||''}" ${editMode?'':'readonly'} required></label></div>
    <div style="display:${editMode ? 'flex' : 'none'};gap:10px;margin-top:8px;flex-wrap:wrap;" class="button-row">
      <button id="save-client-btn" type="submit" class="action-btn">Зберегти зміни</button>
      <button id="add-safe-btn" type="button" class="action-btn secondary">Додати сейф</button>
    </div>
  `;
  
  // Додаємо обробник події для кнопки "Додати сейф" після рендерингу
  if (editMode) {
    const addSafeBtn = document.getElementById('add-safe-btn');
    if (addSafeBtn) {
      addSafeBtn.onclick = function() {
        if (!editMode) return;
        // Показати форму додавання сейфу з вибором категорії
        const box = document.getElementById('safes-section');
        const formDiv = document.createElement('div');
        formDiv.className = 'client-box';
        formDiv.innerHTML = `
          <form id="add-safe-form">
            <div class="form-group"><label>№ сейфу<input type="text" name="safeNumber" required></label></div>
            <div class="form-group"><label>Категорія
              <select name="category" required>
                <option value="1">1 категорія</option>
                <option value="2">2 категорія</option>
                <option value="3">3 категорія</option>
                <option value="4">4 категорія</option>
                <option value="5">5 категорія</option>
              </select>
            </label></div>
            <div class="form-group"><label>Дата закінчення<input type="date" name="endDate" required></label></div>
            <div class="form-group"><label>Тип покриття
              <select name="coverage" required>
                <option value="Страховка">Страховка</option>
                <option value="Грошове покриття">Грошове покриття</option>
              </select>
            </label></div>
            <div class="button-row" style="margin-top:8px;">
              <button type="submit" class="action-btn">Додати сейф</button>
              <button type="button" class="action-btn secondary" id="cancel-add-safe">Скасувати</button>
            </div>
          </form>
        `;
        box.prepend(formDiv);
        addSafeBtn.disabled = true;
        formDiv.querySelector('#cancel-add-safe').onclick = function() {
          formDiv.remove();
          addSafeBtn.disabled = false;
        };
        formDiv.querySelector('#add-safe-form').onsubmit = function(e) {
          e.preventDefault();
          const fd = new FormData(this);
          const safe = {
            safeNumber: fd.get('safeNumber'),
            category: fd.get('category'),
            endDate: fd.get('endDate'),
            coverage: fd.get('coverage'),
          };
          currentClient.safes = currentClient.safes || [];
          currentClient.safes.push(safe);
          formDiv.remove();
          addSafeBtn.disabled = false;
          renderSafes();
        };
      };
    }
  }
}

function renderSafes() {
  // Check if new table structure exists
  const newSafesTable = document.getElementById('safes-list');
  if (newSafesTable) {
    renderSafesNewFormat();
    return;
  }
  
  // Fallback to old format
  const box = document.getElementById('safes-section');
  if (!box) return;
  
  box.innerHTML = '';
  
  // Перевіряємо, чи потрібно підсвітити конкретний сейф
  const highlightData = localStorage.getItem('highlightSafe');
  let highlightSafeIndex = -1;
  if (highlightData) {
    try {
      const parsed = JSON.parse(highlightData);
      if (parsed.clientId === currentClient?.id) {
        highlightSafeIndex = parsed.safeIndex;
        localStorage.removeItem('highlightSafe'); // Використовуємо тільки один раз
      }
    } catch (e) {
      console.error('Помилка парсингу highlightSafe:', e);
    }
  }
  
  (currentClient.safes||[]).forEach((s, idx) => {
    const div = document.createElement('div');
    div.className = 'client-box';
    
    // Додаємо підсвічування для вибраного сейфу
    if (idx === highlightSafeIndex) {
      div.className += ' highlighted-safe';
      setTimeout(() => {
        div.classList.remove('highlighted-safe');
      }, 3000); // Прибираємо підсвічування через 3 секунди
    }
    
    // Замінюємо старі значення "Депозит" на "Грошове покриття" для відображення
    const coverageDisplay = s.coverage === 'Депозит' ? 'Грошове покриття' : (s.coverage || '-');
    div.innerHTML = `
      <b>Сейф №${s.safeNumber || '-'} (${s.category ? s.category + ' категорія' : '-'})</b><br>
      <span><b>Дата закінчення:</b> <input type="date" value="${s.endDate||''}" ${editMode?'':'readonly'} onchange="window.updateSafeDate(${idx},this.value)" ${s.safeNumber? '':'disabled'}></span><br>
      <span><b>Покриття:</b> ${coverageDisplay}</span><br>
      <div class="button-row" style="margin-top:8px;">
        <button class="action-btn" type="button" onclick="window.calculateSafe(${idx})" style="font-size:0.9em;">Прорахувати</button>
        <button class="action-btn danger" type="button" onclick="window.deleteSafe(${idx})" style="${editMode?'':'display:none;'}">Видалити</button>
      </div>
    `;
    box.appendChild(div);
  });
}

function renderSafesNewFormat() {
  const safesTable = document.getElementById('safes-list');
  const safesCount = document.getElementById('safes-count');
  
  if (!currentClient || !currentClient.safes || currentClient.safes.length === 0) {
    safesTable.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">
          <div class="empty-state">
            <span class="empty-icon">🏦</span>
            <span>У цього клієнта поки немає сейфів</span>
            <button class="action-btn primary" onclick="addSafe()">➕ Додати перший сейф</button>
          </div>
        </td>
      </tr>
    `;
    if (safesCount) {
      safesCount.textContent = '0 сейфів';
    }
    return;
  }
  
  // Update safes count
  const count = currentClient.safes.length;
  if (safesCount) {
    safesCount.textContent = `${count} ${count === 1 ? 'сейф' : count < 5 ? 'сейфи' : 'сейфів'}`;
  }
  
  // Render safes
  safesTable.innerHTML = currentClient.safes.map((safe, index) => {
    const status = safe.endDate ? (new Date(safe.endDate) < new Date() ? 'прострочено' : 'активний') : 'не активний';
    const statusClass = getStatusClass(status);
    
    return `
      <tr class="data-row" data-safe-index="${index}">
        <td><span class="safe-number">#${safe.safeNumber || '-'}</span></td>
        <td><span class="size-badge">${safe.category || '-'}</span></td>
        <td><span class="price">-</span></td>
        <td>${safe.startDate ? formatDate(safe.startDate) : '-'}</td>
        <td>${safe.endDate ? formatDate(safe.endDate) : '-'}</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td class="actions">
          <button class="action-btn small" onclick="editSafe(${index})" title="Редагувати">✏️</button>
          <button class="action-btn small danger" onclick="deleteSafe(${index})" title="Видалити">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

window.editSafe = function(idx) {
  // Можна додати додаткове редагування сейфу тут
}

window.deleteSafe = function(idx) {
  if (!confirm('Видалити сейф?')) return;
  currentClient.safes.splice(idx,1);
  renderSafes();
  // Оновлюємо список термінових сейфів
  if (window.expiringSafesManager) {
    setTimeout(() => window.expiringSafesManager.loadClients(), 100);
  }
}

window.updateSafeDate = function(idx, value) {
  currentClient.safes[idx].endDate = value;
  // Оновлюємо список термінових сейфів при зміні дати
  if (window.expiringSafesManager) {
    setTimeout(() => window.expiringSafesManager.loadClients(), 100);
  }
}

document.getElementById('edit-client-btn').onclick = function() {
  editMode = true;
  renderClientForm();
  renderSafes();
};

document.getElementById('client-form').onsubmit = async function(e) {
  e.preventDefault();
  if (!editMode) return;
  const fd = new FormData(this);
  currentClient.iban = fd.get('iban');
  currentClient.email = fd.get('email');
  currentClient.phone = fd.get('phone');
  // PATCH/PUT до API
  const resp = await fetch(`/api/clients?id=${encodeURIComponent(currentClient.id)}`, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(currentClient)
  });
  if (resp.ok) {
    editMode = false;
    await renderClient();
    showMessage('Зміни збережено!', 'success');
    // Оновлюємо список термінових сейфів
    if (window.expiringSafesManager) {
      window.expiringSafesManager.loadClients();
    }
  } else {
    const err = await resp.json();
    showMessage('Помилка збереження: ' + (err.error || resp.status), 'error');
  }
// Показ повідомлень
function showMessage(msg, type) {
  let box = document.getElementById('msg-box');
  if (!box) {
    box = document.createElement('div');
    box.id = 'msg-box';
    box.style.position = 'fixed';
    box.style.top = '20px';
    box.style.right = '20px';
    box.style.zIndex = 1000;
    box.style.padding = '12px 20px';
    box.style.borderRadius = '8px';
    box.style.fontWeight = 'bold';
    document.body.appendChild(box);
  }
  box.textContent = msg;
  box.style.background = type === 'success' ? '#d4edda' : '#f8d7da';
  box.style.color = type === 'success' ? '#155724' : '#721c24';
  box.style.border = type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
  box.style.display = 'block';
  setTimeout(() => { box.style.display = 'none'; }, 2500);
}
};

renderClient();

window.calculateSafe = function(idx) {
  if (!currentClient) return;
  const s = currentClient.safes[idx];
  if (!s) return;
  
  // Наступний день після дати закінчення
  let startDate = '';
  if (s.endDate) {
    const d = new Date(s.endDate);
    d.setDate(d.getDate() + 1);
    startDate = d.toISOString().slice(0,10);
  }
  
  // Підготувати дані для калькулятора
  const calculatorData = {
    // Дані клієнта
    name: currentClient.name || '',
    ipn: currentClient.ipn || '',
    iban: currentClient.iban || '',
    
    // Дані сейфу
    category: s.category || '',
    coverage: (s.coverage === 'Страховка') ? 'insurance' : 'deposit', // Депозит або Грошове покриття -> deposit
    contractType: 'prolong', // Тип договору "пролонгація"
    startDate: startDate,
    
    // Додаткові дані для ідентифікації
    safeNumber: s.safeNumber || '',
    clientId: currentClient.id || ''
  };
  
  // Зберігаємо дані в localStorage для передачі на калькулятор
  localStorage.setItem('calculatorPreset', JSON.stringify(calculatorData));
  
  // Перенаправляємо на калькулятор
  window.location.href = 'index.html';
}

// Enhanced client display functions
function displayClient(client) {
    if (!client) return;
    
    // Update profile display
    const nameDisplay = document.getElementById('client-name-display');
    const contactDisplay = document.getElementById('client-contact-display');
    
    if (nameDisplay) {
        nameDisplay.textContent = client.name || 'Невідомий клієнт';
    }
    if (contactDisplay) {
        contactDisplay.innerHTML = `📧 ${client.email || 'Не вказано'} | 📱 ${client.phone || 'Не вказано'}`;
    }
    
    // Update safes count
    const safesCount = client.safes ? client.safes.length : 0;
    const safesCountElement = document.getElementById('safes-count');
    if (safesCountElement) {
        safesCountElement.textContent = `${safesCount} ${safesCount === 1 ? 'сейф' : safesCount < 5 ? 'сейфи' : 'сейфів'}`;
    }
    
    // Display safes in table
    displaySafes(client.safes || []);
}

function toggleEditMode() {
    if (!currentClient) return;
    
    editMode = !editMode;
    const profileSection = document.querySelector('.client-profile');
    const editContainer = document.getElementById('edit-form-container');
    
    if (!profileSection || !editContainer) return;
    
    if (editMode) {
        profileSection.style.display = 'none';
        editContainer.style.display = 'block';
        populateEditForm();
    } else {
        profileSection.style.display = 'block';
        editContainer.style.display = 'none';
    }
}

function populateEditForm() {
    if (!currentClient) return;
    
    const form = document.getElementById('client-form');
    if (!form) return;
    
    form.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="edit-name">👤 Ім'я клієнта</label>
                <input type="text" id="edit-name" value="${currentClient.name || ''}" required>
                <small class="form-hint">Повне ім'я або назва організації</small>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="edit-email">📧 Email</label>
                <input type="email" id="edit-email" value="${currentClient.email || ''}" placeholder="client@example.com">
                <small class="form-hint">Електронна адреса для зв'язку</small>
            </div>
            
            <div class="form-group">
                <label for="edit-phone">📱 Телефон</label>
                <input type="tel" id="edit-phone" value="${currentClient.phone || ''}" placeholder="+380501234567">
                <small class="form-hint">Контактний номер у форматі +380...</small>
            </div>
        </div>
        
        <div class="form-actions">
            <button type="button" class="action-btn secondary" onclick="cancelEdit()">❌ Скасувати</button>
            <button type="submit" class="action-btn primary" onclick="saveClient(event)">💾 Зберегти зміни</button>
        </div>
    `;
}

function cancelEdit() {
    editMode = false;
    toggleEditMode();
}

function saveClient(event) {
    event.preventDefault();
    
    const name = document.getElementById('edit-name')?.value;
    const email = document.getElementById('edit-email')?.value;
    const phone = document.getElementById('edit-phone')?.value;
    
    if (!name) {
        showNotification('❌ Ім\'я клієнта обов\'язкове!', 'error');
        return;
    }
    
    // Update current client
    currentClient.name = name;
    currentClient.email = email;
    currentClient.phone = phone;
    
    // Here you would typically save to server/API
    // For now, we'll just update the display
    displayClient(currentClient);
    
    // Exit edit mode
    cancelEdit();
    
    // Show success message
    showNotification('✅ Дані клієнта успішно оновлено!', 'success');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function addSafe() {
    // Placeholder function - implement as needed
    alert('Функція додавання сейфу буде реалізована');
}

function editSafe(index) {
    // Placeholder function - implement as needed
    alert(`Редагування сейфу #${index}`);
}

function deleteSafe(index) {
    // Placeholder function - implement as needed
    if (confirm('Ви впевнені, що хочете видалити цей сейф?')) {
        alert(`Видалення сейфу #${index}`);
    }
}

function deleteClient() {
    if (confirm('Ви впевнені, що хочете видалити цього клієнта?')) {
        alert('Функція видалення клієнта буде реалізована');
    }
}

// ...existing code...
document.addEventListener('DOMContentLoaded', function() {
    renderClient();
    
    // Edit button handler - check if element exists
    const editBtn = document.getElementById('edit-client-btn');
    if (editBtn && typeof toggleEditMode === 'function') {
        editBtn.addEventListener('click', toggleEditMode);
    }
});
