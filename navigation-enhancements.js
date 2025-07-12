// Navigation enhancements with breadcrumbs, collapsible sidebar, and hotkeys
class NavigationManager {
  constructor() {
    this.sidebar = null;
    this.breadcrumbs = null;
    this.isSidebarCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  init() {
    // this.createBreadcrumbs(); // Відключено за запитом користувача
    // this.setupSidebarToggle(); // Відключено за запитом користувача  
    this.setupHotkeys();
    this.setupSmoothScrolling();
    this.applySidebarState();
    this.highlightCurrentPage();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    const pages = {
      '/index.html': 'calculator',
      '/': 'calculator',
      '/clients.html': 'clients',
      '/add-client.html': 'add-client',
      '/client.html': 'client'
    };
    
    // Get the filename from path
    const filename = path.split('/').pop() || 'index.html';
    return pages[`/${filename}`] || 'calculator';
  }

  createBreadcrumbs() {
    const breadcrumbsContainer = document.createElement('nav');
    breadcrumbsContainer.className = 'breadcrumbs';
    breadcrumbsContainer.setAttribute('aria-label', 'Breadcrumb navigation');
    
    const breadcrumbsData = this.getBreadcrumbsData();
    
    breadcrumbsContainer.innerHTML = `
      <ol class="breadcrumbs-list">
        ${breadcrumbsData.map((item, index) => `
          <li class="breadcrumb-item ${index === breadcrumbsData.length - 1 ? 'active' : ''}">
            ${index === breadcrumbsData.length - 1 ? 
              `<span aria-current="page">${item.label}</span>` :
              `<a href="${item.href}">${item.label}</a>`
            }
            ${index < breadcrumbsData.length - 1 ? '<i class="fas fa-chevron-right breadcrumb-separator"></i>' : ''}
          </li>
        `).join('')}
      </ol>
    `;

    // Insert breadcrumbs after header
    const header = document.querySelector('.header');
    if (header) {
      header.insertAdjacentElement('afterend', breadcrumbsContainer);
    }
  }

  getBreadcrumbsData() {
    const translations = {
      uk: {
        home: 'Головна',
        calculator: 'Калькулятор',
        clients: 'Клієнти',
        'add-client': 'Додати клієнта',
        client: 'Деталі клієнта'
      },
      en: {
        home: 'Home',
        calculator: 'Calculator',
        clients: 'Clients',
        'add-client': 'Add Client',
        client: 'Client Details'
      }
    };

    const lang = localStorage.getItem('lang') || 'uk';
    const t = translations[lang];

    const breadcrumbs = [
      { label: t.home, href: 'index.html' }
    ];

    switch (this.currentPage) {
      case 'calculator':
        breadcrumbs.push({ label: t.calculator, href: 'index.html' });
        break;
      case 'clients':
        breadcrumbs.push({ label: t.clients, href: 'clients.html' });
        break;
      case 'add-client':
        breadcrumbs.push({ label: t.clients, href: 'clients.html' });
        breadcrumbs.push({ label: t['add-client'], href: 'add-client.html' });
        break;
      case 'client':
        breadcrumbs.push({ label: t.clients, href: 'clients.html' });
        breadcrumbs.push({ label: t.client, href: '#' });
        break;
    }

    return breadcrumbs;
  }

  setupSidebarToggle() {
    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sidebar-toggle';
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    toggleBtn.setAttribute('aria-label', 'Toggle sidebar');
    toggleBtn.setAttribute('aria-expanded', !this.isSidebarCollapsed);

    // Add to header
    const header = document.querySelector('.header');
    if (header) {
      header.prepend(toggleBtn);
    }

    // Setup sidebar reference
    this.sidebar = document.querySelector('.sidebar');
    
    // Toggle event
    toggleBtn.addEventListener('click', () => {
      this.toggleSidebar();
    });

    // Auto-collapse on mobile
    this.handleResponsiveSidebar();
    window.addEventListener('resize', () => this.handleResponsiveSidebar());
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    localStorage.setItem('sidebar-collapsed', this.isSidebarCollapsed);
    this.applySidebarState();
    
    const toggleBtn = document.querySelector('.sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', !this.isSidebarCollapsed);
    }
  }

  applySidebarState() {
    if (this.sidebar) {
      this.sidebar.classList.toggle('collapsed', this.isSidebarCollapsed);
      document.body.classList.toggle('sidebar-collapsed', this.isSidebarCollapsed);
    }
  }

  handleResponsiveSidebar() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile && !this.isSidebarCollapsed) {
      this.isSidebarCollapsed = true;
      this.applySidebarState();
    }
  }

  highlightCurrentPage() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      
      const href = link.getAttribute('href');
      const currentFile = window.location.pathname.split('/').pop() || 'index.html';
      
      if (href === currentFile || (href === 'index.html' && currentFile === '')) {
        link.classList.add('active');
      }
    });
  }

  setupHotkeys() {
    document.addEventListener('keydown', (e) => {
      // Only trigger if no input is focused
      if (document.activeElement.tagName === 'INPUT' || 
          document.activeElement.tagName === 'TEXTAREA' ||
          document.activeElement.tagName === 'SELECT') {
        return;
      }

      // Ctrl/Cmd + key combinations
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            window.location.href = 'index.html';
            break;
          case '2':
            e.preventDefault();
            window.location.href = 'clients.html';
            break;
          case '3':
            e.preventDefault();
            window.location.href = 'add-client.html';
            break;
          case 't':
            e.preventDefault();
            if (window.themeManager) {
              window.themeManager.toggle();
            }
            break;
          case 'b':
            e.preventDefault();
            this.toggleSidebar();
            break;
        }
      }

      // Single key shortcuts
      switch (e.key) {
        case 'Escape':
          // Close any open modals or reset focus
          if (this.isSidebarCollapsed === false && window.innerWidth <= 768) {
            this.toggleSidebar();
          }
          break;
        case '?':
          e.preventDefault();
          this.showHelpModal();
          break;
      }
    });
  }

  setupSmoothScrolling() {
    // Smooth scrolling for anchor links
    document.addEventListener('click', (e) => {
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });

    // Add smooth scrolling to body
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  showHelpModal() {
    const modal = document.createElement('div');
    modal.className = 'help-modal-overlay';
    modal.innerHTML = `
      <div class="help-modal">
        <div class="help-modal-header">
          <h3><i class="fas fa-keyboard"></i> Гарячі клавіші</h3>
          <button class="help-modal-close" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="help-modal-content">
          <div class="hotkey-group">
            <h4>Навігація</h4>
            <div class="hotkey-item">
              <kbd>Ctrl + 1</kbd>
              <span>Калькулятор</span>
            </div>
            <div class="hotkey-item">
              <kbd>Ctrl + 2</kbd>
              <span>Клієнти</span>
            </div>
            <div class="hotkey-item">
              <kbd>Ctrl + 3</kbd>
              <span>Додати клієнта</span>
            </div>
          </div>
          <div class="hotkey-group">
            <h4>Інтерфейс</h4>
            <div class="hotkey-item">
              <kbd>Ctrl + T</kbd>
              <span>Змінити тему</span>
            </div>
            <div class="hotkey-item">
              <kbd>Ctrl + B</kbd>
              <span>Приховати/показати бічну панель</span>
            </div>
            <div class="hotkey-item">
              <kbd>Esc</kbd>
              <span>Закрити панель (мобільний)</span>
            </div>
            <div class="hotkey-item">
              <kbd>?</kbd>
              <span>Показати це вікно</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal events
    const closeBtn = modal.querySelector('.help-modal-close');
    const overlay = modal;

    const closeModal = () => {
      modal.remove();
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function escapeHandler(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    });

    // Animate in
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }

  updateBreadcrumbs() {
    const existingBreadcrumbs = document.querySelector('.breadcrumbs');
    if (existingBreadcrumbs) {
      existingBreadcrumbs.remove();
    }
    this.currentPage = this.getCurrentPage();
    this.createBreadcrumbs();
  }
}

// Micro-interactions and enhanced interactivity
class InteractivityManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupHoverEffects();
    this.setupMicroInteractions();
    this.setupCardInteractions();
    this.setupButtonInteractions();
    this.setupFormInteractions();
  }

  setupHoverEffects() {
    // Add hover effects to cards
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('.md-card, .client-card, .calc-section')) {
        const card = e.target.closest('.md-card, .client-card, .calc-section');
        this.animateCardHover(card, true);
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('.md-card, .client-card, .calc-section')) {
        const card = e.target.closest('.md-card, .client-card, .calc-section');
        this.animateCardHover(card, false);
      }
    });
  }

  animateCardHover(card, isHover) {
    if (!card) return;

    card.style.transition = 'all 0.3s var(--md-easing-standard)';
    
    if (isHover) {
      card.style.transform = 'translateY(-4px) scale(1.02)';
      card.style.boxShadow = 'var(--md-shadow-3)';
    } else {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = 'var(--md-shadow-1)';
    }
  }

  setupMicroInteractions() {
    // Heart animation for save actions
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-save], .save-btn, #generate-btn')) {
        this.showHeartAnimation(e.target);
      }
    });

    // Success pulse for completed actions
    document.addEventListener('submit', (e) => {
      const submitBtn = e.target.querySelector('[type="submit"]');
      if (submitBtn) {
        this.showSuccessPulse(submitBtn);
      }
    });
  }

  showHeartAnimation(element) {
    const heart = document.createElement('div');
    heart.className = 'heart-animation';
    heart.innerHTML = '<i class="fas fa-heart"></i>';
    
    const rect = element.getBoundingClientRect();
    heart.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
      transform: translate(-50%, -50%);
      color: #e91e63;
      font-size: 20px;
      pointer-events: none;
      z-index: 10000;
      animation: heartBeat 0.8s ease-out forwards;
    `;

    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 800);
  }

  showSuccessPulse(element) {
    element.classList.add('success-pulse');
    setTimeout(() => {
      element.classList.remove('success-pulse');
    }, 600);
  }

  setupCardInteractions() {
    // Add interactive states to cards
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.md-card, .client-card');
      if (card && !e.target.closest('button, a, input')) {
        this.animateCardClick(card);
      }
    });
  }

  animateCardClick(card) {
    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
      card.style.transform = '';
    }, 150);
  }

  setupButtonInteractions() {
    // Enhanced button interactions
    document.addEventListener('mousedown', (e) => {
      if (e.target.matches('button, .btn-primary, .action-btn')) {
        e.target.style.transform = 'scale(0.95)';
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (e.target.matches('button, .btn-primary, .action-btn')) {
        e.target.style.transform = '';
      }
    });

    // Add loading state to buttons during async operations
    document.addEventListener('click', async (e) => {
      if (e.target.matches('.async-btn, [data-async]')) {
        this.setButtonLoading(e.target, true);
        
        // Simulate async operation
        setTimeout(() => {
          this.setButtonLoading(e.target, false);
        }, 2000);
      }
    });
  }

  setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.dataset.originalText = button.textContent;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      button.disabled = true;
      button.classList.add('loading');
    } else {
      button.innerHTML = button.dataset.originalText || button.textContent;
      button.disabled = false;
      button.classList.remove('loading');
    }
  }

  setupFormInteractions() {
    // Enhanced form interactions
    document.addEventListener('input', (e) => {
      if (e.target.matches('input, textarea')) {
        this.handleInputAnimation(e.target);
      }
    });

    document.addEventListener('focus', (e) => {
      if (e.target.matches('input, textarea')) {
        this.animateInputFocus(e.target, true);
      }
    });

    document.addEventListener('blur', (e) => {
      if (e.target.matches('input, textarea')) {
        this.animateInputFocus(e.target, false);
      }
    });
  }

  handleInputAnimation(input) {
    const formGroup = input.closest('.form-group, .input-group');
    if (formGroup) {
      formGroup.classList.toggle('has-content', input.value.length > 0);
    }
  }

  animateInputFocus(input, isFocused) {
    const formGroup = input.closest('.form-group, .input-group');
    if (formGroup) {
      formGroup.classList.toggle('focused', isFocused);
    }
  }
}

// Initialize navigation and interactivity
document.addEventListener('DOMContentLoaded', () => {
  window.navigationManager = new NavigationManager();
  window.interactivityManager = new InteractivityManager();
});

// Export for global use
window.NavigationManager = NavigationManager;
window.InteractivityManager = InteractivityManager;
