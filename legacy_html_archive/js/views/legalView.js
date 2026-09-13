/**
 * LabourLink Safety & Rules View (Legal & Compliance)
 * Simple, clean, plain-English terms and official legal frameworks
 */

const LegalView = {
  activeDoc: 'aggregator-agreement',

  render(container) {
    container.innerHTML = `
      <div class="dashboard-grid">
        <div class="col-12">
          <div class="glass-card" style="padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <h2 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: #fff;">Safety, Terms &amp; Platform Rules</h2>
                <span class="badge badge-green">Safe Harbor Protection</span>
                <span class="badge badge-blue">Verified Independent Contractors</span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 3px;">
                Clear, simple terms for customers and workers
              </div>
            </div>

            <div class="filter-pills" style="margin-bottom: 0;">
              <button class="pill-btn ${this.activeDoc === 'aggregator-agreement' ? 'active' : ''}" onclick="LegalView.switchDoc('aggregator-agreement')">
                <i data-lucide="file-text" style="width: 14px; height: 14px; display: inline;"></i> Platform Agreement
              </button>
              <button class="pill-btn ${this.activeDoc === 'escrow-policy' ? 'active' : ''}" onclick="LegalView.switchDoc('escrow-policy')">
                <i data-lucide="lock" style="width: 14px; height: 14px; display: inline;"></i> Escrow &amp; Refunds
              </button>
              <button class="pill-btn ${this.activeDoc === 'code-of-conduct' ? 'active' : ''}" onclick="LegalView.switchDoc('code-of-conduct')">
                <i data-lucide="shield-alert" style="width: 14px; height: 14px; display: inline;"></i> Code of Conduct
              </button>
              <button class="pill-btn ${this.activeDoc === 'privacy-data' ? 'active' : ''}" onclick="LegalView.switchDoc('privacy-data')">
                <i data-lucide="database" style="width: 14px; height: 14px; display: inline;"></i> Privacy &amp; Data
              </button>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="glass-card" style="padding: 1.75rem;">
            ${this.renderDocumentBody()}
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();
  },

  switchDoc(key) {
    this.activeDoc = key;
    this.render(document.getElementById('mainContainer'));
  },

  renderDocumentBody() {
    switch (this.activeDoc) {
      case 'aggregator-agreement':
        return `
          <div style="max-width: 850px; margin: 0 auto; line-height: 1.7; font-size: 0.88rem;">
            <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
              <h2 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff;">
                Platform Service Agreement &amp; Independent Worker Rules
              </h2>
            </div>

            <!-- Plain English Box -->
            <div style="background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: var(--radius-md); padding: 1.15rem; margin-bottom: 1.5rem; font-size: 0.84rem; color: #bfdbfe;">
              <strong style="color: #fff; font-size: 0.92rem;">In Plain English:</strong><br>
              1. <strong>We connect you:</strong> LabourLink connects customers with skilled workers. We do not directly employ the workers.<br>
              2. <strong>Independent Workers:</strong> Workers choose their own hours and accept jobs freely. They are independent freelance professionals.<br>
              3. <strong>Safe Payments:</strong> We hold customer payments safely until the job is done to protect both sides.<br>
              4. <strong>Legal Safety:</strong> This protects the platform and businesses from employee payroll, PF, and ESI obligations.
            </div>

            <h3 style="color: #fff; font-size: 1.05rem; margin-top: 1.25rem; margin-bottom: 0.4rem;">1. Role of LabourLink</h3>
            <p style="color: var(--text-secondary);">
              LabourLink operates an aggregator and technology matching platform. Our role is to verify worker identity, provide transparent pricing, safely manage escrow payments, and resolve disputes.
            </p>

            <h3 style="color: #fff; font-size: 1.05rem; margin-top: 1.25rem; margin-bottom: 0.4rem;">2. Independent Contractor Status</h3>
            <p style="color: var(--text-secondary);">
              All service providers registered on the platform are independent contractors. They are not employees of LabourLink or the customer. They have complete freedom to choose when they work and which jobs they accept.
            </p>

            <h3 style="color: #fff; font-size: 1.05rem; margin-top: 1.25rem; margin-bottom: 0.4rem;">3. Fair Platform Commission</h3>
            <p style="color: var(--text-secondary);">
              LabourLink charges a transparent commission between 10% and 25% on completed jobs to cover payment processing, customer support, and platform insurance. All customer tips go 100% directly to the worker.
            </p>
          </div>
        `;

      case 'escrow-policy':
        return `
          <div style="max-width: 850px; margin: 0 auto; line-height: 1.7; font-size: 0.88rem;">
            <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
              <h2 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff;">
                Escrow &amp; Cancellation Refund Rules
              </h2>
            </div>

            <!-- Plain English Box -->
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 1.15rem; margin-bottom: 1.5rem; font-size: 0.84rem; color: #a7f3d0;">
              <strong style="color: #fff; font-size: 0.92rem;">In Plain English:</strong><br>
              • Cancel more than 6 hours before work starts: <strong>100% Full Refund</strong>.<br>
              • Cancel 2 to 6 hours before work starts: <strong>70% Refund</strong> (30% goes to the worker for their reserved time).<br>
              • Cancel less than 2 hours before work: <strong>No refund</strong> (full payment compensates the worker for travelling to the site).<br>
              • If the worker fails to show up: <strong>100% Full Refund immediately</strong> + the worker is fined ₹300.
            </div>

            <div style="background: #101626; border: 1px solid var(--border-light); border-radius: var(--radius-md); overflow: hidden; margin: 1rem 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem;">
                <thead>
                  <tr style="background: #0d1322; text-align: left; color: var(--text-secondary);">
                    <th style="padding: 0.75rem 1rem;">When You Cancel</th>
                    <th style="padding: 0.75rem 1rem;">Customer Refund</th>
                    <th style="padding: 0.75rem 1rem;">Worker Compensation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px dashed rgba(255,255,255,0.06);">
                    <td style="padding: 0.75rem 1rem; font-weight: 600; color: #fff;">More than 6 hours before start</td>
                    <td style="padding: 0.75rem 1rem; color: #34d399; font-weight: 700;">100% Refund</td>
                    <td style="padding: 0.75rem 1rem; color: var(--text-secondary);">None (job released early)</td>
                  </tr>
                  <tr style="border-bottom: 1px dashed rgba(255,255,255,0.06);">
                    <td style="padding: 0.75rem 1rem; font-weight: 600; color: #fff;">2 to 6 hours before start</td>
                    <td style="padding: 0.75rem 1rem; color: #fbbf24; font-weight: 700;">70% Refund</td>
                    <td style="padding: 0.75rem 1rem; color: #34d399;">Partial compensation</td>
                  </tr>
                  <tr style="border-bottom: 1px dashed rgba(255,255,255,0.06);">
                    <td style="padding: 0.75rem 1rem; font-weight: 600; color: #fff;">Less than 2 hours before start</td>
                    <td style="padding: 0.75rem 1rem; color: #f87171; font-weight: 700;">No Refund</td>
                    <td style="padding: 0.75rem 1rem; color: #34d399;">Full travel compensation</td>
                  </tr>
                  <tr>
                    <td style="padding: 0.75rem 1rem; font-weight: 600; color: #f87171;">Worker No-Show</td>
                    <td style="padding: 0.75rem 1rem; color: #34d399; font-weight: 700;">100% Instant Refund</td>
                    <td style="padding: 0.75rem 1rem; color: #f87171;">₹300 Penalty Fine</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        `;

      case 'code-of-conduct':
        return `
          <div style="max-width: 850px; margin: 0 auto; line-height: 1.7; font-size: 0.88rem;">
            <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
              <h2 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff;">
                Code of Conduct &amp; No-Cash Policy
              </h2>
            </div>

            <!-- Plain English Box -->
            <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md); padding: 1.15rem; margin-bottom: 1.5rem; font-size: 0.84rem; color: #fde68a;">
              <strong style="color: #fff; font-size: 0.92rem;">In Plain English:</strong><br>
              • <strong>No offline cash:</strong> Do not pay or accept cash outside the app. Offline payments are not covered by insurance or escrow protection.<br>
              • <strong>Private phone numbers:</strong> Phone numbers are kept private until a booking is confirmed.<br>
              • <strong>Respect &amp; Punctuality:</strong> Workers must arrive on time with proper tools; customers must provide a safe work site.
            </div>

            <h3 style="color: #fff; font-size: 1.05rem; margin-top: 1.25rem; margin-bottom: 0.4rem;">Why Paying Inside the App Protects You</h3>
            <p style="color: var(--text-secondary);">
              When you pay inside LabourLink, your money is held safely in escrow. If the worker does poor work or leaves early, we can issue a partial or full refund. If you pay cash directly, we cannot guarantee refunds or work quality.
            </p>
          </div>
        `;

      case 'privacy-data':
        return `
          <div style="max-width: 850px; margin: 0 auto; line-height: 1.7; font-size: 0.88rem;">
            <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
              <h2 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #fff;">
                Privacy &amp; Location Data
              </h2>
            </div>

            <!-- Plain English Box -->
            <div style="background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: var(--radius-md); padding: 1.15rem; margin-bottom: 1.5rem; font-size: 0.84rem; color: #bfdbfe;">
              <strong style="color: #fff; font-size: 0.92rem;">In Plain English:</strong><br>
              • Your GPS location is used only to show arrival times while a job is active.<br>
              • As soon as the job is finished, location tracking turns off automatically.<br>
              • Your personal ID and bank details are encrypted and stored safely.
            </div>
          </div>
        `;

      default:
        return '';
    }
  }
};

window.LegalView = LegalView;
