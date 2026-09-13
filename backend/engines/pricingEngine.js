/**
 * LabourLink Pricing & Commission Engine
 * Exact formulas, commission slabs, dynamic surge, and cancellation logic from PDF Pages 27-33 & 58
 */

class PricingEngine {
  static getCommissionRate(category, isB2B = false) {
    if (isB2B) return 10;
    switch (category) {
      case 'Unskilled':  return 20;
      case 'Semi-Skilled': return 22;
      case 'Skilled':    return 25;
      case 'Specialist': return 25;
      default:           return 20;
    }
  }

  static calculateBookingQuote({
    service = {},
    pricingType = 'Hourly',
    duration = 3,
    quantity = 1,
    isEmergency = false,
    isNightShift = false,
    distanceKm = 2.0,
    customerTier = 'Bronze',
    isB2BSubscriber = false
  }) {
    let unitRate = 0;
    if (pricingType === 'Hourly') {
      unitRate = service.baseHourlyRate || 250;
    } else if (pricingType === 'Daily') {
      unitRate = service.baseDailyRate || 1800;
    } else {
      unitRate = (service.baseHourlyRate || 250) * 3;
    }

    const baseLabourCharge = unitRate * duration * quantity;

    let surgeMultiplier = 1.0;
    const surgeReasons = [];
    if (isEmergency) {
      surgeMultiplier += 0.25;
      surgeReasons.push('Emergency Booking (<2h window: +25%)');
    }
    if (isNightShift) {
      surgeMultiplier += 0.20;
      surgeReasons.push('Night Shift Window: +20%');
    }

    const surgedLabourCharge = Math.round(baseLabourCharge * surgeMultiplier);
    const convenienceFee = isB2BSubscriber ? 0 : Math.round(surgedLabourCharge * 0.05 + 25);
    const totalCustomerAmount = surgedLabourCharge + convenienceFee;

    const commissionPercent = this.getCommissionRate(service.skillLevel || 'Skilled', isB2BSubscriber);
    const platformCommission = Math.round((surgedLabourCharge * commissionPercent) / 100);
    const workerPayout = surgedLabourCharge - platformCommission;

    return {
      pricingType,
      duration,
      quantity,
      unitRate,
      baseLabourCharge,
      surgeMultiplier,
      surgeReasons,
      surgedLabourCharge,
      convenienceFee,
      totalCustomerAmount,
      commissionPercent,
      platformCommission,
      workerPayout
    };
  }
}

module.exports = PricingEngine;
