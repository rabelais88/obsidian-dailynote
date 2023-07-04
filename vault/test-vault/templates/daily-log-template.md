# <% tp.date.now("YYYY-MM-DD", 0) %> {{date:ddd}}

# tasks

```dataviewjs
dv.view('daily-tasks')
```

## Due Soon(Heads up!)
```dataview
TASK WHERE !startswith(file.path, "templates/")
  AND !contains(text, "[[status-wip]]")
  AND start
  AND date(start) - date(this.file.day) >= dur(1 days)
  AND date(start) - date(this.file.day) < dur(7 days)
  AND !completed
SORT start ASC, priority DESC, days ASC, file.ctime DESC
GROUP BY dateformat(date(start), "MM.dd.EEE")
```


## morning routines
- [ ] morning walk
- [ ] drink water
## routines
<% tp.user.repeatedTasks(tp, {}) %>

# timeline

```dataviewjs
dv.view("daily-timeline")
```
```dataviewjs
dv.view("daily-summary")
```

# logs

- 08:00 [[wake up]]
