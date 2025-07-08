const categoryEl = document.getElementById('category');
const startEl = document.getElementById('start');
const endEl = document.getElementById('end');
const coverageEl = document.getElementById('coverage');
const contractEl = document.getElementById('contract');
const penaltyEl = document.getElementById('penalty');
const atCount = document.getElementById('at-count');
const rentCost = document.getElementById('rent-cost');
const covCost = document.getElementById('coverage-cost');
const atCost = document.getElementById('attorney-cost');
const penCost = document.getElementById('penalty-cost');
const totCost = document.getElementById('total-cost');
const langSelect = document.getElementById('lang');

const dailyRates = [
  { min: 1, max: 30, rates: { 1: 10, 2: 12, 3: 15 } },
  { min: 31, max: 90, rates: { 1: 8, 2: 10, 3: 12 } },
  { min: 91, max: 365, rates: { 1: 6, 2: 8, 3: 10 } }
];

const insuranceRates = [
  { min: 1, max: 30, cost: 50 },
  { min: 31, max: 90, cost: 100 },
  { min: 91, max: 365, cost: 150 }
];

const depositAmount = 500;
const attorneyTariff = 20;

const coverageLabels = {
  uk: { insurance: 'Страхування ключа', deposit: 'Покриття' },
  en: { insurance: 'Key insurance', deposit: 'Coverage' }
};

function getTermDays() {
  const start = new Date(startEl.value);
  const end = new Date(endEl.value);
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return isNaN(diff) ? 0 : diff;
}

function toggleVisibilityByAmount(id, amount) {
  const row = document.getElementById(id);
  if (row) row.style.display = amount > 0 ? 'flex' : 'none';
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

  rentCost.textContent = rent.toFixed(2) + ' грн';
  covCost.textContent = cov.toFixed(2) + ' грн';
  atCost.textContent = at.toFixed(2) + ' грн';
  penCost.textContent = pen.toFixed(2) + ' грн';
  totCost.textContent = total.toFixed(2) + ' грн';

  const covLabelEl = document.getElementById('coverage-label');
  covLabelEl.textContent = coverageLabels[lang][coverageEl.value] + ':';

  toggleVisibilityByAmount('rent-row', rent);
  toggleVisibilityByAmount('coverage-row', cov);
  toggleVisibilityByAmount('attorney-row', at);
  toggleVisibilityByAmount('penalty-row', pen);
}

// Події
[startEl, endEl, categoryEl, coverageEl, contractEl, penaltyEl].forEach(el =>
  el.addEventListener('change', calculateAll)
);

document.getElementById('inc-at').addEventListener('click', () => {
  atCount.textContent = parseInt(atCount.textContent, 10) + 1;
  calculateAll();
});
document.getElementById('dec-at').addEventListener('click', () => {
  const count = parseInt(atCount.textContent, 10);
  if (count > 0) {
    atCount.textContent = count - 1;
    calculateAll();
  }
});

langSelect.addEventListener('change', calculateAll);
document.addEventListener('DOMContentLoaded', calculateAll);
