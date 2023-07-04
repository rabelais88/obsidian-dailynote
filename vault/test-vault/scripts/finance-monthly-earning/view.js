const delimit = (num) => Math.round(num).toLocaleString();

const month = dv.current().file.frontmatter.month;
let earnings = [];
const pages = dv
  .pages('"daily-logs"')
  .filter((page) => page.file.day.month === month);
let sum = 0;
let renderRows = [];
const values = pages.where(p => !!p.earned).values;

values.forEach((v) => {
  const earned =
    typeof v.earned === "string" ? [v.earned] : Array.from(v.earned);
  let sumDaily = 0;
  earned.forEach((e) => {
    const mangled = e.split("-");
    const [desc, priceText] = [mangled[0], mangled[1]];
    sum += Number(priceText);
    sumDaily += Number(priceText);
    earnings.push([desc, priceText]);
  });
  const day = `${v.file.day.day}`.padStart(2, "0");
  const link = v.file.link;
  renderRows.push([day, link, delimit(sumDaily)]);
});

renderRows = renderRows.sort((a, b) => (a[0] > b[0] ? 1 : -1));

renderRows.push(["💰Month Total", "", delimit(sum)]);
renderRows.push(["💰Daily Average", "", delimit(sum / values.length)]);

const header = ["day", "link", "KRW"];
dv.table(header, renderRows);

earnings = earnings.sort((a, b) => Number(a[1]) - Number(b[1]));
dv.table(["description", "KRW"], earnings);
