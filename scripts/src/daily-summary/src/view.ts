/**
 * @example
 * // in dataview.js
 * dv.view("daily-summary")
 */
const key = 'spent';
// const getExpenses = _lists => Array.from(_lists.map(t => t.children)).flat().filter(c => c.spent).map(e => {
//   const [name, price] = e.spent.split('-');
//   return {name, price}
// })

const textToPrice = (price: string, rate: number) => {
  if (price.slice(-3) === 'eur') {
    // default euro rate if no rate was given
    return Number(price.slice(0, -3)) * (rate ?? 1350);
  }
  if (price.slice(-3) === 'brl') {
    return Number(price.slice(0, -3)) * (rate ?? 250);
  }
  return Number(price);
};

const delimit = (num: number) => Math.round(num).toLocaleString();
// const expenses = getExpenses(dv.current().file.lists);
// const earnings = getEarnings(dv.current().file.lists)
interface PriceItem {
  name: string;
  price: string;
}
let expenses: PriceItem[] = [];
let expenseAlts: PriceItem[] = [];
let earnings: PriceItem[] = [];
const childLists = Array.from(
  dv.current().file.lists.map((t) => t.children)
).flat();
childLists.forEach((listItem) => {
  if (listItem.spent) {
    const [name, price] = listItem.spent.split('-');
    expenses.push({ name, price });
    return;
  }
  if (listItem.spentAlt) {
    const [name, price] = listItem.spentAlt.split('-');
    expenseAlts.push({ name, price });
    return;
  }
  if (listItem.earned) {
    const [name, price] = listItem.earned.split('-');
    earnings.push({ name, price });
  }
});
const totalExpenses = expenses.reduce(
  (ac, cv) => ac + textToPrice(cv.price, dv.current().koreanWonRate),
  0
);
const totalAltExpenses = expenseAlts.reduce(
  (ac, cv) => ac + textToPrice(cv.price, dv.current().koreanWonRate),
  0
);
const totalEarnings = earnings.reduce(
  (ac, cv) => ac + textToPrice(cv.price, dv.current().koreanWonRate),
  0
);
const pExp = dv.paragraph(`total expenses: ${delimit(totalExpenses)}`);
if (totalAltExpenses > 0)
  dv.paragraph(`total alternative expenses: ${delimit(totalAltExpenses)}`);
if (totalEarnings > 0) {
  const pEarn = dv.paragraph(`total earnings: ${delimit(totalEarnings)}`);
}
const total = totalEarnings - totalExpenses;
const pSum = dv.paragraph(`💰Today's Total: ${delimit(total)} KRW`);
pSum.style.color = total > 0 ? 'green' : 'red';
