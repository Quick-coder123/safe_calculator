// clients.js
// Відображення таблиці клієнтів, вибір, видалення, експорт
let clients = [];
let filteredClients = [];

function loadClients() {
  fetch('/api/clients')
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
  filteredClients.forEach((c)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>
        <a href="client.html?id=${c.id}" class="action-btn secondary" title="Переглянути анкету">Анкета</a>
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
// openClient більше не потрібен, бо анкета відкривається за id
}

function selectClient(idx) {
  // Зберігаємо дані у localStorage для калькулятора
  localStorage.setItem('selectedClient', JSON.stringify(clients[idx]));
  window.location.href = 'index.html';
}

function deleteClient(idx) {
  if (!confirm('Видалити клієнта?')) return;
  const id = typeof idx === 'string' ? idx : clients[idx].id;
  fetch(`/api/clients?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    .then(()=>loadClients());
}

function saveClients() {
  // Відправляємо лише останнього клієнта (додавання)
  fetch('/api/clients', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(clients[clients.length-1])
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
