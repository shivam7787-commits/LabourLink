/**
 * LabourLink Executive Economics & Financial Analytics Dashboard
 * Simple, clean, plain-English breakdown of platform profits, margins, and growth metrics
 */

const ExecutiveView = {
  monthlyFixedCostInput: 200000,
  cacInput: 300,
  bookingsPerMonthInput: 5,
  retentionMonthsInput: 6,
  testBookingValue: 1000,

  render(container) {
    const bookingVal = this.testBookingValue;
    const commission = Math.round(bookingVal * 0.15); // ₹150
    const platformFee = 100;                          // ₹100
    const totalRev = commission + platformFee;        // ₹250

    const gatewayFee = Math.round(bookingVal * 0.02); // ₹20
    const supportCost = 10;                           // ₹10
    const notifCost = 2;                              // ₹2
    const disputeCost = 8;                            // ₹8
    const incentiveCost = 15;                         // ₹15
    const totalVarCost = gatewayFee + supportCost + notifCost + disputeCost + incentiveCost; // ₹55

    const netContribution = totalRev - totalVarCost;  // ₹195
    const contributionMargin = Math.round((netContribution / totalRev) * 100); // 78%

    const breakEvenBookings = Math.ceil(this.monthlyFixedCostInput / netContribution);
    const ltv = totalRev * this.bookingsPerMonthInput * this.retentionMonthsInput;
    const ltvCacRatio = (ltv / this.cacInput).toFixed(1);

    container.innerHTML = `
      <div class="dashboard-grid">
        <div class="col-12">
          <div class="glass-card" style="padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <h2 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: #fff;">Platform Business Overview</h2>
                <span class="badge badge-green">78% Profit Margin</span>
                <span class="badge badge-purple">${ltvCacRatio}× Return on Ad Spend</span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 3px;">
                How the business makes money, per-booking profit, and growth metrics
              </div>
            </div>

            <div>
              <button class="btn btn-emerald btn-sm" onclick="ExecutiveView.simulateVolumeSpike()">
                <i data-lucide="trending-up"></i>
                <span>Simulate 2× Growth Spike</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 6 Simple Business Metrics -->
        <div class="col-12">
          <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.85rem;">
            <div class="metric-card">
              <div class="metric-title">1. Cost per Booking</div>
              <div class="metric-value">₹55</div>
              <div class="metric-trend trend-up">Low &amp; controlled</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">2. Worker Busy Rate</div>
              <div class="metric-value" style="color: #34d399;">84.2%</div>
              <div class="metric-trend trend-up">High daily work</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">3. Repeat Customers</div>
              <div class="metric-value" style="color: #60a5fa;">46.8%</div>
              <div class="metric-trend trend-up">&gt;40% Industry benchmark</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">4. Cancellation Rate</div>
              <div class="metric-value" style="color: #fbbf24;">3.2%</div>
              <div class="metric-trend">Escrow protected</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">5. Average Order</div>
              <div class="metric-value">₹980</div>
              <div class="metric-trend">Per booking</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">6. Active Workers</div>
              <div class="metric-value" style="color: #c4b5fd;">1,420</div>
              <div class="metric-trend trend-up">Bengaluru Hub</div>
            </div>
          </div>
        </div>

        <!-- Left: How We Make Money -->
        <div class="col-6">
          <div class="glass-card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="pie-chart" style="color: #38bdf8;"></i>
                <span>How We Make Money (Per ₹1,000 Booking)</span>
              </div>
              <span class="badge badge-green">78% Margin</span>
            </div>

            <div class="price-breakdown-card" style="margin-bottom: 1.25rem;">
              <div style="font-size: 0.8rem; font-weight: 700; color: #93c5fd; margin-bottom: 0.5rem;">
                MONEY IN (Total Platform Revenue)
              </div>
              <div class="breakdown-row">
                <span>Commission from Booking (15%):</span>
                <span style="font-family: var(--font-mono); font-weight: 700;">₹${commission}</span>
              </div>
              <div class="breakdown-row">
                <span>Customer Safety &amp; Tech Fee:</span>
                <span style="font-family: var(--font-mono); font-weight: 700;">₹${platformFee}</span>
              </div>
              <div class="breakdown-row" style="color: #38bdf8; font-weight: 700;">
                <span>Total Revenue per Booking:</span>
                <span style="font-family: var(--font-mono);">₹${totalRev}</span>
              </div>

              <div style="font-size: 0.8rem; font-weight: 700; color: #f87171; margin-top: 1rem; margin-bottom: 0.5rem;">
                COSTS TO DELIVER THE SERVICE
              </div>
              <div class="breakdown-row">
                <span>Online Payment Gateway Fee (2%):</span>
                <span style="font-family: var(--font-mono);">₹${gatewayFee}</span>
              </div>
              <div class="breakdown-row">
                <span>Customer Care &amp; Support:</span>
                <span style="font-family: var(--font-mono);">₹${supportCost}</span>
              </div>
              <div class="breakdown-row">
                <span>SMS &amp; WhatsApp OTP Alerts:</span>
                <span style="font-family: var(--font-mono);">₹${notifCost}</span>
              </div>
              <div class="breakdown-row">
                <span>Dispute / Refund Reserve:</span>
                <span style="font-family: var(--font-mono);">₹${disputeCost}</span>
              </div>
              <div class="breakdown-row">
                <span>Worker Bonus &amp; Peak Incentives:</span>
                <span style="font-family: var(--font-mono);">₹${incentiveCost}</span>
              </div>
              <div class="breakdown-row" style="color: #f87171; font-weight: 700;">
                <span>Total Costs:</span>
                <span style="font-family: var(--font-mono);">- ₹${totalVarCost}</span>
              </div>

              <div class="breakdown-row highlight" style="font-size: 1.25rem;">
                <span>Net Profit per Booking:</span>
                <span style="font-family: var(--font-mono); color: #34d399;">₹${netContribution}</span>
              </div>
            </div>

            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-md); padding: 0.85rem; font-size: 0.82rem; color: #a7f3d0;">
              Every ₹1,000 booking leaves <strong>₹195 in pure profit</strong> after all payment gateway and customer support costs are paid.
            </div>
          </div>
        </div>

        <!-- Right: Break-Even & Customer Value -->
        <div class="col-6">
          <div class="glass-card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="target" style="color: #fbbf24;"></i>
                <span>Break-Even Calculator</span>
              </div>
            </div>

            <div style="background: #101626; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.25rem;">
              <h4 style="font-size: 0.9rem; color: #fff; margin-bottom: 0.5rem; display: flex; justify-content: space-between;">
                <span>Monthly Office &amp; Staff Costs:</span>
                <span style="font-family: var(--font-mono); color: #38bdf8;">₹${this.monthlyFixedCostInput.toLocaleString()}</span>
              </h4>
              <input type="range" class="form-control" min="50000" max="500000" step="10000" value="${this.monthlyFixedCostInput}" oninput="ExecutiveView.updateFixedCost(Number(this.value))">
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; margin-bottom: 0.75rem;">
                Covers team salaries, server hosting, and legal compliance.
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; background: #0c1220; padding: 0.85rem; border-radius: var(--radius-sm);">
                <div>
                  <div style="font-size: 0.82rem; color: #fff; font-weight: 700;">Bookings Needed to Break Even:</div>
                  <div style="font-size: 0.72rem; color: var(--text-secondary);">₹${this.monthlyFixedCostInput.toLocaleString()} ÷ ₹${netContribution} profit / booking</div>
                </div>
                <div style="font-family: var(--font-mono); font-size: 1.8rem; font-weight: 800; color: #34d399;">
                  ${breakEvenBookings.toLocaleString()} <span style="font-size: 0.75rem; color: var(--text-secondary);">/ month</span>
                </div>
              </div>
            </div>

            <!-- Customer Value Section -->
            <div style="background: #101626; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <h4 style="font-size: 0.95rem; color: #fff;">Customer Lifetime Value (LTV)</h4>
                <span class="badge badge-green">Healthy 25× Return</span>
              </div>

              <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 0.75rem;">
                When a customer joins, they typically book 5 times a month for 6 months.
              </p>

              <div class="breakdown-row highlight" style="font-size: 1.15rem; margin-top: 0; padding-top: 0; border-top: none;">
                <span>Total Value per Customer:</span>
                <span style="font-family: var(--font-mono); color: #34d399;">₹${ltv.toLocaleString()}</span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">
                Since it costs only ~₹300 to acquire a new customer through online ads, the return is more than 20× the acquisition cost.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();
  },

  updateFixedCost(val) {
    this.monthlyFixedCostInput = val;
    this.render(document.getElementById('mainContainer'));
  },

  simulateVolumeSpike() {
    window.showToast('2× Growth Spike Simulated', 'Monthly bookings scaled to 2,400. Operating profit reaches ₹2,68,000 net after all costs.', 'success');
  }
};

window.ExecutiveView = ExecutiveView;
