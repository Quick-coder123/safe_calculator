document.addEventListener('DOMContentLoaded', () => {
  const get = id => document.getElementById(id);

  const themeBtn = get('theme-toggle');
  const langSelect = get('lang-select');
  const categoryEl = get('category');
  const contractEl = get('contractType');
  const coverageEl = get('coverage');
  const daysEl = get('days');
  const startEl = get('start-date');
  const endEl = get('end-date');
  const penaltyEl = get('penalty-amount');
  const atCount = get('attorney-count');
  const atInc = get('attorney-increase');
  const atDec = get('attorney-decrease');
  const outRate = get('out-rate');
  const outDays = get('out-days');
  const outEnd = get('out-end');
  const rentCost = get('rent-cost');
  const covCost = get('coverage-cost');
  const atCost = get('attorney-cost');
  const penCost = get('penalty-cost');
  const totCost = get('total-cost');
  const recEl = get('recipient-name');
  const edrEl = get('edrpou');
  const ibanEl = get('iban');
  const linkEl = get('insurance-link');
  const genBtn = get('generate-btn');
  const copyBtn = get('copy-btn');
  const printBtn = get('print-btn');
  const txtArea = get('payment-text');
  const toast = get('toast');
  const warningEl = get('end-warning');

  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeBtn.textContent = savedTheme === 'light' ? '🌙' : '☀️';
  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeBtn.textContent = next === 'light' ? '🌙' : '☀️';
  });

  const translations = {
    uk: {
      calc_title: "Калькулятор оренди індивідуального сейфу",
      label_category: "Категорія сейфу",
      label_contract: "Тип договору",
      label_coverage: "Тип покриття",
      label_days: "Термін (днів)",
      label_start: "Дата початку",
      label_end: "Дата закінчення",
      label_penalty: "Пеня (грн)",
      label_attorney: "Довіреності",
      summary_title: "Підсумкова інформація",
      summary_term: "Термін:",
      summary_end: "Дата закінчення:",
      summary_rent: "Вартість сейфу:",
      summary_cov: "Покриття:",
      summary_att: "Довіреності:",
      summary_pen: "Пеня:",
      summary_total: "Разом:",
      pay_title: "Реквізити",
      label_rec: "Отримувач (ПІБ)",
      label_edr: "Код ЄДРПОУ",
      hint_edr: "10 цифр",
      label_iban: "IBAN",
      hint_iban: "UA + 29 цифр",
      label_link: "Посилання на страхування",
      btn_generate: "Згенерувати реквізити",
      btn_copy: "Скопіювати",
      btn_print: "Друк рахунку",
      toast_generated: "Реквізити згенеровано!",
      toast_copied: "Скопійовано!"
    },
    en: {
      calc_title: "Safe Rental Calculator",
      label_category: "Safe Category",
      label_contract: "Contract Type",
      label_coverage: "Coverage Type",
      label_days: "Term (days)",
      label_start: "Start Date",
      label_end: "End Date",
      label_penalty: "Penalty (UAH)",
      label_attorney: "Power of Attorney",
      summary_title: "Summary Information",
      summary_term: "Term:",
      summary_end: "End Date:",
      summary_rent: "Safe Cost:",
      summary_cov: "Coverage:",
      summary_att: "Attorney Cost:",
      summary_pen: "Penalty:",
      summary_total: "Total:",
      pay_title: "Payment Details",
      label_rec: "Recipient (Name)",
      label_edr: "EDRPOU Code",
      hint_edr: "10 digits",
      label_iban: "IBAN",
      hint_iban: "UA + 29 digits",
      label_link: "Insurance Link",
      btn_generate: "Generate Details",
      btn_copy: "Copy",
      btn_print: "Print Invoice",
      toast_generated: "Details generated!",
      toast_copied: "Copied!"
    }
  };

  const coverageLabels = {
    uk: {
      insurance: "Страхування ключа",
      deposit: "Покриття"
    },
    en: {
      insurance: "Key Insurance",
      deposit: "Coverage"
    }
  };

  function applyTranslations(lang) {
    const t = translations[lang];
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
      const key = el.dataset.i18nKey;
      if (t[key]) el.textContent = t[key];
    });

    categoryEl.innerHTML = (lang === 'uk'
      ? ['1 категорія','2 категорія','3 категорія','4 категорія','5 категорія']
      : ['Category 1','Category 2','Category 3','Category 4','Category 5']
    ).map((txt, i) => `<option value="${i + 1}">${txt}</option>`).join('');

    contractEl.innerHTML = (lang === 'uk'
      ? ['Новий','Пролонгація']
      : ['New','Prolongation']
    ).map((txt, i) => `<option value="${i === 0 ? 'new' : 'prolong'}">${txt}</option>`).join('');

    coverageEl.innerHTML = (lang === 'uk'
      ? ['Страхування ключа','Грошове покриття']
      : ['Key Insurance','Cash Deposit']
    ).map((txt, i) => `<option value="${i === 0 ? 'insurance' : 'deposit'}">${txt}</option>`).join('');
  }

  const dailyRates = [
    { min: 1, max: 30,  rates: { 1: 39, 2: 51, 3: 63, 4: 63, 5: 63 }},
    { min: 31, max: 90, rates: { 1: 25, 2: 26, 3: 28, 4: 35, 5: 43 }},
    { min: 91, max: 180,rates: { 1: 22, 2: 24, 3: 26, 4: 33, 5: 41 }},
    { min: 181,max: 365,rates: { 1: 20, 2: 22, 3: 24, 4: 29, 5: 40 }}
  ];
  const insuranceRates = [
    { min: 1, max: 90,   cost: 285 },
    { min: 91, max: 180, cost: 370 },
    { min: 181,max: 270, cost: 430 },
    { min: 271,max: 365, cost: 550 }
  ];

  const attorneyTariff = 300;
  const depositAmount = 3000;

  function getTermDays() {
    const d = parseInt(daysEl.value, 10);
    return d > 0 ? d : 1;
  }

  function syncEndDate() {
    const d = getTermDays();
    const dt = new Date(startEl.value);
    dt.setDate(dt.getDate() + d - 1);
    endEl.value = dt.toISOString().slice(0, 10);
  }

  function syncDays() {
    const sd = new Date(startEl.value), ed = new Date(endEl.value);
    const diff = Math.floor((ed - sd) / (1000 * 60 * 60 * 24)) + 1;
    daysEl.value = diff > 0 ? diff : 1;
  }

  function checkWeekend(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDay();
    warningEl.style.display = (day === 0 || day === 6) ? 'block' : 'none';
  }

  function calculateAll() {
    const lang = langSelect.value;
    const days = getTermDays();
    const rate = dailyRates.find(r => days >= r.min && days <= r.max)?.rates[categoryEl.value] || 0;
    const rent = rate * days;
    const covObj = insuranceRates.find(r => days >= r.min && days <= r.max);
    const cov = coverageEl.value === 'insurance'
      ? covObj?.cost || 0
      : (contractEl.value === 'new' ? depositAmount : 0);
    const at = parseInt(atCount.textContent, 10) * attorneyTariff;
    const pen = parseFloat(penaltyEl.value) || 0;
    const total = rent + cov + at + pen;

    outRate.textContent = rate.toFixed(2) + ' грн/день';
    outDays.textContent = days + ' днів';
    outEnd.textContent = endEl.value.split('-').reverse().join('-');
    rentCost.textContent = rent.toFixed(2) + ' грн';
    covCost.textContent = cov.toFixed(2) + ' грн';
    atCost.textContent = at.toFixed(2) + ' грн';
    penCost.textContent = pen.toFixed(2) + ' грн';
    totCost.textContent = total.toFixed(2) + ' грн';

    // ✅ ОНОВЛЕННЯ НАЗВИ "Покриття"/"Страхування ключа"
    const covLabelEl = document.querySelector('[data-i18n-key="summary_cov"]');
    covLabelEl.textContent = coverageLabels[lang][coverageEl.value];

    checkWeekend(endEl.value);
  }

  function handleCountChange(id, delta) {
    const el = get(id);
    const val = Math.max(0, parseInt(el.textContent) + delta);
    el.textContent = val;
    calculateAll();
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
  }

  const savedLang = localStorage.getItem('lang') || 'uk';
  langSelect.value = savedLang;
  applyTranslations(savedLang);

  daysEl.addEventListener('input', () => { syncEndDate(); calculateAll(); });
  startEl.addEventListener('change', () => { syncDays(); calculateAll(); });
  endEl.addEventListener('change', () => { syncDays(); calculateAll(); });
  [categoryEl, contractEl, coverageEl, penaltyEl].forEach(el => el.addEventListener('change', calculateAll));
  atInc.addEventListener('click', () => handleCountChange('attorney-count', +1));
  atDec.addEventListener('click', () => handleCountChange('attorney-count', -1));

  langSelect.addEventListener('change', () => {
    const lang = langSelect.value;
    localStorage.setItem('lang', lang);
    applyTranslations(lang);
    calculateAll();
  });

  genBtn.addEventListener('click', () => {
    if (!recEl.value || !edrEl.value.match(/^\d{10}$/) || !ibanEl.value.match(/^UA\d{27}$/)) {
      alert('Будь ласка, заповніть усі реквізити коректно');
      return;
    }

    calculateAll();
    const lines = [
      'Для дистанційного продовження строку дії індивідуального сейфу просимо здійснити оплату:',
      '',
      `💳 Сума до сплати: ${totCost.textContent}`,
      `👤 Отримувач: ${recEl.value}`,
      `🆔 Код ЄДРПОУ: ${edrEl.value}`,
      `🏦 IBAN: ${ibanEl.value}`,
      '',
      '📝 Призначення платежу:',
      'Продовження строку дії індивідуального сейфу',
      '',
      '🔗 Посилання на сплату страхування:',
      linkEl.value.trim() || 'https://ars.aiwa.in.ua/docs/sdb/newID'
    ];
    txtArea.value = lines.join('\n');
    showToast(translations[langSelect.value].toast_generated);
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(txtArea.value).then(() => {
      showToast(translations[langSelect.value].toast_copied);
    });
  });

  printBtn.addEventListener('click', () => {
    const inv = get('invoice-print');
    inv.innerHTML = `<pre>${txtArea.value}</pre>`;
    inv.removeAttribute('aria-hidden');
    window.print();
    inv.setAttribute('aria-hidden', 'true');
  });

  const today = new Date().toISOString().slice(0, 10);
  startEl.value = endEl.value = today;
  calculateAll();
});
