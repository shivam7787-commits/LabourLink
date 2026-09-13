/**
 * LabourLink B2B & Company Portal View
 * Simple, clean bulk labour hiring and attendance for businesses
 */

const B2bView = {
  activeContractTab: 'contracts',
  requestedWorkersCount: 15,
  tradeCategory: 'Construction Helpers',

  render(container) {
    container.innerHTML = `
      <div class="dashboard-grid">
        <div class="col-12">
          <div class="glass-card" style="padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <h2 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: #fff;">Apex Infrastructure Ltd</h2>
                <span class="badge badge-purple">Business Account</span>
                <span class="badge badge-green">Dedicated Support Active</span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 3px;">
                Bulk Worker Management • Single Monthly Invoices • Verified Independent Contractors
              </div>
            </div>

            <div class="filter-pills" style="margin-bottom: 0;">
              <button class="pill-btn ${this.activeContractTab === 'contracts' ? 'active' : ''}" onclick="B2bView.switchTab('contracts')">
                <i data-lucide="file-text" style="width: 14px; height: 14px; display: inline;"></i> Active Contracts
              </button>
              <button class="pill-btn ${this.activeContractTab === 'bulk-request' ? 'active' : ''}" onclick="B2bView.switchTab('bulk-request')">
                <i data-lucide="users" style="width: 14px; height: 14px; display: inline;"></i> Hire Multiple Workers
              </button>
              <button class="pill-btn ${this.activeContractTab === 'attendance' ? 'active' : ''}" onclick="B2bView.switchTab('attendance')">
                <i data-lucide="check-square" style="width: 14px; height: 14px; display: inline;"></i> Today's Attendance
              </button>
              <button class="pill-btn ${this.activeContractTab === 'payroll' ? 'active' : ''}" onclick="B2bView.switchTab('payroll')">
                <i data-lucide="receipt" style="width: 14px; height: 14px; display: inline;"></i> Monthly Bills &amp; GST
              </button>
              <button class="pill-btn ${this.activeContractTab === 'subscriptions' ? 'active' : ''}" onclick="B2bView.switchTab('subscriptions')">
                <i data-lucide="shield" style="width: 14px; height: 14px; display: inline;"></i> Plans
              </button>
            </div>
          </div>
        </div>

        <div class="col-12">
          ${this.renderTabBody()}
        </div>
      </div>
    `;

    lucide.createIcons();
  },

  switchTab(tab) {
    this.activeContractTab = tab;
    this.render(document.getElementById('mainContainer'));
  },

  renderTabBody() {
    switch (this.activeContractTab) {
      case 'contracts':
        return this.renderContracts();
      case 'bulk-request':
        return this.renderBulkRequest();
      case 'attendance':
        return this.renderAttendanceSheet();
      case 'payroll':
        return this.renderManagedPayroll();
      case 'subscriptions':
        return this.renderB2BSubscriptions();
      default:
        return '';
    }
  },

  renderContracts() {
    return `
      <div class="dashboard-grid">
        <div class="col-8">
          <div class="glass-card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="file-check" style="color: #60a5fa;"></i>
                <span>Your Active Labour Contracts</span>
              </div>
              <button class="btn btn-primary btn-sm" onclick="B2bView.switchTab('bulk-request')">
                + Hire More Workers
              </button>
            </div>

            <div style="background: #101626; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff;">Metro Station Site 4 - Construction Helpers</h3>
                  <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
                    25 Workers Every Day • Valid till 31 Oct 2026
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 0.72rem; color: var(--text-secondary);">Monthly Cost</div>
                  <div style="font-family: var(--font-mono); font-size: 1.3rem; font-weight: 800; color: #38bdf8;">₹5,25,000</div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; margin: 1rem 0; background: #0c1220; padding: 0.75rem; border-radius: var(--radius-sm);">
                <div>
                  <div style="font-size: 0.7rem; color: var(--text-secondary);">Attendance Rate</div>
                  <strong style="color: #34d399;">98.4% Guaranteed</strong>
                </div>
                <div>
                  <div style="font-size: 0.7rem; color: var(--text-secondary);">Fast Replacement</div>
                  <strong style="color: #60a5fa;">&lt; 90 min if absent</strong>
                </div>
                <div>
                  <div style="font-size: 0.7rem; color: var(--text-secondary);">Safety Gear (PPE)</div>
                  <strong style="color: #fbbf24;">100% Equipped</strong>
                </div>
              </div>

              <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="btn btn-glass btn-sm" onclick="B2bView.switchTab('attendance')">Check Today's Roster</button>
                <button class="btn btn-glass btn-sm" onclick="B2bView.downloadInvoice()">Download Monthly Invoice</button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-4">
          <div class="glass-card">
            <div class="card-header">
              <div class="card-title" style="font-size: 0.95rem;">
                <i data-lucide="shield-check" style="color: #34d399;"></i>
                <span>Zero Hiring Hassle</span>
              </div>
            </div>
            <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6;">
              • <strong>No PF or ESI Liabilities:</strong> All workers are independent professionals supplied via the aggregator platform.<br><br>
              • <strong>Single GST Invoice:</strong> All shifts, overtime, and payments are combined into one simple tax-deductible bill each month.<br><br>
              • <strong>Immediate Replacements:</strong> If anyone is sick or absent, a backup worker is sent within 90 minutes.
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderBulkRequest() {
    return `
      <div class="glass-card" style="max-width: 750px; margin: 0 auto;">
        <div class="card-header">
          <div class="card-title">
            <i data-lucide="users" style="color: #38bdf8;"></i>
            <span>Hire a Group of Workers</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Type of Work</label>
            <select class="form-control form-select">
              <option>Construction Helpers &amp; Loaders</option>
              <option>Electricians &amp; Plumbers</option>
              <option>Warehouse Packing &amp; Moving</option>
              <option>Factory Machine Operators</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Number of Workers</label>
            <input type="number" class="form-control" value="15" min="5" max="100">
          </div>

          <div class="form-group">
            <label class="form-label">Contract Period</label>
            <select class="form-control form-select">
              <option>1 Month (Trial)</option>
              <option selected>3 Months</option>
              <option>6 Months (5% Discount)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Work Shift</label>
            <select class="form-control form-select">
              <option>Day Shift (8 AM - 5 PM)</option>
              <option>Night Shift (10 PM - 6 AM)</option>
            </select>
          </div>
        </div>

        <div style="background: #101626; border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem; border: 1px solid var(--border-light);">
          <div style="font-size: 0.85rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem;">
            Estimated Monthly Cost (15 Workers × 26 Days)
          </div>
          <div class="breakdown-row">
            <span>Worker Wages:</span>
            <span style="font-family: var(--font-mono);">₹2,73,000</span>
          </div>
          <div class="breakdown-row">
            <span>LabourLink Coordination Fee (6%):</span>
            <span style="font-family: var(--font-mono); color: #34d399;">₹16,380</span>
          </div>
          <div class="breakdown-row">
            <span>18% GST (Tax Credit Available):</span>
            <span style="font-family: var(--font-mono);">₹52,088</span>
          </div>
          <div class="breakdown-row highlight">
            <span>Total Monthly Cost:</span>
            <span style="font-family: var(--font-mono); color: #38bdf8;">₹3,41,468</span>
          </div>
        </div>

        <button class="btn btn-primary btn-block btn-lg" onclick="B2bView.submitBulkOrder()">
          Submit Hiring Request
        </button>
      </div>
    `;
  },

  renderAttendanceSheet() {
    return `
      <div class="glass-card">
        <div class="card-header">
          <div class="card-title">
            <i data-lucide="check-square" style="color: #34d399;"></i>
            <span>Today's On-Site Attendance</span>
          </div>
          <span class="badge badge-green">Site 4 - Metro Yard (25/25 Present)</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-top: 0.5rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-light); text-align: left; color: var(--text-secondary);">
              <th style="padding: 0.6rem 0.5rem;">Worker Name</th>
              <th style="padding: 0.6rem 0.5rem;">Trade</th>
              <th style="padding: 0.6rem 0.5rem;">Arrival Time</th>
              <th style="padding: 0.6rem 0.5rem;">Daily Wage</th>
              <th style="padding: 0.6rem 0.5rem;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px dashed rgba(255, 255, 255, 0.06);">
              <td style="padding: 0.65rem 0.5rem; font-weight: 600; color: #fff;">Ramesh Kumar</td>
              <td style="padding: 0.65rem 0.5rem;">Electrician</td>
              <td style="padding: 0.65rem 0.5rem; color: #34d399;">07:54 AM (On Time)</td>
              <td style="padding: 0.65rem 0.5rem; font-family: var(--font-mono);">₹1,400</td>
              <td style="padding: 0.65rem 0.5rem;"><span class="badge badge-green">Working</span></td>
            </tr>
            <tr style="border-bottom: 1px dashed rgba(255, 255, 255, 0.06);">
              <td style="padding: 0.65rem 0.5rem; font-weight: 600; color: #fff;">Sunil Paswan</td>
              <td style="padding: 0.65rem 0.5rem;">Helper / Loader</td>
              <td style="padding: 0.65rem 0.5rem; color: #34d399;">07:58 AM (On Time)</td>
              <td style="padding: 0.65rem 0.5rem; font-family: var(--font-mono);">₹700</td>
              <td style="padding: 0.65rem 0.5rem;"><span class="badge badge-green">Working</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  renderManagedPayroll() {
    return `
      <div class="glass-card">
        <div class="card-header">
          <div class="card-title">
            <i data-lucide="receipt" style="color: #fbbf24;"></i>
            <span>Monthly Billing Statements</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
          <div class="metric-card">
            <div class="metric-title">Active Workers</div>
            <div class="metric-value">37</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Total Labour Wages</div>
            <div class="metric-value" style="color: #34d399;">₹7,65,000</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">LabourLink Fee (6%)</div>
            <div class="metric-value" style="color: #38bdf8;">₹45,900</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">GST Input Credit</div>
            <div class="metric-value" style="color: #fbbf24;">₹8,262</div>
          </div>
        </div>

        <button class="btn btn-emerald" onclick="B2bView.downloadInvoice()">
          <i data-lucide="download"></i>
          <span>Download September Invoice (PDF)</span>
        </button>
      </div>
    `;
  },

  renderB2BSubscriptions() {
    return `
      <div class="glass-card">
        <div class="card-header">
          <div class="card-title">
            <i data-lucide="shield" style="color: #8b5cf6;"></i>
            <span>Business Plans</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem;">
          <div style="background: #101626; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.25rem;">
            <h3>Basic Business</h3>
            <div style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono); margin: 0.5rem 0;">₹999<span style="font-size: 0.8rem; color: var(--text-secondary);">/mo</span></div>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">For small teams up to 10 workers per month.</p>
            <button class="btn btn-glass btn-block btn-sm">Select Basic</button>
          </div>

          <div style="background: #172554; border: 2px solid #3b82f6; border-radius: var(--radius-lg); padding: 1.25rem;">
            <span class="badge badge-blue" style="margin-bottom: 0.4rem;">Active Plan</span>
            <h3>Pro Business</h3>
            <div style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono); margin: 0.5rem 0;">₹2,999<span style="font-size: 0.8rem; color: var(--text-secondary);">/mo</span></div>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">Fast worker replacement guarantee (&lt;90 mins) and priority matching.</p>
            <button class="btn btn-primary btn-block btn-sm" disabled>Current Active Plan</button>
          </div>

          <div style="background: #101626; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.25rem;">
            <h3>Enterprise</h3>
            <div style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono); margin: 0.5rem 0;">Custom</div>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">Dedicated account manager and custom shift contracts.</p>
            <button class="btn btn-glass btn-block btn-sm">Contact Us</button>
          </div>
        </div>
      </div>
    `;
  },

  submitBulkOrder() {
    window.showToast('Hiring Request Received!', 'Our operations team will source and assign your workers within 24 hours.', 'success');
    this.switchTab('contracts');
  },

  downloadInvoice() {
    window.showToast('Invoice Downloaded', 'September GST invoice saved to downloads.', 'success');
  }
};

window.B2bView = B2bView;
