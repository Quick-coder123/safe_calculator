document.addEventListener('DOMContentLoaded', () => {
  // 1. Тарифи
  const dailyRates = [
    { min: 1,   max: 30,  rates: { 1: 39,  2: 51,  3: 63,  4: 63,  5: 63  } },
    { min: 31,  max: 90,  rates: { 1: 25,  2: 26,  3: 28,  4: 35,  5: 43  } },
    { min: 91,  max: 180, rates: { 1: 22,  2: 24,  3: 26,  4: 33,  5: 41  } },
    { min: 181, max: 365, rates: { 1: 20,  2: 22,  3: 24,  4: 29,  5: 40  } },
  ];
  const insuranceRates = [
    { min: 1,   max: 90,  cost: 285 },
    { min: 91,  max: 180, cost: 370 },
    { min: 181, max: 270, cost: 430 },
    { min: 271, max: 365, cost: 550 },
  ];
  const depositAmount  = 3000;
  const attorneyTariff = 300;

  // 2. DOM
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
  const copyBtn      = document.getElementById('copy-btn');
  const copySumBtn   = document.getElementById('copy-summary-btn');
  const toast        = document.getElementById('toast');
  const warningEl    = document.getElementById('end-warning');

  // 3. Заповнення селектів
  categoryEl.innerHTML = `
    <option value="1">Категорія І</option>
    <option value="2">Категорія ІІ</option>
    <option value="3">Категорія ІІІ</option>
    <option value="4">Категорія ІV</option>
    <option value="5">Категорія V</option>
  `;
  contractEl.innerHTML = `
    <option value="new">Новий договір</option>
    <option value="extension">Продовження</option>
  `;
  coverageEl.innerHTML = `
    <option value="insurance">Страхування ключа</option>
    <option value="deposit">Грошове покриття</option>
  `;

  // 4. Утиліти
  function getTermDays() {
    const s = new Date(startEl.value);
    const e = new Date(endEl.value);
    const diff = Math.round((e - s) / (1000*60*60*24)) + 1;
    return diff > 0 ? diff : 0;
  }
  function syncEndDate() {
    const days = parseInt(daysEl.value,10)||1;
    const s = new Date(startEl.value);
    s.setDate(s.getDate()+days-1);
    endEl.value = s.toISOString().slice(0,10);
  }
  function syncDays() { daysEl.value = getTermDays(); }
  function checkWeekend(d) {
    const dow = new Date(d).getDay();
    warningEl.style.display = (dow===0||dow===6)?'block':'none';
  }
  function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn.apply(this,a),ms);} }

  function calculateAll(){
    const days = getTermDays();
    outDays.textContent = `${days} дн.`;
    const dr = dailyRates.find(r=>days>=r.min&&days<=r.max)||{rates:{}};
    const rate=dr.rates[categoryEl.value]||0;
    outRate.textContent=`${rate.toFixed(2)} грн/день`;
    const rent=rate*days;rentCost.textContent=`${rent.toFixed(2)} грн`;
    let cov=0;
    if(coverageEl.value==='insurance'){
      const ins=insuranceRates.find(r=>days>=r.min&&days<=r.max)||{cost:0};
      cov=ins.cost;
    }else if(contractEl.value==='new'){ cov=depositAmount; }
    covCost.textContent=`${cov.toFixed(2)} грн`;
    const a=parseInt(atCount.textContent,10)||0;const aSum=a*attorneyTariff;atCost.textContent=`${aSum.toFixed(2)} грн`;
    const p=parseFloat(penaltyEl.value)||0;penCost.textContent=`${p.toFixed(2)} грн`;
    const tot=rent+cov+aSum+p;totCost.textContent=`${tot.toFixed(2)} грн`;
    checkWeekend(endEl.value);
  }

  function generatePaymentText(){
    const tot=parseFloat(totCost.textContent)||0;
    txtArea.value=[
      'Для дистанційного продовження строку дії індивідуального сейфу просимо здійснити оплату:','',
      `💳 Сума до сплати: ${tot.toFixed(2)} грн`,
      `👤 Отримувач: ${recEl.value||'—'}`,
      `🆔 Код ЄДРПОУ: ${edrEl.value||'—'}`,
      `🏦 IBAN: ${ibanEl.value||'—'}`, '', '📝 Призначення платежу:','Продовження строку дії індивідуального сейфу','',
      '🔗 Посилання на сплату страхування:',linkEl.value.trim()||'https://ars.aiwa.in.ua/docs/sdb/newID'
    ].join('\n');
  }

  function showToast(msg){toast.textContent=msg;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1500);}

  // 5. Події
  daysEl.addEventListener('input',debounce(()=>{syncEndDate();calculateAll();},300));
  startEl.addEventListener('change',()=>{syncEndDate();calculateAll();});
  endEl.addEventListener('change',()=>{syncDays();calculateAll();});
  [categoryEl,contractEl,coverageEl].forEach(el=>el.addEventListener('change',calculateAll));
  atDec.addEventListener('click',()=>{let n=parseInt(atCount.textContent,10);if(n>0)atCount.textContent=--n;calculateAll();});
  atInc.addEventListener('click',()=>{atCount.textContent++;calculateAll();});
  genBtn.addEventListener('click',()=>{genBtn.disabled=true;calculateAll();generatePaymentText();genBtn.disabled=false;showToast('Реквізити згенеровано');});
  copyBtn.addEventListener('click',()=>{txtArea.select();document.execCommand('copy');showToast('Текст скопійовано');});
  copySumBtn.addEventListener('click',()=>{const lines=['Підсумкова інформація:'];document.querySelectorAll('.summary-panel .summary-item').forEach(item=>{const l=item.querySelector('span:first-child').textContent.replace(/:$/,'').trim();const v=item.querySelector('span:last-child').textContent.trim();lines.push(`${l}: ${v}`);});const tl=document.querySelector('.summary-panel .summary-total strong').textContent.replace(/:$/,'').trim();const tv=document.querySelector('.summary-panel .summary-total span').textContent.trim();lines.push(`${tl}: ${tv}`);const tmp=document.createElement('textarea');tmp.value=lines.join('\n');document.body.appendChild(tmp);tmp.select();document.execCommand('copy');document.body.removeChild(tmp);showToast('Підсумки скопійовано');});

  // 6. Ініціалізація
  const today=new Date().toISOString().slice(0,10);
  startEl.value=endEl.value=today;
  syncEndDate();
  calculateAll();
});
