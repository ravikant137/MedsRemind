/**
 * Smart Refill Prediction Engine
 * Predicts next refill date based on current stock and daily dosage.
 */

const predictNextRefill = (currentStock, dailyDosage) => {
  if (dailyDosage <= 0) return null;
  const daysLeft = Math.floor(currentStock / dailyDosage);
  const nextRefillDate = new Date();
  nextRefillDate.setDate(nextRefillDate.getDate() + (daysLeft - 3)); // Suggest reorder 3 days before running out
  return nextRefillDate;
};

const calculateAdherence = (logs) => {
  if (!logs || logs.length === 0) return 100;
  const taken = logs.filter(l => l.status === 'TAKEN').length;
  return Math.round((taken / logs.length) * 100);
};

module.exports = { predictNextRefill, calculateAdherence };
