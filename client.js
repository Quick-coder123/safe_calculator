// client.js
const info = document.getElementById('client-info');
// client.js
// Отримуємо id з URL
function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchClient(id) {
  const res = await fetch(`/api/clients?id=eq.${encodeURIComponent(id)}`);
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
  `;
  document.getElementById('save-client-btn').style.display = editMode ? '' : 'none';
}

function renderSafes() {
  const box = document.getElementById('safes-section');
  box.innerHTML = '';
  (currentClient.safes||[]).forEach((s, idx) => {
    const div = document.createElement('div');
    div.className = 'client-box';
    div.innerHTML = `
      <b>Сейф №${s.safeNumber || '-'} (${s.category || '-'})</b><br>
      <span><b>Дата закінчення:</b> <input type="date" value="${s.endDate||''}" ${editMode?'':'readonly'} onchange="window.updateSafeDate(${idx},this.value)"></span><br>
      <span><b>Покриття:</b> ${s.coverage || '-'}</span>
      <button class="action-btn secondary" type="button" onclick="window.editSafe(${idx})" style="margin-top:8px;${editMode?'':'display:none;'}">Редагувати</button>
      <button class="action-btn danger" type="button" onclick="window.deleteSafe(${idx})" style="margin-top:8px;${editMode?'':'display:none;'}">Видалити</button>
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
}

window.updateSafeDate = function(idx, value) {
  currentClient.safes[idx].endDate = value;
}

document.getElementById('add-safe-btn').onclick = function() {
  if (!editMode) return;
  currentClient.safes = currentClient.safes || [];
  currentClient.safes.push({category:'',safeNumber:'',endDate:'',coverage:''});
  renderSafes();
};

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
  await fetch(`/api/clients?id=${encodeURIComponent(currentClient.id)}`, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(currentClient)
  });
  editMode = false;
  await renderClient();
};

renderClient();

window.calculateSafe = function(idx) {
  const c = JSON.parse(localStorage.getItem('viewClient'));
  const s = Array.isArray(c.safes) ? c.safes[idx] : c;
  // Наступний день після дати закінчення
  let startDate = '';
  if (s.endDate) {
    const d = new Date(s.endDate);
    d.setDate(d.getDate() + 1);
    startDate = d.toISOString().slice(0,10);
  }
  // Підготувати дані для калькулятора
  const selected = {
    name: c.name,
    ipn: c.ipn,
    iban: c.iban,
    category: s.category,
    coverage: s.coverage === 'Страховка' ? 'insurance' : 'deposit',
    start: startDate,
    // інші поля калькулятора залишити порожніми
  };
  localStorage.setItem('selectedClient', JSON.stringify(selected));
  window.location.href = 'index.html';
}
