// add-client.js
// Додавання нового клієнта

const form = document.getElementById('client-form');
const safesList = document.getElementById('safes-list');
const addSafeBtn = document.getElementById('add-safe-btn');

function renderSafes(safes) {
  safesList.innerHTML = safes.map((s, i) => `
    <div class="form-group" style="border:1px solid #eee; border-radius:8px; padding:10px; margin-bottom:8px;">
      <label>Категорія
        <select name="category${i}" required>
          <option value="1"${s.category==='1' || s.category==='1 категорія'?' selected':''}>1 категорія</option>
          <option value="2"${s.category==='2' || s.category==='2 категорія'?' selected':''}>2 категорія</option>
          <option value="3"${s.category==='3' || s.category==='3 категорія'?' selected':''}>3 категорія</option>
          <option value="4"${s.category==='4' || s.category==='4 категорія'?' selected':''}>4 категорія</option>
          <option value="5"${s.category==='5' || s.category==='5 категорія'?' selected':''}>5 категорія</option>
        </select>
      </label>
      <label style="margin-left:8px;">№ сейфу <input type="text" name="safeNumber${i}" value="${s.safeNumber||''}" required style="width:80px;"></label>
      <label style="margin-left:8px;">Дата закінчення <input type="date" name="endDate${i}" value="${s.endDate||''}" required></label>
      <label style="margin-left:8px;">Покриття
        <select name="coverage${i}" required>
          <option value="Страховка"${s.coverage==='Страховка'?' selected':''}>Страховка</option>
          <option value="Грошове покриття"${s.coverage==='Грошове покриття'?' selected':''}>Грошове покриття</option>
        </select>
      </label>
      <button type="button" onclick="removeSafe(${i})" class="action-btn" style="background:#e74c3c; margin-left:8px;">Видалити</button>
    </div>
  `).join('');
}

let safes = [ { category: '1', safeNumber: '', endDate: '', coverage: 'Страховка' } ];
renderSafes(safes);

window.removeSafe = function(idx) {
  safes.splice(idx,1);
  if (safes.length === 0) safes.push({ category: '1', safeNumber: '', endDate: '', coverage: 'Страховка' });
  renderSafes(safes);
}
addSafeBtn.onclick = function() {
  safes.push({ category: '1', safeNumber: '', endDate: '', coverage: 'Страховка' });
  renderSafes(safes);
}

form.onsubmit = function(e) {
  e.preventDefault();
  const fd = new FormData(form);
  // Особисті дані
  const data = {
    name: fd.get('name'),
    ipn: fd.get('ipn'),
    iban: fd.get('iban'),
    email: fd.get('email'),
    phone: fd.get('phone'),
    safes: []
  };
  // Сейфи
  for (let i = 0; i < safes.length; ++i) {
    data.safes.push({
      category: fd.get('category'+i),
      safeNumber: fd.get('safeNumber'+i),
      endDate: fd.get('endDate'+i),
      coverage: fd.get('coverage'+i)
    });
  }
  fetch('/api/clients', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  })
  .then(()=>{
    // Оновлюємо список термінових сейфів перед переходом
    if (window.expiringSafesManager) {
      window.expiringSafesManager.loadClients();
    }
    window.location.href = 'clients.html';
  });
};
