﻿// ========== АНІМАЦІЙНІ ФУНКЦІЇ ==========

// Функція для анімації оновлення значень
function animateValueUpdate(element, newValue) {
  if (!element) return;
  
  // Додаємо клас оновлення
  element.classList.add('updating');
  
  // Оновлюємо значення через невеликий проміжок часу
  setTimeout(() => {
    element.textContent = newValue;
    element.classList.remove('updating');
  }, 150);
}

// Функція для анімації числових контролів
function animateCounterUpdate(element) {
  if (!element) return;
  
  element.classList.add('updating');
  setTimeout(() => {
    element.classList.remove('updating');
  }, 300);
}

// Функція для анімації генерації результату
function animateGeneration() {
  const textarea = document.getElementById('payment-text');
  if (textarea) {
    textarea.classList.add('generated');
    setTimeout(() => {
      textarea.classList.remove('generated');
    }, 500);
  }
}

// Функція для анімації помилок
function animateError(element) {
  if (!element) return;
  
  element.classList.add('error-animation');
  setTimeout(() => {
    element.classList.remove('error-animation');
  }, 300);
}

// Функція для анімації успішних дій
function animateSuccess(element) {
  if (!element) return;
  
  element.classList.add('success-animation');
  setTimeout(() => {
    element.classList.remove('success-animation');
  }, 300);
}

// Функція для анімації завантаження сторінки
function initPageAnimation() {
  document.body.classList.add('page-enter');
}

// Функція для плавного показу/приховування елементів
function toggleElementWithAnimation(element, show) {
  if (!element) return;
  
  if (show) {
    element.style.display = '';
    element.style.opacity = '0';
    element.style.transform = 'translateY(10px)';
    
    requestAnimationFrame(() => {
      element.style.transition = 'all 0.3s ease';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });
  } else {
    element.style.transition = 'all 0.3s ease';
    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      element.style.display = 'none';
    }, 300);
  }
}

// Ініціалізація анімацій при завантаженні сторінки
initPageAnimation();

// Копіювання підсумкової інформації
document.addEventListener('DOMContentLoaded', () => {
  const copySummaryBtn = document.getElementById('copy-summary-btn');
  if (copySummaryBtn) {
    copySummaryBtn.onclick = function() {
      const title = document.querySelector('[data-i18n-key="summary_title"]').textContent.trim();
      const summary = document.getElementById('summary-content');
      let text = title + '\n';
      summary.querySelectorAll('.summary-item, .summary-total').forEach(row => {
        if (row.offsetParent !== null) {
          text += row.innerText.replace(/\s+/g,' ').trim() + '\n';
        }
      });
      navigator.clipboard.writeText(text.trim());
      toast.textContent = 'Підсумок скопійовано!';
      toast.classList.add('show');
      setTimeout(()=>toast.classList.remove('show'),1500);
    };
  }
});
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
  
  // Автозаповнення з даних клієнта
  prefillFromClient();
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
  const copyBtn     = document.getElementById('copy-btn');
  // Валідація
  function validateEDRPOU(val) {
    return /^\d{10}$/.test(val);
  }
  function validateIBAN(val) {
    return /^UA\d{27}$/.test(val);
  }
function showHint(id, msg, isError) {
  const el = document.getElementById(id+"-help");
  if (!el) return;
  if (msg) {
    el.textContent = msg;
    el.classList.toggle('error', !!isError);
  } else {
    // показати стандартну підказку, якщо немає помилки
    if (id === 'edrpou') {
      el.textContent = translations[langSelect.value].hint_edr;
    } else if (id === 'iban') {
      el.textContent = translations[langSelect.value].hint_iban;
    } else if (id === 'recipient-name') {
      el.textContent = langSelect.value==='uk' ? 'Введіть ПІБ отримувача' : 'Enter recipient full name';
    } else {
      el.textContent = '';
    }
    el.classList.remove('error');
  }
}
  function setError(input, isError) {
    input.classList.toggle('input-error', !!isError);
  }

  // Збереження у LocalStorage
  function saveForm() {
    const data = {
      category: categoryEl.value,
      contract: contractEl.value,
      coverage: coverageEl.value,
      days: daysEl.value,
      start: startEl.value,
      end: endEl.value,
      penalty: penaltyEl.value,
      attorney: atCount.textContent,
      packet: pkCount.textContent,
      rec: recEl.value,
      edr: edrEl.value,
      iban: ibanEl.value,
      link: linkEl.value
    };
    localStorage.setItem('safe_calc_form', JSON.stringify(data));
  }
  function loadForm() {
    const data = JSON.parse(localStorage.getItem('safe_calc_form')||'null');
    if (!data) return;
    categoryEl.value = data.category || '';
    contractEl.value = data.contract || '';
    coverageEl.value = data.coverage || '';
    daysEl.value = data.days || '1';
    startEl.value = data.start || '';
    endEl.value = data.end || '';
    penaltyEl.value = data.penalty || '0';
    atCount.textContent = data.attorney || '0';
    pkCount.textContent = data.packet || '0';
    recEl.value = data.rec || '';
    edrEl.value = data.edr || '';
    ibanEl.value = data.iban || '';
    linkEl.value = data.link || '';
  }

  // Завантаження попередньо заповнених даних з анкети клієнта
  function loadCalculatorPreset() {
    const preset = JSON.parse(localStorage.getItem('calculatorPreset')||'null');
    if (!preset) return;
    
    // Заповнюємо поля калькулятора
    if (preset.category) categoryEl.value = preset.category;
    if (preset.coverage) coverageEl.value = preset.coverage;
    if (preset.contractType) contractEl.value = preset.contractType;
    if (preset.startDate) startEl.value = preset.startDate;
    
    // Заповнюємо реквізити
    if (preset.name) recEl.value = preset.name;
    if (preset.ipn) edrEl.value = preset.ipn;
    if (preset.iban) ibanEl.value = preset.iban;
    
    // Очищаємо preset після використання
    localStorage.removeItem('calculatorPreset');
    
    // Перерахуємо після заповнення
    calculate();
  }
  const txtArea     = document.getElementById('payment-text');
  const toast       = document.getElementById('toast');

  // Theme toggle
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeBtn.textContent = savedTheme === 'light' ? '🌙' : '☀️';
  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeBtn.textContent = next === 'light' ? '🌙' : '☀️';
  });

  // Translations + populate selects
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
      label_packet: "Пакети",
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
      label_packet: "Packages",
      summary_title: "Summary Information",
      summary_term: "Term:",
      summary_end: "End Date:",
      summary_rent: "Safe Cost:",
      summary_cov: "Coverage:",
      summary_att: "Power of Attorney Cost:",
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
  function applyTranslations(lang) {
    // populate selects
    const catLabels = lang==='uk'
      ? ['1 категорія','2 категорія','3 категорія','4 категорія','5 категорія']
      : ['Category 1','Category 2','Category 3','Category 4','Category 5'];
    categoryEl.innerHTML = catLabels.map((t,i)=>`<option value="${i+1}">${t}</option>`).join('');
    const conLabels = lang==='uk' ? ['Новий','Пролонгація'] : ['New','Prolongation'];
    contractEl.innerHTML = conLabels.map((t,i)=>`<option value="${i===0?'new':'prolong'}">${t}</option>`).join('');
    const covLabels = lang==='uk' ? ['Страхування ключа','Грошове покриття'] : ['Key Insurance','Cash Deposit'];
    coverageEl.innerHTML = covLabels.map((t,i)=>`<option value="${i===0?'insurance':'deposit'}">${t}</option>`).join('');
    // translate text
    document.querySelectorAll('[data-i18n-key]').forEach(el=>{
      const key = el.dataset.i18nKey;
      if(translations[lang][key]) el.textContent = translations[lang][key];
    });
    // placeholders & hints
    recEl.placeholder = translations[lang].label_rec;
    edrEl.placeholder = '1234567890';
    document.querySelector('#edrpou + .form-hint').textContent = translations[lang].hint_edr;
    ibanEl.placeholder = 'UA1234...';
    document.querySelector('#iban + .form-hint').textContent = translations[lang].hint_iban;
    linkEl.placeholder = 'https://...';
  }
  const savedLang = localStorage.getItem('lang') || 'uk';
  langSelect.value = savedLang;
  applyTranslations(savedLang);
  // Якщо вибрано клієнта зі списку — підставити дані
  const selectedClient = localStorage.getItem('selectedClient');
  if (selectedClient) {
    const c = JSON.parse(selectedClient);
    recEl.value = c.name || '';
    edrEl.value = c.ipn || '';
    categoryEl.value = c.category ? (c.category[0]||'1') : '1';
    coverageEl.value = c.coverage || 'insurance';
    ibanEl.value = c.iban || '';
    if (c.start) startEl.value = c.start;
    // email, phone — не підставляємо у калькулятор
    localStorage.removeItem('selectedClient');
  } else {
    loadForm();
  }
  
  // Завантажуємо попередньо заповнені дані з анкети клієнта (якщо є)
  loadCalculatorPreset();
  langSelect.addEventListener('change', () => {
    localStorage.setItem('lang', langSelect.value);
    applyTranslations(langSelect.value);
  });

  // Initialize dates
  const today = new Date().toISOString().slice(0,10);
  if (!startEl.value) startEl.value = today;
  if (!endEl.value) endEl.value = today;

  // Завантаження тарифів з rates.json
  let dailyRates = [], insuranceRates = [], attorneyTariff = 0, packetTariff = 0, depositAmount = 0;
  fetch('rates.json')
    .then(r=>r.json())
    .then(data=>{
      // Преобразуємо dailyRates для швидкого пошуку
      dailyRates = data.dailyRates.map((row,i)=>({
        min: [1,31,91,181][i],
        max: [30,90,180,365][i],
        rates: {
          1: row.rates['1 категорія'],
          2: row.rates['2 категорія'],
          3: row.rates['3 категорія'],
          4: row.rates['4 категорія'],
          5: row.rates['5 категорія']
        }
      }));
      insuranceRates = data.insuranceRates.map((row,i)=>({
        min: [1,91,181,271][i],
        max: [90,180,270,365][i],
        cost: row.cost
      }));
      attorneyTariff = data.attorneyTariff;
      packetTariff = data.packetTariff;
      depositAmount = data.depositAmount;
      calculateAll();
    });

  // Helpers
  function getTermDays(){
    const v = parseInt(daysEl.value,10);
    if(v>0) return v;
    const sd=new Date(startEl.value), ed=new Date(endEl.value),
          diff=Math.floor((ed-sd)/(1000*60*60*24))+1;
    return diff>0?diff:0;
  }
  function syncEndDate(){
    const d=getTermDays(), dt=new Date(startEl.value);
    dt.setDate(dt.getDate()+d-1);
    endEl.value=dt.toISOString().slice(0,10);
  }
  function syncDays(){
    const sd=new Date(startEl.value), ed=new Date(endEl.value),
          diff=Math.floor((ed-sd)/(1000*60*60*24))+1;
    daysEl.value = diff>0?diff:1;
  }
  function calculateAll(){
    // Валідація та підказки
    let valid = true;
    // EDRPOU
    if (edrEl.value && !validateEDRPOU(edrEl.value)) {
      showHint('edrpou', langSelect.value==='uk' ? 'Має бути 10 цифр' : 'Should be 10 digits', true);
      setError(edrEl, true); valid = false;
    } else {
      showHint('edrpou', '', false); setError(edrEl, false);
    }
    // IBAN
    if (ibanEl.value && !validateIBAN(ibanEl.value)) {
      showHint('iban', langSelect.value==='uk' ? 'Формат: UA + 27 цифр' : 'Format: UA + 27 digits', true);
      setError(ibanEl, true); valid = false;
    } else {
      showHint('iban', '', false); setError(ibanEl, false);
    }
    // Дати
    if (startEl.value && endEl.value && startEl.value > endEl.value) {
      showHint('end-date', langSelect.value==='uk' ? 'Дата закінчення не може бути раніше початку' : 'End date cannot be before start', true);
      setError(endEl, true); valid = false;
    } else {
      showHint('end-date', '', false); setError(endEl, false);
    }
    saveForm();
    const days=getTermDays();
    const rateObj=dailyRates.find(r=>days>=r.min&&days<=r.max)||{rates:{}};
    const dailyRate=rateObj.rates[categoryEl.value]||0;
    
    // Анімоване оновлення значень
    animateValueUpdate(outRate, dailyRate.toFixed(2)+' грн/день');
    animateValueUpdate(outDays, days+' днів');
    animateValueUpdate(outEnd, endEl.value.split('-').reverse().join('-'));
    
    const rentAmt=dailyRate*days;
    animateValueUpdate(rentCost, rentAmt.toFixed(2)+' грн');
    const insObj=insuranceRates.find(r=>days>=r.min&&days<=r.max)||{};
    const covAmt=coverageEl.value==='insurance'?insObj.cost:(contractEl.value==='new'?depositAmount:0);
    // Відображення типу покриття
    let coverageText = '';
    if (coverageEl.value === 'insurance') {
      coverageText = langSelect.value === 'uk' ? 'Страхування ключа' : 'Key insurance';
    } else {
      coverageText = langSelect.value === 'uk' ? 'Грошове покриття' : 'Cash deposit';
    }
    document.querySelector('[data-i18n-key="summary_cov"]').textContent = coverageText + ':';
    animateValueUpdate(covCost, covAmt.toFixed(2)+' грн');
    
    // Плавне показ/приховування елементів покриття
    const coverageSummary = document.getElementById('coverage-summary');
    toggleElementWithAnimation(coverageSummary, covAmt > 0);
    
    const aCost=parseInt(atCount.textContent,10)*attorneyTariff;
    animateValueUpdate(atCost, aCost.toFixed(2)+' грн');
    const pCost=parseFloat(penaltyEl.value)||0;
    animateValueUpdate(penCost, pCost.toFixed(2)+' грн');
    const pkCost=parseInt(pkCount.textContent,10)*packetTariff;
    
    // Плавне показ/приховування підсумкових рядків
    const attorneySummary = document.getElementById('attorney-summary');
    const packetSummary = document.getElementById('packet-summary');
    const penaltySummary = document.getElementById('penalty-summary');
    
    toggleElementWithAnimation(attorneySummary, aCost > 0);
    toggleElementWithAnimation(packetSummary, pkCost > 0);
    toggleElementWithAnimation(penaltySummary, pCost > 0);
    
    animateValueUpdate(totCost, (rentAmt+covAmt+aCost+pCost+pkCost).toFixed(2)+' грн');
  }

  // Events
  daysEl.addEventListener('input',()=>{ syncEndDate(); calculateAll(); });
  startEl.addEventListener('change',()=>{ syncDays(); calculateAll(); });
  endEl.addEventListener('change',()=>{ syncDays(); calculateAll(); });
  [categoryEl,contractEl,coverageEl,penaltyEl,recEl,edrEl,ibanEl,linkEl].forEach(el=>el.addEventListener('input',calculateAll));
  
  atDec.addEventListener('click',()=>{ 
    atCount.textContent=Math.max(0,parseInt(atCount.textContent)-1); 
    animateCounterUpdate(atCount);
    calculateAll(); 
  });
  atInc.addEventListener('click',()=>{ 
    atCount.textContent=parseInt(atCount.textContent)+1; 
    animateCounterUpdate(atCount);
    calculateAll(); 
  });
  pkDec.addEventListener('click',()=>{ 
    pkCount.textContent=Math.max(0,parseInt(pkCount.textContent)-1); 
    animateCounterUpdate(pkCount);
    calculateAll(); 
  });
  pkInc.addEventListener('click',()=>{ 
    pkCount.textContent=parseInt(pkCount.textContent)+1; 
    animateCounterUpdate(pkCount);
    calculateAll(); 
  });

  // Generate
  genBtn.addEventListener('click',()=>{
    calculateAll();
    if (document.querySelector('.input-error')) {
      toast.textContent = langSelect.value==='uk' ? 'Виправте помилки у формі!' : 'Please fix form errors!';
      toast.classList.add('show');
      setTimeout(()=>toast.classList.remove('show'),2000);
      return;
    }
    const days=getTermDays();
    const rateObj=dailyRates.find(r=>days>=r.min&&days<=r.max)||{rates:{}};
    const dailyRate=rateObj.rates[categoryEl.value]||0;
    const rentAmount=dailyRate*days;
    const penaltyAmount=parseFloat(penaltyEl.value)||0;
    const totalAmount=rentAmount+penaltyAmount;
    const lines=[
      langSelect.value==='uk'
        ? 'Для дистанційного продовження строку дії індивідуального сейфу просимо здійснити оплату:'
        : 'To remotely extend the term of your individual safe, please make a payment:',
      '',
      (langSelect.value==='uk'
        ? `💳 Сума до сплати: ${totalAmount.toFixed(2)} грн`
        : `💳 Amount to pay: ${totalAmount.toFixed(2)} UAH`),
      (langSelect.value==='uk'
        ? `👤 Отримувач: ${recEl.value||'—'}`
        : `👤 Recipient: ${recEl.value||'—'}`),
      (langSelect.value==='uk'
        ? `🆔 Код ЄДРПОУ: ${edrEl.value||'—'}`
        : `🆔 EDRPOU: ${edrEl.value||'—'}`),
      (langSelect.value==='uk'
        ? `🏦 IBAN: ${ibanEl.value||'—'}`
        : `🏦 IBAN: ${ibanEl.value||'—'}`),
      '',
      (langSelect.value==='uk'
        ? '📝 Призначення платежу:'
        : '📝 Payment purpose:'),
      (langSelect.value==='uk'
        ? 'Продовження строку дії індивідуального сейфу'
        : 'Extension of individual safe rental period'),
      '',
      (langSelect.value==='uk'
        ? '🔗 Посилання на сплату страхування:'
        : '🔗 Insurance payment link:'),
      linkEl.value.trim()||'https://ars.aiwa.in.ua/docs/sdb/newID'
    ];
    txtArea.value=lines.join('\n');
    
    // Додаємо анімацію генерації
    animateGeneration();
    
    toast.textContent=translations[langSelect.value].toast_generated;
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'),1500);
  });

  // Copy
  copyBtn.addEventListener('click',()=>{
    if (!txtArea.value.trim()) {
      animateError(copyBtn);
      return;
    }
    navigator.clipboard.writeText(txtArea.value).then(()=>{
      // Анімація успішного копіювання
      animateSuccess(copyBtn);
      
      toast.textContent=translations[langSelect.value].toast_copied;
      toast.classList.add('show');
      setTimeout(()=>toast.classList.remove('show'),1500);
    }).catch(()=>{
      animateError(copyBtn);
    });
  });

  // Auto-send

  // Initial calculate
  calculateAll();
});

// ========== АВТОЗАПОВНЕННЯ З АНКЕТИ КЛІЄНТА ==========

// Функція для автозаповнення форми з даними клієнта
function prefillFromClient() {
    const storedData = localStorage.getItem('calculatorPreFill');
    if (!storedData) return;
    
    try {
        const data = JSON.parse(storedData);
        
        // Заповнюємо поля клієнта
        if (data.clientName) {
            const nameField = document.getElementById('client-name');
            if (nameField) {
                nameField.value = data.clientName;
                animateValueUpdate(nameField, data.clientName);
            }
        }
        
        if (data.clientEmail) {
            const emailField = document.getElementById('client-email');
            if (emailField) {
                emailField.value = data.clientEmail;
            }
        }
        
        if (data.clientPhone) {
            const phoneField = document.getElementById('client-phone');
            if (phoneField) {
                phoneField.value = data.clientPhone;
            }
        }
        
        if (data.clientIpn) {
            const ipnField = document.getElementById('client-ipn');
            if (ipnField) {
                ipnField.value = data.clientIpn;
            }
        }
        
        if (data.clientIban) {
            const ibanField = document.getElementById('client-iban');
            if (ibanField) {
                ibanField.value = data.clientIban;
            }
        }
        
        // Заповнюємо дані сейфу
        if (data.safeNumber) {
            const safeField = document.getElementById('safe-number');
            if (safeField) {
                safeField.value = data.safeNumber;
                animateValueUpdate(safeField, data.safeNumber);
            }
        }
        
        if (data.safeCategory) {
            const categoryField = document.getElementById('category');
            if (categoryField) {
                categoryField.value = data.safeCategory;
                animateValueUpdate(categoryField, data.safeCategory);
                // Викликаємо зміну для оновлення розрахунків
                categoryField.dispatchEvent(new Event('change'));
            }
        }
        
        if (data.coverage) {
            const coverageField = document.getElementById('coverage');
            if (coverageField) {
                coverageField.value = data.coverage;
                animateValueUpdate(coverageField, data.coverage);
            }
        }
        
        if (data.endDate) {
            const endDateField = document.getElementById('end-date');
            if (endDateField) {
                endDateField.value = data.endDate;
                // Автоматично розраховуємо період
                calculatePeriodFromEndDate(data.endDate);
            }
        }
        
        // Видаляємо дані після використання
        localStorage.removeItem('calculatorPreFill');
        
        // Показуємо повідомлення про успішне заповнення
        showNotification('✅ Дані клієнта автоматично заповнені!', 'success');
        
        // Запускаємо розрахунок
        setTimeout(() => {
            calculate();
        }, 500);
        
    } catch (error) {
        console.error('Помилка при автозаповненні:', error);
        localStorage.removeItem('calculatorPreFill');
    }
}

// Функція для розрахунку періоду з кінцевої дати
function calculatePeriodFromEndDate(endDate) {
    try {
        const end = new Date(endDate);
        const start = new Date();
        const diffTime = end - start;
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
        
        if (diffMonths > 0) {
            const periodField = document.getElementById('period');
            if (periodField) {
                periodField.value = diffMonths;
                animateValueUpdate(periodField, diffMonths.toString());
            }
        }
    } catch (error) {
        console.error('Помилка розрахунку періоду:', error);
    }
}

// Функція показу уведомлень
function showNotification(message, type = 'info') {
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
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
