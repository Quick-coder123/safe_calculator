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
  const copyBtn     = document.getElementById('copy-btn');
  const printBtn    = document.getElementById('print-btn');
  const txtArea     = document.getElementById('payment-text');
  const toast       = document.getElementById('toast');
  const warningEl   = document.getElementById('end-warning');

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

  // Translations + selects
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
    const catLabels = lang==='uk'
      ? ['1 категорія','2 категорія','3 категорія','4 категорія','5 категорія']
      : ['Category 1','Category 2','Category 3','Category 4','Category 5'];
    categoryEl.innerHTML = catLabels.map((t,i)=>`<option value="${i+1}">${t}</option>`).join('');
    const conLabels = lang==='uk' ? ['Новий','Пролонгація'] : ['New','Prolongation'];
    contractEl.innerHTML = conLabels.map((t,i)=>`<option value="${i===0?'new':'prolong'}">${t}</option>`).join('');
    const covLabels = lang==='uk' ? ['Страхування ключа','Грошове покриття'] : ['Key Insurance','Cash Deposit'];
    coverageEl.innerHTML = covLabels.map((t,i)=>`<option value="${i===0?'insurance':'deposit'}">${t}</option>`).join('');
    document.querySelectorAll('[data-i18n-key]').forEach(el=>{
      const key = el.dataset.i18nKey;
      if(translations[lang][key]) el.textContent = translations[lang][key];
    });
    recEl.placeholder = translations[lang].label_rec;
    edrEl.placeholder = '1234567890';
    document.querySelector('#edrpou + .tooltiptext').textContent = translations[lang].hint_edr;
    ibanEl.placeholder = 'UA1234...';
    document.querySelector('#iban + .tooltiptext').textContent = translations[lang].hint_iban;
    linkEl.placeholder = 'https://...';
  }

  // Check weekend
  function checkWeekend(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDay();
    if (day === 0 || day === 6) {
      warningEl.style.display = 'block';
    } else {
      warningEl.style.display = 'none';
    }
  }

  // Rates
  const dailyRates = [
    {min:1,max:30,  rates:{1:39,2:51,3:63,4:63,5:63}},
    {min:31,max:90, rates:{1:25,2:26,3:28,4:35,5:43}},
    {min:91,max:180,rates:{1:22,2:24,3:26,4:33,5:41}},
    {min:181,max:365,rates:{1:20,2:22,3:24,4:29,5:40}}
  ];
  const insuranceRates = [
    {min:1,max:90,  cost:285},
    {min:91,max:180,cost:370},
    {min:181,max:270,cost:430},
    {min:271,max:365,cost:550}
  ];
  const attorneyTariff=300, packetTariff=30, depositAmount=3000;

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
    const days=getTermDays();
    const rateObj=dailyRates.find(r=>days>=r.min&&days<=r.max)||{rates:{}};
    const dailyRate=rateObj.rates[categoryEl.value]||0;
    outRate.textContent = dailyRate.toFixed(2)+' грн/день';
    outDays.textContent = days+' днів';
    outEnd.textContent = endEl.value.split('-').reverse().join('-');
    const rentAmt=dailyRate*days;
    rentCost.textContent = rentAmt.toFixed(2)+' грн';
    const insObj=insuranceRates.find(r=>days>=r.min&&days<=r.max)||{};
    const covAmt=coverageEl.value==='insurance'?insObj.cost:(contractEl.value==='new'?depositAmount:0);
    covCost.textContent = covAmt.toFixed(2)+' грн';
    const aCost=parseInt(atCount.textContent,10)*attorneyTariff;
    atCost.textContent = aCost.toFixed(2)+' грн';
    const pCost=parseFloat(penaltyEl.value)||0;
    penCost.textContent = pCost.toFixed(2)+' грн';
    const pkCost=parseInt(pkCount.textContent,10)*packetTariff;
    totCost.textContent = (rentAmt+covAmt+aCost+pCost+pkCost).toFixed(2)+' грн';
    checkWeekend(endEl.value);
  }

  const savedLang = localStorage.getItem('lang') || 'uk';
  langSelect.value = savedLang;
  applyTranslations(savedLang);

  // Events
  daysEl.addEventListener('input',()=>{ syncEndDate(); calculateAll(); });
  startEl.addEventListener('change',()=>{ syncDays(); calculateAll(); });
  endEl.addEventListener('change',()=>{ syncDays(); calculateAll(); });
  [categoryEl,contractEl,coverageEl,penaltyEl].forEach(el=>el.addEventListener('change',calculateAll));
  atDec.addEventListener('click',()=>{ atCount.textContent=Math.max(0,parseInt(atCount.textContent)-1); calculateAll(); });
  atInc.addEventListener('click',()=>{ atCount.textContent=parseInt(atCount.textContent)+1; calculateAll(); });
  pkDec.addEventListener('click',()=>{ pkCount.textContent=Math.max(0,parseInt(pkCount.textContent)-1); calculateAll(); });
  pkInc.addEventListener('click',()=>{ pkCount.textContent=parseInt(pkCount.textContent)+1; calculateAll(); });

  genBtn.addEventListener('click',()=>{
    calculateAll();
    const days=getTermDays();
    const rateObj=dailyRates.find(r=>days>=r.min&&days<=r.max)||{rates:{}};
    const dailyRate=rateObj.rates[categoryEl.value]||0;
    const rentAmount=dailyRate*days;
    const penaltyAmount=parseFloat(penaltyEl.value)||0;
    const totalAmount=rentAmount+penaltyAmount;
    const lines=[
      'Для дистанційного продовження строку дії індивідуального сейфу просимо здійснити оплату:',
      '',
      `💳 Сума до сплати: ${totalAmount.toFixed(2)} грн`,
      `👤 Отримувач: ${recEl.value||'—'}`,
      `🆔 Код ЄДРПОУ: ${edrEl.value||'—'}`,
      `🏦 IBAN: ${ibanEl.value||'—'}`,
      '',
      '📝 Призначення платежу:',
      'Продовження строку дії індивідуального сейфу',
      '',
      '🔗 Посилання на сплату страхування:',
      linkEl.value.trim()||'https://ars.aiwa.in.ua/docs/sdb/newID'
    ];
    txtArea.value=lines.join('\n');
    toast.textContent=translations[langSelect.value].toast_generated;
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'),1500);
  });

  copyBtn.addEventListener('click',()=>{
    navigator.clipboard.writeText(txtArea.value).then(()=>{
      toast.textContent=translations[langSelect.value].toast_copied;
      toast.classList.add('show');
      setTimeout(()=>toast.classList.remove('show'),1500);
    });
  });

  printBtn.addEventListener('click',()=>{
    const inv=document.getElementById('invoice-print');
    inv.innerHTML=`<pre>${txtArea.value}</pre>`;
    inv.removeAttribute('aria-hidden');
    window.print();
    inv.setAttribute('aria-hidden','true');
  });

  // Init
  const today = new Date().toISOString().slice(0,10);
  startEl.value = endEl.value = today;
  calculateAll();
});
