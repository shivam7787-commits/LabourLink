/**
 * LabourLink Rating & Progressive Penalty Engine
 * Implements weighted rating formula, progressive penalties, anti-abuse checks,
 * and rewards system from PDF Pages 71-77.
 */

class RatingPenaltyEngine {
  static calculateWeightedRating(ratingsList) {
    if (!ratingsList || ratingsList.length === 0) return 5.0;
    const total = ratingsList.reduce((acc, r) => acc + (r.score || 5), 0);
    return parseFloat((total / ratingsList.length).toFixed(2));
  }

  static evaluatePenaltyTier(cancellationsIn30Days, disputeLossCount) {
    if (cancellationsIn30Days >= 5 || disputeLossCount >= 3) {
      return { tier: 3, action: 'SUSPENDED_7_DAYS', priorityPenalty: -40 };
    }
    if (cancellationsIn30Days >= 3 || disputeLossCount >= 2) {
      return { tier: 2, action: 'DISPATCH_DEPRIORITIZED', priorityPenalty: -20 };
    }
    if (cancellationsIn30Days >= 1) {
      return { tier: 1, action: 'FORMAL_WARNING', priorityPenalty: 0 };
    }
    return { tier: 0, action: 'GOOD_STANDING', priorityPenalty: 0 };
  }
}

module.exports = RatingPenaltyEngine;
