// client.js
const info = document.getElementById('client-info');
const c = JSON.parse(localStorage.getItem('viewClient')||'null');
if (!c) {
  info.innerHTML = '<div style="color:#e74c3c;">Дані клієнта не знайдено.</div>';
} else {
  // Особисті дані
  let html = `
    <div class="client-info-boxes">
      <div class="client-box"><b>ПІБ</b><span>${c.name}</span></div>
      <div class="client-box"><b>ІПН</b><span>${c.ipn}</span></div>
      <div class="client-box"><b>Телефон</b><span>${c.phone}</span></div>
      <div class="client-box"><b>Email</b><span>${c.email}</span></div>
      <div class="client-box"><b>IBAN</b><span>${c.iban}</span></div>
    </div>
    <div class="client-safes-boxes">
      <b style="margin-bottom:8px; color:#009944;">Сейфи клієнта</b>
  `;
  // Підтримка масиву сейфів або одного сейфу (зворотна сумісність)
  const safes = Array.isArray(c.safes) ? c.safes : [{
    category: c.category,
    safeNumber: c.safeNumber || '',
    endDate: c.endDate,
    coverage: c.coverage
  }];
  safes.forEach((s, idx) => {
    html += `
      <div class="client-box">
        <b>Сейф №${s.safeNumber || '-'} (${s.category || '-'})</b>
        <span><b>Дата закінчення:</b> ${s.endDate || '-'}</span>
        <span><b>Покриття:</b> ${s.coverage || '-'}</span>
        <button class="action-btn secondary" style="margin-top:10px;max-width:160px;" onclick="calculateSafe(${idx})">Прорахувати</button>
      </div>
    `;
  });
  html += '</div>';
  info.innerHTML = html;
}

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
