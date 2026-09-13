/**
 * LabourLink Central Store & Reactive State Engine
 * Manages all entities across Customer Demand, Labour Supply, Escrow, Disputes, and Economics.
 */

const STORAGE_KEY = 'LABOURLINK_PLATFORM_STATE_v1';

// Default initial mock dataset aligned with PDF specifications
const INITIAL_STATE = {
  activeView: 'customer',
  currentCustomerId: 'cust_01',
  currentLabourId: 'labour_01',
  
  // Customers
  customers: [
    {
      id: 'cust_01',
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      email: 'priya.sharma@example.com',
      city: 'Bengaluru',
      tier: 'Silver', // Bronze (1-3), Silver (4-10), Gold (10+)
      completedBookingsCount: 6,
      walletBalance: 450, // Non-withdrawable cashback
      savedAddresses: [
        { id: 'addr_1', label: 'Home', text: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru', lat: 12.926, lng: 77.676 },
        { id: 'addr_2', label: 'Office', text: 'Tech Park Block B, Outer Ring Road, Bengaluru', lat: 12.935, lng: 77.690 }
      ],
      favouriteLabourIds: ['labour_01', 'labour_03'],
      riskScore: 'Low',
      cancellationRate: 0.04
    },
    {
      id: 'cust_02',
      name: 'Apex Infrastructure Ltd (B2B)',
      phone: '+91 98111 22334',
      email: 'procurement@apexinfra.in',
      city: 'Bengaluru',
      tier: 'Gold',
      isB2B: true,
      subscriptionPlan: 'Pro', // Basic ₹999/mo, Pro ₹2,999/mo, Enterprise
      completedBookingsCount: 42,
      walletBalance: 12500,
      savedAddresses: [
        { id: 'addr_b2b_1', label: 'Site 4 - Metro Yard', text: 'Hebbal Flyover Junction, Bengaluru', lat: 13.035, lng: 77.597 }
      ],
      favouriteLabourIds: ['labour_04'],
      riskScore: 'Low',
      cancellationRate: 0.01
    }
  ],

  // Labour Supply Registry (Skill tiers, Verification tags, Performance metrics)
  labourList: [
    {
      id: 'labour_01',
      name: 'Ramesh Kumar',
      phone: '+91 91234 56789',
      category: 'Skilled', // Unskilled, Semi-Skilled, Skilled, Specialist
      trade: 'Electrician',
      experienceYears: 5,
      experienceLevel: 'Expert', // Beginner (0-1), Intermediate (1-3), Expert (3+)
      rating: 4.8,
      ratingsHistory: [5, 5, 5, 4, 5, 5, 5, 4, 5, 5], // For weighted formula calculation
      completedJobs: 48,
      acceptedJobs: 50,
      completionRate: 96, // >95% = 100 score
      avgAcceptanceTimeSec: 25, // <30s = 100 score
      jobsToday: 2, // Fairness cap check (<5)
      status: 'Active', // Active, Suspended, Inactive
      availability: 'Free now', // Free now (100), Free in 1 hr (70), Busy (0)
      homeZone: 'Bellandur',
      serviceRadiusKm: 8,
      currentLocation: { lat: 12.928, lng: 77.672, distanceKm: 0.8 },
      verification: {
        idVerified: true,
        policeVerified: true,
        skillCertified: true,
        platformTrained: true,
        overallStatus: 'Verified'
      },
      documents: {
        aadhaarNumber: 'XXXX-XXXX-8921',
        policeCertRef: 'POL-KA-2025-88912',
        bankAccount: 'HDFC0001234 - A/C ...9812'
      },
      wallet: {
        availableBalance: 4250,
        pendingEscrow: 850,
        totalEarnings: 45600,
        tipsReceived: 600
      },
      subscriptionPlan: 'Pro', // Free, Boost (₹199), Pro (₹499)
      penalties: [],
      appealRequests: []
    },
    {
      id: 'labour_02',
      name: 'Sunil Paswan',
      phone: '+91 94567 12345',
      category: 'Unskilled',
      trade: 'Loader / Helper',
      experienceYears: 2,
      experienceLevel: 'Intermediate',
      rating: 4.5,
      ratingsHistory: [5, 4, 5, 4, 4, 5, 4, 5],
      completedJobs: 32,
      acceptedJobs: 34,
      completionRate: 94,
      avgAcceptanceTimeSec: 45,
      jobsToday: 1,
      status: 'Active',
      availability: 'Free now',
      homeZone: 'Marathahalli',
      serviceRadiusKm: 10,
      currentLocation: { lat: 12.932, lng: 77.685, distanceKm: 2.1 },
      verification: {
        idVerified: true,
        policeVerified: true,
        skillCertified: false,
        platformTrained: true,
        overallStatus: 'Verified'
      },
      documents: {
        aadhaarNumber: 'XXXX-XXXX-4310',
        policeCertRef: 'POL-KA-2025-34102',
        bankAccount: 'SBI0009841 - A/C ...3321'
      },
      wallet: {
        availableBalance: 2100,
        pendingEscrow: 0,
        totalEarnings: 22400,
        tipsReceived: 250
      },
      subscriptionPlan: 'Free',
      penalties: [],
      appealRequests: []
    },
    {
      id: 'labour_03',
      name: 'Manish Verma',
      phone: '+91 97890 23456',
      category: 'Semi-Skilled',
      trade: 'Painter (Basic)',
      experienceYears: 3,
      experienceLevel: 'Intermediate',
      rating: 4.2,
      ratingsHistory: [4, 4, 4, 5, 4, 3, 5, 4],
      completedJobs: 19,
      acceptedJobs: 22,
      completionRate: 86,
      avgAcceptanceTimeSec: 80,
      jobsToday: 6, // Exceeds fairness cap (>5) for demonstration
      status: 'Active',
      availability: 'Free in 1 hr',
      homeZone: 'HSR Layout',
      serviceRadiusKm: 7,
      currentLocation: { lat: 12.915, lng: 77.650, distanceKm: 4.2 },
      verification: {
        idVerified: true,
        policeVerified: true,
        skillCertified: true,
        platformTrained: true,
        overallStatus: 'Verified'
      },
      documents: {
        aadhaarNumber: 'XXXX-XXXX-7110',
        policeCertRef: 'POL-KA-2025-11094',
        bankAccount: 'ICIC0004521 - A/C ...5519'
      },
      wallet: {
        availableBalance: 1650,
        pendingEscrow: 0,
        totalEarnings: 18900,
        tipsReceived: 100
      },
      subscriptionPlan: 'Boost',
      penalties: [],
      appealRequests: []
    },
    {
      id: 'labour_04',
      name: 'Gurpreet Singh',
      phone: '+91 96655 44332',
      category: 'Specialist',
      trade: 'Industrial Machinery Technician',
      experienceYears: 7,
      experienceLevel: 'Expert',
      rating: 4.9,
      ratingsHistory: [5, 5, 5, 5, 5, 4, 5, 5, 5, 5],
      completedJobs: 64,
      acceptedJobs: 65,
      completionRate: 98,
      avgAcceptanceTimeSec: 18,
      jobsToday: 0,
      status: 'Active',
      availability: 'Free now',
      homeZone: 'Whitefield',
      serviceRadiusKm: 15,
      currentLocation: { lat: 12.940, lng: 77.680, distanceKm: 1.8 },
      verification: {
        idVerified: true,
        policeVerified: true,
        skillCertified: true,
        platformTrained: true,
        overallStatus: 'Verified'
      },
      documents: {
        aadhaarNumber: 'XXXX-XXXX-9901',
        policeCertRef: 'POL-KA-2024-90218',
        bankAccount: 'AXIS0008812 - A/C ...0018'
      },
      wallet: {
        availableBalance: 8900,
        pendingEscrow: 1500,
        totalEarnings: 94000,
        tipsReceived: 1200
      },
      subscriptionPlan: 'Pro',
      penalties: [],
      appealRequests: []
    },
    {
      id: 'labour_05',
      name: 'Vikram Yadav (Restricted Test)',
      phone: '+91 93322 11000',
      category: 'Semi-Skilled',
      trade: 'Plumber',
      experienceYears: 1,
      experienceLevel: 'Beginner',
      rating: 3.2, // Below 3.5 rating -> Penalty zone
      ratingsHistory: [3, 3, 2, 4, 3, 3, 3],
      completedJobs: 8,
      acceptedJobs: 12,
      completionRate: 67, // <80% Excluded
      avgAcceptanceTimeSec: 320,
      jobsToday: 0,
      status: 'Under Review',
      availability: 'Busy',
      homeZone: 'Koramangala',
      serviceRadiusKm: 5,
      currentLocation: { lat: 12.935, lng: 77.620, distanceKm: 6.5 },
      verification: {
        idVerified: true,
        policeVerified: false,
        skillCertified: false,
        platformTrained: false,
        overallStatus: 'Pending Verification'
      },
      documents: {
        aadhaarNumber: 'XXXX-XXXX-1144',
        policeCertRef: 'Pending',
        bankAccount: 'PNB0001122 - A/C ...9900'
      },
      wallet: {
        availableBalance: 300,
        pendingEscrow: 0,
        totalEarnings: 4200,
        tipsReceived: 0
      },
      subscriptionPlan: 'Free',
      penalties: [
        { id: 'pen_01', type: 'Level 1 - Warning', reason: 'Late arrival >20 mins on Booking #LB-8802', date: '2026-09-10' }
      ],
      appealRequests: []
    }
  ],

  // Service Catalog
  services: [
    { id: 'srv_elec', name: 'Certified Electrician', category: 'Skilled', trade: 'Electrical', baseHourlyRate: 200, baseDailyRate: 1400, unitType: 'Hourly', icon: 'zap', popular: true },
    { id: 'srv_plumb', name: 'Plumber & Pipe Fitter', category: 'Skilled', trade: 'Plumbing', baseHourlyRate: 190, baseDailyRate: 1350, unitType: 'Hourly', icon: 'wrench', popular: true },
    { id: 'srv_helper', name: 'General Helper / Loader', category: 'Unskilled', trade: 'Loading', baseHourlyRate: 120, baseDailyRate: 700, unitType: 'Daily', icon: 'package', popular: true },
    { id: 'srv_clean', name: 'Deep Cleaning Crew', category: 'Semi-Skilled', trade: 'Cleaning', baseHourlyRate: 160, baseDailyRate: 1100, unitType: 'Fixed', icon: 'sparkles', popular: false },
    { id: 'srv_paint', name: 'House Painter', category: 'Semi-Skilled', trade: 'Painting', baseHourlyRate: 150, baseDailyRate: 1000, unitType: 'Daily', icon: 'paint-bucket', popular: false },
    { id: 'srv_tech', name: 'Industrial Tech / Welder', category: 'Specialist', trade: 'Maintenance', baseHourlyRate: 350, baseDailyRate: 2500, unitType: 'Hourly', icon: 'cog', popular: true }
  ],

  // Active & Past Bookings
  bookings: [
    {
      id: 'BK-1049',
      serviceId: 'srv_elec',
      serviceName: 'Certified Electrician',
      category: 'Skilled',
      customerId: 'cust_01',
      customerName: 'Priya Sharma',
      customerPhone: '+91 98765 43210',
      labourId: 'labour_01',
      labourName: 'Ramesh Kumar',
      labourPhone: '+91 91234 56789',
      status: 'ASSIGNED', // PENDING_PAYMENT, ESCROW_LOCKED, DISPATCHING, ASSIGNED, EN_ROUTE, OTP_VERIFIED, IN_PROGRESS, COMPLETED, DISPUTED, REFUNDED
      bookingModel: 'On-Demand', // On-Demand, Scheduled, Contract
      createdAt: '2026-09-12 22:15',
      scheduledDate: '2026-09-12',
      scheduledTime: '23:00',
      durationHours: 3,
      quantity: 1,
      isEmergency: false,
      address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru',
      specialInstructions: 'Check main circuit breaker and kitchen power socket',
      startOtp: '4892',
      financials: {
        baseLabourCost: 600, // 3h * 200
        platformFee: 150,    // Platform convenience fee
        surgeFee: 0,
        gst18: 135,         // 18% on fees
        totalCustomerPayable: 885,
        escrowLocked: 885,
        commissionRatePercent: 15,
        platformCommission: 90,
        labourPayoutExpected: 510,
        settlementStatus: 'HELD_IN_ESCROW'
      },
      tracking: {
        workerLat: 12.927,
        workerLng: 77.674,
        etaMinutes: 8,
        statusStep: 3 // 1: Booked, 2: Escrow Locked, 3: Assigned, 4: OTP Verified, 5: Work Done
      },
      dispute: null
    },
    {
      id: 'BK-1042',
      serviceId: 'srv_clean',
      serviceName: 'Deep Cleaning Crew',
      category: 'Semi-Skilled',
      customerId: 'cust_01',
      customerName: 'Priya Sharma',
      customerPhone: '+91 98765 43210',
      labourId: 'labour_03',
      labourName: 'Manish Verma',
      labourPhone: '+91 97890 23456',
      status: 'DISPUTED',
      bookingModel: 'Scheduled',
      createdAt: '2026-09-11 10:00',
      scheduledDate: '2026-09-11',
      scheduledTime: '11:00',
      durationHours: 4,
      quantity: 1,
      isEmergency: false,
      address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru',
      startOtp: '7104',
      financials: {
        baseLabourCost: 640,
        platformFee: 100,
        surgeFee: 0,
        gst18: 133,
        totalCustomerPayable: 873,
        escrowLocked: 873,
        commissionRatePercent: 15,
        platformCommission: 96,
        labourPayoutExpected: 544,
        settlementStatus: 'FROZEN_FOR_DISPUTE'
      },
      tracking: {
        workerLat: 12.915,
        workerLng: 77.650,
        etaMinutes: 0,
        statusStep: 4
      },
      dispute: {
        id: 'DISP-801',
        type: 'Quality Issue', // No-show, Delay, Quality issue, Behavior/Safety, Payment issue, Scope mismatch
        description: 'Bathroom cleaning left incomplete; spots on kitchen counter untouched.',
        raisedBy: 'Customer',
        raisedAt: '2026-09-11 16:30',
        slaHoursRemaining: 32,
        status: 'UNDER_INVESTIGATION', // UNDER_INVESTIGATION, RESOLVED, REJECTED
        severity: 'Medium',
        evidence: [
          { type: 'PHOTO', url: '#photo-dirty-corner', note: 'Kitchen corner dirt photo uploaded' },
          { type: 'GPS_LOG', note: 'Worker was at site for 2h 45m instead of booked 4h' }
        ]
      }
    }
  ],

  // Platform Escrow Pool & Financial Summary
  escrowLedger: {
    totalEscrowPool: 14500,
    lockedInActiveJobs: 1758,
    frozenInDisputes: 873,
    totalSettledPayoutsToday: 12400,
    totalCommissionsToday: 2180,
    gstCollectedMonth: 6420
  },

  // Dispute Desk Queue
  disputes: [
    {
      id: 'DISP-801',
      bookingId: 'BK-1042',
      customerName: 'Priya Sharma',
      labourName: 'Manish Verma',
      type: 'Quality Issue',
      amountHeld: 873,
      slaLimit: '48 hrs',
      slaHoursLeft: 32,
      priority: 'Medium',
      status: 'Open',
      evidenceCount: 2
    },
    {
      id: 'DISP-802',
      bookingId: 'BK-0994',
      customerName: 'Rohit Aggarwal',
      labourName: 'Vikram Yadav',
      type: 'No-show',
      amountHeld: 700,
      slaLimit: 'Instant',
      slaHoursLeft: 0,
      priority: 'High',
      status: 'Awaiting Refund',
      evidenceCount: 1
    }
  ],

  // Platform Economics Configuration & Unit Economics Engine
  platformConfig: {
    baseCommissionPercent: 15,
    unskilledCommission: 12,
    skilledCommission: 18,
    specialistCommission: 22,
    emergencySurgeMultiplier: 1.25,
    nightHoursSurgeMultiplier: 1.35,
    customerConvenienceFeeFlat: 100,
    gstRatePercent: 18,
    monthlyFixedCost: 200000,
    cacPerCustomer: 300,
    avgBookingsPerCustomerPerMonth: 5,
    avgRetentionMonths: 6
  }
};

class AppStore {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read localStorage:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Could not save to localStorage:', e);
    }
  }

  getState() {
    return this.state;
  }

  updateState(partial) {
    this.state = { ...this.state, ...partial };
    this.saveState();
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  resetToDefault() {
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this.saveState();
    this.notify();
  }

  // Booking Actions
  addBooking(booking) {
    this.state.bookings.unshift(booking);
    this.state.escrowLedger.totalEscrowPool += booking.financials.escrowLocked;
    this.state.escrowLedger.lockedInActiveJobs += booking.financials.escrowLocked;
    this.saveState();
    this.notify();
  }

  updateBooking(id, updates) {
    const idx = this.state.bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.state.bookings[idx] = { ...this.state.bookings[idx], ...updates };
      this.saveState();
      this.notify();
    }
  }

  // Labour Actions
  addLabour(labour) {
    this.state.labourList.unshift(labour);
    this.saveState();
    this.notify();
  }

  updateLabour(id, updates) {
    const idx = this.state.labourList.findIndex(l => l.id === id);
    if (idx !== -1) {
      this.state.labourList[idx] = { ...this.state.labourList[idx], ...updates };
      this.saveState();
      this.notify();
    }
  }

  // Dispute Actions
  resolveDispute(disputeId, resolution) {
    // resolution: { outcome: 'REFUND_CUSTOMER' | 'PAY_LABOUR' | 'SPLIT_SETTLEMENT', customerRefund: number, labourPayout: number, penaltyAmount: number }
    const disputeIdx = this.state.disputes.findIndex(d => d.id === disputeId);
    if (disputeIdx !== -1) {
      const d = this.state.disputes[disputeIdx];
      const booking = this.state.bookings.find(b => b.id === d.bookingId);
      
      if (booking) {
        booking.financials.settlementStatus = 'RESOLVED_' + resolution.outcome;
        booking.status = resolution.outcome === 'REFUND_CUSTOMER' ? 'REFUNDED' : 'SETTLED';
        
        // Update escrow pool
        this.state.escrowLedger.totalEscrowPool -= (resolution.customerRefund + resolution.labourPayout);
        this.state.escrowLedger.frozenInDisputes -= d.amountHeld;
        
        // Update worker wallet if payout
        const worker = this.state.labourList.find(l => l.id === booking.labourId);
        if (worker && resolution.labourPayout > 0) {
          worker.wallet.availableBalance += resolution.labourPayout;
        }
        if (worker && resolution.penaltyAmount > 0) {
          worker.wallet.availableBalance = Math.max(0, worker.wallet.availableBalance - resolution.penaltyAmount);
          worker.penalties.push({
            id: 'pen_' + Date.now(),
            type: 'Dispute Penalty',
            reason: `Resolved dispute ${disputeId}: ₹${resolution.penaltyAmount} deduction`,
            date: new Date().toISOString().split('T')[0]
          });
        }
      }

      this.state.disputes.splice(disputeIdx, 1);
      this.saveState();
      this.notify();
    }
  }
}

window.LabourLinkStore = new AppStore();
