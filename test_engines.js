/**
 * Automated Verification Test Suite for LabourLink Algorithmic Engines
 * Tests exact PDF formulas, scoring models, commission slabs, and penalty tiers.
 */

// Mock browser window object for node execution
global.window = {};

require('./js/matchingEngine.js');
require('./js/pricingEngine.js');
require('./js/escrowEngine.js');
require('./js/ratingPenaltyEngine.js');

const MatchingEngine = window.MatchingEngine;
const PricingEngine = window.PricingEngine;
const EscrowEngine = window.EscrowEngine;
const RatingPenaltyEngine = window.RatingPenaltyEngine;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== RUNNING LABOURLINK ENGINE TEST SUITE ===\n');

// 1. Matching Algorithm Engine Tests (PDF Pages 50-54)
console.log('Test 1: Matching Algorithm Mathematical Formulas');
{
  const mockWorker = {
    trade: 'Electrician',
    status: 'Active',
    verification: { idVerified: true, policeVerified: true },
    currentLocation: { distanceKm: 0.8 }, // <1km = 100 (25% -> 25)
    availability: 'Free now',             // Free now = 100 (20% -> 20)
    rating: 4.8,                          // >=4.75 = 100 (20% -> 20)
    completionRate: 98,                   // >95% = 100 (15% -> 15)
    avgAcceptanceTimeSec: 20,             // <30s = 100 (10% -> 10)
    experienceYears: 6,                   // >5 yrs = 100 (10% -> 10)
    jobsToday: 2                          // <=5 (no anti-bias penalty)
  };

  const scoreResult = MatchingEngine.computeMatchScore(mockWorker, false);
  // Total expected: 25 + 20 + 20 + 15 + 10 + 10 = 100
  assert(scoreResult.finalScore === 100, `Perfect candidate match score is 100 (Got ${scoreResult.finalScore})`);
  assert(!scoreResult.antiBiasApplied, 'Anti-bias penalty NOT applied for <= 5 jobs today');

  // Test Anti-Bias Job Monopoly Rule (PDF Page 53)
  mockWorker.jobsToday = 6;
  const biasedResult = MatchingEngine.computeMatchScore(mockWorker, false);
  // 100 * 0.8 = 80
  assert(biasedResult.finalScore === 80, `Anti-bias 20% penalty correctly applied for >5 jobs today (100 -> ${biasedResult.finalScore})`);
  assert(biasedResult.antiBiasApplied === true, 'Anti-bias flag set to true');

  // Test Hard Quality Filters (Rating < 3.0 or Completion < 80% Excluded)
  const lowQualityWorker = {
    trade: 'Electrician',
    status: 'Active',
    verification: { idVerified: true, policeVerified: true },
    currentLocation: { distanceKm: 2 },
    rating: 2.8,
    completionRate: 75
  };
  const elig = MatchingEngine.checkEligibility(lowQualityWorker, { trade: 'Electrician' });
  assert(!elig.isEligible, 'Worker with rating < 3.0 and completion < 80% is strictly excluded');
}

// 2. Pricing & Commission Engine Tests (PDF Pages 28-33 & 58)
console.log('\nTest 2: Pricing & Commission Slabs');
{
  const mockService = {
    category: 'Skilled',
    trade: 'Electrical',
    baseHourlyRate: 200,
    baseDailyRate: 1400
  };

  const quote = PricingEngine.calculateBookingQuote({
    service: mockService,
    pricingType: 'Hourly',
    duration: 3,
    quantity: 1,
    isEmergency: false,
    distanceKm: 2.0,
    customerTier: 'Bronze'
  });

  // Base: 3 * 200 = 600, Platform fee: 100, Subtotal: 700, GST 18%: 126, Total: 826
  assert(quote.baseLabourCharge === 600, `Base labour charge = ₹600 (Got ₹${quote.baseLabourCharge})`);
  assert(quote.platformFee === 100, `Platform convenience fee = ₹100`);
  assert(quote.gstAmount === 126, `GST 18% = ₹126`);
  assert(quote.totalCustomerPayable === 826, `Total customer payable = ₹826`);
  assert(quote.commissionPercent === 18, `Skilled commission rate is 18% (PDF Page 25)`);

  // Emergency Surge (+25%)
  const emergencyQuote = PricingEngine.calculateBookingQuote({
    service: mockService,
    pricingType: 'Hourly',
    duration: 3,
    quantity: 1,
    isEmergency: true,
    distanceKm: 2.0,
    customerTier: 'Bronze'
  });
  // Surge fee: 600 * 0.25 = 150
  assert(emergencyQuote.surgeFee === 150, `Emergency surge fee = ₹150 (+25% multiplier)`);

  // Cancellation Policy (PDF Page 28 & 61)
  const cancelEarly = PricingEngine.evaluateCancellation(7, 'Customer');
  assert(cancelEarly.customerRefundPercent === 100, 'Customer cancels >6h -> 100% refund');

  const cancelMid = PricingEngine.evaluateCancellation(4, 'Customer');
  assert(cancelMid.customerRefundPercent === 70 && cancelMid.cancellationFeePercent === 30, 'Customer cancels 2-6h -> 70% refund, 30% fee');

  const cancelLate = PricingEngine.evaluateCancellation(1, 'Customer');
  assert(cancelLate.customerRefundPercent === 0 && cancelLate.cancellationFeePercent === 100, 'Customer cancels <2h -> 0% refund, 100% fee');

  const workerNoShow = PricingEngine.evaluateCancellation(0, 'Labour');
  assert(workerNoShow.customerRefundPercent === 100 && workerNoShow.labourPenaltyAmount === 250, 'Labour no-show -> 100% refund + worker penalty');
}

// 3. Escrow & Partial Hours Engine Tests (PDF Pages 34-40)
console.log('\nTest 3: Escrow & Partial Work Hours Recalculation');
{
  const mockBooking = {
    id: 'BK-TEST',
    durationHours: 8,
    customerName: 'Priya Sharma',
    customerPhone: '+91 9876543210',
    address: 'Bellandur',
    labourName: 'Ramesh Kumar',
    serviceName: 'Electrician',
    financials: {
      baseLabourCost: 1600, // 8h * 200
      platformFee: 100,
      totalCustomerPayable: 2006,
      commissionRatePercent: 15,
      labourPayoutExpected: 1360
    }
  };

  // Recalculate if worked 5 hours instead of 8 hours (PDF Page 38)
  const partialResult = EscrowEngine.recalculatePartialHours(mockBooking, 5);
  assert(partialResult.adjusted === true, 'Partial hours adjustment triggered');
  assert(partialResult.unusedHours === 3, 'Unused hours = 3');
  assert(partialResult.customerRefundAmount === 600, `Refund to customer wallet for 3 unused hours = ₹600 (Got ₹${partialResult.customerRefundAmount})`);
  assert(partialResult.adjustedLabourPayout === 850, `Labour payment for 5 hours (1000 - 15% comm) = ₹850 (Got ₹${partialResult.adjustedLabourPayout})`);
}

// 4. Rating & Progressive Penalty Matrix (PDF Pages 71-77)
console.log('\nTest 4: Weighted Rating Formula & Progressive Penalties');
{
  // Final Rating = (Last 10 Jobs × 50%) + (Previous 20 Jobs × 30%) + (Overall History × 20%)
  const history = [
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, // overall earlier (10 jobs)
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, // prev 20 part 1
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, // prev 20 part 2
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5  // last 10 jobs
  ];

  const weightedRating = RatingPenaltyEngine.calculateWeightedRating(history);
  // Last 10 avg = 5.0 (50% -> 2.5)
  // Prev 20 avg = 4.0 (30% -> 1.2)
  // Overall avg = (10*5 + 20*4 + 10*5)/40 = 180/40 = 4.5 (20% -> 0.9)
  // Total = 2.5 + 1.2 + 0.9 = 4.6
  assert(weightedRating === 4.6, `Weighted rating matches PDF formula = 4.6 (Got ${weightedRating})`);

  // Progressive penalties test
  const p1 = RatingPenaltyEngine.determinePenaltyTier({ penalties: [] }, 'LATE');
  assert(p1.level === 1, 'First offense is Level 1 Warning');

  const p2 = RatingPenaltyEngine.determinePenaltyTier({ penalties: [{}] }, 'NO_SHOW');
  assert(p2.level === 2 && p2.fine === 300, 'Second offense is Level 2 Financial Penalty (₹300 fine)');

  const p3 = RatingPenaltyEngine.determinePenaltyTier({ penalties: [{}, {}] }, 'NO_SHOW');
  assert(p3.level === 3 && p3.suspensionDays === 3, 'Third offense is Level 3 Temporary Suspension (3 days)');

  const pCritical = RatingPenaltyEngine.determinePenaltyTier({ penalties: [] }, 'SAFETY_MISCONDUCT');
  assert(pCritical.level === 4, 'Safety misconduct is immediately Level 4 Permanent Ban');
}

console.log(`\n=== TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`);
if (failed > 0) process.exit(1);
