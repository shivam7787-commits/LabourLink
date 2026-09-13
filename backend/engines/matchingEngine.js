/**
 * LabourLink Matching Algorithm Engine
 * Exact mathematical formulation and eligibility filter from PDF Pages 48-54
 */

class MatchingEngine {
  static checkEligibility(labour, jobRequirements) {
    const reasons = [];

    // 1. Skill Match
    const labourTrade = (labour.trade || labour.category || '').toLowerCase();
    const requiredTrade = (jobRequirements.trade || '').toLowerCase();
    if (!labourTrade.includes(requiredTrade) && !requiredTrade.includes(labourTrade)) {
      reasons.push(`Skill mismatch (${labour.trade || labour.category} vs ${jobRequirements.trade})`);
    }

    // 2. Status & Suspension Check
    if (labour.status && labour.status.toLowerCase() !== 'active') {
      reasons.push(`Account status not Active (${labour.status})`);
    }

    // 3. Distance / Service Radius Filter
    const distanceKm = labour.distanceKm ?? labour.currentLocation?.distanceKm ?? 2.5;
    const maxRadius = labour.serviceRadiusKm || 15;
    if (distanceKm > maxRadius) {
      reasons.push(`Outside service radius (${distanceKm.toFixed(1)}km > ${maxRadius}km)`);
    }

    // 4. Hard Quality Filters (Rating < 3.0)
    if (labour.rating && labour.rating < 3.0) {
      reasons.push(`Rating below threshold (${labour.rating} < 3.0★)`);
    }

    return {
      isEligible: reasons.length === 0,
      reasons
    };
  }

  static calculateDistanceScore(distanceKm) {
    if (distanceKm < 1) return 100;
    if (distanceKm <= 3) return 80;
    if (distanceKm <= 5) return 60;
    return 30;
  }

  static calculateAvailabilityScore(status, lastActiveMinutesAgo) {
    if (status === 'AVAILABLE_IMMEDIATE' || status === 'active') return 100;
    if (status === 'BUSY_ENDING_SOON') return 60;
    if (lastActiveMinutesAgo <= 15) return 40;
    return 10;
  }

  static calculateRatingScore(rating) {
    return Math.min(100, Math.max(0, (rating / 5) * 100));
  }

  static calculateCompletionRateScore(ratePercentage) {
    return Math.min(100, Math.max(0, ratePercentage));
  }

  static calculateCompositeScore({
    labour,
    distanceKm = 2.0,
    availabilityStatus = 'AVAILABLE_IMMEDIATE',
    lastActiveMinutesAgo = 0,
    jobsCompletedToday = 0
  }) {
    const distScore = this.calculateDistanceScore(distanceKm);
    const availScore = this.calculateAvailabilityScore(availabilityStatus, lastActiveMinutesAgo);
    const ratingScore = this.calculateRatingScore(labour.rating || 4.8);
    const completionScore = this.calculateCompletionRateScore(labour.completionRate || 98);

    const baseComposite = (
      (distScore * 0.25) +
      (availScore * 0.25) +
      (ratingScore * 0.30) +
      (completionScore * 0.20)
    );

    let antiBiasAdjustment = 0;
    const antiBiasNotes = [];
    if (jobsCompletedToday > 5) {
      antiBiasAdjustment -= 20;
      antiBiasNotes.push('Anti-monopoly cap: >5 jobs completed today (-20%)');
    }

    const finalScore = Math.max(0, Math.min(100, baseComposite + antiBiasAdjustment));

    return {
      baseComposite: parseFloat(baseComposite.toFixed(2)),
      antiBiasAdjustment,
      antiBiasNotes,
      finalScore: parseFloat(finalScore.toFixed(2)),
      breakdown: {
        distanceScore: distScore,
        availabilityScore: availScore,
        ratingScore: ratingScore,
        completionScore: completionScore
      }
    };
  }

  static rankLabourForJob(labourPool, jobRequirements) {
    const eligibleResults = [];
    const excludedResults = [];

    labourPool.forEach(labour => {
      const eligibility = this.checkEligibility(labour, jobRequirements);
      if (eligibility.isEligible) {
        const scoreData = this.calculateCompositeScore({
          labour,
          distanceKm: labour.distanceKm ?? 2.0,
          jobsCompletedToday: labour.jobsCompletedToday ?? 1
        });
        eligibleResults.push({
          labour,
          ...scoreData
        });
      } else {
        excludedResults.push({
          labour,
          reasons: eligibility.reasons
        });
      }
    });

    eligibleResults.sort((a, b) => b.finalScore - a.finalScore);
    return { topMatches: eligibleResults, excluded: excludedResults };
  }
}

module.exports = MatchingEngine;
