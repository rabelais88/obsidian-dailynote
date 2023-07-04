---
month: <% tp.date.now("MM", 0) %>
year: <% tp.date.now("YYYY", 0) %>
---
<% tp.file.move("finance/monthly/" + tp.date.now("YYYY-MM", 0)) %>
# expense of <% tp.date.now("YYYY MMM") %>

```dataviewjs
dv.view('finance-monthly-expense')
```

# earnings of <% tp.date.now("YYYY MMM") %>
```dataviewjs
dv.view('finance-monthly-earning')
```