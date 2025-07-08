// script.js
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
  const pkDec       = document.getElementById('packet-decrease');
  const pkInc       = document.getElementById('packet-increase');
  const pkCount     = document.getElementById('packet-count');
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

  // … (усі інші функції та константи залишаються без змін) …

  // Генерація реквізитів з UX-індикатором
  genBtn.addEventListener('click', () => {
    // Показати спінер і заблокувати кнопку
    genBtn.disabled = true;
    spinner.style.display = 'inline-block';

    // Ваш існуючий код генерації
    calculateAll();
    const days = getTermDays();
    const rateObj = dailyRates.find(r => days>=r.min && days<=r.max) || {rates:{}};
    const dailyRate = rateObj.rates[categoryEl.value] || 0;
    const rentAmount = dailyRate * days;
    const penaltyAmount = parseFloat(penaltyEl.value) || 0;
    const totalAmount = rentAmount + penaltyAmount;
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

    // Сховати спінер і розблокувати кнопку
    spinner.style.display = 'none';
    genBtn.disabled = false;

    // Показати тост
    toast.textContent = translations[langSelect.value].toast_generated;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
  });

  // … (скопіювання, друк, решта логіки) …
});
