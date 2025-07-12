// Керування терміновими сейфами у боковому меню
class ExpiringSafesManager {
  constructor() {
    this.clients = [];
    this.expiringSafes = [];
    this.animationDelay = 100; // мс між анімаціями елементів
  }

  // ========== АНІМАЦІЙНІ МЕТОДИ ==========
  
  animateItemEntry(element, delay = 0) {
    element.style.opacity = '0';
    element.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
      element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      element.style.opacity = '1';
      element.style.transform = 'translateX(0)';
    }, delay);
  }

  animateItemUpdate(element) {
    element.style.transform = 'scale(1.05)';
    element.style.background = 'rgba(74, 144, 226, 0.1)';
    
    setTimeout(() => {
      element.style.transform = 'scale(1)';
      element.style.background = '';
    }, 200);
  }

  showLoadingState() {
    const container = document.getElementById('expiring-safes-list');
    if (container) {
      container.innerHTML = '<div class="loading-placeholder" style="height: 30px; border-radius: 4px; margin: 4px 0;"></div>';
    }
  }

  // Завантаження клієнтів з API
  async loadClients() {
    this.showLoadingState();
    
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        this.clients = await response.json();
        this.findExpiringSafes();
        this.renderExpiringSafes();
      }
    } catch (error) {
      console.error('Помилка завантаження клієнтів:', error);
      const container = document.getElementById('expiring-safes-list');
      if (container) {
        container.innerHTML = '<div style="color: #e74c3c; font-size: 0.9em; padding: 8px;">Помилка завантаження</div>';
      }
    }
  }

  // Пошук сейфів, що закінчуються
  findExpiringSafes() {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    this.expiringSafes = [];

    this.clients.forEach(client => {
      if (client.safes && Array.isArray(client.safes)) {
        client.safes.forEach((safe, safeIndex) => {
          if (safe.endDate) {
            const endDate = new Date(safe.endDate);
            
            // Перевіряємо чи термін закінчився або закінчується найближчим часом
            if (endDate <= nextWeek) {
              const isExpired = endDate < today;
              const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
              
              this.expiringSafes.push({
                client: client,
                safe: safe,
                safeIndex: safeIndex,
                endDate: endDate,
                isExpired: isExpired,
                daysLeft: daysLeft
              });
            }
          }
        });
      }
    });

    // Сортуємо: спочатку прострочені, потім за датою закінчення
    this.expiringSafes.sort((a, b) => {
      if (a.isExpired && !b.isExpired) return -1;
      if (!a.isExpired && b.isExpired) return 1;
      return a.endDate - b.endDate;
    });
  }

  // Рендеринг списку термінових сейфів
  renderExpiringSafes() {
    const container = document.getElementById('expiring-safes-list');
    const titleElement = document.querySelector('.expiring-title');
    if (!container) return;

    // Оновлюємо заголовок з лічильником
    if (titleElement) {
      const expiredCount = this.expiringSafes.filter(item => item.isExpired).length;
      const soonCount = this.expiringSafes.filter(item => !item.isExpired).length;
      
      if (this.expiringSafes.length === 0) {
        titleElement.innerHTML = '✅ Термінові сейфи';
      } else {
        const badgeClass = expiredCount > 0 ? 'badge-danger' : 'badge-warning';
        titleElement.innerHTML = `⚠️ Термінові сейфи <span class="count-badge ${badgeClass}">${this.expiringSafes.length}</span>`;
      }
      
      // Анімація оновлення заголовка
      this.animateItemUpdate(titleElement);
    }

    if (this.expiringSafes.length === 0) {
      container.innerHTML = '<div style="text-align:center;color:#666;font-size:0.75em;padding:8px;">Немає термінових сейфів</div>';
      return;
    }

    // Очищаємо контейнер
    container.innerHTML = '';

    // Створюємо елементи з анімацією
    this.expiringSafes.forEach((item, index) => {
      const statusClass = item.isExpired ? 'expired' : 'expiring-soon';
      const statusIcon = item.isExpired ? '🔴' : '⚠️';
      const statusText = item.isExpired 
        ? 'Прострочено!' 
        : `${item.daysLeft} дн.`;
      
      const element = document.createElement('a');
      element.href = `client.html?id=${encodeURIComponent(item.client.id)}`;
      element.className = `expiring-item ${statusClass}`;
      element.dataset.clientId = item.client.id;
      element.dataset.safeIndex = item.safeIndex;
      element.title = 'Натисніть, щоб перейти до анкети клієнта';
      
      element.innerHTML = `
        <div class="expiring-item-name">${statusIcon} ${this.truncateName(item.client.name)}</div>
        <div class="expiring-item-safe">🔒 Сейф №${item.safe.safeNumber || '-'}</div>
        <div class="expiring-item-date">📅 ${statusText}</div>
      `;
      
      container.appendChild(element);
      
      // Анімація появи з затримкою
      this.animateItemEntry(element, index * this.animationDelay);
    });

    // Додаємо обробники подій для кращого UX
    this.addClickHandlers();
  }

  // Додавання обробників кліків
  addClickHandlers() {
    const items = document.querySelectorAll('.expiring-item');
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        // Додаємо візуальний feedback
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
          item.style.transform = '';
        }, 150);

        // Зберігаємо інформацію про вибраний сейф для підсвічування в анкеті
        const clientId = item.dataset.clientId;
        const safeIndex = item.dataset.safeIndex;
        if (clientId && safeIndex !== undefined) {
          localStorage.setItem('highlightSafe', JSON.stringify({
            clientId: clientId,
            safeIndex: parseInt(safeIndex)
          }));
        }
      });

      // Hover звук (опціонально)
      item.addEventListener('mouseenter', () => {
        // Можна додати звуковий ефект тут
      });
    });
  }

  // Скорочення довгих імен
  truncateName(name) {
    if (!name) return '-';
    if (name.length <= 25) return name;
    return name.substring(0, 22) + '...';
  }

  // Форматування дати
  formatDate(date) {
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Ініціалізація
  init() {
    // Завантажуємо дані при завантаженні сторінки
    this.loadClients();
    
    // Оновлюємо кожні 5 хвилин
    setInterval(() => {
      this.loadClients();
    }, 5 * 60 * 1000);
  }
}

// Ініціалізація при завантаженні DOM
document.addEventListener('DOMContentLoaded', () => {
  const expiringSafesManager = new ExpiringSafesManager();
  expiringSafesManager.init();
  
  // Робимо доступним глобально для можливого використання в інших скриптах
  window.expiringSafesManager = expiringSafesManager;
});
