const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Dispute = require('../models/Dispute');
const EscrowTransaction = require('../models/EscrowTransaction');

const authMiddleware = require('../middleware/auth');
const PricingEngine = require('../engines/pricingEngine');

const ADMIN_CREDENTIALS = {
  id: 'admin',
  role: 'admin',
  name: 'Platform Administrator',
  passwordHash: bcrypt.hashSync('LabourLink@Admin2025', 10)
};

/** Generate a signed JWT for a user */
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

/** Strip password hash before sending user object */
const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const obj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete obj.password;
  return obj;
};

/* ══════════════════════════════════════════════
   1. AUTHENTICATION  (public routes)
   ══════════════════════════════════════════════ */

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  const { role, identifier, password } = req.body;

  if (role === 'admin') {
    const valid = bcrypt.compareSync(password, ADMIN_CREDENTIALS.passwordHash);
    if ((identifier === 'admin' || identifier === 'admin@labourlink.in') && valid) {
      const token = signToken({ id: 'admin', role: 'admin', name: 'Platform Administrator' });
      return res.json({ ok: true, token, user: { id: 'admin', role: 'admin', name: 'Platform Administrator' }, redirectPath: '/admin' });
    }
    return res.status(401).json({ ok: false, msg: 'Invalid admin identifier or password.' });
  }

  try {
    const user = await User.findOne({
      role,
      $or: [{ phone: identifier }, { email: identifier }]
    });

    if (!user) return res.status(401).json({ ok: false, msg: 'Incorrect phone number or password for this role.' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ ok: false, msg: 'Incorrect phone number or password for this role.' });

    if (user.status === 'blocked') return res.status(403).json({ ok: false, msg: 'This account has been suspended by administration.' });

    const token = signToken({ id: user._id, role: user.role, name: user.name });
    const pathMap = { customer: '/customer', labour: '/labour', b2b: '/b2b' };
    return res.json({ ok: true, token, user: sanitizeUser(user), redirectPath: pathMap[role] || '/' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// POST /api/auth/register
router.post('/auth/register', async (req, res) => {
  const { role, name, phone, email, password, city, address, category, experience, companyName, gst } = req.body;

  try {
    const existing = await User.findOne({ phone, role });
    if (existing) return res.status(400).json({ ok: false, msg: `Phone number ${phone} is already registered as a ${role}.` });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      role, name, phone,
      email: email || '',
      password: hashedPassword,
      city: city || 'Mumbai',
      status: role === 'labour' ? 'pending' : 'active',

      ...(role === 'customer' && { address: address || '', totalBookings: 0, walletBalance: 0, tier: 'Bronze', loyaltyPoints: 0 }),
      ...(role === 'labour' && { category: category || 'General Helper', trade: category || 'General Helper', experience: experience || '1', rating: 5.0, totalJobs: 0, walletBalance: 0, onboardingStage: 1, documents: { aadhar: false, pan: false, bank: false, photo: false, policeVerification: false }, badge: 'New Worker' }),
      ...(role === 'b2b' && { companyName: companyName || name + ' Enterprises', gst: gst || '', contactPerson: name, totalContracts: 0, activeHeadcount: 0, creditLimit: 100000, monthlyBilling: 0 })
    });

    await newUser.save();
    const token = signToken({ id: newUser._id, role: newUser.role, name: newUser.name });
    const pathMap = { customer: '/customer', labour: '/labour', b2b: '/b2b' };
    res.status(201).json({ ok: true, token, user: sanitizeUser(newUser), redirectPath: pathMap[role] || '/' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// POST /api/auth/demo-login
router.post('/auth/demo-login', async (req, res) => {
  const { role } = req.body;

  if (role === 'admin') {
    const token = signToken({ id: 'admin', role: 'admin', name: 'Platform Administrator' });
    return res.json({ ok: true, token, user: { id: 'admin', role: 'admin', name: 'Platform Administrator' }, redirectPath: '/admin' });
  }

  try {
    const candidate = await User.findOne({ role, status: 'active' }) || await User.findOne({ role });
    if (!candidate) return res.status(404).json({ ok: false, msg: `No sample ${role} account found.` });

    const token = signToken({ id: candidate._id, role: candidate.role, name: candidate.name });
    const pathMap = { customer: '/customer', labour: '/labour', b2b: '/b2b' };
    res.json({ ok: true, token, user: sanitizeUser(candidate), redirectPath: pathMap[role] || '/' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

/* ══════════════════════════════════════════════
   2. USERS MANAGEMENT  (protected)
   ══════════════════════════════════════════════ */

router.get('/users', authMiddleware, async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

router.get('/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ ok: false, msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

router.put('/users/:id', authMiddleware, async (req, res) => {
  try {
    // Prevent password from being updated via this route (use dedicated endpoint)
    const { password, ...updates } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ ok: false, msg: 'User not found' });
    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

router.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true, msg: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

/* ══════════════════════════════════════════════
   3. SERVICES & PRICING  (services public, pricing protected)
   ══════════════════════════════════════════════ */

router.get('/services', async (req, res) => {
  try {
    let services = await Service.find();
    if (!services || services.length === 0) {
      const defaultServices = [
        { serviceId: 'srv_elec',  name: 'Certified Electrician',    skillLevel: 'Skilled',      baseHourlyRate: 250, baseDailyRate: 1800, icon: 'zap' },
        { serviceId: 'srv_plumb', name: 'Emergency Plumber',        skillLevel: 'Skilled',      baseHourlyRate: 250, baseDailyRate: 1800, icon: 'droplet' },
        { serviceId: 'srv_paint', name: 'Wall Painter & Primer',    skillLevel: 'Semi-Skilled', baseHourlyRate: 220, baseDailyRate: 1500, icon: 'paint-brush' },
        { serviceId: 'srv_carp',  name: 'Furniture Carpenter',      skillLevel: 'Skilled',      baseHourlyRate: 260, baseDailyRate: 1900, icon: 'tool' },
        { serviceId: 'srv_load',  name: 'Warehouse Loader / Mover', skillLevel: 'Unskilled',    baseHourlyRate: 180, baseDailyRate: 1200, icon: 'truck' },
        { serviceId: 'srv_clean', name: 'Deep Home Cleaner',        skillLevel: 'Semi-Skilled', baseHourlyRate: 200, baseDailyRate: 1400, icon: 'sparkles' }
      ];
      services = await Service.insertMany(defaultServices);
    }
    res.json(services);
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

router.post('/pricing/quote', authMiddleware, async (req, res) => {
  try {
    const { serviceId, pricingType, duration, quantity, isEmergency, isNightShift, distanceKm, isB2B } = req.body;
    const service = await Service.findOne({ serviceId }) || await Service.findOne();

    const quote = PricingEngine.calculateBookingQuote({
      service: { baseHourlyRate: service.baseHourlyRate, baseDailyRate: service.baseDailyRate },
      pricingType: pricingType || 'Hourly',
      duration: duration || 3,
      quantity: quantity || 1,
      isEmergency: !!isEmergency,
      isNightShift: !!isNightShift,
      distanceKm: distanceKm || 2.0,
      isB2BSubscriber: !!isB2B
    });

    res.json({ ok: true, quote });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

/* ══════════════════════════════════════════════
   4. BOOKINGS  (protected)
   ══════════════════════════════════════════════ */

router.get('/bookings', authMiddleware, async (req, res) => {
  try {
    const { customerId, labourId } = req.query;
    const filter = {};
    if (customerId) filter.customerId = customerId;
    if (labourId) filter.labourId = labourId;
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

router.post('/bookings', authMiddleware, async (req, res) => {
  try {
    const { customerId, customerName, serviceId, duration, pricingType, isEmergency } = req.body;
    const service = await Service.findOne({ serviceId }) || await Service.findOne();

    const quote = PricingEngine.calculateBookingQuote({
      service: { baseHourlyRate: service.baseHourlyRate, baseDailyRate: service.baseDailyRate },
      pricingType: pricingType || 'Hourly',
      duration: duration || 3,
      isEmergency: !!isEmergency
    });

    const matchedWorker = await User.findOne({ role: 'labour', status: 'active' });
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const bookingId = `BK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newBooking = new Booking({
      bookingId,
      customerId,
      customerName: customerName || 'Valued Customer',
      labourId: matchedWorker ? matchedWorker._id.toString() : 'unassigned',
      labourName: matchedWorker ? matchedWorker.name : 'To Be Assigned',
      serviceId: service.serviceId,
      serviceName: service.name,
      totalAmount: quote.totalCustomerAmount,
      workerPayout: quote.workerPayout,
      platformCommission: quote.platformCommission,
      otp,
      status: 'Matched',
      customerLocation: req.body.customerLocation || {
        address: req.body.address || 'Sea Breeze Apts, Bandra West, Mumbai',
        lat: 19.0596,
        lng: 72.8295,
        landmark: 'Near Mehboob Studio',
        instructions: 'Tower B, Flat 402, Ring bell twice',
        phone: req.body.customerPhone || '9876543210'
      },
      labourLocation: {
        address: 'Linking Road, Khar West, Mumbai',
        lat: 19.0688,
        lng: 72.8340,
        lastUpdated: new Date(),
        speedKmph: 22
      },
      etaMinutes: 12,
      distanceKm: 1.8,
      trackingStatus: 'En Route'
    });

    await newBooking.save();

    await new EscrowTransaction({
      txnId: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingId,
      total: quote.totalCustomerAmount,
      commission: quote.platformCommission,
      payout: quote.workerPayout,
      state: 'Locked in Escrow'
    }).save();

    res.status(201).json({ ok: true, booking: newBooking, quote });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

router.get('/bookings/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id });
    if (!booking) return res.status(404).json({ ok: false, msg: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Update live location, ETA, or tracking status for a booking
router.put('/bookings/:id/location', authMiddleware, async (req, res) => {
  try {
    const { labourLocation, customerLocation, etaMinutes, distanceKm, trackingStatus, status } = req.body;
    const booking = await Booking.findOne({ bookingId: req.params.id });
    if (!booking) return res.status(404).json({ ok: false, msg: 'Booking not found' });

    if (labourLocation) {
      booking.labourLocation = {
        ...booking.labourLocation?.toObject?.(),
        ...labourLocation,
        lastUpdated: new Date()
      };
    }
    if (customerLocation) {
      booking.customerLocation = {
        ...booking.customerLocation?.toObject?.(),
        ...customerLocation
      };
    }
    if (etaMinutes !== undefined) booking.etaMinutes = etaMinutes;
    if (distanceKm !== undefined) booking.distanceKm = distanceKm;
    if (trackingStatus) booking.trackingStatus = trackingStatus;
    if (status) booking.status = status;

    await booking.save();
    res.json({ ok: true, booking, msg: 'Location and ETA updated successfully' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

router.put('/bookings/:id/verify-otp', authMiddleware, async (req, res) => {
  try {
    const { otp } = req.body;
    const booking = await Booking.findOne({ bookingId: req.params.id });
    if (!booking) return res.status(404).json({ ok: false, msg: 'Booking not found' });
    if (booking.otp !== otp) return res.status(400).json({ ok: false, msg: 'Invalid verification OTP.' });

    booking.status = booking.status === 'Matched' ? 'In Progress' : 'Completed';
    if (booking.status === 'In Progress') {
      booking.trackingStatus = 'Arrived';
      booking.etaMinutes = 0;
      booking.distanceKm = 0;
    }
    await booking.save();
    res.json({ ok: true, booking, msg: `Job status updated to ${booking.status}` });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// B2B Worksite and Fleet Tracking
router.get('/b2b/sites/tracking', authMiddleware, async (req, res) => {
  try {
    const sites = [
      {
        siteId: 'SITE-MUM-01',
        siteName: 'Metro Line 4 Casting Yard, Thane',
        address: 'Ghodbunder Road, Near Kasarvadavali, Thane West',
        lat: 19.2612,
        lng: 72.9644,
        geofenceRadiusMeters: 250,
        supervisor: 'Rajesh Kulkarni (+91 98200 11223)',
        totalAssigned: 15,
        presentOnSite: 12,
        inTransit: 3,
        batches: [
          {
            batchId: 'BATCH-A1',
            trade: 'Construction Helpers',
            headcount: 12,
            status: 'On Site (Geofence Verified)',
            lat: 19.2615,
            lng: 72.9641,
            etaMinutes: 0,
            distanceKm: 0,
            driver: 'Direct Check-in (Turnstile Gate 2)'
          },
          {
            batchId: 'BATCH-A2',
            trade: 'Construction Helpers',
            headcount: 3,
            status: 'In Transit (Shuttle Bus 3)',
            lat: 19.2485,
            lng: 72.9750,
            etaMinutes: 14,
            distanceKm: 2.6,
            driver: 'Mahesh Patil (+91 98331 44556)'
          }
        ]
      },
      {
        siteId: 'SITE-MUM-02',
        siteName: 'Navi Mumbai Commercial Complex',
        address: 'Sector 15, Palm Beach Road, Vashi, Navi Mumbai',
        lat: 19.0760,
        lng: 73.0039,
        geofenceRadiusMeters: 200,
        supervisor: 'Anand Jadhav (+91 98199 88776)',
        totalAssigned: 5,
        presentOnSite: 5,
        inTransit: 0,
        batches: [
          {
            batchId: 'BATCH-B1',
            trade: 'Licensed Electricians',
            headcount: 5,
            status: 'On Site (Electrical Substation B)',
            lat: 19.0762,
            lng: 73.0041,
            etaMinutes: 0,
            distanceKm: 0,
            driver: 'On-site Supervisor Verified'
          }
        ]
      }
    ];

    res.json({ ok: true, sites });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

/* ══════════════════════════════════════════════
   5. DISPUTES  (protected)
   ══════════════════════════════════════════════ */

router.get('/disputes', authMiddleware, async (req, res) => {
  try {
    const disputes = await Dispute.find().sort({ createdAt: -1 });
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

router.post('/disputes', authMiddleware, async (req, res) => {
  try {
    const { bookingId, raisedBy, reason, escrowHeld } = req.body;
    const newDispute = new Dispute({
      disputeId: `DISP-${Math.floor(100 + Math.random() * 900)}`,
      bookingId, raisedBy, reason,
      escrowHeld: escrowHeld || 950,
      status: 'OPEN'
    });
    await newDispute.save();
    res.status(201).json({ ok: true, dispute: newDispute });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

router.put('/disputes/:id/resolve', authMiddleware, async (req, res) => {
  try {
    const { outcome } = req.body;
    const dispute = await Dispute.findOneAndUpdate(
      { disputeId: req.params.id },
      { status: 'RESOLVED', resolutionOutcome: outcome },
      { new: true }
    );
    if (!dispute) return res.status(404).json({ ok: false, msg: 'Dispute not found' });
    res.json({ ok: true, dispute, msg: `Dispute resolved with action: ${outcome}` });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

/* ══════════════════════════════════════════════
   6. ESCROW  (protected)
   ══════════════════════════════════════════════ */

router.get('/escrow/ledger', authMiddleware, async (req, res) => {
  try {
    const transactions = await EscrowTransaction.find().sort({ createdAt: -1 });
    const totalEscrowPool = transactions.filter(t => t.state === 'Locked in Escrow').reduce((s, t) => s + t.total, 0);
    const totalCommissions = transactions.reduce((s, t) => s + t.commission, 0);
    const totalDisbursed = transactions.filter(t => t.state === 'Disbursed to Worker').reduce((s, t) => s + t.payout, 0);
    res.json({ totalEscrowPool, totalCommissions, totalDisbursed, transactions });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

router.post('/escrow/payout', authMiddleware, async (req, res) => {
  try {
    const { labourId, amount } = req.body;
    const worker = await User.findByIdAndUpdate(labourId, { $inc: { walletBalance: -amount } }, { new: true }).select('-password');
    res.json({ ok: true, msg: `Disbursed ₹${amount} via Instant UPI.`, worker });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

module.exports = router;
