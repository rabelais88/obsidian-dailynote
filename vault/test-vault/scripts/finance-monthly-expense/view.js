const delimit = (num) => Math.round(num).toLocaleString();

const month = dv.current().file.frontmatter.month;
const year = dv.current().file.frontmatter.year;
const dayStart = new Date(`${year}-${month.toString().padStart(2, '0')}-01`)
const dayStartTime = dayStart.getTime()
/** 
 * @param {string} price
 * @param {number} rate
 */
const textToPrice = (price, rate) => {
  if (price.slice(-3) === 'eur') {
    // default euro rate if no rate was given
    return Math.round(Number(price.slice(0,-3)) * (rate ?? 1438.74))
  }
  if (price.slice(-3) === 'brl') {
    // default euro rate if no rate was given
    return Math.round(Number(price.slice(0,-3)) * (rate ?? 268.53))
  }
  return Number(price)
}
let expenses = [];
let expensesAlt = [];
const pages = dv
  .pages('"daily-logs"')
  .filter((page) => page.file.day.month === month);
let sum = 0;
let sumAlt = 0;
let renderRows = [];
let renderRowsAlt = [];
const values = pages.where(p => !!p.spent || !!p.spentAlt).values;

values.forEach((v) => {
  if (!v.spent) return;
  const spent = typeof v.spent === "string" ? [v.spent] : Array.from(v.spent);
  let sumDaily = 0;
  spent.forEach((s) => {
    const mangled = s.split("-");
    const [desc, priceText] = [mangled[0], mangled[1]];
    sum += textToPrice(priceText, v.koreanWonRate);
    sumDaily += textToPrice(priceText, v.koreanWonRate);
    expenses.push([desc, textToPrice(priceText)]);
  });
  const day = `${v.file.day.day}`.padStart(2, "0");
  const link = v.file.link;
  renderRows.push([day, link, delimit(sumDaily)]);
});

values.forEach((v) => {
  if (!v.spentAlt) return;
  const spentAlt = typeof v.spentAlt === "string" ? [v.spentAlt] : Array.from(v.spentAlt);
  spentAlt.forEach((s) => {
    const mangled = s.split("-");
    const [desc, priceText] = [mangled[0], mangled[1]];
    sumAlt += textToPrice(priceText, v.koreanWonRate);
    expensesAlt.push([desc, textToPrice(priceText)]);
  });
})

renderRows = renderRows.sort((a, b) => (a[0] > b[0] ? 1 : -1));

renderRows.push(["💰Month Total", "", delimit(sum)]);
renderRows.push(["💰Daily Average", "", delimit(sum / values.length)]);
renderRows.push(['💰Month Total(특이 지출)', "", delimit(sumAlt)])

const header = ["day", "link", "KRW"];
dv.table(header, renderRows);

expenses = expenses.sort((a, b) => Number(a[1]) - Number(b[1]));
dv.table(["description", "KRW"], expenses);
expensesAlt = expensesAlt.sort((a, b) => Number(a[1] - Number(b[1])));
dv.table(['description(특이 지출)', 'KRW'], expensesAlt)

let monthlyExpenseSum = 0;
const monthlyExpenses = Array.from(
  dv
    .pages('"daily-logs"')
    .file.where((f) => {
      // 1. before target year-month
      if(+f.day <= dayStartTime) return true;
      // 2. in the same year-month
      const fDayStart = new Date(`${f.day.year}-${f.day.month.toString().padStart(2, '0')}-01`).getTime();
      return fDayStart === dayStartTime;
    })
    .lists.where((list) => {
      // 기록된 달 이전 내용은 알 수 없는 것으로 한다.
      const terminated = list?.children?.[0]?.terminated ?? 0;
      return (
        !!list.monthlyExpense && (+terminated > +dayStartTime || terminated === 0)
      );
    })
    .map((list) => {
      const e = (list?.monthlyExpense ?? "").toString().split("-");
      const desc = e[0];
      const price = e[1];
      monthlyExpenseSum += Number(price ?? 0);
      return [desc, delimit(price)];
    })
);
monthlyExpenses.push(["💳Month Total", delimit(monthlyExpenseSum)]);

const header2 = ["description", "expense(KRW)"];
dv.header(2, "monthly expense");
dv.table(["description", "KRW"], monthlyExpenses);
