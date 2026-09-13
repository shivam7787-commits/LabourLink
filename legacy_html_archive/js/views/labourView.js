/**
 * LabourLink Labour Supply App View
 * Simple, clean, and user-friendly portal for workers
 */

const LabourView = {
  activeTab: 'radar', // 'radar', 'onboarding', 'wallet', 'performance', 'boost'
  onboardingStage: 1, // 1 to 7
  dispatchTimerInterval: null,
  dispatchSecondsLeft: 30,

  render(container) {
    const state = window.LabourLinkStore.getState();
    const worker = state.labourList.find(l => l.id === state.currentLabourId) || state.labourList[0];
    const activeJob = state.bookings.find(b => b.labourId === worker.id && b.status !== 'SETTLED' && b.status !== 'REFUNDED');

    container.innerHTML = `
      <div class="dashboard-grid">
        <!-- Worker Profile Header -->
        <div class="col-12">
          <div class="glass-card" style="padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: #059669; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; color: #fff;">
                ${worker.name.charAt(0)}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <h2 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: #fff;">${worker.name}</h2>
                  <span class="badge badge-blue">${worker.trade}</span>
                  <span class="badge badge-green">★ ${worker.rating} Rating</span>
                </div>
                <div style="font-size: 0.76rem; color: var(--text-secondary); margin-top: 2px;">
                  Area: ${worker.homeZone} • Verified ID &amp; Police Check • ${worker.completedJobs} Jobs Completed
                </div>
              </div>
            </div>

            <!-- Simple Clean Tabs -->
            <div class="filter-pills" style="margin-bottom: 0;">
              <button class="pill-btn ${this.activeTab === 'radar' ? 'active' : ''}" onclick="LabourView.switchTab('radar')">
                <i data-lucide="radio" style="width: 14px; height: 14px; display: inline;"></i> Available Jobs
              </button>
              <button class="pill-btn ${this.activeTab === 'onboarding' ? 'active' : ''}" onclick="LabourView.switchTab('onboarding')">
                <i data-lucide="check-circle" style="width: 14px; height: 14px; display: inline;"></i> 7-Step Sign-up
              </button>
              <button class="pill-btn ${this.activeTab === 'wallet' ? 'active' : ''}" onclick="LabourView.switchTab('wallet')">
                <i data-lucide="wallet" style="width: 14px; height: 14px; display: inline;"></i> My Wallet (₹${worker.wallet.availableBalance})
              </button>
              <button class="pill-btn ${this.activeTab === 'performance' ? 'active' : ''}" onclick="LabourView.switchTab('performance')">
                <i data-lucide="star" style="width: 14px; height: 14px; display: inline;"></i> My Ratings
              </button>
              <button class="pill-btn ${this.activeTab === 'boost' ? 'active' : ''}" onclick="LabourView.switchTab('boost')">
                <i data-lucide="trending-up" style="width: 14px; height: 14px; display: inline;"></i> Get More Jobs
              </button>
            </div>
          </div>
        </div>

        <div class="col-12">
          ${this.renderTabContent(worker, activeJob, state)}
        </div>
      </div>
    `;

    lucide.createIcons();
    if (this.activeTab === 'radar' && !activeJob) {
      this.initDispatchCountdown();
    }
  },

  switchTab(tab) {
    this.activeTab = tab;
    this.render(document.getElementById('mainContainer'));
  },

  renderTabContent(worker, activeJob, state) {
    switch (this.activeTab) {
      case 'radar':
        return this.renderRadarAndCockpit(worker, activeJob, state);
      case 'onboarding':
        return this.render7StageOnboarding(worker);
      case 'wallet':
        return this.renderWorkerWallet(worker);
      case 'performance':
        return this.renderPerformanceHub(worker);
      case 'boost':
        return this.renderGrowthAndBoost(worker);
      default:
        return '';
    }
  },

  // 1. Available Jobs & Active Job
  renderRadarAndCockpit(worker, activeJob, state) {
    if (activeJob) {
      const isOTPVerified = activeJob.status === 'OTP_VERIFIED' || activeJob.status === 'IN_PROGRESS';

      return `
        <div class="dashboard-grid">
          <div class="col-8">
            <div class="glass-card">
              <div class="card-header">
                <div class="card-title">
                  <i data-lucide="hard-hat" style="color: #34d399;"></i>
                  <span>Current Job in Progress</span>
                </div>
                <span class="badge badge-green">${activeJob.status}</span>
              </div>

              <div style="background: #101626; border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.25rem; border: 1px solid var(--border-light);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff;">${activeJob.serviceName}</h3>
                    <div style="font-size: 0.84rem; color: var(--text-secondary); margin-top: 4px;">
                      Customer: <strong>${activeJob.customerName}</strong>
                    </div>
                    <div style="font-size: 0.82rem; color: #93c5fd; margin-top: 4px;">
                      📍 ${activeJob.address}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 0.72rem; color: var(--text-secondary);">Your Net Earning</div>
                    <div style="font-family: var(--font-mono); font-size: 1.4rem; font-weight: 800; color: #34d399;">
                      ₹${activeJob.financials.labourPayoutExpected}
                    </div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">After 15% platform commission</div>
                  </div>
                </div>
              </div>

              <!-- Enter 4-Digit Code -->
              ${!isOTPVerified ? `
                <div style="background: #0d1322; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: var(--radius-md); padding: 1.5rem; text-align: center; margin-bottom: 1.25rem;">
                  <h4 style="font-size: 1rem; color: #fff; margin-bottom: 0.35rem;">Enter Customer's 4-Digit Code</h4>
                  <p style="font-size: 0.82rem; color: var(--text-secondary); max-width: 380px; margin: 0 auto 1rem;">
                    When you reach the customer's house, ask them for their code to verify arrival and start work.
                  </p>
                  <div style="display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 1.25rem;">
                    <input type="text" id="labourInputOtp" class="form-control" maxlength="4" value="${activeJob.startOtp}" style="max-width: 200px; font-family: var(--font-mono); font-size: 1.3rem; text-align: center; letter-spacing: 0.25em;">
                  </div>
                  <button class="btn btn-emerald btn-lg" onclick="LabourView.verifyJobStartOtp('${activeJob.id}')">
                    <i data-lucide="check"></i>
                    <span>Verify Code &amp; Start Work</span>
                  </button>
                </div>
              ` : `
                <div class="job-live-timer" style="margin-bottom: 1.25rem;">
                  <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">
                    Work Clock Running
                  </div>
                  <div class="timer-digits">00:14:32</div>
                  <div style="font-size: 0.75rem; color: #34d399; margin-top: 4px;">
                    ✓ Code Verified • Work is under way
                  </div>
                </div>

                <div style="display: flex; gap: 0.75rem;">
                  <button class="btn btn-emerald btn-block btn-lg" onclick="LabourView.markJobFinished('${activeJob.id}')">
                    <i data-lucide="check-check"></i>
                    <span>Mark Job Finished (Request Payment)</span>
                  </button>
                </div>
              `}
            </div>
          </div>

          <!-- Right Column: Earnings Summary -->
          <div class="col-4">
            <div class="glass-card">
              <div class="card-header">
                <div class="card-title" style="font-size: 0.95rem;">
                  <span>Payment Breakdown</span>
                </div>
              </div>
              <div class="price-breakdown-card">
                <div class="breakdown-row">
                  <span>Customer Total:</span>
                  <span style="font-family: var(--font-mono);">₹${activeJob.financials.baseLabourCost}</span>
                </div>
                <div class="breakdown-row" style="color: #f87171;">
                  <span>Platform Fee (15%):</span>
                  <span style="font-family: var(--font-mono);">- ₹${activeJob.financials.platformCommission}</span>
                </div>
                <div class="breakdown-row highlight">
                  <span>You Receive in Bank:</span>
                  <span style="font-family: var(--font-mono); font-size: 1.2rem; color: #34d399;">₹${activeJob.financials.labourPayoutExpected}</span>
                </div>
              </div>
              <div style="margin-top: 0.75rem; font-size: 0.75rem; color: var(--text-secondary); background: #101626; padding: 0.6rem; border-radius: var(--radius-sm);">
                💡 Any tips given by the customer go 100% to you. No commission is taken on tips.
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // New Job Available Alert
    return `
      <div class="dashboard-grid">
        <div class="col-7">
          <div class="glass-card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="bell" style="color: #38bdf8;"></i>
                <span>New Job Request Nearby</span>
              </div>
              <span class="badge badge-green">Ready to Accept</span>
            </div>

            <!-- Job Card -->
            <div style="background: #101626; border: 2px solid #2563eb; border-radius: var(--radius-lg); padding: 1.5rem; position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <span class="badge badge-blue">Electrician Job</span>
                <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 700; color: #f59e0b; font-size: 0.9rem;">
                  <i data-lucide="timer" style="width: 18px; height: 18px;"></i>
                  <span id="dispatchCountdownText">Accept in 28s</span>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem;">
                <div>
                  <h3 style="font-size: 1.2rem; font-weight: 800; color: #fff;">Electrician: Main Circuit Repair</h3>
                  <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">
                    📍 Bellandur (1.2 km away from you)
                  </div>
                  <div style="font-size: 0.78rem; color: #93c5fd; margin-top: 4px;">
                    Duration: ~3 Hours • Standard Booking
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 0.72rem; color: var(--text-secondary);">You Earn in Hand</div>
                  <div style="font-family: var(--font-mono); font-size: 1.6rem; font-weight: 800; color: #34d399;">₹510</div>
                </div>
              </div>

              <!-- Countdown Bar -->
              <div style="width: 100%; height: 6px; background: #1e293b; border-radius: 3px; overflow: hidden; margin-bottom: 1.25rem;">
                <div id="dispatchProgressBar" style="width: 80%; height: 100%; background: #2563eb;"></div>
              </div>

              <div style="display: flex; gap: 0.75rem;">
                <button class="btn btn-glass btn-block" onclick="LabourView.passJobOffer()">Pass</button>
                <button class="btn btn-emerald btn-block btn-lg" onclick="LabourView.acceptJobOffer()">
                  <i data-lucide="check"></i>
                  <span>Accept Job (Earn ₹510)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Today's Work Summary -->
        <div class="col-5">
          <div class="glass-card">
            <div class="card-header">
              <div class="card-title" style="font-size: 0.95rem;">
                <span>Daily Job Fair-Share</span>
              </div>
            </div>

            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">
              Jobs are shared fairly among all partners. Once you finish 5 jobs in a day, other workers get priority so everyone gets work.
            </p>

            <div style="background: #101626; padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                <span>Jobs Completed Today:</span>
                <strong style="color: #fff;">${worker.jobsToday} of 5</strong>
              </div>
              <div style="width: 100%; height: 8px; background: #1e293b; border-radius: 4px; overflow: hidden;">
                <div style="width: ${(worker.jobsToday / 5) * 100}%; height: 100%; background: #2563eb;"></div>
              </div>
              <div style="font-size: 0.75rem; color: #34d399; margin-top: 6px;">
                ✓ You have top priority for new job alerts.
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div style="background: #101626; padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
                <div style="font-size: 0.74rem; color: var(--text-secondary);">How Fast You Accept</div>
                <div style="font-size: 1.3rem; font-weight: 800; font-family: var(--font-mono); color: #38bdf8;">
                  ${worker.avgAcceptanceTimeSec}s
                </div>
              </div>
              <div style="background: #101626; padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
                <div style="font-size: 0.74rem; color: var(--text-secondary);">Completion Rate</div>
                <div style="font-size: 1.3rem; font-weight: 800; font-family: var(--font-mono); color: #34d399;">
                  ${worker.completionRate}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 2. 7-Step Simple Onboarding
  render7StageOnboarding(worker) {
    const steps = [
      { num: 1, title: '1. Basic Info' },
      { num: 2, title: '2. ID & Bank' },
      { num: 3, title: '3. Skill Quiz' },
      { num: 4, title: '4. Safety Check' },
      { num: 5, title: '5. Agreement' },
      { num: 6, title: '6. Training' },
      { num: 7, title: '7. Active!' }
    ];

    return `
      <div class="glass-card">
        <div class="card-header">
          <div class="card-title">
            <i data-lucide="check-circle" style="color: #10b981;"></i>
            <span>Worker 7-Step Simple Sign-up</span>
          </div>
          <span class="badge badge-green">Profile Verified ✓</span>
        </div>

        <!-- Stepper -->
        <div class="onboarding-stepper">
          ${steps.map(st => `
            <div class="step-item ${this.onboardingStage === st.num ? 'active' : this.onboardingStage > st.num ? 'completed' : ''}" onclick="LabourView.setOnboardingStage(${st.num})">
              <div class="step-circle">
                ${this.onboardingStage > st.num ? '✓' : st.num}
              </div>
              <div class="step-label">${st.title}</div>
            </div>
          `).join('')}
        </div>

        <div style="background: #101626; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.5rem;">
          ${this.renderOnboardingStageContent(worker)}
        </div>
      </div>
    `;
  },

  renderOnboardingStageContent(worker) {
    switch (this.onboardingStage) {
      case 1:
        return `
          <h3 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">Step 1: Your Name &amp; Phone Number</h3>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1.25rem;">Enter your contact details and what work you do.</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-control" value="${worker.name}" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number (Verified with OTP)</label>
              <input type="text" class="form-control" value="${worker.phone}" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">City</label>
              <input type="text" class="form-control" value="Bengaluru" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">Trade / Skill</label>
              <input type="text" class="form-control" value="${worker.trade}" readonly>
            </div>
          </div>
          <button class="btn btn-primary" style="margin-top: 1rem;" onclick="LabourView.setOnboardingStage(2)">
            Next: Step 2 - ID &amp; Bank Details &rarr;
          </button>
        `;
      case 2:
        return `
          <h3 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">Step 2: Upload Government ID &amp; Bank Account</h3>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1.25rem;">So you can receive daily bank transfers safely.</p>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
            <div style="background: #162036; padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
              <div style="font-weight: 700; font-size: 0.88rem; color: #fff;">Aadhaar Card</div>
              <div style="font-size: 0.75rem; color: #34d399; margin-top: 3px;">✓ Verified (${worker.documents.aadhaarNumber})</div>
            </div>
            <div style="background: #162036; padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
              <div style="font-weight: 700; font-size: 0.88rem; color: #fff;">Police Verification</div>
              <div style="font-size: 0.75rem; color: #34d399; margin-top: 3px;">✓ Verified (${worker.documents.policeCertRef})</div>
            </div>
            <div style="background: #162036; padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
              <div style="font-weight: 700; font-size: 0.88rem; color: #fff;">Bank Account (for payouts)</div>
              <div style="font-size: 0.75rem; color: #34d399; margin-top: 3px;">✓ Connected (${worker.documents.bankAccount})</div>
            </div>
          </div>
          <button class="btn btn-primary" style="margin-top: 1.25rem;" onclick="LabourView.setOnboardingStage(3)">
            Next: Step 3 - Quick Skill Quiz &rarr;
          </button>
        `;
      case 3:
        return `
          <h3 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">Step 3: Quick 1-Minute Skill Check</h3>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">Answer 1 simple question about your trade to qualify for higher-paying skilled jobs.</p>
          <div style="background: #162036; padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 1rem;">
            <div style="font-weight: 700; font-size: 0.88rem; color: #fff;">What is the wire color for Earthing / Ground in household wiring?</div>
            <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.6rem;">
              <label style="font-size: 0.84rem; color: #fff;"><input type="radio" name="q" checked> Green / Yellow (Correct)</label>
              <label style="font-size: 0.84rem; color: var(--text-secondary);"><input type="radio" name="q"> Red</label>
              <label style="font-size: 0.84rem; color: var(--text-secondary);"><input type="radio" name="q"> Black</label>
            </div>
          </div>
          <div style="font-size: 0.78rem; color: #34d399; margin-bottom: 1rem;">
            ✓ Passed! You are approved as a <strong>Skilled Electrician</strong>.
          </div>
          <button class="btn btn-primary" onclick="LabourView.setOnboardingStage(4)">
            Next: Step 4 - Safety Check &rarr;
          </button>
        `;
      case 4:
        return `
          <h3 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">Step 4: Safety &amp; Background Check</h3>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">Automatic safety checks to protect both customers and workers.</p>
          <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.25rem;">
            <div style="background: rgba(16, 185, 129, 0.1); padding: 0.75rem 1rem; border-radius: var(--radius-sm); display: flex; justify-content: space-between;">
              <span>No criminal record found</span>
              <span class="badge badge-green">Passed</span>
            </div>
            <div style="background: rgba(16, 185, 129, 0.1); padding: 0.75rem 1rem; border-radius: var(--radius-sm); display: flex; justify-content: space-between;">
              <span>Unique Aadhaar (no duplicate account)</span>
              <span class="badge badge-green">Passed</span>
            </div>
          </div>
          <button class="btn btn-primary" onclick="LabourView.setOnboardingStage(5)">
            Next: Step 5 - Partner Agreement &rarr;
          </button>
        `;
      case 5:
        return `
          <h3 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">Step 5: Simple Partner Agreement</h3>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">Clear rules for working on LabourLink.</p>
          <div style="background: #0d1322; border-radius: var(--radius-md); padding: 1rem; font-size: 0.82rem; line-height: 1.6; margin-bottom: 1rem; border: 1px solid var(--border-light);">
            • <strong>You are your own boss:</strong> You are an independent contractor, not an employee. You decide when to accept jobs.<br>
            • <strong>Guaranteed Payments:</strong> LabourLink protects you from non-paying customers via Escrow.<br>
            • <strong>No Offline Cash:</strong> All payments must be recorded on the app so you stay insured and verified.
          </div>
          <div style="font-size: 0.78rem; color: #34d399; margin-bottom: 1rem;">
            ✓ Digitally accepted via OTP verification
          </div>
          <button class="btn btn-primary" onclick="LabourView.setOnboardingStage(6)">
            Next: Step 6 - Quick Video Training &rarr;
          </button>
        `;
      case 6:
        return `
          <h3 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">Step 6: Quick 3-Minute Quality Training</h3>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">Learn how to get 5-star ratings and earn more tips.</p>
          <div style="background: #162036; padding: 1.25rem; border-radius: var(--radius-md); text-align: center; margin-bottom: 1.25rem;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem;">
              <i data-lucide="play" style="width: 24px; height: 24px; color: #fff;"></i>
            </div>
            <div style="font-weight: 700; font-size: 0.92rem; color: #fff;">Video: Polite Customer Service &amp; Safety</div>
            <span class="badge badge-green" style="margin-top: 0.6rem;">Completed ✓</span>
          </div>
          <button class="btn btn-primary" onclick="LabourView.setOnboardingStage(7)">
            Next: Step 7 - Activate My Profile &rarr;
          </button>
        `;
      case 7:
        return `
          <div style="text-align: center; padding: 1.5rem 0;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #059669; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: #fff; font-size: 1.8rem;">
              ✓
            </div>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff;">You're Ready to Receive Jobs!</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 380px; margin: 0.5rem auto 1.5rem;">
              Your profile is verified. You can now turn on the job radar to start getting booking alerts.
            </p>
            <button class="btn btn-emerald btn-lg" onclick="LabourView.switchTab('radar')">
              <span>Go to Available Jobs</span>
            </button>
          </div>
        `;
      default:
        return '';
    }
  },

  setOnboardingStage(st) {
    this.onboardingStage = st;
    this.render(document.getElementById('mainContainer'));
  },

  // 3. Worker Wallet
  renderWorkerWallet(worker) {
    return `
      <div class="dashboard-grid">
        <div class="col-8">
          <div class="glass-card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="wallet" style="color: #34d399;"></i>
                <span>My Earnings &amp; Wallet</span>
              </div>
              <span class="badge badge-green">Bank Account Connected</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
              <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 1.15rem;">
                <div style="font-size: 0.78rem; color: var(--text-secondary);">Ready to Withdraw</div>
                <div style="font-family: var(--font-mono); font-size: 1.8rem; font-weight: 800; color: #34d399;">
                  ₹${worker.wallet.availableBalance}
                </div>
                <button class="btn btn-emerald btn-sm" style="margin-top: 0.75rem; width: 100%;" onclick="LabourView.withdrawFunds()">
                  Transfer to Bank Now
                </button>
              </div>

              <div style="background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: var(--radius-md); padding: 1.15rem;">
                <div style="font-size: 0.78rem; color: var(--text-secondary);">Held in Escrow (Ongoing)</div>
                <div style="font-family: var(--font-mono); font-size: 1.8rem; font-weight: 800; color: #60a5fa;">
                  ₹${worker.wallet.pendingEscrow}
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.75rem;">
                  Releases as soon as job is completed
                </div>
              </div>

              <div style="background: rgba(139, 92, 246, 0.12); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: var(--radius-md); padding: 1.15rem;">
                <div style="font-size: 0.78rem; color: var(--text-secondary);">Tips Received</div>
                <div style="font-family: var(--font-mono); font-size: 1.8rem; font-weight: 800; color: #c4b5fd;">
                  ₹${worker.wallet.tipsReceived}
                </div>
                <div style="font-size: 0.72rem; color: #34d399; margin-top: 0.75rem;">
                  100% yours • ₹0 commission
                </div>
              </div>
            </div>

            <div style="background: #101626; padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
              <h4 style="font-size: 0.88rem; color: #fff; margin-bottom: 0.4rem;">Payout Schedule</h4>
              <div style="font-size: 0.82rem; color: var(--text-secondary);">
                Earnings are sent to your HDFC Bank Account (${worker.documents.bankAccount}) every day automatically.
              </div>
            </div>
          </div>
        </div>

        <div class="col-4">
          <div class="glass-card">
            <div class="card-header">
              <div class="card-title" style="font-size: 0.95rem;">
                <span>Recent Payments</span>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              <div style="background: #101626; padding: 0.75rem; border-radius: var(--radius-sm); display: flex; justify-content: space-between;">
                <div>
                  <div style="font-size: 0.84rem; font-weight: 600; color: #fff;">Wiring Job</div>
                  <div style="font-size: 0.72rem; color: var(--text-secondary);">Yesterday • UPI</div>
                </div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono);">+ ₹680</div>
              </div>
              <div style="background: #101626; padding: 0.75rem; border-radius: var(--radius-sm); display: flex; justify-content: space-between;">
                <div>
                  <div style="font-size: 0.84rem; font-weight: 600; color: #fff;">Switchboard Repair</div>
                  <div style="font-size: 0.72rem; color: var(--text-secondary);">Sep 10 • Bank Transfer</div>
                </div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono);">+ ₹510</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 4. Performance & Reviews
  renderPerformanceHub(worker) {
    return `
      <div class="dashboard-grid">
        <div class="col-7">
          <div class="glass-card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="star" style="color: #fbbf24;"></i>
                <span>My Ratings &amp; Trust Score</span>
              </div>
              <span class="badge badge-green">★ 4.8 Excellent</span>
            </div>

            <div style="background: #101626; border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.25rem; border: 1px solid var(--border-light);">
              <h4 style="font-size: 0.95rem; color: #fff; margin-bottom: 0.35rem;">How Rating is Calculated</h4>
              <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;">
                Recent jobs matter the most (your last 10 jobs make up 50% of your rating). Doing great work on your recent jobs will boost your rating fast.
              </p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.25rem;">
              <div style="background: #162036; padding: 0.85rem; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 0.72rem; color: var(--text-secondary);">Last 10 Jobs</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: #fbbf24;">4.9 ★</div>
              </div>
              <div style="background: #162036; padding: 0.85rem; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 0.72rem; color: var(--text-secondary);">Previous 20 Jobs</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: #fbbf24;">4.8 ★</div>
              </div>
              <div style="background: #162036; padding: 0.85rem; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 0.72rem; color: var(--text-secondary);">All-Time Average</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: #fbbf24;">4.7 ★</div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-5">
          <div class="glass-card">
            <div class="card-header">
              <div class="card-title" style="font-size: 0.95rem;">
                <i data-lucide="award" style="color: #34d399;"></i>
                <span>Top Performer Rewards</span>
              </div>
            </div>
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
              <div style="font-weight: 700; color: #34d399; font-size: 0.9rem;">⭐ Priority Worker Status Active</div>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">
                Because you maintained &gt;4.8★ rating, you get <strong>+10% priority boost</strong> on new job offers!
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 5. Growth Plans
  renderGrowthAndBoost(worker) {
    return `
      <div class="glass-card">
        <div class="card-header">
          <div class="card-title">
            <i data-lucide="trending-up" style="color: #38bdf8;"></i>
            <span>Get More Jobs (Optional Boost Plans)</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem;">
          <div style="background: #101626; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.25rem;">
            <h3 style="color: #fff;">Free Plan</h3>
            <div style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono); margin: 0.5rem 0;">₹0</div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">Regular job offers based on your proximity and rating.</p>
            <button class="btn btn-glass btn-block btn-sm" disabled>Current Plan</button>
          </div>

          <div style="background: #172554; border: 2px solid #3b82f6; border-radius: var(--radius-lg); padding: 1.25rem;">
            <span class="badge badge-blue" style="margin-bottom: 0.5rem;">Recommended</span>
            <h3 style="color: #fff;">Job Boost</h3>
            <div style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono); margin: 0.5rem 0;">₹199<span style="font-size: 0.75rem; color: var(--text-secondary);">/month</span></div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;"><strong>+20% higher visibility</strong> in customer searches and early alerts.</p>
            <button class="btn btn-primary btn-block" onclick="LabourView.activatePlan('Boost')">Get Boost</button>
          </div>

          <div style="background: #1e1b4b; border: 1px solid #6366f1; border-radius: var(--radius-lg); padding: 1.25rem;">
            <h3 style="color: #fff;">Pro Worker</h3>
            <div style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono); margin: 0.5rem 0;">₹499<span style="font-size: 0.75rem; color: var(--text-secondary);">/month</span></div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">Access to corporate high-value contracts and zero emergency fees.</p>
            <button class="btn btn-primary btn-block" onclick="LabourView.activatePlan('Pro')">Get Pro</button>
          </div>
        </div>
      </div>
    `;
  },

  initDispatchCountdown() {
    if (this.dispatchTimerInterval) clearInterval(this.dispatchTimerInterval);
    this.dispatchSecondsLeft = 30;

    this.dispatchTimerInterval = setInterval(() => {
      this.dispatchSecondsLeft--;
      const textEl = document.getElementById('dispatchCountdownText');
      const barEl = document.getElementById('dispatchProgressBar');

      if (textEl && barEl) {
        textEl.innerText = `Accept in ${this.dispatchSecondsLeft}s`;
        barEl.style.width = `${(this.dispatchSecondsLeft / 30) * 100}%`;
      }

      if (this.dispatchSecondsLeft <= 0) {
        clearInterval(this.dispatchTimerInterval);
        this.passJobOffer();
      }
    }, 1000);
  },

  acceptJobOffer() {
    if (this.dispatchTimerInterval) clearInterval(this.dispatchTimerInterval);
    const state = window.LabourLinkStore.getState();
    const worker = state.labourList.find(l => l.id === state.currentLabourId) || state.labourList[0];

    let booking = state.bookings.find(b => b.status === 'ASSIGNED') || state.bookings[0];
    booking.labourId = worker.id;
    booking.labourName = worker.name;
    booking.labourPhone = worker.phone;
    booking.status = 'ASSIGNED';

    window.LabourLinkStore.updateBooking(booking.id, booking);
    window.showToast('Job Accepted!', `You have accepted Booking #${booking.id}. Customer is waiting.`, 'success');
    this.render(document.getElementById('mainContainer'));
  },

  passJobOffer() {
    if (this.dispatchTimerInterval) clearInterval(this.dispatchTimerInterval);
    window.showToast('Job Passed', 'The job has been offered to another worker nearby.', 'info');
    this.initDispatchCountdown();
  },

  verifyJobStartOtp(bookingId) {
    const entered = (document.getElementById('labourInputOtp')?.value || '').trim();
    const state = window.LabourLinkStore.getState();
    const booking = state.bookings.find(b => b.id === bookingId);

    if (!booking) return;
    if (entered !== booking.startOtp) {
      window.showToast('Incorrect Code', 'Please ask the customer for the correct 4-digit code.', 'error');
      return;
    }

    window.LabourLinkStore.updateBooking(bookingId, {
      status: 'OTP_VERIFIED',
      startOtpVerified: true
    });

    window.showToast('Code Verified!', 'Work clock is now running.', 'success');
    this.render(document.getElementById('mainContainer'));
  },

  markJobFinished(bookingId) {
    const state = window.LabourLinkStore.getState();
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    window.LabourLinkStore.updateBooking(bookingId, {
      status: 'COMPLETED'
    });

    window.showToast('Job Completed!', 'Customer has been asked to confirm and release your payment.', 'success');
    this.render(document.getElementById('mainContainer'));
  },

  withdrawFunds() {
    window.showToast('Transfer Sent!', '₹4,250 sent to your bank account via IMPS.', 'success');
  },

  activatePlan(name) {
    window.showToast(`${name} Plan Activated!`, 'Your account now has higher priority matching.', 'success');
  }
};

window.LabourView = LabourView;
