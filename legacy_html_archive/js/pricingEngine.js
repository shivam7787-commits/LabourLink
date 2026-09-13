/**
 * LabourLink Pricing & Commission Engine
 * Exact formulas, commission slabs, dynamic surge, and cancellation logic from PDF Pages 27-33 & 58
 */

class PricingEngine {
  /**
   * Commission rate based on labour category (PDF Page 25 & 31)
   */
  static getCommissionRate(category, isB2B = false) {
    if (isB2B) return 10; // Corporate 8-10%
    switch (category) {
      case 'Unskilled':
        return 12; // 10-12%
      case 'Semi-Skilled':
        return 15; // 15%
      case 'Skilled':
        return 18; // 15-20%
      case 'Specialist':
        return 22; // 20-25%
      default:
        return 15;
    }
  }

  /**
   * Calculate transparent itemized price for customer and payout for labour
   */
  static calculateBookingQuote({
    service,
    pricingType = 'Hourly', // Hourly, Daily, Fixed
    duration = 3,           // hours or days or 1 task
    quantity = 1,          // number of workers
    isEmergency = false,   // <2h or urgent
    isNightShift = false,  // 9pm - 6am
    distanceKm = 2.0,
    customerTier = 'Bronze', // Bronze, Silver, Gold
    isB2BSubscriber = false
  }) {
    let unitRate = 0;
    if (pricingType === 'Hourly') {
      unitRate = service.baseHourlyRate || 200;
    } else if (pricingType === 'Daily') {
      unitRate = service.baseDailyRate || 1400;
    } else {
      unitRate = service.baseHourlyRate * 3; // Fixed task default
    }

    // Base Labour Charge
    const baseLabourCharge = unitRate * duration * quantity;

    // Surge Multipliers (PDF Page 30)
    let surgeMultiplier = 1.0;
    let surgeReasons = [];
    if (isEmergency) {
      surgeMultiplier += 0.25; // 1.25x
      surgeReasons.push('Emergency Booking (<2h window: +25%)');
    }
    if (isNightShift) {
      surgeMultiplier += 0.20; // Night hours
      surgeReasons.push('Night Hours Service (+20%)');
    }

    const surgeFee = Math.round(baseLabourCharge * (surgeMultiplier - 1.0));

    // Platform Convenience Fee (PDF Page 32, 80)
    // Subscription members get Zero platform fee!
    let platformFee = isB2BSubscriber ? 0 : 100;
    if (customerTier === 'Gold') {
      platformFee = 50; // Discounted for Gold
    }

    // Distance Adjustment if > 5km
    let distanceSurcharge = 0;
    if (distanceKm > 5) {
      distanceSurcharge = Math.round((distanceKm - 5) * 15);
    }

    // Subtotal before tax
    const subtotal = baseLabourCharge + surgeFee + platformFee + distanceSurcharge;

    // GST (18%) on Platform Fee & Services (India Example PDF Page 32 & 58)
    const gstRate = 0.18;
    const gstAmount = Math.round(subtotal * gstRate);

    // Final Customer Payable
    const totalCustomerPayable = subtotal + gstAmount;

    // Commission Breakdown for Labour Payout (PDF Page 31 & 36)
    const commissionPercent = this.getCommissionRate(service.category, isB2BSubscriber);
    const platformCommission = Math.round(baseLabourCharge * (commissionPercent / 100));
    const labourBasePayout = (baseLabourCharge + surgeFee) - platformCommission;

    return {
      pricingType,
      duration,
      quantity,
      unitRate,
      baseLabourCharge,
      surgeMultiplier,
      surgeFee,
      surgeReasons,
      platformFee,
      distanceSurcharge,
      subtotal,
      gstRatePercent: 18,
      gstAmount,
      totalCustomerPayable,
      
      // Labour Payout Transparency (PDF Page 31)
      commissionPercent,
      platformCommission,
      labourBasePayout,
      labourFinalPayout: labourBasePayout // Before tips
    };
  }

  /**
   * Cancellation & Penalty Refund Matrix (PDF Page 28, 32, 61)
   */
  static evaluateCancellation(hoursBeforeStart, cancelledBy = 'Customer') {
    if (cancelledBy === 'Labour') {
      return {
        customerRefundPercent: 100,
        cancellationFeePercent: 0,
        labourPenaltyAmount: 250,
        summary: 'Labour No-Show: 100% full refund to customer + ₹250 penalty to labour + priority backup.'
      };
    }

    // Customer cancellations
    if (hoursBeforeStart > 6) {
      return {
        customerRefundPercent: 100,
        cancellationFeePercent: 0,
        labourCompensationPercent: 0,
        summary: 'Cancelled >6 hrs before start: 100% full refund.'
      };
    } else if (hoursBeforeStart >= 2) {
      return {
        customerRefundPercent: 70,
        cancellationFeePercent: 30,
        labourCompensationPercent: 20,
        summary: 'Cancelled 2–6 hrs before start: 70% refund, 30% cancellation fee (partial compensation to labour).'
      };
    } else {
      return {
        customerRefundPercent: 0,
        cancellationFeePercent: 100,
        labourCompensationPercent: 80,
        summary: 'Cancelled <2 hrs before start or No-Show: 0% refund, 100% fee credited to labour compensation.'
      };
    }
  }
}

window.PricingEngine = PricingEngine;
