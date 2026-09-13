/**
 * LabourLink Pre-seeded Database
 * Initial store containing sample accounts, services, bookings, disputes and escrow ledger.
 */

const SEED_DATA = {
  users: [
    // Customers
    {
      id: 'cust_1',
      role: 'customer',
      name: 'Priya Sharma',
      phone: '9876543210',
      email: 'priya.sharma@example.com',
      password: 'password123',
      city: 'Mumbai',
      address: 'A-402, Sea Breeze Apts, Bandra West, Mumbai',
      createdAt: '2026-09-01T10:30:00.000Z',
      status: 'active',
      totalBookings: 8,
      walletBalance: 450,
      tier: 'Gold',
      loyaltyPoints: 120
    },
    {
      id: 'cust_2',
      role: 'customer',
      name: 'Rajesh Patel',
      phone: '9820123456',
      email: 'rajesh.patel@example.com',
      password: 'password123',
      city: 'Pune',
      address: 'Plot 12, Kalyani Nagar, Pune',
      createdAt: '2026-09-03T14:15:00.000Z',
      status: 'active',
      totalBookings: 4,
      walletBalance: 200,
      tier: 'Silver',
      loyaltyPoints: 60
    },
    {
      id: 'cust_3',
      role: 'customer',
      name: 'Anita Desai',
      phone: '9811223344',
      email: 'anita.d@example.com',
      password: 'password123',
      city: 'Delhi NCR',
      address: 'Flat 102, Green Park Extension, New Delhi',
      createdAt: '2026-09-06T09:00:00.000Z',
      status: 'active',
      totalBookings: 2,
      walletBalance: 100,
      tier: 'Bronze',
      loyaltyPoints: 30
    },

    // Workers / Labour
    {
      id: 'lab_1',
      role: 'labour',
      name: 'Ramesh Kumar',
      phone: '9876500001',
      email: 'ramesh.kumar@labourlink.in',
      password: 'password123',
      city: 'Mumbai',
      category: 'Electrician',
      trade: 'Electrician',
      experience: '6',
      createdAt: '2026-08-15T08:00:00.000Z',
      status: 'active',
      rating: 4.9,
      totalJobs: 142,
      walletBalance: 3250,
      onboardingStage: 7,
      documents: { aadhar: true, pan: true, bank: true, photo: true, policeVerification: true },
      badge: 'Certified Pro'
    },
    {
      id: 'lab_2',
      role: 'labour',
      name: 'Suresh Yadav',
      phone: '9876500002',
      email: 'suresh.yadav@labourlink.in',
      password: 'password123',
      city: 'Mumbai',
      category: 'Plumber',
      trade: 'Plumber',
      experience: '8',
      createdAt: '2026-08-20T11:20:00.000Z',
      status: 'active',
      rating: 4.8,
      totalJobs: 98,
      walletBalance: 1800,
      onboardingStage: 7,
      documents: { aadhar: true, pan: true, bank: true, photo: true, policeVerification: true },
      badge: 'Verified'
    },
    {
      id: 'lab_3',
      role: 'labour',
      name: 'Dilip Verma',
      phone: '9876500003',
      email: 'dilip.v@labourlink.in',
      password: 'password123',
      city: 'Pune',
      category: 'Painter',
      trade: 'Painter',
      experience: '4',
      createdAt: '2026-09-02T13:45:00.000Z',
      status: 'active',
      rating: 4.7,
      totalJobs: 46,
      walletBalance: 2400,
      onboardingStage: 7,
      documents: { aadhar: true, pan: true, bank: true, photo: true, policeVerification: false },
      badge: 'Verified'
    },
    {
      id: 'lab_4',
      role: 'labour',
      name: 'Mohan Lal',
      phone: '9876500004',
      email: 'mohan.lal@labourlink.in',
      password: 'password123',
      city: 'Mumbai',
      category: 'Carpenter',
      trade: 'Carpenter',
      experience: '5',
      createdAt: '2026-09-10T16:10:00.000Z',
      status: 'pending',
      rating: 4.6,
      totalJobs: 12,
      walletBalance: 850,
      onboardingStage: 4,
      documents: { aadhar: true, pan: false, bank: true, photo: true, policeVerification: false },
      badge: 'Under Review'
    },
    {
      id: 'lab_5',
      role: 'labour',
      name: 'Raju Shinde',
      phone: '9876500005',
      email: 'raju.s@labourlink.in',
      password: 'password123',
      city: 'Mumbai',
      category: 'Loader',
      trade: 'Loader',
      experience: '3',
      createdAt: '2026-09-08T10:00:00.000Z',
      status: 'active',
      rating: 4.8,
      totalJobs: 64,
      walletBalance: 1600,
      onboardingStage: 7,
      documents: { aadhar: true, pan: true, bank: true, photo: true, policeVerification: true },
      badge: 'Verified'
    },

    // B2B Enterprise Clients
    {
      id: 'b2b_1',
      role: 'b2b',
      name: 'Vikram Singhania',
      companyName: 'Apex Infrastructure Ltd',
      phone: '9899001122',
      email: 'v.singhania@apexinfra.com',
      password: 'password123',
      city: 'Mumbai',
      gst: '27AAACA9012A1ZG',
      contactPerson: 'Vikram Singhania (VP Operations)',
      createdAt: '2026-08-10T12:00:00.000Z',
      status: 'active',
      totalContracts: 5,
      activeHeadcount: 24,
      creditLimit: 250000,
      monthlyBilling: 185000
    },
    {
      id: 'b2b_2',
      role: 'b2b',
      name: 'Aditi Roy',
      companyName: 'BuildCon Projects Pvt Ltd',
      phone: '9877889900',
      email: 'procurement@buildcon.in',
      password: 'password123',
      city: 'Pune',
      gst: '27AABCB8765B1ZH',
      contactPerson: 'Aditi Roy (Site Manager)',
      createdAt: '2026-08-28T15:30:00.000Z',
      status: 'active',
      totalContracts: 2,
      activeHeadcount: 12,
      creditLimit: 150000,
      monthlyBilling: 92000
    }
  ],

  services: [
    { id: 'srv_elec', name: 'Certified Electrician', skillLevel: 'Skilled', baseHourlyRate: 250, baseDailyRate: 1800, icon: 'zap' },
    { id: 'srv_plumb', name: 'Emergency Plumber', skillLevel: 'Skilled', baseHourlyRate: 250, baseDailyRate: 1800, icon: 'droplet' },
    { id: 'srv_paint', name: 'Wall Painter & Primer', skillLevel: 'Semi-Skilled', baseHourlyRate: 220, baseDailyRate: 1500, icon: 'paint-brush' },
    { id: 'srv_carp', name: 'Furniture Carpenter', skillLevel: 'Skilled', baseHourlyRate: 260, baseDailyRate: 1900, icon: 'tool' },
    { id: 'srv_load', name: 'Warehouse Loader / Mover', skillLevel: 'Unskilled', baseHourlyRate: 180, baseDailyRate: 1200, icon: 'truck' },
    { id: 'srv_clean', name: 'Deep Home Cleaner', skillLevel: 'Semi-Skilled', baseHourlyRate: 200, baseDailyRate: 1400, icon: 'sparkles' }
  ],

  bookings: [
    { id: 'BK-2026-901', customerId: 'cust_1', customerName: 'Priya Sharma', labourId: 'lab_1', labourName: 'Ramesh Kumar', serviceId: 'srv_elec', serviceName: 'Certified Electrician', totalAmount: 1250, otp: '8492', status: 'In Progress', createdAt: '2026-09-12T14:30:00Z' },
    { id: 'BK-2026-894', customerId: 'cust_2', customerName: 'Rajesh Patel', labourId: 'lab_2', labourName: 'Suresh Yadav', serviceId: 'srv_plumb', serviceName: 'Emergency Plumber', totalAmount: 950, otp: '3219', status: 'Matched', createdAt: '2026-09-12T11:00:00Z' },
    { id: 'BK-2026-880', customerId: 'cust_3', customerName: 'Anita Desai', labourId: 'lab_3', labourName: 'Dilip Verma', serviceId: 'srv_paint', serviceName: 'Wall Painter', totalAmount: 1800, otp: '7105', status: 'Completed', createdAt: '2026-09-11T09:15:00Z' },
    { id: 'BK-2026-871', customerId: 'b2b_1', customerName: 'Apex Infra Ltd', labourId: 'lab_5', labourName: 'Raju Shinde', serviceId: 'srv_load', serviceName: 'Warehouse Loader', totalAmount: 3500, otp: '4920', status: 'Completed', createdAt: '2026-09-10T08:00:00Z' }
  ],

  disputes: [
    { id: 'DISP-104', bookingId: 'BK-2026-889', raisedBy: 'Priya Sharma (Customer)', reason: 'Worker arrived 45 mins late & tools missing', escrowHeld: 950, status: 'OPEN' },
    { id: 'DISP-102', bookingId: 'BK-2026-865', raisedBy: 'Mohan Lal (Worker)', reason: 'Customer demanded extra unpaid carpentry tasks', escrowHeld: 1400, status: 'OPEN' }
  ],

  escrowLedger: {
    totalEscrowPool: 14500,
    totalCommissions: 2900,
    totalDisbursed: 11600,
    transactions: [
      { id: 'TXN-9081', bookingId: 'BK-2026-901', total: 1250, commission: 312.5, payout: 937.5, state: 'Locked in Escrow' },
      { id: 'TXN-9077', bookingId: 'BK-2026-894', total: 950, commission: 209.0, payout: 741.0, state: 'Locked in Escrow' },
      { id: 'TXN-9065', bookingId: 'BK-2026-880', total: 1800, commission: 396.0, payout: 1404.0, state: 'Disbursed to Worker' },
      { id: 'TXN-9052', bookingId: 'BK-2026-871', total: 3500, commission: 700.0, payout: 2800.0, state: 'Disbursed to Worker' }
    ]
  }
};

module.exports = SEED_DATA;
