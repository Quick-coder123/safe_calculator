// script.js

document.addEventListener('DOMContentLoaded', () => {
  // —————————————————————————————————————————————————————————
  // 1. Налаштування тарифів (оновіть значення відповідно до ваших даних)
  // —————————————————————————————————————————————————————————
  const dailyRates = [
    { min: 1,  max: 30,  rates: { 1: 5, 2: 10, 3: 15, 4: 20 } },
    { min: 31, max: 365, rates: { 1: 4, 2: 8,  3: 12, 4: 16 } },
  ];
  const insuranceRates = [
    { min: 1,   max: 180, cost: 50 },
    { min: 181, max: 365, cost: 75 },
  ];
  const depositAmount  = 1000;  // сума грошового покриття при новому договорі
  const attorneyTariff = 25;    // тариф за одну довіреність

  // —————————————————————————————————————————————————————————
  // 2. Отримуємо елементи DOM
  // —————————————————————————————————————————————————————————
  const categoryEl   = document.getElementById('category');
  const contractEl   = document.getElementById('contractType');
  const coverageEl   = document.getElementById('coverage');
  const daysEl       = document.getElementById('days');
  const startEl      = document.getElementById('start-date');
  const endEl        = document.getElementById('end-date');
  const penaltyEl    = document.getElementById('penalty-amount');
  const atDec        = document.getElementById('attorney-decrease');
  const atInc        = document.getElementById('attorney-increase');
  const atCount      = document.getElementById('attorney-count');

  const outRate      = document.getElementById('out-rate');
  const outDays      = document.getElementById('out-days');
  const outEnd       = document.getElementById('out-end');
  const rentCost     = document.getElementById('rent-cost');
  const covCost      = document.getElementById('coverage-cost');
  const atCost       = document.getElementById('attorney-cost');
  const penCost      = document.getElementById('penalty-cost');
  const totCost      = document.getElementById('total-cost');

  const recEl        = document.getElementById('recipient-name');
  const edrEl        = document.getElementById('edrpou');
  const ibanEl       = document.getElementById('iban');
  const linkEl       = document.getElementById('insurance-link');
  const txtArea      = document.getElementById('payment-text');

  const genBtn       = document.getElementById('generate-btn');
  const spinner      = genBtn.querySelector('.spinner');
  const copyBtn      = document.getElementById('copy-btn');
  const printBtn     = document.getElementById('print-btn');
  const copySumBtn   = document.getElementById('copy-summary-btn');

  const warningEl    = document.getElementById('end-warning');
  const toast        = document.getElementById('toast');

  // —————————————————————————————————————————————————————————
  // 3. Допоміжні функції
  // —————————————————————————————————————————————————————————

  // Інклюзивний підрахунок днів між startEl та endEl
  function getTermDays() {
    const s = new Date(startEl.value);
    const e = new Date(endEl.value);
    const rawDiff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return rawDiff > 0 ? rawDiff : 0;
  }

  // Синхронізація endEl з урахуванням інклюзивності
  function syncEndDate() {
    const days = parseInt(daysEl.value, 10) || 1;
    const s = new Date(startEl.value);
    s.setDate(s.getDate() + days - 1);
    endEl.value = s.toISOString().slice(0, 10);
  }

  // Синхронізація daysEl при зміні endEl
  function syncDays() {
    daysEl.value = getTermDays();
  }

  // Показ або приховування попередження про вихідний день
  function checkWeekend(dateStr) {
    const dow = new Date(dateStr).getDay();
    warningEl.style.display = (dow === 0 || dow === 6) ? 'block' : 'none';
  }

  // Debounce для полегшення обробки input
  function debounce(fn, ms) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // Основна функція розрахунків та оновлення UI
  function calculateAll() {
    const days = getTermDays();
    outDays.textContent = `${days} дн.`;

    // 1) Щоденний тариф
    const dr = dailyRates.find(r => days >= r.min && days <= r.max) || { rates: {} };
    const dailyRate = dr.rates[categoryEl.value] || 0;
    outRate.textContent = `${dailyRate.toFixed(2)} грн/день`;

    // 2) Вартість оренди
    const rentAmt = dailyRate * days;
    rentCost.textContent = `${rentAmt.toFixed(2)} грн`;

    // 3) Вартість покриття
    let coverageAmt = 0;
    if (coverageEl.value === 'insurance') {
      const ins = insuranceRates.find(r => days >= r.min && days <= r.max) || { cost: 0 };
      coverageAmt = ins.cost;
    } else if (contractEl.value === 'new') {
      coverageAmt = depositAmount;
    }
    covCost.textContent = `${coverageAmt.toFixed(2)} грн`;

    // 4) Вартість довіреностей
    const aCount = parseInt(atCount.textContent, 10) || 0;
    const aAmt = aCount * attorneyTariff;
    atCost.textContent = `${aAmt.toFixed(2)} грн`;

    // 5) Пеня
    const pAmt = parseFloat(penaltyEl.value) || 0;
    penCost.textContent = `${pAmt.toFixed(2)} грн`;

    // 6) Підсумкова сума
    const total = rentAmt + coverageAmt + aAmt + pAmt;
    totCost.textContent = `${total.toFixed(2)} грн`;

    // 7) Перевірка вихідного дня
    checkWeekend(endEl.value);
  }

  // Генерація тексту реквізитів
  function generatePaymentText() {
    const total = parseFloat(totCost.textContent) || 0;
    const lines = [
      'Для дистанційного продовження строку дії індивідуального сейфу просимо здійснити оплату:',
      '',
      `💳 Сума до сплати: ${total.toFixed(2)} грн`,
      `👤 Отримувач: ${recEl.value || '—'}`,
      `🆔 Код ЄДРПОУ: ${edrEl.value || '—'}`,
      `🏦 IBAN: ${ibanEl.value || '—'}`,
      '',
      '📝 Призначення платежу:',
      'Продовження строку дії індивідуального сейфу',
      '',
      '🔗 Посилання на сплату страхування:',
      linkEl.value.trim() || 'https://ars.aiwa.in.ua/docs/sdb/newID'
    ];
    txtArea.value = lines.join('\n');
  }

  // Відображення тост-повідомлення
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
  }

  // —————————————————————————————————————————————————————————
  // 4. Обробники подій
  // —————————————————————————————————————————————————————————
  daysEl.addEventListener('input', debounce(() => {
    syncEndDate();
    calculateAll();
  }, 300));

  startEl.addEventListener('change', () => {
    syncEndDate();
    calculateAll();
  });

  endEl.addEventListener('change', () => {
    syncDays();
    calculateAll();
  });

  [categoryEl, contractEl, coverageEl].forEach(el =>
    el.addEventListener('change', calculateAll)
  );

  atDec.addEventListener('click', () => {
    let n = parseInt(atCount.textContent, 10);
    if (n > 0) atCount.textContent = --n;
    calculateAll();
  });

  atInc.addEventListener('click', () => {
    let n = parseInt(atCount.textContent, 10);
    atCount.textContent = ++n;
    calculateAll();
  });

  genBtn.addEventListener('click', () => {
    genBtn.disabled = true;
    spinner.style.display = 'inline-block';

    calculateAll();
    generatePaymentText();

    spinner.style.display = 'none';
    genBtn.disabled = false;
    showToast('Реквізити згенеровано');
  });

  copyBtn.addEventListener('click', () => {
    txtArea.select();
    document.execCommand('copy');
    showToast('Текст скопійовано');
  });

  printBtn.addEventListener('click', () => {
    const inv = document.getElementById('invoice-print');
    inv.innerHTML = `<pre>${txtArea.value}</pre>`;
    inv.removeAttribute('aria-hidden');
    window.print();
    inv.setAttribute('aria-hidden', 'true');
  });

  copySumBtn.addEventListener('click', () => {
    const lines = ['Підсумкова інформація:'];
    document.querySelectorAll('.summary-panel .summary-item').forEach(item => {
      const label = item.children[0].textContent.trim();
      const value = item.children[1].textContent.trim();
      lines.push(`${label}: ${value}`);
    });
    const totalLabel = document.querySelector('.summary-panel .summary-total strong').textContent.trim();
    const totalValue = document.querySelector('.summary-panel .summary-total span').textContent.trim();
    lines.push(`${totalLabel}: ${totalValue}`);

    const temp = document.createElement('textarea');
    temp.value = lines.join('\n');
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);

    showToast('Підсумки скопійовано');
  });

  // —————————————————————————————————————————————————————————
  // 5. Початкова ініціалізація
  // —————————————————————————————————————————————————————————
  const today = new Date().toISOString().slice(0, 10);
  startEl.value = endEl.value = today;
  syncEndDate();
  calculateAll();
});
