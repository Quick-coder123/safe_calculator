// clients.js
// Відображення таблиці клієнтів, вибір, видалення, експорт
let clients = [];
let filteredClients = [];

function loadClients() {
  fetch('clients.json')
    .then(r=>r.json())
    .then(data=>{
      clients = data;
      filteredClients = data;
      renderTable();
      setupSearch();
    });
}

function renderTable() {
  const tbody = document.querySelector('#clients-table tbody');
  tbody.innerHTML = '';
  filteredClients.forEach((c,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>
        <button onclick="openClient(${clients.indexOf(c)})" class="action-btn secondary" title="Переглянути анкету">Анкета</button>
        <button onclick="deleteClient(${clients.indexOf(c)})" class="action-btn" style="background:#e74c3c;">Видалити</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
function setupSearch() {
  const searchInput = document.getElementById('client-search');
  if (!searchInput) return;
  searchInput.addEventListener('input', function() {
    const value = this.value.trim().toLowerCase();
    filteredClients = clients.filter(c => c.name.toLowerCase().includes(value));
    renderTable();
  });
}

function openClient(idx) {
  localStorage.setItem('viewClient', JSON.stringify(clients[idx]));
  window.location.href = 'client.html';
}

function selectClient(idx) {
  // Зберігаємо дані у localStorage для калькулятора
  localStorage.setItem('selectedClient', JSON.stringify(clients[idx]));
  window.location.href = 'index.html';
}

function deleteClient(idx) {
  if (!confirm('Видалити клієнта?')) return;
  clients.splice(idx,1);
  saveClients();
  renderTable();
}

function saveClients() {
  fetch('clients.json', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(clients, null, 2)
  });
}

document.getElementById('export-btn').onclick = function() {
  // Експорт у CSV (Excel)
  let csv = 'ПІБ,ІПН,Категорія,Дата закінчення,Покриття,IBAN,Email,Телефон\n';
  clients.forEach(c=>{
    csv += `${c.name},${c.ipn},${c.category},${c.endDate},${c.coverage},${c.iban},${c.email},${c.phone}\n`;
  });
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'clients.csv';
  a.click();
};

loadClients();
