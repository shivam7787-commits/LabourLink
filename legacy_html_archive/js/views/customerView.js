/**
 * LabourLink Customer Demand App View
 * Simple, clean, and user-friendly booking experience
 */

const CustomerView = {
  selectedServiceId: 'srv_elec',
  pricingType: 'Hourly',
  duration: 3,
  quantity: 1,
  isEmergency: false,
  isNightShift: false,
  selectedAddressId: 'addr_1',
  specialInstructions: 'Check main circuit breaker and kitchen power socket',
  activeJobTimer: null,
  timerSecondsElapsed: 0,
  isTimerPaused: false,

  render(container) {
    const state = window.LabourLinkStore.getState();
    const customer = state.customers.find(c => c.id === state.currentCustomerId) || state.customers[0];
    const activeBooking = state.bookings.find(b => b.customerId === customer.id && b.status !== 'SETTLED' && b.status !== 'REFUNDED');
    const selectedService = state.services.find(s => s.id === this.selectedServiceId) || state.services[0];

    const quote = window.PricingEngine.calculateBookingQuote({
      service: selectedService,
      pricingType: this.pricingType,
      duration: this.duration,
      quantity: this.quantity,
      isEmergency: this.isEmergency,
      isNightShift: this.isNightShift,
      distanceKm: 1.8,
      customerTier: customer.tier,
      isB2BSubscriber: customer.isB2B && customer.subscriptionPlan
    });

    container.innerHTML = `
      <div class="dashboard-grid">
        <!-- Left: Simple Booking Form -->
        <div class="col-7">
          <div class="glass-card">
            <!-- Customer Welcome Header -->
            <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 1rem; border-bottom: 1px solid var(--border-light); margin-bottom: 1.25rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; color: #fff;">
                  ${customer.name.charAt(0)}
                </div>
                <div>
                  <h3 style="font-size: 1.05rem; font-weight: 700; color: #fff;">Hello, ${customer.name}</h3>
                  <div style="font-size: 0.78rem; color: var(--text-secondary);">
                    ${customer.tier} Member • ${customer.completedBookingsCount} bookings completed
                  </div>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.72rem; color: var(--text-secondary);">Cashback Balance</div>
                <div style="font-family: var(--font-mono); font-weight: 700; color: #34d399; font-size: 1.1rem;">
                  ₹${customer.walletBalance}
                </div>
              </div>
            </div>

            <!-- Step 1: Choose Service -->
            <div class="form-group">
              <label class="form-label" style="font-size: 0.9rem; color: #fff; margin-bottom: 0.6rem;">
                1. What do you need help with?
              </label>
              <div class="category-grid">
                ${state.services.map(srv => `
                  <div class="category-card ${srv.id === this.selectedServiceId ? 'selected' : ''}" onclick="CustomerView.selectService('${srv.id}')">
                    <div class="category-icon">
                      <i data-lucide="${srv.icon}"></i>
                    </div>
                    <div class="category-name">${srv.name}</div>
                    <div class="category-rate">₹${srv.baseHourlyRate}/hr</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Step 2: Details & Duration -->
            <label class="form-label" style="font-size: 0.9rem; color: #fff; margin-bottom: 0.6rem;">
              2. How long do you need the worker?
            </label>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.25rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Price Type</label>
                <select class="form-control form-select" id="pricingTypeSelect" onchange="CustomerView.updateParam('pricingType', this.value)">
                  <option value="Hourly" ${this.pricingType === 'Hourly' ? 'selected' : ''}>By the Hour</option>
                  <option value="Daily" ${this.pricingType === 'Daily' ? 'selected' : ''}>Full Day (8 hrs)</option>
                  <option value="Fixed" ${this.pricingType === 'Fixed' ? 'selected' : ''}>Fixed Task</option>
                </select>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">${this.pricingType === 'Daily' ? 'No. of Days' : 'No. of Hours'}</label>
                <input type="number" class="form-control" min="1" max="30" value="${this.duration}" onchange="CustomerView.updateParam('duration', Number(this.value))">
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Workers Needed</label>
                <input type="number" class="form-control" min="1" max="10" value="${this.quantity}" onchange="CustomerView.updateParam('quantity', Number(this.value))">
              </div>
            </div>

            <!-- Step 3: Address -->
            <div class="form-group">
              <label class="form-label">3. Service Location</label>
              <select class="form-control form-select" id="addressSelect" onchange="CustomerView.updateParam('selectedAddressId', this.value)">
                ${customer.savedAddresses.map(a => `
                  <option value="${a.id}" ${a.id === this.selectedAddressId ? 'selected' : ''}>${a.label}: ${a.text}</option>
                `).join('')}
              </select>
            </div>

            <!-- Urgent Toggle -->
            <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: var(--radius-md); padding: 0.85rem 1rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-weight: 700; font-size: 0.88rem; color: #fbbf24; display: flex; align-items: center; gap: 0.4rem;">
                  <i data-lucide="zap" style="width: 16px; height: 16px;"></i>
                  <span>Need help urgently? (&lt; 2 hours)</span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                  Connects you immediately to the closest available worker (+25% emergency fee)
                </div>
              </div>
              <input type="checkbox" id="emergencyToggle" ${this.isEmergency ? 'checked' : ''} onchange="CustomerView.toggleEmergency(this.checked)" style="width: 20px; height: 20px; cursor: pointer;">
            </div>

            <!-- Clear & Simple Price Summary -->
            <div class="price-breakdown-card" style="margin-bottom: 1.25rem;">
              <div style="font-size: 0.85rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; display: flex; justify-content: space-between;">
                <span>Price Details</span>
                <span style="color: #34d399; font-size: 0.78rem;">✓ No Hidden Fees</span>
              </div>
              <div class="breakdown-row">
                <span style="color: var(--text-secondary);">Worker Cost (${this.quantity} × ${this.duration} ${this.pricingType === 'Daily' ? 'days' : 'hours'})</span>
                <span style="font-family: var(--font-mono); font-weight: 600;">₹${quote.baseLabourCharge}</span>
              </div>
              ${quote.surgeFee > 0 ? `
                <div class="breakdown-row surge-active">
                  <span>Urgent Service Fee (+25%)</span>
                  <span style="font-family: var(--font-mono); font-weight: 600;">+ ₹${quote.surgeFee}</span>
                </div>
              ` : ''}
              <div class="breakdown-row">
                <span style="color: var(--text-secondary);">Platform &amp; Safety Fee</span>
                <span style="font-family: var(--font-mono); font-weight: 600;">₹${quote.platformFee}</span>
              </div>
              <div class="breakdown-row">
                <span style="color: var(--text-secondary);">Taxes (18% GST)</span>
                <span style="font-family: var(--font-mono); font-weight: 600;">₹${quote.gstAmount}</span>
              </div>
              <div class="breakdown-row highlight">
                <span>Total Amount</span>
                <span style="font-family: var(--font-mono); font-size: 1.3rem; color: #38bdf8;">₹${quote.totalCustomerPayable}</span>
              </div>
            </div>

            <!-- CTA -->
            <button class="btn btn-primary btn-block btn-lg" id="btnBookNow" onclick="CustomerView.openEscrowPaymentModal()">
              <i data-lucide="shield-check"></i>
              <span>Pay &amp; Find Worker (₹${quote.totalCustomerPayable})</span>
            </button>
            <div style="text-align: center; margin-top: 0.6rem; font-size: 0.75rem; color: var(--text-muted);">
              🛡️ <strong>Safe Escrow:</strong> Money is held safely. The worker is paid only when you confirm the work is complete.
            </div>
          </div>

          <!-- Book Again Section -->
          <div class="glass-card" style="margin-top: 1.25rem;">
            <div class="card-header" style="margin-bottom: 0.75rem;">
              <div class="card-title" style="font-size: 0.95rem;">
                <i data-lucide="rotate-ccw"></i>
                <span>Hire a Previous Worker Again</span>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              ${customer.favouriteLabourIds.map(fid => {
                const fav = state.labourList.find(l => l.id === fid);
                if (!fav) return '';
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; background: #101626; padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <div style="width: 34px; height: 34px; border-radius: 50%; background: #059669; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff;">
                        ${fav.name.charAt(0)}
                      </div>
                      <div>
                        <div style="font-weight: 600; font-size: 0.85rem; color: #fff;">${fav.name}</div>
                        <div style="font-size: 0.72rem; color: var(--text-secondary);">${fav.trade} • ★ ${fav.rating} (${fav.completedJobs} jobs)</div>
                      </div>
                    </div>
                    <button class="btn btn-glass btn-sm" onclick="CustomerView.rebookWorker('${fav.id}')">
                      Book Again
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Right: Current Job Status -->
        <div class="col-5">
          ${activeBooking ? this.renderActiveJobCockpit(activeBooking, state) : this.renderNoActiveBookingState(state)}
        </div>
      </div>
    `;

    lucide.createIcons();
    this.attachEventListeners();
  },

  renderActiveJobCockpit(booking, state) {
    const worker = state.labourList.find(l => l.id === booking.labourId) || state.labourList[0];
    const isOTPVerified = booking.status === 'OTP_VERIFIED' || booking.status === 'IN_PROGRESS';
    const isCompleted = booking.status === 'COMPLETED' || booking.status === 'SETTLED';
    const isDisputed = booking.status === 'DISPUTED';

    return `
      <div class="glass-card">
        <div class="card-header">
          <div class="card-title">
            <i data-lucide="map-pin" style="color: #38bdf8;"></i>
            <span>Your Active Booking</span>
          </div>
          <span class="badge ${isDisputed ? 'badge-red' : isCompleted ? 'badge-green' : 'badge-blue'}">
            ${isDisputed ? 'Issue Reported' : isCompleted ? 'Work Done' : isOTPVerified ? 'Work in Progress' : 'Worker on the way'}
          </span>
        </div>

        <!-- Clean Tracking Map -->
        <div class="map-canvas-container" id="mapSimContainer">
          <div class="map-grid-bg">
            <div class="radar-sweep"></div>
            <!-- Customer Pin -->
            <div class="map-pin customer-pin" style="top: 35%; left: 75%;">
              <div class="pin-bubble">Your Home</div>
              <div class="pin-icon-wrap"><i data-lucide="home" style="width: 14px; height: 14px;"></i></div>
            </div>
            <!-- Worker Pin -->
            <div class="map-pin labour-pin" id="workerGpsPin" style="top: ${isOTPVerified ? '35%' : '65%'}; left: ${isOTPVerified ? '75%' : '25%'};">
              <div class="pin-bubble">${worker.name} (~${booking.tracking?.etaMinutes || 5} min)</div>
              <div class="pin-icon-wrap"><i data-lucide="hard-hat" style="width: 14px; height: 14px;"></i></div>
            </div>
          </div>
        </div>

        <!-- Worker Card -->
        <div style="background: #101626; border-radius: var(--radius-md); padding: 1rem; margin: 1rem 0; border: 1px solid var(--border-light);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: #059669; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; color: #fff;">
                ${worker.name.charAt(0)}
              </div>
              <div>
                <div style="font-weight: 700; font-size: 0.92rem; color: #fff;">${worker.name}</div>
                <div style="font-size: 0.75rem; color: #34d399;">
                  ✓ Verified ID &amp; Police Clearance
                </div>
                <div style="font-size: 0.72rem; color: var(--text-secondary);">
                  ${worker.trade} • ★ ${worker.rating} (${worker.completedJobs} jobs done)
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-glass btn-sm" onclick="CustomerView.simulateCall()" title="Call Worker">
                <i data-lucide="phone" style="width: 15px; height: 15px;"></i>
              </button>
              <button class="btn btn-glass btn-sm" onclick="CustomerView.simulateChat()" title="Chat">
                <i data-lucide="message-square" style="width: 15px; height: 15px;"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 4-Digit Start Code -->
        <div style="background: #0d1322; border-radius: var(--radius-md); padding: 1rem; border: 1px solid rgba(59, 130, 246, 0.3); text-align: center;">
          <div style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">
            Share this 4-Digit Code when the worker arrives:
          </div>
          <div class="otp-display-box">
            ${(booking.startOtp || '4892').split('').map(d => `
              <div class="otp-digit">${d}</div>
            `).join('')}
          </div>
          ${!isOTPVerified && !isCompleted ? `
            <button class="btn btn-emerald btn-sm" onclick="CustomerView.simulateWorkerArrivalAndOtpVerify('${booking.id}')">
              <i data-lucide="check"></i>
              <span>Worker Has Arrived (Start Work)</span>
            </button>
          ` : `
            <span class="badge badge-green" style="font-size: 0.78rem; padding: 0.4rem 0.85rem;">
              ✓ Code Verified • Work in Progress
            </span>
          `}
        </div>

        <!-- Timer & Mark Done Button -->
        ${isOTPVerified && !isCompleted ? `
          <div class="job-live-timer" style="margin-top: 1rem;">
            <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">
              Time Elapsed
            </div>
            <div class="timer-digits" id="liveTimerDisplay">00:14:32</div>
            <div style="display: flex; justify-content: center; gap: 0.6rem; margin-top: 0.75rem;">
              <button class="btn btn-glass btn-sm" onclick="CustomerView.togglePauseTimer()">
                <span id="pauseBtnText">Pause</span>
              </button>
              <button class="btn btn-emerald btn-sm" onclick="CustomerView.completeJob('${booking.id}')">
                <i data-lucide="check-check"></i>
                <span>Work is Done (Release Payment)</span>
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Escrow Protection Pill -->
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-md); padding: 0.75rem; margin-top: 1rem; font-size: 0.8rem; display: flex; justify-content: space-between;">
          <span style="color: var(--text-secondary);">Money in Safe Escrow:</span>
          <strong style="color: #34d399; font-family: var(--font-mono);">₹${booking.financials.totalCustomerPayable}</strong>
        </div>

        ${isCompleted ? `
          <div style="margin-top: 1rem; display: flex; gap: 0.6rem;">
            <button class="btn btn-glass btn-block" onclick="CustomerView.openInvoiceModal('${booking.id}')">
              <i data-lucide="file-text"></i>
              <span>View Invoice</span>
            </button>
            <button class="btn btn-primary btn-block" onclick="CustomerView.openRatingModal('${booking.id}')">
              <i data-lucide="star"></i>
              <span>Rate Worker</span>
            </button>
          </div>
        ` : ''}

        <!-- Help & Report Issue Buttons -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border-light);">
          <button class="btn btn-danger btn-sm" onclick="CustomerView.triggerEmergencySOS('${booking.id}')">
            <i data-lucide="alert-octagon"></i>
            <span>Emergency Help</span>
          </button>
          <button class="btn btn-glass btn-sm" onclick="CustomerView.openDisputeModal('${booking.id}')">
            <i data-lucide="help-circle"></i>
            <span>Report a Problem</span>
          </button>
        </div>
      </div>
    `;
  },

  renderNoActiveBookingState(state) {
    const recent = state.bookings[0];
    return `
      <div class="glass-card" style="text-align: center; padding: 2.5rem 1.5rem;">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(37, 99, 235, 0.15); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: #60a5fa;">
          <i data-lucide="calendar-check" style="width: 26px; height: 26px;"></i>
        </div>
        <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem;">No Active Bookings</h3>
        <p style="font-size: 0.82rem; color: var(--text-secondary); max-width: 320px; margin: 0 auto 1.25rem;">
          Select a service on the left to see upfront pricing and book a verified worker in minutes.
        </p>
        ${recent ? `
          <div style="background: #101626; border-radius: var(--radius-md); padding: 0.85rem; text-align: left; border: 1px solid var(--border-light);">
            <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Previous Booking</div>
            <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.85rem; color: #fff; margin-top: 3px;">
              <span>${recent.serviceName}</span>
              <span class="badge badge-green">${recent.status}</span>
            </div>
            <div style="font-size: 0.74rem; color: var(--text-secondary); margin-top: 3px;">
              Worker: ${recent.labourName} • Total Paid: ₹${recent.financials.totalCustomerPayable}
            </div>
            <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
              <button class="btn btn-glass btn-sm" onclick="CustomerView.openInvoiceModal('${recent.id}')">View Invoice</button>
              <button class="btn btn-glass btn-sm" onclick="CustomerView.rebookWorker('${recent.labourId}')">Hire Again</button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  selectService(id) {
    this.selectedServiceId = id;
    this.render(document.getElementById('mainContainer'));
  },

  updateParam(k, v) {
    this[k] = v;
    this.render(document.getElementById('mainContainer'));
  },

  toggleEmergency(val) {
    this.isEmergency = val;
    this.render(document.getElementById('mainContainer'));
  },

  // Payment Checkout Modal
  openEscrowPaymentModal() {
    const state = window.LabourLinkStore.getState();
    const service = state.services.find(s => s.id === this.selectedServiceId);
    const customer = state.customers.find(c => c.id === state.currentCustomerId);
    const quote = window.PricingEngine.calculateBookingQuote({
      service,
      pricingType: this.pricingType,
      duration: this.duration,
      quantity: this.quantity,
      isEmergency: this.isEmergency,
      isNightShift: this.isNightShift,
      distanceKm: 1.8,
      customerTier: customer.tier
    });

    const overlay = document.getElementById('modalOverlay');
    const card = document.getElementById('modalCard');

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">
          <i data-lucide="shield-check" style="color: #10b981;"></i>
          <span>Pay Safely with Escrow</span>
        </div>
        <button class="btn-icon-dismiss" onclick="CustomerView.closeModal()">&times;</button>
      </div>

      <div style="background: #101626; padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; border: 1px solid var(--border-light);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 0.85rem; color: var(--text-secondary);">Service:</span>
          <strong>${service.name} (${this.duration} ${this.pricingType === 'Daily' ? 'Days' : 'Hours'})</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-size: 0.85rem; color: var(--text-secondary);">Total to Deposit:</span>
          <strong style="color: #34d399; font-family: var(--font-mono); font-size: 1.2rem;">₹${quote.totalCustomerPayable}</strong>
        </div>
        <div style="font-size: 0.75rem; color: #93c5fd;">
          🔒 <strong>Protection Guarantee:</strong> Your money is NOT sent directly to the worker. It is held safely by LabourLink until you verify the work is done.
        </div>
      </div>

      <div class="filter-pills" style="margin-bottom: 1rem;">
        <button class="pill-btn active" id="payTabUpi" onclick="CustomerView.switchPayTab('UPI')">UPI / GPay / PhonePe</button>
        <button class="pill-btn" id="payTabCard" onclick="CustomerView.switchPayTab('CARD')">Credit / Debit Card</button>
        <button class="pill-btn" id="payTabWallet" onclick="CustomerView.switchPayTab('WALLET')">Wallet Balance</button>
      </div>

      <div id="payTabContent" style="text-align: center; padding: 0.5rem 0 1rem;">
        <div style="width: 140px; height: 140px; background: #fff; border-radius: var(--radius-md); margin: 0 auto 0.75rem; display: flex; align-items: center; justify-content: center; padding: 8px;">
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <rect width="100" height="100" fill="white"/>
            <path d="M10 10h30v30h-30zM60 10h30v30h-30zM10 60h30v30h-30z" fill="black"/>
            <path d="M16 16h18v18h-18zM66 16h18v18h-18zM16 66h18v18h-18z" fill="white"/>
            <path d="M22 22h6v6h-6zM72 22h6v6h-6zM22 72h6v6h-6z" fill="black"/>
            <path d="M50 20h5v15h-5zM60 50h15v5h-15zM50 60h10v10h-10zM70 70h15v15h-15zM50 80h10v10h-10z" fill="black"/>
          </svg>
        </div>
        <div style="font-size: 0.82rem; color: var(--text-secondary);">
          Scan QR Code with any UPI app to pay ₹${quote.totalCustomerPayable}
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <button class="btn btn-glass btn-block" onclick="CustomerView.closeModal()">Cancel</button>
        <button class="btn btn-primary btn-block btn-lg" onclick="CustomerView.confirmPaymentAndDispatch('${service.id}')">
          <span>Confirm Payment (₹${quote.totalCustomerPayable})</span>
        </button>
      </div>
    `;

    overlay.classList.remove('hidden');
    lucide.createIcons();
  },

  switchPayTab(tab) {
    document.querySelectorAll('.filter-pills .pill-btn').forEach(b => b.classList.remove('active'));
    const content = document.getElementById('payTabContent');
    if (tab === 'UPI') {
      document.getElementById('payTabUpi').classList.add('active');
      content.innerHTML = `
        <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: #fff;">Enter UPI ID</div>
        <input type="text" class="form-control" value="priya@okaxis" style="max-width: 260px; margin: 0 auto 0.5rem; text-align: center;">
        <div style="font-size: 0.75rem; color: var(--text-secondary);">Or scan the QR code above</div>
      `;
    } else if (tab === 'CARD') {
      document.getElementById('payTabCard').classList.add('active');
      content.innerHTML = `
        <div style="max-width: 320px; margin: 0 auto; text-align: left;">
          <input type="text" class="form-control" placeholder="Card Number" value="•••• •••• •••• 4242" style="margin-bottom: 0.5rem;">
          <div style="display: flex; gap: 0.5rem;">
            <input type="text" class="form-control" placeholder="MM/YY" value="08/29">
            <input type="password" class="form-control" placeholder="CVV" value="891">
          </div>
        </div>
      `;
    } else {
      document.getElementById('payTabWallet').classList.add('active');
      content.innerHTML = `
        <div style="padding: 0.75rem 0;">
          <div style="font-size: 0.82rem; color: var(--text-secondary);">Your Cashback Balance</div>
          <div style="font-size: 1.6rem; font-family: var(--font-mono); font-weight: 800; color: #34d399;">₹450</div>
          <div style="font-size: 0.78rem; color: #93c5fd; margin-top: 0.35rem;">₹450 will be deducted from your wallet automatically.</div>
        </div>
      `;
    }
  },

  confirmPaymentAndDispatch(serviceId) {
    const state = window.LabourLinkStore.getState();
    const service = state.services.find(s => s.id === serviceId);
    const customer = state.customers.find(c => c.id === state.currentCustomerId);

    const matchResults = window.MatchingEngine.rankLabourForJob(state.labourList, {
      trade: service.trade,
      isEmergency: this.isEmergency
    });

    const topWorker = matchResults.topMatches.length > 0 ? matchResults.topMatches[0].labour : state.labourList[0];

    const quote = window.PricingEngine.calculateBookingQuote({
      service,
      pricingType: this.pricingType,
      duration: this.duration,
      quantity: this.quantity,
      isEmergency: this.isEmergency,
      isNightShift: this.isNightShift,
      distanceKm: topWorker.currentLocation?.distanceKm || 1.2,
      customerTier: customer.tier
    });

    const newBookingId = 'BK-' + Math.floor(1000 + Math.random() * 9000);
    const newBooking = {
      id: newBookingId,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      labourId: topWorker.id,
      labourName: topWorker.name,
      labourPhone: topWorker.phone,
      status: 'ASSIGNED',
      bookingModel: this.isEmergency ? 'Emergency' : 'On-Demand',
      createdAt: new Date().toLocaleString(),
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: 'Instant',
      durationHours: this.duration,
      quantity: this.quantity,
      isEmergency: this.isEmergency,
      address: customer.savedAddresses[0].text,
      specialInstructions: this.specialInstructions,
      startOtp: String(Math.floor(1000 + Math.random() * 9000)),
      financials: {
        baseLabourCost: quote.baseLabourCharge,
        platformFee: quote.platformFee,
        surgeFee: quote.surgeFee,
        gst18: quote.gstAmount,
        totalCustomerPayable: quote.totalCustomerPayable,
        escrowLocked: quote.totalCustomerPayable,
        commissionRatePercent: quote.commissionPercent,
        platformCommission: quote.platformCommission,
        labourPayoutExpected: quote.labourBasePayout,
        settlementStatus: 'HELD_IN_ESCROW'
      },
      tracking: {
        workerLat: topWorker.currentLocation.lat,
        workerLng: topWorker.currentLocation.lng,
        etaMinutes: 8,
        statusStep: 3
      },
      startOtpVerified: false,
      dispute: null
    };

    window.LabourLinkStore.addBooking(newBooking);
    this.closeModal();

    window.showToast('Payment Secured & Worker Assigned!', `₹${quote.totalCustomerPayable} held safely in Escrow. ${topWorker.name} has accepted your request.`, 'success');
    this.render(document.getElementById('mainContainer'));
  },

  simulateWorkerArrivalAndOtpVerify(bookingId) {
    const state = window.LabourLinkStore.getState();
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    window.LabourLinkStore.updateBooking(bookingId, {
      status: 'OTP_VERIFIED',
      startOtpVerified: true,
      tracking: {
        ...booking.tracking,
        etaMinutes: 0,
        statusStep: 4
      }
    });

    this.startJobTimer();
    window.showToast('Code Verified! Work Has Started', 'Timer is now running. Worker is officially on site.', 'success');
    this.render(document.getElementById('mainContainer'));
  },

  startJobTimer() {
    if (this.activeJobTimer) clearInterval(this.activeJobTimer);
    this.timerSecondsElapsed = 0;
    this.isTimerPaused = false;

    this.activeJobTimer = setInterval(() => {
      if (!this.isTimerPaused) {
        this.timerSecondsElapsed++;
        const el = document.getElementById('liveTimerDisplay');
        if (el) {
          const hrs = String(Math.floor(this.timerSecondsElapsed / 3600)).padStart(2, '0');
          const mins = String(Math.floor((this.timerSecondsElapsed % 3600) / 60)).padStart(2, '0');
          const secs = String(this.timerSecondsElapsed % 60).padStart(2, '0');
          el.innerText = `${hrs}:${mins}:${secs}`;
        }
      }
    }, 1000);
  },

  togglePauseTimer() {
    this.isTimerPaused = !this.isTimerPaused;
    const btnText = document.getElementById('pauseBtnText');
    if (btnText) {
      btnText.innerText = this.isTimerPaused ? 'Resume' : 'Pause';
    }
  },

  completeJob(bookingId) {
    if (this.activeJobTimer) clearInterval(this.activeJobTimer);

    const state = window.LabourLinkStore.getState();
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    window.EscrowEngine.releaseEscrowOnCompletion(booking, 0);

    const worker = state.labourList.find(l => l.id === booking.labourId);
    if (worker) {
      worker.wallet.availableBalance += booking.financials.labourPayoutExpected;
      worker.wallet.pendingEscrow = Math.max(0, worker.wallet.pendingEscrow - booking.financials.labourPayoutExpected);
      worker.completedJobs++;
      worker.wallet.totalEarnings += booking.financials.labourPayoutExpected;
    }

    const customer = state.customers.find(c => c.id === booking.customerId);
    if (customer) {
      customer.completedBookingsCount++;
      customer.walletBalance += 50; // ₹50 cashback
    }

    window.LabourLinkStore.updateBooking(bookingId, {
      status: 'COMPLETED',
      financials: {
        ...booking.financials,
        settlementStatus: 'SETTLED'
      }
    });

    window.showToast('Work Completed & Payment Released!', 'Payment sent to worker wallet. You earned ₹50 cashback!', 'success');
    this.render(document.getElementById('mainContainer'));
    this.openRatingModal(bookingId);
  },

  // Modal: Rating
  openRatingModal(bookingId) {
    const overlay = document.getElementById('modalOverlay');
    const card = document.getElementById('modalCard');

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">
          <i data-lucide="star" style="color: #fbbf24;"></i>
          <span>How was the service?</span>
        </div>
        <button class="btn-icon-dismiss" onclick="CustomerView.closeModal()">&times;</button>
      </div>

      <div style="display: flex; justify-content: center; gap: 0.75rem; margin: 1.5rem 0;">
        ${[1, 2, 3, 4, 5].map(star => `
          <button style="background: none; border: none; font-size: 2.2rem; cursor: pointer; color: #fbbf24;" onclick="CustomerView.submitRating('${bookingId}')">
            ★
          </button>
        `).join('')}
      </div>

      <div class="form-group">
        <label class="form-label">What did they do well?</label>
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
          <span class="pill-btn active">On-Time</span>
          <span class="pill-btn active">Polite &amp; Clean</span>
          <span class="pill-btn active">Great Quality</span>
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
        <button class="btn btn-glass btn-block" onclick="CustomerView.closeModal()">Skip</button>
        <button class="btn btn-primary btn-block" onclick="CustomerView.submitRating('${bookingId}')">Submit Review</button>
      </div>
    `;

    overlay.classList.remove('hidden');
    lucide.createIcons();
  },

  submitRating(bookingId) {
    window.showToast('Thank You for Rating!', 'Your review helps workers get more jobs.', 'success');
    this.closeModal();
    this.openInvoiceModal(bookingId);
  },

  // Modal: Simple Invoice
  openInvoiceModal(bookingId) {
    const state = window.LabourLinkStore.getState();
    const booking = state.bookings.find(b => b.id === bookingId) || state.bookings[0];
    const invoice = window.EscrowEngine.generateInvoiceRecord(booking);

    const overlay = document.getElementById('modalOverlay');
    const card = document.getElementById('modalCard');

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">
          <i data-lucide="receipt" style="color: #60a5fa;"></i>
          <span>Invoice &amp; Receipt</span>
        </div>
        <button class="btn-icon-dismiss" onclick="CustomerView.closeModal()">&times;</button>
      </div>

      <div style="background: #101626; border-radius: var(--radius-md); padding: 1.25rem; font-size: 0.85rem; margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
          <div>
            <div style="font-weight: 800; font-size: 1rem; color: #fff;">LabourLink Receipt</div>
            <div style="font-size: 0.72rem; color: var(--text-secondary);">Date: ${invoice.date}</div>
          </div>
          <div style="text-align: right;">
            <div style="color: #38bdf8; font-weight: 700;">${invoice.invoiceNumber}</div>
          </div>
        </div>

        <div style="margin-bottom: 1rem;">
          <div style="color: var(--text-secondary); font-size: 0.75rem;">Service:</div>
          <div style="font-weight: 700; color: #fff;">${booking.serviceName} (${booking.durationHours} hrs)</div>
          <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 2px;">Partner: ${booking.labourName}</div>
        </div>

        <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-top: 1px dashed var(--border-light);">
          <span>Worker Fees</span>
          <span style="font-family: var(--font-mono);">₹${booking.financials.baseLabourCost}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 0.4rem 0;">
          <span>Platform &amp; Safety Fee</span>
          <span style="font-family: var(--font-mono);">₹${booking.financials.platformFee}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 0.4rem 0;">
          <span>GST (18%)</span>
          <span style="font-family: var(--font-mono);">₹${booking.financials.gst18}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 0.75rem 0 0; font-weight: 800; font-size: 1.1rem; color: #38bdf8; border-top: 1px solid var(--border-light);">
          <span>Total Paid</span>
          <span style="font-family: var(--font-mono);">₹${booking.financials.totalCustomerPayable}</span>
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <button class="btn btn-emerald btn-block" onclick="window.print()">Print / Save</button>
        <button class="btn btn-glass btn-block" onclick="CustomerView.closeModal()">Done</button>
      </div>
    `;

    overlay.classList.remove('hidden');
    lucide.createIcons();
  },

  // Modal: Report Problem
  openDisputeModal(bookingId) {
    const overlay = document.getElementById('modalOverlay');
    const card = document.getElementById('modalCard');

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">
          <i data-lucide="help-circle" style="color: #ef4444;"></i>
          <span>Report a Problem / Request Refund</span>
        </div>
        <button class="btn-icon-dismiss" onclick="CustomerView.closeModal()">&times;</button>
      </div>

      <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">
        If you are facing an issue, tell us what happened. Your payment will be frozen in escrow so the worker is not paid until this is resolved.
      </p>

      <div class="form-group">
        <label class="form-label">What is the problem?</label>
        <select class="form-control form-select" id="disputeCategorySelect">
          <option value="No-show">Worker Did Not Show Up (Instant Refund)</option>
          <option value="Late arrival">Worker is Very Late (&gt;20 mins)</option>
          <option value="Quality issue" selected>Incomplete or Poor Work Quality</option>
          <option value="Behavior / Safety">Safety / Rude Behavior</option>
          <option value="Overcharging">Worker Asked for Extra Direct Cash</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Brief Details</label>
        <textarea class="form-control" id="disputeDescription" rows="3" placeholder="Please describe the issue in a few words..."></textarea>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <button class="btn btn-glass btn-block" onclick="CustomerView.closeModal()">Cancel</button>
        <button class="btn btn-danger btn-block" onclick="CustomerView.submitDispute('${bookingId}')">
          Hold Payment &amp; Submit
        </button>
      </div>
    `;

    overlay.classList.remove('hidden');
    lucide.createIcons();
  },

  submitDispute(bookingId) {
    const cat = document.getElementById('disputeCategorySelect').value;
    const desc = document.getElementById('disputeDescription').value || 'Customer reported issue with service.';

    const state = window.LabourLinkStore.getState();
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const disputeId = 'DISP-' + Math.floor(800 + Math.random() * 200);
    const newDispute = {
      id: disputeId,
      bookingId: booking.id,
      customerName: booking.customerName,
      labourName: booking.labourName,
      type: cat,
      amountHeld: booking.financials.totalCustomerPayable,
      slaLimit: cat === 'No-show' ? 'Instant' : '48 hrs',
      slaHoursLeft: cat === 'No-show' ? 0 : 48,
      priority: 'Medium',
      status: 'Open',
      evidenceCount: 1
    };

    state.disputes.unshift(newDispute);
    state.escrowLedger.frozenInDisputes += booking.financials.totalCustomerPayable;

    window.LabourLinkStore.updateBooking(bookingId, {
      status: 'DISPUTED',
      financials: {
        ...booking.financials,
        settlementStatus: 'FROZEN_FOR_DISPUTE'
      },
      dispute: newDispute
    });

    this.closeModal();
    window.showToast('Payment Put on Hold', 'Your complaint has been received. Our team will review and resolve it promptly.', 'warning');
    this.render(document.getElementById('mainContainer'));
  },

  triggerEmergencySOS(bookingId) {
    window.showToast('Emergency Alert Sent!', 'Our 24/7 Safety Team has been notified immediately.', 'error');
  },

  simulateCall() {
    window.showToast('Private Call Started', 'Calling partner via private number relay.', 'info');
  },

  simulateChat() {
    window.showToast('Chat Window Opened', 'You can message the worker directly inside the app.', 'info');
  },

  rebookWorker(labourId) {
    const state = window.LabourLinkStore.getState();
    const worker = state.labourList.find(l => l.id === labourId);
    if (!worker) return;

    const matchedService = state.services.find(s => s.trade.toLowerCase().includes(worker.trade.toLowerCase())) || state.services[0];
    this.selectedServiceId = matchedService.id;
    window.showToast('Worker Selected', `Pre-selected ${worker.name} for ${matchedService.name}.`, 'info');
    this.render(document.getElementById('mainContainer'));
  },

  closeModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
  },

  attachEventListeners() {}
};

window.CustomerView = CustomerView;
