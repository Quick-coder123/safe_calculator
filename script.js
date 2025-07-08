document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const themeBtn    = document.getElementById('theme-toggle');
  const langSelect  = document.getElementById('lang-select');
  const categoryEl  = document.getElementById('category');
  const contractEl  = document.getElementById('contractType');
  const coverageEl  = document.getElementById('coverage');
  const daysEl      = document.getElementById('days');
  const startEl     = document.getElementById('start-date');
  const endEl       = document.getElementById('end-date');
  const penaltyEl   = document.getElementById('penalty-amount');
  const atDec       = document.getElementById('attorney-decrease');
  const atInc       = document.getElementById('attorney-increase');
  const atCount     = document.getElementById('attorney-count');
  const outRate     = document.getElementById('out-rate');
  const outDays     = document.getElementById('out-days');
  const outEnd      = document.getElementById('out-end');
  const rentCost    = document.getElementById('rent-cost');
  const covCost     = document.getElementById('coverage-cost');
  const atCost      = document.getElementById('attorney-cost');
  const penCost     = document.getElementById('penalty-cost');
  const totCost     = document.getElementById('total-cost');
  const recEl       = document.getElementById('recipient-name');
  const edrEl       = document.getElementById('edrpou');
  const ibanEl      = document.getElementById('iban');
  const linkEl      = document.getElementById('insurance-link');
  const genBtn      = document.getElementById('generate-btn');
  const spinner     = genBtn.querySelector('.spinner');
  const copyBtn     = document.getElementById('copy-btn');
  const printBtn    = document.getElementById('print-btn');
  const txtArea     = document.getElementById('payment-text');
  const toast       = document.getElementById('toast');
  const warningEl   = document.getElementById('end-warning');

  // ** Видалена логіка для “Пакетів” **

  // Example: синхронізуємо дати
  function getTermDays() {
    const start = new Date(startEl.value);
    const end   = new Date(endEl.value);
    const diff  = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
  }

  function syncEndDate() {
    const days = parseInt(daysEl.value, 10) || 0;
    const startDate = new Date(startEl.value);
    startDate.setDate(startDate.getDate() + days);
    endEl.value = startDate.toISOString().slice(0,10);
  }

  function syncDays() {
    const days = getTermDays();
    daysEl.value = days;
  }

  daysEl.addEventListener('input', syncEndDate);
  startEl.addEventListener('change', () => { syncEndDate(); calculateAll(); });
  endEl.addEventListener('change', () => { syncDays(); calculateAll(); });

  atDec.addEventListener('click', () => {
    let n = parseInt(atCount.textContent,10);
    if (n > 0) atCount.textContent = --n;
    calculateAll();
  });
  atInc.addEventListener('click', () => {
    let n = parseInt(atCount.textContent,10);
    atCount.textContent = ++n;
    calculateAll();
  });

  // Основна функція розрахунку
  function calculateAll() {
    const days = getTermDays();
    // ... ваші rates та логіка ...
    // Приклад оновлення полів:
    outDays.textContent = `${days} дн.`;
    // rentCost.textContent = `… грн`;
    // atCost.textContent = `… грн`;
    // penCost.textContent = `… грн`;
    // totCost.textContent = `… грн`;
  }

  // Генерація реквізитів з UX-індикатором
  genBtn.addEventListener('click', () => {
    genBtn.disabled = true;
    spinner.style.display = 'inline-block';

    calculateAll();
    const totalAmount = 0; // вашу логіку підставити сюди

    const lines = [
      'Для дистанційного продовження строку дії індивідуального сейфу просимо здійснити оплату:',
      '',
      `💳 Сума до сплати: ${totalAmount.toFixed(2)} грн`,
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

    spinner.style.display = 'none';
    genBtn.disabled = false;

    toast.textContent = translations[langSelect.value].toast_generated;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
  });

  copyBtn.addEventListener('click', () => {
    txtArea.select();
    document.execCommand('copy');
    toast.textContent = translations[langSelect.value].toast_copied;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
  });

  printBtn.addEventListener('click', () => {
    const inv = document.getElementById('invoice-print');
    inv.innerHTML = `<pre>${txtArea.value}</pre>`;
    inv.removeAttribute('aria-hidden');
    window.print();
    inv.setAttribute('aria-hidden', 'true');
  });

  // Ініціалізація
  const today = new Date().toISOString().slice(0,10);
  startEl.value = endEl.value = today;
  calculateAll();
});
