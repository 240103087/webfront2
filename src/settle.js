// Turn balances into transfers. No DOM, no storage.

/**
 * Greedy settle-up: the largest debtor pays the largest creditor, as much
 * as one of them needs, until everyone is at 0. Gives at most n-1
 * transfers for n members with a non-zero balance.
 *
 * `balances` is a Map of memberId -> tiyn whose values sum to 0.
 * Returns [{ from, to, amount }].
 */
export function settlePlan(balances) {
  const order = [...balances.keys()];
  const rank = (id) => order.indexOf(id);
  const debtors = [];
  const creditors = [];
  for (const [id, value] of balances) {
    if (value < 0) debtors.push({ id, left: -value });
    if (value > 0) creditors.push({ id, left: value });
  }
  // Largest first; ties keep group order so the plan is stable.
  const byLeft = (a, b) => b.left - a.left || rank(a.id) - rank(b.id);
  const transfers = [];
  while (debtors.length && creditors.length) {
    debtors.sort(byLeft);
    creditors.sort(byLeft);
    const debtor = debtors[0];
    const creditor = creditors[0];
    const amount = Math.min(debtor.left, creditor.left);
    transfers.push({ from: debtor.id, to: creditor.id, amount });
    debtor.left -= amount;
    creditor.left -= amount;
    if (debtor.left === 0) debtors.shift();
    if (creditor.left === 0) creditors.shift();
  }
  return transfers;
}
