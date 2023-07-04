// https://gist.github.com/nicolevanderhoeven/eccc6f910cdc48a5b7934b53a5a0f244

/**
 * 1. dataview and templater are needed
 * 2. must setup templater script folder from plugin options first
 * @example
 * <% tp.user.repeatedTasks(tp, {
 *   filePath: 'repeated-tasks',
 * }) %>
 */
function repeatedTasks(tp, opt = {}) {
  const filePath = opt?.filePath ?? "repeated-tasks";
  // although it does not appear on console, it works exactly same as dv
  const _dv = app.plugins.plugins.dataview.api;

  const today = _dv.luxon.DateTime.now();
  //   .plus({days: 2})

  const tasks = _dv.page(filePath).file.tasks.where((t) => {
    if (t.completed) return false;
    if (t.subtasks[0]?.repeat) {
      const rawRepeat = t.subtasks[0]?.repeat ?? "";
      const repeatData = rawRepeat.split(",");
      const repeatType = repeatData[0];
      // every mon, tue, wed... of x weeks
      if (repeatType === "weeks") {
        const weekRepeat = Number(repeatData[1]);
        const weekday = repeatData[2];
        if (today.weekNumber % weekRepeat !== 0) return false;
        if (today.weekdayShort.toLowerCase() === weekday) return true;
        return false;
      }
      // every x days
      if (repeatType === "days") {
        const startDate =
          t.subtasks[1]?.startDate ?? _dv.luxon.DateTime.fromMillis(0);
        const dur = today.diff(startDate, ["days"]);
        const days = Math.floor(dur.toObject().days);
        return days % Number(repeatData[1]) === 0;
      }
      if (repeatType === "every weekdays") {
        return (
          today.weekdayShort.toLowerCase() !== "sun" &&
          today.weekdayShort.toLowerCase() !== "sat"
        );
      }
      // every mon, tue, wed... of week
      if (repeatType === "every week") {
        const weekday = repeatData[1];
        return today.weekdayShort.toLowerCase() === weekday;
      }
      // every n th day of month
      if (repeatType === "every month") {
        const monthDay = Number(repeatData[1]);
        return today.day === monthDay;
      }
    }
    // without any repeat options, it's daily.
    return true;
  });
  const texts = tasks.map(
    (t) => `- [ ] ${t.text}[start::${today.toISODate()}]`
  );
  return texts.join("\n");
}

module.exports = repeatedTasks;
