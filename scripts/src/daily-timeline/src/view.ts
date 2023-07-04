/**
 * @example
 * // in dataview.js
 * dv.view("daily-timeline")
 */
import { max, min } from 'd3-array';
import { axisLeft } from 'd3-axis';
import { scaleTime, scaleOrdinal } from 'd3-scale';
import { select } from 'd3-selection';
import { timeHour } from 'd3-time';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { forceSimulation, forceCollide, forceX, forceY } from 'd3-force';
import _cloneDeep from 'lodash/cloneDeep';

// const lists = dv.current().file.lists.where((t) => !t.parent);
const divCon = dv.container.createEl('div');
const day = dv.current().file.day;
const nextDay = day.plus({ days: 1 }).set({ hour: 0, minute: 0 });

interface ScheduleItem {
  time: Moment;
  content: string;
  diff: number;
  timeText: string;
  nextTime: Moment;
}
interface PlanItem {
  time: Moment;
  text: string;
  index: number;
  timeText: string;
}
const chartSize = {
  width: 350,
  height: 600,
  leftLabel: 20,
  rightLabel: 80,
  rightLabelText: 60,
};
const innerWidth =
  chartSize.width - (chartSize.leftLabel + chartSize.rightLabel);

const drawChart = ({
  schedules,
  plans,
  nextNoon,
  midnight,
  lastTime,
}: {
  schedules: ScheduleItem[];
  plans: PlanItem[];
  nextNoon: Moment;
  midnight: Moment;
  lastTime: Moment;
}) => {
  const scaleY = scaleTime()
    .domain([
      day.set({ hour: 0, minute: 0 }).toJSDate(),
      Math.max(
        // Date에 대한 Math.max도 작동하는 것이 정상
        // @ts-ignore
        nextDay.toJSDate(),
        max(schedules, (d) => d.nextTime.toDate())
      ),
    ])
    .range([0, chartSize.height]);
  const svg = select(divCon).append('svg');
  svg
    .attr('width', chartSize.width)
    .attr('height', chartSize.height)
    .attr('class', 'timeline');
  const g = svg.append('g').attr('class', 'chart-main');
  g.attr('transform', `translate(${chartSize.leftLabel},0)`);

  const timeNow = moment().set('second', 0);
  const data = schedules.map((s, i, a) => ({
    ...s,
    text: s.content
      .replace('[[meal]]', '🍽 meal')
      .replace('[[travel]]', '🚶')
      .replace('[[prep for outing]]', '💆 prep')
      .replace('[[study]]', '🖋 study')
      .replace('[[workout]]', '💪 workout')
      .replace('[[wake up]]', '🌅 wake up')
      .replace('[[work]]', '🪓 work')
      .replace('[[chore]]', '🛒🧹 chore')
      .replace('[[at-home]]', 'at 🏠')
      .replace(/(\[\[|\]\])/gi, ''),
    y: scaleY(s.time.toDate()),
    h: scaleY(s.nextTime?.toDate()) - scaleY(s.time.toDate()),
    _diff: moment.duration(s.diff),
    isNow:
      timeNow.diff(s.time, 'days') < 2 &&
      timeNow > s.time &&
      timeNow < s.nextTime,
  }));
  const scaleColor = scaleOrdinal<string, string>()
    .domain(data.map((d) => d.text))
    .range(schemeCategory10);
  const dataWithColor = data.map((d) => ({
    ...d,
    color: scaleColor(d.text),
    x: 0,
    diffText: [
      d._diff.hours() > 0
        ? `${d._diff.hours().toString().padStart(2, '0')}H `
        : '',
      d._diff.minutes() > 0
        ? `${d._diff.minutes().toString().padStart(2, '0')}M`
        : '',
    ].join(''),
  }));
  g.append('rect')
    .attr('class', 'bg')
    .attr('width', innerWidth)
    .attr('height', chartSize.height);
  const timelines = g
    .selectAll('.time-item')
    .data(dataWithColor)
    .join((g) =>
      g
        .append('g')
        .attr('class', 'time-item')
        .attr('data-time', (d) => d.time.format('YYYY-MM-DD HH:mm'))
        .attr('data-now', (d) => d.isNow)
        .attr('transform', (d) => `translate(0,${d.y})`)
        .call((g) =>
          g
            .append('rect')
            .attr('height', (d) => d.h)
            .attr('width', innerWidth)
            .attr('fill', (d) => d.color)
        )
        .call((g) =>
          g
            .append('text')
            .text((d) => [d.timeText, d.text].join('-'))
            .attr('dominant-baseline', 'hanging')
            .attr('class', 'task-name')
            .attr('data-index', (d, i) => i)
        )
        .call((g) =>
          g
            .append('line')
            .attr('x2', chartSize.rightLabel - chartSize.rightLabelText)
            .attr('transform', (d) => `translate(${innerWidth}, ${d.h / 2})`)
        )
        .call((g) =>
          g
            .append('text')
            .attr(
              'transform',
              (d) =>
                `translate(${
                  innerWidth + (chartSize.rightLabel - chartSize.rightLabelText)
                },${d.h / 2})`
            )
            .attr('dominant-baseline', 'middle')
            .attr('class', 'time-label')
            .text((d) => d.diffText)
        )
    );
  const tickValues = timeHour.range(scaleY.domain()[0], scaleY.domain()[1]);
  const gAxis = svg
    .append('g')
    .attr('class', 'axis')
    .attr(
      'transform',
      `translate(${chartSize.width - chartSize.rightLabel},0)`
    );
  const axisY = axisLeft(scaleY.nice())
    .tickValues(tickValues)
    .tickFormat((d) => `${moment(d as Date).format('HH')}h`)
    .tickSize(innerWidth);
  gAxis.call(axisY);
  gAxis.selectAll('.axis .tick text').attr('dominant-baseline', 'hanging');

  // 현재 시각 표기
  if (lastTime > timeNow) {
    const clockHand = svg
      .append('g')
      .attr('class', 'clock-hand')
      .attr(
        'transform',
        `translate(${chartSize.leftLabel},${scaleY(timeNow.toDate())})`
      );
    clockHand.append('line').attr('x2', innerWidth);
    clockHand
      .append('text')
      .text(`👉${timeNow.format('HH:mm')}`)
      .attr('dominant-baseline', 'middle')
      .attr('text-align', 'right')
      .attr('transform', `translate(${innerWidth},0)`);
    const timer = setInterval(() => {
      try {
        const tn = moment();
        clockHand.attr(
          'transform',
          `translate(${chartSize.leftLabel},${scaleY(tn.toDate())})`
        );
        clockHand.select('text').text(`👉${tn.format('HH:mm')}`);
      } catch (err) {
        clearInterval(timer);
        return;
      }
      // tick for each 5 minute
    }, 1000 * 60 * 5);
  }

  const labelData = _cloneDeep(dataWithColor).map((d) => ({ ...d, dy: d.y }));
  // 자료가 force에 의해 mutate 되므로 그대로 사용하지 않고 복제한다.
  const forceSim = forceSimulation()
    .nodes(labelData)
    .alphaTarget(0)
    .alphaDecay(0.05)
    .velocityDecay(0.2)
    .force('posX', forceX(0).strength(1))
    .force(
      'posY',
      forceY<(typeof labelData)[0]>((d, i) => dataWithColor[i].y ?? 0).strength(
        0.3
      )
    )
    .force('collision', forceCollide().radius(10).strength(0.05).iterations(3));
  const labels = g.selectAll('.task-name').data(labelData);
  forceSim.on('tick', () => {
    labelData.forEach((d) => {
      // @ts-ignore
      const index = d.index;
      select(`.task-name[data-index="${index}"]`)
        .attr('transform', `translate(${d.x}, ${d.y - dataWithColor[index].y})`)
        .raise();
    });
  });

  const planLabels = g
    .selectAll('.plan')
    .data(plans)
    .join((g) =>
      g
        .append('g')
        .attr('class', 'plan')
        .attr('transform', (d) => `translate(0,${scaleY(d.time.toDate())})`)
        .call((_g) => _g.append('line').attr('x2', innerWidth))
        .call((_g) =>
          _g
            .append('text')
            .text((d) => [d.timeText, d.text].join('-'))
            .attr('text-anchor', 'end')
            .attr('transform', `translate(${innerWidth},0)`)
            .attr('dominant-baseline', 'hanging')
        )
    );
};

const reTime = /^(\d{1,2}:\d{1,2}) (.+)/;
const _schedules = dv.current().file.lists.where((listItem) => {
  if (listItem.parent) return false;
  if (!reTime.test(listItem?.text?.toString())) return false;
  return true;
});

if (_schedules.length > 0) {
  const midnight = moment(day.toJSDate()).set({
    hour: 23,
    minute: 59,
    second: 0,
  });
  let lastTime: Moment = moment(midnight);
  const nextNoon = moment(day.toJSDate())
    .add({ days: 1 })
    .set({ hour: 12, minute: 0, second: 0 });
  const schedules = _schedules
    .map((itm, i, a) => {
      // make time readable
      if (!itm.text) return { time: midnight, content: '', timeText: '' };
      const matches = reTime.exec(itm.text.toString());
      if (!matches?.length)
        return { time: midnight, content: '', timeText: '' };
      // const time = moment(matches[1] || '', 'HH:mm')
      const time = moment(matches[1] || '', 'HH:mm').set({
        year: day.year,
        month: day.month - 1,
        date: day.day,
      });
      return { timeText: matches[1], content: matches[2], time };
    })
    .map(({ time, content, timeText }, i, list) => {
      // parse item with time
      // last schedule will have end time of 23:59 if it does not exist
      const nextItm = list[i + 1] || {};
      if (nextItm?.time > midnight || nextItm?.time < time) {
        nextItm.time = nextItm.time.add(1, 'days');
      }

      if (!nextItm?.time) {
        nextItm.time = time > midnight ? nextNoon : midnight;
        lastTime = nextItm.time;
      }
      const diff = nextItm.time.diff(time);
      return { time, content, diff, timeText, nextTime: nextItm.time };
    });
  const plans = dv
    .current()
    .file.lists.where((listItem) => reTime.test(listItem?.plan?.toString()))
    .map((p, index) => {
      const _matches = reTime.exec(p.plan.toString());
      const matches = _matches as NonNullable<typeof _matches>;
      console.log({ p, matches });
      const time = moment(matches[1] || '', 'HH:mm').set({
        year: day.year,
        month: day.month - 1,
        date: day.day,
      });
      const text = matches[2];
      const timeText = matches[1];

      return { text, time, index, timeText };
    });
  drawChart({ schedules, plans, nextNoon, midnight, lastTime: lastTime });

  divCon.className = 'table-schedule-container';
  divCon.style.position = 'relative';
}
