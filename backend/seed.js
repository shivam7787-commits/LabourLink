require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Dispute = require('./models/Dispute');
const EscrowTransaction = require('./models/EscrowTransaction');

const seed = async () => {
  await connectDB();

  console.log('🔐 Hashing passwords...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Clear only seeded/demo data — real user accounts are preserved
  console.log('🗑️  Clearing seeded collections (real user accounts kept)...');
  await Promise.all([
    User.deleteMany({ isSeeded: true }),   // ← only demo users
    Service.deleteMany({}),
    Booking.deleteMany({}),
    Dispute.deleteMany({}),
    EscrowTransaction.deleteMany({})
  ]);

  // ─── SERVICES ───────────────────────────────────────────
  console.log('📦 Seeding services...');
  const services = await Service.insertMany([
    { serviceId: 'srv_elec',  name: 'Certified Electrician',      skillLevel: 'Skilled',      baseHourlyRate: 250, baseDailyRate: 1800, icon: 'zap' },
    { serviceId: 'srv_plumb', name: 'Emergency Plumber',          skillLevel: 'Skilled',      baseHourlyRate: 250, baseDailyRate: 1800, icon: 'droplet' },
    { serviceId: 'srv_paint', name: 'Wall Painter & Primer',      skillLevel: 'Semi-Skilled', baseHourlyRate: 220, baseDailyRate: 1500, icon: 'paint-brush' },
    { serviceId: 'srv_carp',  name: 'Furniture Carpenter',        skillLevel: 'Skilled',      baseHourlyRate: 260, baseDailyRate: 1900, icon: 'tool' },
    { serviceId: 'srv_load',  name: 'Warehouse Loader / Mover',   skillLevel: 'Unskilled',    baseHourlyRate: 180, baseDailyRate: 1200, icon: 'truck' },
    { serviceId: 'srv_clean', name: 'Deep Home Cleaner',          skillLevel: 'Semi-Skilled', baseHourlyRate: 200, baseDailyRate: 1400, icon: 'sparkles' }
  ]);
  console.log(`   ✅ ${services.length} services seeded`);

  // ─── USERS ──────────────────────────────────────────────
  console.log('👥 Seeding users...');
  const users = await User.insertMany([
    // Customers
    { isSeeded: true, role: 'customer', name: 'Priya Sharma',   phone: '9876543210', email: 'priya.sharma@example.com', password: hashedPassword, city: 'Mumbai',   address: 'A-402, Sea Breeze Apts, Bandra West, Mumbai', status: 'active', totalBookings: 8,  walletBalance: 450,  tier: 'Gold',   loyaltyPoints: 120 },
    { isSeeded: true, role: 'customer', name: 'Rajesh Patel',   phone: '9820123456', email: 'rajesh.patel@example.com', password: hashedPassword, city: 'Pune',     address: 'Plot 12, Kalyani Nagar, Pune',               status: 'active', totalBookings: 4,  walletBalance: 200,  tier: 'Silver', loyaltyPoints: 60 },
    { isSeeded: true, role: 'customer', name: 'Anita Desai',    phone: '9811223344', email: 'anita.d@example.com',      password: hashedPassword, city: 'Delhi NCR', address: 'Flat 102, Green Park Extension, New Delhi',  status: 'active', totalBookings: 2,  walletBalance: 100,  tier: 'Bronze', loyaltyPoints: 30 },

    // Labour / Workers
    { isSeeded: true, role: 'labour', name: 'Ramesh Kumar', phone: '9876500001', email: 'ramesh.kumar@labourlink.in', password: hashedPassword, city: 'Mumbai', category: 'Electrician', trade: 'Electrician', experience: '6', status: 'active', rating: 4.9, totalJobs: 142, walletBalance: 3250, onboardingStage: 7, documents: { aadhar: true, pan: true, bank: true, photo: true, policeVerification: true },  badge: 'Certified Pro' },
    { isSeeded: true, role: 'labour', name: 'Suresh Yadav', phone: '9876500002', email: 'suresh.yadav@labourlink.in', password: hashedPassword, city: 'Mumbai', category: 'Plumber',     trade: 'Plumber',     experience: '8', status: 'active', rating: 4.8, totalJobs: 98,  walletBalance: 1800, onboardingStage: 7, documents: { aadhar: true, pan: true, bank: true, photo: true, policeVerification: true },  badge: 'Verified' },
    { isSeeded: true, role: 'labour', name: 'Dilip Verma',  phone: '9876500003', email: 'dilip.v@labourlink.in',     password: hashedPassword, city: 'Pune',   category: 'Painter',     trade: 'Painter',     experience: '4', status: 'active', rating: 4.7, totalJobs: 46,  walletBalance: 2400, onboardingStage: 7, documents: { aadhar: true, pan: true, bank: true, photo: true, policeVerification: false }, badge: 'Verified' },
    { isSeeded: true, role: 'labour', name: 'Mohan Lal',    phone: '9876500004', email: 'mohan.lal@labourlink.in',   password: hashedPassword, city: 'Mumbai', category: 'Carpenter',   trade: 'Carpenter',   experience: '5', status: 'pending', rating: 4.6, totalJobs: 12, walletBalance: 850,  onboardingStage: 4, documents: { aadhar: true, pan: false, bank: true, photo: true, policeVerification: false }, badge: 'Under Review' },
    { isSeeded: true, role: 'labour', name: 'Raju Shinde',  phone: '9876500005', email: 'raju.s@labourlink.in',      password: hashedPassword, city: 'Mumbai', category: 'Loader',      trade: 'Loader',      experience: '3', status: 'active', rating: 4.8, totalJobs: 64,  walletBalance: 1600, onboardingStage: 7, documents: { aadhar: true, pan: true, bank: true, photo: true, policeVerification: true },  badge: 'Verified' },

    // B2B Clients
    { isSeeded: true, role: 'b2b', name: 'Vikram Singhania', phone: '9899001122', email: 'v.singhania@apexinfra.com',   password: hashedPassword, city: 'Mumbai', companyName: 'Apex Infrastructure Ltd',   gst: '27AAACA9012A1ZG', contactPerson: 'Vikram Singhania (VP Operations)', status: 'active', totalContracts: 5, activeHeadcount: 24, creditLimit: 250000, monthlyBilling: 185000 },
    { isSeeded: true, role: 'b2b', name: 'Aditi Roy',        phone: '9877889900', email: 'procurement@buildcon.in',     password: hashedPassword, city: 'Pune',   companyName: 'BuildCon Projects Pvt Ltd', gst: '27AABCB8765B1ZH', contactPerson: 'Aditi Roy (Site Manager)',          status: 'active', totalContracts: 2, activeHeadcount: 12, creditLimit: 150000, monthlyBilling: 92000 }
  ]);
  console.log(`   ✅ ${users.length} users seeded`);

  // ─── BOOKINGS ────────────────────────────────────────────
  console.log('📋 Seeding bookings...');
  const bookings = await Booking.insertMany([
    {
      bookingId: 'BK-2026-901',
      customerId: users[0]._id.toString(),
      customerName: 'Priya Sharma',
      labourId: users[3]._id.toString(),
      labourName: 'Ramesh Kumar',
      serviceId: 'srv_elec',
      serviceName: 'Certified Electrician',
      totalAmount: 1250,
      workerPayout: 937.5,
      platformCommission: 312.5,
      otp: '8492',
      status: 'In Progress',
      customerLocation: {
        address: 'A-402, Sea Breeze Apts, Bandra West, Mumbai',
        lat: 19.0596,
        lng: 72.8295,
        landmark: 'Near Mehboob Studio & Bandstand Promenade',
        instructions: 'Tower B, 4th Floor, Ring bell twice',
        phone: '9876543210'
      },
      labourLocation: {
        address: 'Linking Road Junction, Khar West, Mumbai',
        lat: 19.0688,
        lng: 72.8340,
        lastUpdated: new Date(),
        speedKmph: 24
      },
      etaMinutes: 8,
      distanceKm: 1.4,
      trackingStatus: 'En Route'
    },
    {
      bookingId: 'BK-2026-894',
      customerId: users[1]._id.toString(),
      customerName: 'Rajesh Patel',
      labourId: users[4]._id.toString(),
      labourName: 'Suresh Yadav',
      serviceId: 'srv_plumb',
      serviceName: 'Emergency Plumber',
      totalAmount: 950,
      workerPayout: 741.0,
      platformCommission: 209.0,
      otp: '3219',
      status: 'Matched',
      customerLocation: {
        address: 'Plot 12, Kalyani Nagar, Pune',
        lat: 18.5482,
        lng: 73.9026,
        landmark: 'Opposite Joggers Park',
        instructions: 'Villa 12, Main Gate entry',
        phone: '9820123456'
      },
      labourLocation: {
        address: 'Koregaon Park Main Road, Pune',
        lat: 18.5362,
        lng: 73.8940,
        lastUpdated: new Date(),
        speedKmph: 28
      },
      etaMinutes: 14,
      distanceKm: 2.3,
      trackingStatus: 'En Route'
    },
    {
      bookingId: 'BK-2026-880',
      customerId: users[2]._id.toString(),
      customerName: 'Anita Desai',
      labourId: users[5]._id.toString(),
      labourName: 'Dilip Verma',
      serviceId: 'srv_paint',
      serviceName: 'Wall Painter',
      totalAmount: 1800,
      workerPayout: 1404.0,
      platformCommission: 396.0,
      otp: '7105',
      status: 'Completed',
      customerLocation: {
        address: 'Flat 102, Green Park Extension, New Delhi',
        lat: 28.5589,
        lng: 77.2028,
        landmark: 'Near Green Park Metro Gate 2',
        instructions: 'First floor above Axis Bank',
        phone: '9811223344'
      },
      labourLocation: {
        address: 'Green Park Extension, New Delhi',
        lat: 28.5589,
        lng: 77.2028,
        lastUpdated: new Date(),
        speedKmph: 0
      },
      etaMinutes: 0,
      distanceKm: 0,
      trackingStatus: 'Completed'
    },
    {
      bookingId: 'BK-2026-871',
      customerId: users[8]._id.toString(),
      customerName: 'Apex Infra Ltd',
      labourId: users[7]._id.toString(),
      labourName: 'Raju Shinde',
      serviceId: 'srv_load',
      serviceName: 'Warehouse Loader',
      totalAmount: 3500,
      workerPayout: 2800.0,
      platformCommission: 700.0,
      otp: '4920',
      status: 'Completed',
      customerLocation: {
        address: 'Metro Line 4 Casting Yard, Thane',
        lat: 19.2612,
        lng: 72.9644,
        landmark: 'Ghodbunder Road, Kasarvadavali',
        instructions: 'Gate 2 Security Cabin',
        phone: '9899001122'
      },
      labourLocation: {
        address: 'Thane West Depot, Mumbai',
        lat: 19.2612,
        lng: 72.9644,
        lastUpdated: new Date(),
        speedKmph: 0
      },
      etaMinutes: 0,
      distanceKm: 0,
      trackingStatus: 'Completed'
    }
  ]);
  console.log(`   ✅ ${bookings.length} bookings seeded`);

  // ─── DISPUTES ────────────────────────────────────────────
  console.log('⚠️  Seeding disputes...');
  const disputes = await Dispute.insertMany([
    { disputeId: 'DISP-104', bookingId: 'BK-2026-889', raisedBy: 'Priya Sharma (Customer)', reason: 'Worker arrived 45 mins late & tools missing', escrowHeld: 950,  status: 'OPEN' },
    { disputeId: 'DISP-102', bookingId: 'BK-2026-865', raisedBy: 'Mohan Lal (Worker)',       reason: 'Customer demanded extra unpaid carpentry tasks', escrowHeld: 1400, status: 'OPEN' }
  ]);
  console.log(`   ✅ ${disputes.length} disputes seeded`);

  // ─── ESCROW TRANSACTIONS ─────────────────────────────────
  console.log('💰 Seeding escrow transactions...');
  const txns = await EscrowTransaction.insertMany([
    { txnId: 'TXN-9081', bookingId: 'BK-2026-901', total: 1250, commission: 312.5,  payout: 937.5,  state: 'Locked in Escrow' },
    { txnId: 'TXN-9077', bookingId: 'BK-2026-894', total: 950,  commission: 209.0,  payout: 741.0,  state: 'Locked in Escrow' },
    { txnId: 'TXN-9065', bookingId: 'BK-2026-880', total: 1800, commission: 396.0,  payout: 1404.0, state: 'Disbursed to Worker' },
    { txnId: 'TXN-9052', bookingId: 'BK-2026-871', total: 3500, commission: 700.0,  payout: 2800.0, state: 'Disbursed to Worker' }
  ]);
  console.log(`   ✅ ${txns.length} escrow transactions seeded`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('════════════════════════════════════════');
  console.log(`   Users:         ${users.length}`);
  console.log(`   Services:      ${services.length}`);
  console.log(`   Bookings:      ${bookings.length}`);
  console.log(`   Disputes:      ${disputes.length}`);
  console.log(`   Transactions:  ${txns.length}`);
  console.log('════════════════════════════════════════');

  mongoose.connection.close();
};

seed().catch(err => {
  console.error('❌ Seeding failed:', err.message);
  mongoose.connection.close();
  process.exit(1);
});
