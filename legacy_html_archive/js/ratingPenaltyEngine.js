/**
 * LabourLink Rating & Progressive Penalty Engine
 * Implements weighted rating formula, progressive penalties, anti-abuse checks,
 * and rewards system from PDF Pages 71-77.
 */

class RatingPenaltyEngine {
  /**
   * Weighted Rating Formula (PDF Page 74)
   * Final Rating = (Last 10 Jobs × 50%) + (Previous 20 Jobs × 30%) + (Overall History × 20%)
   */
  static calculateWeightedRating(ratingsHistory = []) {
    if (!ratingsHistory || ratingsHistory.length === 0) return 5.0;

    const totalCount = ratingsHistory.length;
    // Last 10 jobs
    const last10 = ratingsHistory.slice(-10);
    const avgLast10 = last10.reduce((a, b) => a + b, 0) / last10.length;

    // Previous 20 jobs (from -30 to -10)
    const prev20 = ratingsHistory.slice(Math.max(0, totalCount - 30), Math.max(0, totalCount - 10));
    const avgPrev20 = prev20.length > 0 ? (prev20.reduce((a, b) => a + b, 0) / prev20.length) : avgLast10;

    // Overall history
    const avgOverall = ratingsHistory.reduce((a, b) => a + b, 0) / totalCount;

    const weightedScore = (avgLast10 * 0.50) + (avgPrev20 * 0.30) + (avgOverall * 0.20);
    return Math.round(weightedScore * 10) / 10;
  }

  /**
   * Rating Score Buckets (PDF Page 74)
   */
  static getRatingBucket(rating) {
    if (rating >= 4.5) {
      return { category: 'Excellent', impact: 'Priority Jobs & Premium Badge', color: 'badge-green' };
    }
    if (rating >= 4.0) {
      return { category: 'Good', impact: 'Normal Job Access', color: 'badge-blue' };
    }
    if (rating >= 3.5) {
      return { category: 'Average', impact: 'Limited Job Dispatch', color: 'badge-amber' };
    }
    return { category: 'Poor', impact: 'Penalty Zone / Retraining', color: 'badge-red' };
  }

  /**
   * Auto-Rating Adjustments on Incidents (PDF Page 74)
   */
  static applyAutoIncidentRating(labour, incidentType) {
    let newRatings = [...(labour.ratingsHistory || [5, 5, 5])];
    let note = '';

    if (incidentType === 'NO_SHOW') {
      newRatings.push(1); // Auto 1-star
      note = 'Auto 1★ assigned due to confirmed No-Show.';
    } else if (incidentType === 'LATE_30_MIN') {
      const last = newRatings[newRatings.length - 1];
      newRatings[newRatings.length - 1] = Math.max(1, last - 0.5);
      note = 'Deducted -0.5★ from latest rating due to >30 min unnotified delay.';
    }

    const updatedRating = this.calculateWeightedRating(newRatings);
    return {
      updatedRating,
      newRatingsHistory: newRatings,
      note
    };
  }

  /**
   * Progressive Penalty Assignment (PDF Page 75)
   * Level 1: Warning
   * Level 2: Financial Penalty (₹100–₹500 deduction)
   * Level 3: Temporary Suspension (24h - 7d)
   * Level 4: Permanent Ban
   */
  static determinePenaltyTier(labour, issueType) {
    const existingPenalties = labour.penalties || [];
    const offenseCount = existingPenalties.length + 1;

    if (issueType === 'SAFETY_MISCONDUCT' || issueType === 'FRAUD') {
      return {
        level: 4,
        title: 'Level 4 – Permanent Ban',
        action: 'Account permanently terminated due to critical safety/fraud violation.',
        fine: 0,
        suspensionDays: 9999,
        statusUpdate: 'Suspended'
      };
    }

    if (offenseCount === 1) {
      return {
        level: 1,
        title: 'Level 1 – Warning & Education',
        action: 'First offense warning issued. Educational notification sent. No financial penalty.',
        fine: 0,
        suspensionDays: 0,
        statusUpdate: 'Active'
      };
    } else if (offenseCount === 2) {
      const fineAmount = issueType === 'NO_SHOW' ? 300 : 150;
      return {
        level: 2,
        title: 'Level 2 – Financial Penalty & Priority Demotion',
        action: `₹${fineAmount} fine deducted from available wallet balance. Reduced job matching priority for 7 days.`,
        fine: fineAmount,
        suspensionDays: 0,
        statusUpdate: 'Active'
      };
    } else if (offenseCount === 3) {
      return {
        level: 3,
        title: 'Level 3 – Temporary Suspension',
        action: 'Account temporarily suspended for 3 days. Mandatory safety & punctuality retraining required before reactivation.',
        fine: 500,
        suspensionDays: 3,
        statusUpdate: 'Suspended'
      };
    } else {
      return {
        level: 4,
        title: 'Level 4 – Permanent Ban',
        action: 'Repeated policy violations. Permanent platform account termination.',
        fine: 0,
        suspensionDays: 9999,
        statusUpdate: 'Suspended'
      };
    }
  }

  /**
   * Anti-Abuse Rating Validation (PDF Page 73)
   */
  static validateCustomerReview(booking, ratingValue) {
    if (booking.status !== 'COMPLETED' && booking.status !== 'SETTLED') {
      return { valid: false, reason: 'Ratings are only accepted for completed bookings.' };
    }
    if (!booking.startOtpVerified) {
      // In simulation we check startOtpVerified
      return { valid: false, reason: 'Rating rejected: Job start OTP was not verified.' };
    }
    if (ratingValue < 1 || ratingValue > 5) {
      return { valid: false, reason: 'Star rating must be between 1 and 5.' };
    }
    return { valid: true };
  }
}

window.RatingPenaltyEngine = RatingPenaltyEngine;
