/**
 * LabourLink Operations & Help Desk View
 * Simple, clean dispute resolution, matching diagnostics, and KYC verification
 */

const OperationsView = {
  activeOpsTab: 'disputes',
  simDistance: 1.5,
  simAvailability: 'Free now',
  simRating: 4.8,
  simCompletion: 96,
  simAcceptanceSec: 25,
  simExperienceYears: 5,
  simJobsToday: 2,

  render(container) {
    const state = window.LabourLinkStore.getState();

    container.innerHTML = `
      <div class="dashboard-grid">
        <div class="col-12">
          <div class="glass-card" style="padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <h2 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: #fff;">Help Desk &amp; Dispute Resolution</h2>
                <span class="badge badge-red">${state.disputes.length} Open Issues</span>
                <span class="badge badge-green">Escrow Protected</span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 3px;">
                Review complaints, issue refunds, and check how worker matching works
              </div>
            </div>

            <div class="filter-pills" style="margin-bottom: 0;">
              <button class="pill-btn ${this.activeOpsTab === 'disputes' ? 'active' : ''}" onclick="OperationsView.switchTab('disputes')">
                <i data-lucide="help-circle" style="width: 14px; height: 14px; display: inline;"></i> Customer Issues (${state.disputes.length})
              </button>
              <button class="pill-btn ${this.activeOpsTab === 'matching-sim' ? 'active' : ''}" onclick="OperationsView.switchTab('matching-sim')">
                <i data-lucide="sliders" style="width: 14px; height: 14px; display: inline;"></i> Test Worker Matching
              </button>
              <button class="pill-btn ${this.activeOpsTab === 'escrow-monitor' ? 'active' : ''}" onclick="OperationsView.switchTab('escrow-monitor')">
                <i data-lucide="lock" style="width: 14px; height: 14px; display: inline;"></i> Safe Escrow Pool
              </button>
              <button class="pill-btn ${this.activeOpsTab === 'kyc-desk' ? 'active' : ''}" onclick="OperationsView.switchTab('kyc-desk')">
                <i data-lucide="user-check" style="width: 14px; height: 14px; display: inline;"></i> Verify Documents
              </button>
            </div>
          </div>
        </div>

        <div class="col-12">
          ${this.renderTabBody(state)}
        </div>
      </div>
    `;

    lucide.createIcons();
  },

  switchTab(tab) {
    this.activeOpsTab = tab;
    this.render(document.getElementById('mainContainer'));
  },

  renderTabBody(state) {
    switch (this.activeOpsTab) {
      case 'disputes':
        return this.renderDisputeWorkbench(state);
      case 'matching-sim':
        return this.renderMatchingSimulator(state);
      case 'escrow-monitor':
        return this.renderEscrowMonitor(state);
      case 'kyc-desk':
        return this.renderKycDesk(state);
      default:
        return '';
    }
  },

  // 1. Customer Issues & Disputes
  renderDisputeWorkbench(state) {
    return `
      <div class="dashboard-grid">
        <div class="col-12">
          <div class="glass-card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="alert-circle" style="color: #ef4444;"></i>
                <span>Customer Complaints &amp; Refund Requests</span>
              </div>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">
                Target: No-show: <strong>Instant Refund</strong> • Work quality: <strong>&lt; 48 hours</strong>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${state.disputes.map(disp => `
                <div style="background: #101626; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.25rem;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <span class="badge ${disp.type === 'No-show' ? 'badge-red' : 'badge-amber'}">${disp.type}</span>
                        <h3 style="font-size: 1.05rem; font-weight: 700; color: #fff;">${disp.type} on Booking #${disp.bookingId}</h3>
                      </div>
                      <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">
                        Customer: <strong>${disp.customerName}</strong> • Worker: <strong>${disp.labourName}</strong>
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 0.72rem; color: var(--text-secondary);">Held in Escrow</div>
                      <div style="font-family: var(--font-mono); font-size: 1.2rem; font-weight: 800; color: #38bdf8;">
                        ₹${disp.amountHeld}
                      </div>
                    </div>
                  </div>

                  <div style="background: #0d1322; padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">
                    <strong>Evidence on record:</strong> GPS logs recorded arrival time • Customer uploaded 2 photos of unfinished work • Payment is safely frozen in escrow.
                  </div>

                  <!-- Plain English Action Buttons -->
                  <div style="display: flex; gap: 0.6rem; justify-content: flex-end; flex-wrap: wrap;">
                    <button class="btn btn-emerald btn-sm" onclick="OperationsView.executeDisputeDecision('${disp.id}', 'REFUND_CUSTOMER')">
                      <i data-lucide="rotate-ccw"></i>
                      <span>100% Refund to Customer</span>
                    </button>
                    <button class="btn btn-glass btn-sm" onclick="OperationsView.executeDisputeDecision('${disp.id}', 'PAY_LABOUR')">
                      <i data-lucide="check"></i>
                      <span>Release Payment to Worker</span>
                    </button>
                    <button class="btn btn-amber btn-sm" onclick="OperationsView.executeDisputeDecision('${disp.id}', 'SPLIT_SETTLEMENT')">
                      <i data-lucide="split"></i>
                      <span>50/50 Fair Split</span>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="OperationsView.issuePenaltyToLabour('${disp.id}', '${disp.labourName}')">
                      <span>Apply ₹300 Fine for No-Show</span>
                    </button>
                  </div>
                </div>
              `).join('')}

              ${state.disputes.length === 0 ? `
                <div style="text-align: center; padding: 2.5rem; color: var(--text-secondary);">
                  <i data-lucide="check-circle" style="width: 44px; height: 44px; color: #34d399; margin: 0 auto 0.75rem;"></i>
                  <h3>All Complaints Resolved!</h3>
                  <p style="font-size: 0.82rem;">No pending issues right now.</p>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 2. Simple Matching Algorithm Tester
  renderMatchingSimulator(state) {
    const testWorker = {
      trade: 'Electrician',
      status: 'Active',
      verification: { idVerified: true, policeVerified: true },
      currentLocation: { distanceKm: this.simDistance },
      availability: this.simAvailability,
      rating: this.simRating,
      completionRate: this.simCompletion,
      avgAcceptanceTimeSec: this.simAcceptanceSec,
      experienceYears: this.simExperienceYears,
      jobsToday: this.simJobsToday
    };

    const scoreData = window.MatchingEngine.computeMatchScore(testWorker, false);

    return `
      <div class="dashboard-grid">
        <div class="col-7">
          <div class="glass-card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="sliders" style="color: #38bdf8;"></i>
                <span>How We Pick the Best Worker for a Job</span>
              </div>
            </div>

            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
              The system calculates a Match Score (0 to 100) based on distance, availability, rating, and past reliability. Try changing the values below:
            </p>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.84rem; margin-bottom: 4px;">
                  <span>Distance from customer: <strong>${this.simDistance} km</strong></span>
                  <span style="color: #34d399; font-weight: 700;">Score: ${scoreData.breakdown.distanceScore}</span>
                </div>
                <input type="range" class="form-control" min="0.2" max="8.0" step="0.1" value="${this.simDistance}" oninput="OperationsView.updateSim('simDistance', Number(this.value))">
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.84rem; margin-bottom: 4px;">
                  <span>Worker Availability: <strong>${this.simAvailability}</strong></span>
                  <span style="color: #34d399; font-weight: 700;">Score: ${scoreData.breakdown.availabilityScore}</span>
                </div>
                <select class="form-control form-select" onchange="OperationsView.updateSim('simAvailability', this.value)">
                  <option value="Free now" ${this.simAvailability === 'Free now' ? 'selected' : ''}>Free Right Now (100)</option>
                  <option value="Free in 1 hr" ${this.simAvailability === 'Free in 1 hr' ? 'selected' : ''}>Free in 1 Hour (70)</option>
                  <option value="Busy" ${this.simAvailability === 'Busy' ? 'selected' : ''}>Busy on Another Job (0)</option>
                </select>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.84rem; margin-bottom: 4px;">
                  <span>Customer Rating: <strong>${this.simRating} ★</strong></span>
                  <span style="color: #34d399; font-weight: 700;">Score: ${scoreData.breakdown.ratingScore}</span>
                </div>
                <input type="range" class="form-control" min="3.0" max="5.0" step="0.1" value="${this.simRating}" oninput="OperationsView.updateSim('simRating', Number(this.value))">
              </div>

              <!-- Fairness Rule Slider -->
              <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: var(--radius-md); padding: 1rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                  <strong style="color: #fbbf24;">Fair Turn Rule: Jobs Completed Today</strong>
                  <strong style="font-family: var(--font-mono);">${this.simJobsToday} Jobs</strong>
                </div>
                <input type="range" class="form-control" min="0" max="8" step="1" value="${this.simJobsToday}" oninput="OperationsView.updateSim('simJobsToday', Number(this.value))">
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 6px;">
                  If a worker finishes &gt;5 jobs in a day, their score is lowered by 20% to give other workers a fair chance.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-5">
          <div class="glass-card" style="text-align: center;">
            <div class="card-title" style="justify-content: center; margin-bottom: 1rem;">
              <span>Total Match Score</span>
            </div>

            <div style="font-family: var(--font-mono); font-size: 4rem; font-weight: 800; color: #34d399;">
              ${scoreData.finalScore}
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">Out of 100 Points</div>

            ${scoreData.antiBiasApplied ? `
              <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-md); padding: 0.75rem; font-size: 0.8rem; color: #fca5a5;">
                ⚠️ <strong>Fair Turn Rule Applied:</strong> Raw Score was ${scoreData.rawScore}. Because this worker completed ${this.simJobsToday} jobs today (&gt;5), score was reduced by 20% to rotate jobs.
              </div>
            ` : `
              <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-md); padding: 0.75rem; font-size: 0.8rem; color: #6ee7b7;">
                ✓ <strong>Eligible for Top Priority:</strong> Within normal daily limit.
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  },

  // 3. Escrow Monitor
  renderEscrowMonitor(state) {
    return `
      <div class="glass-card">
        <div class="card-header">
          <div class="card-title">
            <i data-lucide="lock" style="color: #10b981;"></i>
            <span>Safe Escrow Pool</span>
          </div>
          <span class="badge badge-green">100% Protected</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
          <div class="metric-card">
            <div class="metric-title">Total Safe in Escrow</div>
            <div class="metric-value" style="color: #34d399;">₹${state.escrowLedger.totalEscrowPool}</div>
            <div class="metric-trend">Customer payments held</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Locked in Ongoing Jobs</div>
            <div class="metric-value" style="color: #38bdf8;">₹${state.escrowLedger.lockedInActiveJobs}</div>
            <div class="metric-trend">Waiting for work completion</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Held on Reported Issues</div>
            <div class="metric-value" style="color: #f87171;">₹${state.escrowLedger.frozenInDisputes}</div>
            <div class="metric-trend">Under review</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Platform Earnings Today</div>
            <div class="metric-value" style="color: #fbbf24;">₹${state.escrowLedger.totalCommissionsToday}</div>
            <div class="metric-trend">Commissions collected</div>
          </div>
        </div>

        <div style="background: #101626; border-radius: var(--radius-md); padding: 1.25rem; font-size: 0.84rem; line-height: 1.6; border: 1px solid var(--border-light);">
          <strong>How the Escrow Safety Net Works:</strong><br>
          1. Customer pays upfront before work begins.<br>
          2. Money is kept safe in a virtual escrow account, NOT sent to the worker yet.<br>
          3. When the customer confirms the job is done, the payment is released automatically.<br>
          4. If there is a dispute, the money stays frozen until our support team resolves it.
        </div>
      </div>
    `;
  },

  // 4. KYC Desk
  renderKycDesk(state) {
    return `
      <div class="glass-card">
        <div class="card-header">
          <div class="card-title">
            <i data-lucide="user-check" style="color: #38bdf8;"></i>
            <span>Worker ID &amp; Police Verification</span>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${state.labourList.map(l => `
            <div style="background: #101626; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <strong style="color: #fff; font-size: 0.95rem;">${l.name}</strong>
                  <span class="badge ${l.verification.overallStatus === 'Verified' ? 'badge-green' : 'badge-amber'}">
                    ${l.verification.overallStatus}
                  </span>
                  <span class="badge badge-blue">${l.trade}</span>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">
                  Aadhaar: ${l.documents.aadhaarNumber} • Police Certificate: ${l.documents.policeCertRef} • Bank: ${l.documents.bankAccount}
                </div>
              </div>
              <div>
                ${l.verification.overallStatus !== 'Verified' ? `
                  <button class="btn btn-emerald btn-sm" onclick="OperationsView.verifyWorkerDocs('${l.id}')">
                    Approve ID
                  </button>
                ` : `
                  <span style="color: #34d399; font-size: 0.85rem; font-weight: 600;">Approved ✓</span>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  updateSim(k, v) {
    this[k] = v;
    this.render(document.getElementById('mainContainer'));
  },

  executeDisputeDecision(disputeId, outcome) {
    const state = window.LabourLinkStore.getState();
    const disp = state.disputes.find(d => d.id === disputeId);
    if (!disp) return;

    let customerRefund = 0;
    let labourPayout = 0;

    if (outcome === 'REFUND_CUSTOMER') {
      customerRefund = disp.amountHeld;
      labourPayout = 0;
    } else if (outcome === 'PAY_LABOUR') {
      customerRefund = 0;
      labourPayout = Math.round(disp.amountHeld * 0.82);
    } else {
      customerRefund = Math.round(disp.amountHeld * 0.5);
      labourPayout = Math.round(disp.amountHeld * 0.4);
    }

    window.LabourLinkStore.resolveDispute(disputeId, {
      outcome,
      customerRefund,
      labourPayout,
      penaltyAmount: outcome === 'REFUND_CUSTOMER' ? 300 : 0
    });

    window.showToast('Issue Resolved!', `Action executed: ${outcome}. Customer and worker have been updated.`, 'success');
    this.render(document.getElementById('mainContainer'));
  },

  issuePenaltyToLabour(disputeId, workerName) {
    window.showToast('Penalty Applied', `₹300 deducted from ${workerName} for failing to show up.`, 'warning');
    this.executeDisputeDecision(disputeId, 'REFUND_CUSTOMER');
  },

  verifyWorkerDocs(workerId) {
    const state = window.LabourLinkStore.getState();
    const worker = state.labourList.find(l => l.id === workerId);
    if (worker) {
      worker.verification.overallStatus = 'Verified';
      worker.verification.policeVerified = true;
      worker.verification.skillCertified = true;
      worker.status = 'Active';
      window.LabourLinkStore.updateLabour(workerId, worker);
      window.showToast('Worker Approved', `${worker.name}'s profile is now active.`, 'success');
      this.render(document.getElementById('mainContainer'));
    }
  }
};

window.OperationsView = OperationsView;
