function toggleTheme() {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
}

function changeLanguage(lang) {
  // Місце для логіки перемикання мови (UA/EN)
}

function adjustProxy(delta) {
  const countEl = document.getElementById('proxyCount');
  let count = parseInt(countEl.textContent) + delta;
  if (count < 0) count = 0;
  countEl.textContent = count;
}

function toggleFineInput() {
  const fineInput = document.getElementById('fineAmount');
  fineInput.style.display = document.getElementById('fineOption').checked ? 'block' : 'none';
}

function calculate() {
  const category = +document.getElementById('category').value;
  const days = +document.getElementById('daysCount').value || 0;
  const coverage = document.getElementById('coverageType').value;
  const proxies = +document.getElementById('proxyCount').textContent;
  const fine = document.getElementById('fineOption').checked ? +document.getElementById('fineAmount').value || 0 : 0;

  const ratePerDay = 2 * category;
  const rent = ratePerDay * days;
  const coverageAmount = coverage === 'insurance' ? 50 : 100;
  const proxyFee = proxies * 30;
  const total = rent + coverageAmount + proxyFee + fine;

  const summary = document.getElementById('summaryDetails');
  const summaryHTML = `
    <div class="summary-item"><span>Оренда:</span><span>${rent} грн</span></div>
    <div class="summary-item"><span>Забезпечення:</span><span>${coverageAmount} грн</span></div>
    <div class="summary-item"><span>Довіреностей:</span><span>${proxyFee} грн</span></div>
    <div class="summary-item"><span>Пеня:</span><span>${fine} грн</span></div>
    <hr>
    <div class="summary-total"><strong>ВСЬОГО:</strong><strong>${total} грн</strong></div>
  `;
  summary.innerHTML = summaryHTML;

  const invoiceText = `До сплати: ${total} грн\nОренда: ${rent} грн\nЗабезпечення: ${coverageAmount} грн\nДовіреностей: ${proxyFee} грн\nПеня: ${fine} грн`;
  document.getElementById('invoiceText').value = invoiceText;
}

function copyInvoice() {
  const text = document.getElementById('invoiceText').value;
  navigator.clipboard.writeText(text).then(() => showToast('Реквізити скопійовано'));
}

function printInvoice() {
  const text = document.getElementById('invoiceText').value;
  const win = window.open('', '', 'width=600,height=400');
  win.document.write(`<pre>${text}</pre>`);
  win.print();
  win.close();
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function copySummary() {
  const summary = document.getElementById('summaryDetails');
  if (!summary || summary.innerText.trim() === '') {
    showToast('Немає даних для копіювання');
    return;
  }

  const text = Array.from(summary.querySelectorAll('.summary-item, .summary-total'))
    .map(el => el.textContent.trim())
    .join('\n');

  navigator.clipboard.writeText(text).then(() => {
    showToast('Підсумок скопійовано');
  }).catch(err => {
    console.error('Помилка копіювання:', err);
    showToast('Помилка копіювання');
  });
}
