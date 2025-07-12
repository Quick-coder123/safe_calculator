// clients.js
// Відображення таблиці клієнтів, вибір, видалення, експорт

// ========== АНІМАЦІЙНІ ФУНКЦІЇ ==========

function animateRowEntry(row, delay = 0) {
  row.style.opacity = '0';
  row.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    row.style.transition = 'all 0.3s ease';
    row.style.opacity = '1';
    row.style.transform = 'translateY(0)';
  }, delay);
}

function animateRowExit(row, callback) {
  row.style.transition = 'all 0.3s ease';
  row.style.opacity = '0';
  row.style.transform = 'translateX(-20px)';
  
  setTimeout(() => {
    if (callback) callback();
  }, 300);
}

function showLoadingState() {
  const tbody = document.querySelector('#clients-table tbody');
  tbody.innerHTML = '<tr><td colspan="2" class="loading-placeholder" style="height: 40px; text-align: center;">Завантаження...</td></tr>';
}

let clients = [];
let filteredClients = [];

function loadClients() {
  showLoadingState();
  
  fetch('/api/clients')
    .then(r=>r.json())
    .then(data=>{
      clients = data;
      filteredClients = data;
      renderTable();
      setupSearch();
    })
    .catch(() => {
      const tbody = document.querySelector('#clients-table tbody');
      tbody.innerHTML = '<tr><td colspan="2" style="text-align: center; color: #e74c3c;">Помилка завантаження даних</td></tr>';
    });
}

function renderTable() {
  const tbody = document.querySelector('#clients-table tbody');
  tbody.innerHTML = '';
  
  filteredClients.forEach((c, index)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>
        <a href="client.html?id=${c.id}" class="action-btn secondary" title="Переглянути анкету">Анкета</a>
        <button onclick="deleteClient(${clients.indexOf(c)})" class="action-btn" style="background:#e74c3c;">Видалити</button>
      </td>
    `;
    tbody.appendChild(tr);
    
    // Додаємо анімацію появи з затримкою
    animateRowEntry(tr, index * 50);
  });
}
function setupSearch() {
  const searchInput = document.getElementById('client-search');
  if (!searchInput) return;
  
  let searchTimeout;
  
  searchInput.addEventListener('input', function() {
    const value = this.value.trim().toLowerCase();
    
    // Додаємо невелику затримку для кращого UX
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      // Додаємо ефект завантаження
      const tbody = document.querySelector('#clients-table tbody');
      tbody.style.opacity = '0.5';
      
      filteredClients = clients.filter(c => c.name.toLowerCase().includes(value));
      
      setTimeout(() => {
        renderTable();
        tbody.style.opacity = '1';
      }, 150);
    }, 300);
  });
  
  // Анімація фокусу на полі пошуку
  searchInput.addEventListener('focus', function() {
    this.parentElement.style.transform = 'scale(1.02)';
  });
  
  searchInput.addEventListener('blur', function() {
    this.parentElement.style.transform = 'scale(1)';
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
  
  // Знаходимо рядок для анімації
  const rows = document.querySelectorAll('#clients-table tbody tr');
  const rowToDelete = rows[filteredClients.findIndex(c => c === clients[idx])];
  
  if (rowToDelete) {
    animateRowExit(rowToDelete, () => {
      const id = typeof idx === 'string' ? idx : clients[idx].id;
      fetch(`/api/clients?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
        .then(()=>loadClients())
        .catch(() => {
          // У разі помилки повертаємо рядок
          rowToDelete.style.opacity = '1';
          rowToDelete.style.transform = 'translateX(0)';
          alert('Помилка видалення клієнта');
        });
    });
  } else {
    // Fallback без анімації
    const id = typeof idx === 'string' ? idx : clients[idx].id;
    fetch(`/api/clients?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      .then(()=>loadClients());
  }
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
