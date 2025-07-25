// client.js
const info = document.getElementById('client-info');
// client.js
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
  renderClientForm();
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
  const box = document.getElementById('safes-section');
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
      <b>Сейф №${s.safeNumber || '-'} (${s.category ? (isNaN(s.category) ? s.category : s.category + ' категорія') : '-'})</b><br>
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
