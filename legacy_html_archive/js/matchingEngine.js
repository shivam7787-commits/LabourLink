/**
 * LabourLink Matching Algorithm Engine
 * Exact mathematical formulation and eligibility filter from PDF Pages 48-54
 */

class MatchingEngine {
  /**
   * First Layer: Eligibility Filtering (PDF Page 50)
   * Before scoring, eliminate unsuitable labour.
   */
  static checkEligibility(labour, jobRequirements) {
    const reasons = [];

    // 1. Skill Match
    const labourTrade = (labour.trade || '').toLowerCase();
    const requiredTrade = (jobRequirements.trade || '').toLowerCase();
    if (!labourTrade.includes(requiredTrade) && !requiredTrade.includes(labourTrade)) {
      reasons.push(`Skill mismatch (${labour.trade} vs ${jobRequirements.trade})`);
    }

    // 2. Status & Suspension Check
    if (labour.status !== 'Active') {
      reasons.push(`Account status not Active (${labour.status})`);
    }

    // 3. Verification Check
    if (!labour.verification || !labour.verification.idVerified || !labour.verification.policeVerified) {
      reasons.push('Incomplete KYC or police verification');
    }

    // 4. Distance / Service Radius Filter
    const distanceKm = labour.currentLocation?.distanceKm ?? 999;
    const maxRadius = labour.serviceRadiusKm || 10;
    if (distanceKm > maxRadius) {
      reasons.push(`Outside service radius (${distanceKm.toFixed(1)}km > ${maxRadius}km)`);
    }

    // 5. Hard Quality Filters (Rating < 3.0 or Completion < 80%)
    if (labour.rating < 3.0) {
      reasons.push(`Rating below threshold (${labour.rating} < 3.0★)`);
    }
    if (labour.completionRate < 80) {
      reasons.push(`Completion rate below threshold (${labour.completionRate}% < 80%)`);
    }

    return {
      isEligible: reasons.length === 0,
      reasons
    };
  }

  /**
   * Distance Scoring (PDF Page 51)
   * <1 km: 100 | 1–3 km: 80 | 3–5 km: 60 | >5 km: 30
   */
  static calculateDistanceScore(distanceKm) {
    if (distanceKm < 1) return 100;
    if (distanceKm <= 3) return 80;
    if (distanceKm <= 5) return 60;
    return 30;
  }

  /**
   * Availability Score (PDF Page 51)
   * Free now: 100 | Free in 1 hr: 70 | Busy: 0
   */
  static calculateAvailabilityScore(availability) {
    if (availability === 'Free now') return 100;
    if (availability === 'Free in 1 hr') return 70;
    return 0;
  }

  /**
   * Rating Score (PDF Page 51-52)
   * 5★: 100 | 4★: 80 | 3★: 60 | <3★: Excluded
   */
  static calculateRatingScore(rating) {
    if (rating >= 4.75) return 100;
    if (rating >= 4.0) return 80;
    if (rating >= 3.0) return 60;
    return 0;
  }

  /**
   * Completion Rate Score (PDF Page 52)
   * >95%: 100 | 90–95%: 80 | 80–90%: 60 | <80%: Excluded
   */
  static calculateCompletionScore(rate) {
    if (rate > 95) return 100;
    if (rate >= 90) return 80;
    if (rate >= 80) return 60;
    return 0;
  }

  /**
   * Acceptance Speed Score (PDF Page 52)
   * <30 sec: 100 | <2 min (120s): 70 | >5 min: 30
   */
  static calculateAcceptanceScore(seconds) {
    if (seconds < 30) return 100;
    if (seconds <= 120) return 70;
    return 30;
  }

  /**
   * Experience Score (PDF Page 52)
   * >5 yrs: 100 | 2–5 yrs: 70 | <2 yrs: 40
   */
  static calculateExperienceScore(years) {
    if (years > 5) return 100;
    if (years >= 2) return 70;
    return 40;
  }

  /**
   * Core Mathematical Match Score Formulation (PDF Page 51)
   * Match Score = 
   *   (Distance Score × 25%)
   * + (Availability Score × 20%)
   * + (Rating Score × 20%)
   * + (Completion Score × 15%)
   * + (Acceptance Score × 10%)
   * + (Experience Score × 10%)
   */
  static computeMatchScore(labour, isEmergency = false) {
    const dist = labour.currentLocation?.distanceKm ?? 2.5;
    const distanceScore = this.calculateDistanceScore(dist);
    const availabilityScore = this.calculateAvailabilityScore(labour.availability);
    const ratingScore = this.calculateRatingScore(labour.rating);
    const completionScore = this.calculateCompletionScore(labour.completionRate);
    const acceptanceScore = this.calculateAcceptanceScore(labour.avgAcceptanceTimeSec);
    const experienceScore = this.calculateExperienceScore(labour.experienceYears);

    // Emergency adjustments (PDF Page 53): lower distance weight, increase acceptance weight
    let rawScore = 0;
    if (isEmergency) {
      rawScore = 
        (distanceScore * 0.15) +
        (availabilityScore * 0.25) +
        (ratingScore * 0.20) +
        (completionScore * 0.10) +
        (acceptanceScore * 0.20) +
        (experienceScore * 0.10);
    } else {
      rawScore = 
        (distanceScore * 0.25) +
        (availabilityScore * 0.20) +
        (ratingScore * 0.20) +
        (completionScore * 0.15) +
        (acceptanceScore * 0.10) +
        (experienceScore * 0.10);
    }

    // Fairness & Anti-Bias Logic (PDF Page 53)
    // To prevent job monopoly: IF labour.jobs_today > 5 THEN reduce score by 20%
    let antiBiasApplied = false;
    let finalScore = rawScore;
    if ((labour.jobsToday || 0) > 5) {
      finalScore = rawScore * 0.8;
      antiBiasApplied = true;
    }

    return {
      finalScore: Math.round(finalScore * 10) / 10,
      rawScore: Math.round(rawScore * 10) / 10,
      breakdown: {
        distanceScore,
        availabilityScore,
        ratingScore,
        completionScore,
        acceptanceScore,
        experienceScore
      },
      antiBiasApplied,
      jobsToday: labour.jobsToday || 0
    };
  }

  /**
   * Full Search & Ranking Pipeline
   */
  static rankLabourForJob(labourPool, jobRequirements) {
    const eligibleResults = [];
    const excludedResults = [];

    labourPool.forEach(labour => {
      const eligibility = this.checkEligibility(labour, jobRequirements);
      if (eligibility.isEligible) {
        const scoreData = this.computeMatchScore(labour, jobRequirements.isEmergency);
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

    // Sort descending by finalScore
    eligibleResults.sort((a, b) => b.finalScore - a.finalScore);

    return {
      topMatches: eligibleResults,
      excluded: excludedResults
    };
  }
}

window.MatchingEngine = MatchingEngine;
