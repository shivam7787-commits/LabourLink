/**
 * LabourLink Main Application Controller
 * Orchestrates routing across 6 perspective views, provides toast notifications,
 * and powers interactive scenario runners for the 107-page PDF blueprint.
 */

class LabourLinkApp {
  constructor() {
    this.currentView = 'customer';
    this.views = {
      customer: window.CustomerView,
      labour: window.LabourView,
      b2b: window.B2bView,
      operations: window.OperationsView,
      executive: window.ExecutiveView,
      legal: window.LegalView
    };
  }

  init() {
    this.setupNavigation();
    this.setupDemoDropdown();
    this.setupStoreSubscriptions();
    this.setupBannerDismiss();
    
    // Initial Render
    this.renderCurrentView();
    this.updateEscrowHeader();
  }

  setupNavigation() {
    const tabs = document.querySelectorAll('.role-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const viewKey = tab.dataset.view;
        this.switchView(viewKey);
      });
    });
  }

  switchView(viewKey) {
    if (!this.views[viewKey]) return;

    this.currentView = viewKey;
    document.querySelectorAll('.role-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.view === viewKey);
    });

    this.renderCurrentView();
  }

  renderCurrentView() {
    const container = document.getElementById('mainContainer');
    if (!container) return;

    const viewModule = this.views[this.currentView];
    if (viewModule && typeof viewModule.render === 'function') {
      viewModule.render(container);
    }
  }

  setupStoreSubscriptions() {
    window.LabourLinkStore.subscribe(state => {
      this.updateEscrowHeader();
      const opsBadge = document.getElementById('opsBadgeCount');
      if (opsBadge) {
        opsBadge.innerText = state.disputes.length;
        opsBadge.style.display = state.disputes.length > 0 ? 'inline-block' : 'none';
      }
    });
  }

  updateEscrowHeader() {
    const state = window.LabourLinkStore.getState();
    const el = document.getElementById('headerEscrowTotal');
    if (el) {
      el.innerText = `₹${state.escrowLedger.totalEscrowPool.toLocaleString()}`;
    }
  }

  setupBannerDismiss() {
    const btn = document.getElementById('dismissBannerBtn');
    const banner = document.getElementById('complianceBanner');
    if (btn && banner) {
      btn.addEventListener('click', () => {
        banner.style.display = 'none';
      });
    }
  }

  setupDemoDropdown() {
    const btn = document.getElementById('demoPresetsBtn');
    const menu = document.getElementById('demoMenu');

    if (btn && menu) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        menu.classList.remove('show');
      });

      menu.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          menu.classList.remove('show');
          const scenario = item.dataset.scenario;
          if (scenario) {
            this.runScenario(scenario);
          }
        });
      });

      const resetBtn = document.getElementById('resetDataBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          window.LabourLinkStore.resetToDefault();
          window.showToast('Platform State Reset', 'Restored default blueprint data.', 'info');
          this.renderCurrentView();
        });
      }
    }
  }

  runScenario(scenarioId) {
    switch (scenarioId) {
      case 'instant-booking':
        this.switchView('customer');
        window.showToast('Scenario 1: Instant Electrician Booking', 'Selected Certified Electrician. Opening Escrow checkout...', 'info');
        setTimeout(() => {
          window.CustomerView.selectedServiceId = 'srv_elec';
          window.CustomerView.render(document.getElementById('mainContainer'));
          window.CustomerView.openEscrowPaymentModal();
        }, 300);
        break;

      case 'labour-onboarding':
        this.switchView('labour');
        window.LabourView.switchTab('onboarding');
        window.LabourView.setOnboardingStage(1);
        window.showToast('Scenario 2: 7-Stage Onboarding Flow', 'Explore each stage from Registration to MCQ test & Non-employment agreement.', 'info');
        break;

      case 'simulate-dispute':
        this.switchView('operations');
        window.OperationsView.switchTab('disputes');
        window.showToast('Scenario 3: Dispute Workbench', 'Inspect active disputes, frozen escrow funds, evidence locker, and resolution outcomes.', 'warning');
        break;

      case 'antibias-test':
        this.switchView('operations');
        window.OperationsView.switchTab('matching-sim');
        window.OperationsView.simJobsToday = 6;
        window.OperationsView.updateSim('simJobsToday', 6);
        window.showToast('Scenario 4: Anti-Bias & Job Monopoly Rule', 'Simulated 6 jobs today (>5). Observe the -20% anti-monopoly score penalty!', 'info');
        break;

      case 'unit-economics':
        this.switchView('executive');
        window.showToast('Scenario 5: Unit Economics & Margins', 'Inspect ₹1,000 booking = ₹250 Rev, ₹55 Variable Cost, ₹195 Net (78% margin).', 'success');
        break;

      default:
        break;
    }
  }
}

// Global Toast System
window.showToast = function(title, body, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div>
      <div class="toast-title">${title}</div>
      <div class="toast-body">${body}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // ── Auth guard ──
  const session = window.AuthSystem ? window.AuthSystem.getSession() : null;
  if (window.AuthSystem && !session) {
    window.location.href = 'auth.html';
    return;
  }

  // ── Update user pill in header ──
  if (session) {
    const roleIcons = { customer: '🏠', labour: '👷', b2b: '🏢', admin: '🛡️' };
    const roleLabels = { customer: 'Customer', labour: 'Worker', b2b: 'B2B', admin: 'Admin' };
    const pillName = document.getElementById('userPillName');
    const pillRole = document.getElementById('userPillRole');
    const pillIcon = document.getElementById('userPillIcon');
    if (pillName) pillName.textContent = session.name || 'User';
    if (pillRole) pillRole.textContent = roleLabels[session.role] || session.role;
    if (pillIcon) pillIcon.textContent = roleIcons[session.role] || '👤';
  }

  window.LabourLinkApp = new LabourLinkApp();
  window.LabourLinkApp.init();
});
