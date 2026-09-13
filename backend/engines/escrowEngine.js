/**
 * LabourLink Escrow & Settlement Engine
 * Handles upfront funds locking, dispute freezes, partial hour recalculation,
 * commission split, and automated payout disbursement from PDF Pages 34-40 & 60.
 */

class EscrowEngine {
  static createEscrowTransaction({ bookingId, customerId, totalCustomerAmount, platformCommission, workerPayout }) {
    return {
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      bookingId,
      customerId,
      amountLocked: totalCustomerAmount,
      platformCommission,
      workerPayout,
      status: 'LOCKED_IN_ESCROW',
      lockedAt: new Date().toISOString(),
      disbursedAt: null,
      refundedAmount: 0
    };
  }

  static settleOnJobCompletion(escrowTxn) {
    return {
      ...escrowTxn,
      status: 'SETTLED_RELEASED',
      disbursedAt: new Date().toISOString()
    };
  }

  static freezeOnDispute(escrowTxn, reason) {
    return {
      ...escrowTxn,
      status: 'FROZEN_DISPUTE',
      disputeReason: reason,
      frozenAt: new Date().toISOString()
    };
  }

  static resolveDispute(escrowTxn, outcome) {
    // outcome: 'REFUND_CUSTOMER', 'PAYOUT_WORKER', 'SPLIT_50_50'
    const updated = { ...escrowTxn, resolvedAt: new Date().toISOString() };
    if (outcome === 'REFUND_CUSTOMER') {
      updated.status = 'REFUNDED_CUSTOMER';
      updated.refundedAmount = escrowTxn.amountLocked;
      updated.workerPayout = 0;
    } else if (outcome === 'PAYOUT_WORKER') {
      updated.status = 'SETTLED_RELEASED';
    } else {
      updated.status = 'SETTLED_SPLIT_50_50';
      updated.refundedAmount = Math.round(escrowTxn.amountLocked / 2);
      updated.workerPayout = Math.round(escrowTxn.workerPayout / 2);
    }
    return updated;
  }
}

module.exports = EscrowEngine;
