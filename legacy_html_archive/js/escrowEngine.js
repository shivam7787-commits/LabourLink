/**
 * LabourLink Escrow & Settlement Engine
 * Handles upfront funds locking, dispute freezes, partial hour recalculation,
 * commission split, and automated payout disbursement from PDF Pages 34-40 & 60.
 */

class EscrowEngine {
  /**
   * Step 1 & 2: Lock customer payment in Platform Escrow Wallet (PDF Page 36)
   */
  static lockPaymentInEscrow(bookingData, paymentMethod = 'UPI') {
    const quote = bookingData.financials;
    const escrowTxn = {
      txnId: 'ESCROW-' + Math.floor(100000 + Math.random() * 900000),
      bookingId: bookingData.id,
      amount: quote.totalCustomerPayable,
      paymentMethod,
      timestamp: new Date().toISOString(),
      status: 'LOCKED', // LOCKED, RELEASED, FROZEN_DISPUTE, REFUNDED, PARTIAL_REFUND
      splits: {
        baseLabourAmount: quote.baseLabourCost,
        platformCommission: quote.platformCommission,
        gstTaxes: quote.gst18 || Math.round(quote.totalCustomerPayable * 0.18 / 1.18),
        netLabourPayable: quote.labourPayoutExpected
      }
    };
    return escrowTxn;
  }

  /**
   * Step 4 & 5: Release Escrow upon Job Completion & OTP Verification (PDF Page 36-37)
   */
  static releaseEscrowOnCompletion(booking, tipAmount = 0) {
    const fin = booking.financials;
    const workerPayable = fin.labourPayoutExpected + Number(tipAmount);
    
    return {
      success: true,
      releasedAt: new Date().toISOString(),
      platformRevenue: fin.platformCommission + fin.platformFee,
      gstToGovernment: fin.gst18,
      labourPayoutTransferred: workerPayable,
      tipIncluded: Number(tipAmount),
      status: 'SETTLED',
      message: `Escrow released: ₹${workerPayable} credited to Labour Wallet (${tipAmount > 0 ? `including ₹${tipAmount} tip` : 'net of commission'}). ₹${fin.platformCommission} retained by platform.`
    };
  }

  /**
   * Partial Work / Hour-Based Recalculation (PDF Page 38)
   * Example: Booked for 8 hours, worked only 5 hours.
   * System recalculates: Labour payment = 5 hours, Remaining refunded to customer wallet.
   */
  static recalculatePartialHours(booking, actualHoursWorked) {
    const originalHours = booking.durationHours;
    if (actualHoursWorked >= originalHours) {
      return { adjusted: false, message: 'Full duration delivered.' };
    }

    const hourlyRate = booking.financials.baseLabourCost / originalHours;
    const adjustedLabourBase = Math.round(hourlyRate * actualHoursWorked);
    const unusedHours = originalHours - actualHoursWorked;
    const customerRefundAmount = Math.round(hourlyRate * unusedHours);

    // Adjust commission proportionately
    const commissionPercent = booking.financials.commissionRatePercent || 15;
    const adjustedCommission = Math.round(adjustedLabourBase * (commissionPercent / 100));
    const adjustedLabourPayout = adjustedLabourBase - adjustedCommission;

    return {
      adjusted: true,
      originalHours,
      actualHoursWorked,
      unusedHours,
      customerRefundAmount,
      adjustedLabourPayout,
      adjustedCommission,
      summary: `Worked ${actualHoursWorked}h of booked ${originalHours}h. ₹${customerRefundAmount} refunded to Customer Wallet; ₹${adjustedLabourPayout} payable to worker.`
    };
  }

  /**
   * Dispute-Based Money Hold (PDF Page 38 & 68)
   */
  static freezeEscrowForDispute(booking, disputeDetails) {
    return {
      frozenAmount: booking.financials.totalCustomerPayable,
      frozenAt: new Date().toISOString(),
      reason: disputeDetails.type,
      status: 'FROZEN_FOR_DISPUTE',
      slaHours: disputeDetails.type === 'Safety' ? 0 : (disputeDetails.type === 'No-show' ? 0 : 48),
      payoutBlocked: true
    };
  }

  /**
   * Generate GST Tax Invoice & Settlement Statements (PDF Page 39)
   */
  static generateInvoiceRecord(booking) {
    const fin = booking.financials;
    return {
      invoiceNumber: 'INV-' + booking.id.replace('BK-', '') + '-2026',
      date: new Date().toLocaleDateString('en-IN'),
      customer: {
        name: booking.customerName,
        phone: booking.customerPhone,
        address: booking.address
      },
      serviceProvider: {
        name: booking.labourName,
        trade: booking.serviceName,
        legalStatus: 'Independent Contractor (Not Employee of LabourLink)'
      },
      lineItems: [
        { desc: `${booking.serviceName} (${booking.durationHours} hrs / ${booking.quantity} worker)`, amount: fin.baseLabourCost },
        { desc: 'Platform Aggregator Technology & Verification Fee', amount: fin.platformFee },
        { desc: 'Integrated GST (18% IGST)', amount: fin.gst18 }
      ],
      totalPaid: fin.totalCustomerPayable,
      escrowReference: 'RBI/AGG/ESCROW/' + booking.id,
      taxNote: 'LabourLink facilitates technology matching and escrow under Section 9(5) CGST Act. Labour services provided by verified independent partner.'
    };
  }
}

window.EscrowEngine = EscrowEngine;
