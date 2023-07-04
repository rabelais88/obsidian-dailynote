/** today as luxon Date */
const logDate = dv.current().file.day;
// dv.paragraph(`document date ${logDate.toLocaleString()}`)

const rePathIgnore = /(templates\/|logs\/trainings-|repeated-tasks).+/;
const tags = ['status-wip', 'status-block', 'status-success', 'status-fail'];
type Tags = typeof tags;
const tagsMap: Record<Tags[number], DataViewTask[]> = {};
const allowedTags: Record<Tags[number], boolean> = Object.values(tags).reduce(
  (ac, cv) => ({ ...ac, [cv]: true }),
  {}
);
// console.log(allowedTags)

const hasStatus = (t: DataViewTask, status: string) =>
  t?.outlinks.some((link) => link?.path === status);

const tasks = Array.from(
  dv
    .pages()
    .where((p) => !rePathIgnore.test(p.file.path))
    .file.tasks.where((t) => {
      if (hasStatus(t, 'status-reconsider')) return false;
      if (!t.completed) return true;
      if (t.path === dv.current().file.path) return true;
      if (t.completion === +logDate) return true;
      return (
        +t.start <= +logDate && (+t.completion === +logDate || !t.completed)
      );
    })
);
tasks.forEach((task) => {
  const tag = (task.outlinks || []).find((link) => allowedTags[link?.path]);
  if (tag) {
    tagsMap[tag.path] = [...(tagsMap[tag.path] || []), task];
    task.visual = task.text.replace(/\[\[status-\w+\]\]/, '');
    return;
  }
  if (task.start) {
    const diff = Math.round(
      logDate.diff(task.start, 'days').toObject()?.days ?? 0
    );
    let diffText = `==D${diff > 0 ? `+${Math.abs(diff)}` : diff}==`;
    if (diff === 0) diffText = '==TODAY==';
    task.visual = `${diffText} ${(task.visual
      ? task.visual
      : task.text
    ).replace(/\[start::[\d-]+\]/, '')}`;
  }
  if (
    task.path === dv.current().file.path ||
    (task.start && +task.start <= +logDate && !task.completed) ||
    +task.completion === +logDate
  ) {
    if (task.completed && !hasStatus(task, 'status-fail')) {
      tagsMap['status-success'] = [...(tagsMap['status-success'] || []), task];
      return;
    }
    if (task.completed && hasStatus(task, 'status-fail')) {
      tagsMap['status-fail'] = [...(tagsMap['status-fail'] || []), task];
      return;
    }
    if (!task.completed && task.start && +task.start > +logDate) return;
    tagsMap.noTag = [...(tagsMap.noTag || []), task];
  }
});
dv.header(2, '🈚 no tags');
if ((tagsMap.noTag?.length ?? 0) === 0) dv.paragraph('no tasks');
else dv.taskList(tagsMap['noTag'], false);
dv.el('hr', '');
const headerMap: Record<Tags[number], string> = {
  'status-wip': '👷‍♀️ wip',
  'status-block': '⛔ block',
  'status-success': '✅ success',
  'status-fail': '❌ fail',
};
tags.forEach((key) => {
  const header = dv.header(2, headerMap[key] ?? key);
  header.setAttribute('data-tag', key);
  if ((tagsMap[key]?.length ?? 0) === 0) dv.paragraph('no tasks');
  else dv.taskList(tagsMap[key], false);
  dv.el('hr', '');
});
// console.log(tagsMap)
const container = dv.container;
container.classList.add('daily-tasks');
