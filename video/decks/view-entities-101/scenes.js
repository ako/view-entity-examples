// Film 3 - what a view entity is, for someone who has never written a query.
//
// Same system as films 1 and 2 (video-system/DESIGN-LANGUAGE.md): Recursive,
// seven tokens, one accent event per frame, flat plane, 30px mono floor.
// Everything on screen is captured from the app in this repo; the sources are
// named on each frame.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SCENES = factory();
}(typeof self !== 'undefined' ? self : this, function () {

return [
{
  id: "title", label: "", kind: "declarative",
  narration: "A view entity is a question you save in your app. The database answers it from scratch every time someone asks. No database experience needed.",
  steps: 1, cues: [{ step: 1, s: 2 }],
  noChrome: true,
  html: `
    <div class="tag">Mendix 10.24.24 &middot; view entities &middot; from zero</div>
    <h1>What a view entity is</h1>
    <p class="sub" style="max-width:1480px">A saved question, answered by the database &mdash; and
       <span class="accent">how to see what the database did with it</span>.</p>
    <div class="step" data-step="1" style="font-size:28px;color:var(--dim)">
      Every query, row, log line and plan on the following screens was captured
      from the app in this repository.
    </div>`
},
{
  id: "words", label: "Three words first", kind: "command",
  narration: "Three words first. A table is a grid the database keeps on disk. A row is one entry in it; a column is one field of it. Every entity you draw in Mendix is a table, and every object is a row.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 2 }],
  html: `
    <h2>Table, row, column</h2>
    <p class="sub">The whole vocabulary you need for this film</p>
    <div class="card">
<pre>trends$reading          <span class="cm">&lt;- a TABLE. it is on disk.</span>
+------------+---------------------+--------+
| id         | readat              | kwh    |
+------------+---------------------+--------+
| 1914...609 | 2023-01-01 00:00:00 |  15.00 |  <span class="step cm" data-step="1">&lt;- a ROW</span>
| 1914...610 | 2023-01-02 00:00:00 |  14.00 |
| ...                                       |  <span class="cm">-- 6568 more rows</span>
+------------+---------------------+--------+
               <span class="step cm" data-step="2">^ a COLUMN</span></pre>
    </div>
    <p class="note"><span class="accent">A persistable entity is a table. An object is a row.</span>
       Mendix writes the table for you; the words are the database's.</p>`
},
{
  id: "data", label: "The data", kind: "command",
  narration: "Meters, and readings hanging off them. Six meters, three years of daily readings: six thousand five hundred and seventy rows, and none of them is a monthly total.",
  steps: 1, cues: [{ step: 1, s: 1 }],
  html: `
    <h2>Two entities, and nothing else</h2>
    <p class="sub">Module <code>Trends</code> &middot; mdl/10-trends-domain.mdl</p>
    <div class="dm">
      <svg>
        <line x1="1014" y1="110" x2="714" y2="110" stroke="#262828" stroke-width="1"/>
      </svg>
      <div class="ent" style="left:234px;top:20px">
        <div class="hd"><span>Meter</span><span class="k">persistable</span></div>
        <div class="at"><span>MeterCode</span><span class="t">String(20)</span></div>
        <div class="at"><span>Region</span><span class="t">String(40)</span></div>
      </div>
      <div class="ent" style="left:1014px;top:20px">
        <div class="hd"><span>Reading</span><span class="k">persistable</span></div>
        <div class="at"><span>ReadAt</span><span class="t">DateTime</span></div>
        <div class="at"><span>Kwh</span><span class="t">Decimal</span></div>
      </div>
      <div class="lbl" style="left:654px;top:250px;width:420px;text-align:center">Reading_Meter</div>
      <div class="callout step" data-step="1" style="left:234px;top:330px;max-width:1260px">
        <span class="accent">6 meters &middot; 1095 daily readings each &middot; 6570 rows on disk.</span><br>
        Two columns you can read straight off a reading: when, and how much.
      </div>
    </div>`
},
{
  id: "question", label: "The question", kind: "result",
  narration: "Now the question. How much energy did each meter use, per month? Nobody stored that, so it has to be worked out. The only choice is where.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 3 }],
  html: `
    <h2>&ldquo;How much energy did each meter use, per month?&rdquo;</h2>
    <p class="sub">An answer nobody wrote down</p>
    <div class="cols">
      <div class="col card step" data-step="1">
        <h3>In the app</h3>
        <p class="note" style="margin-top:0">Retrieve 6570 readings into memory.
           Loop over them. Add them up. Every reading crosses the wire to be added
           to something and then thrown away.</p>
      </div>
      <div class="col card step" data-step="2">
        <h3>In the database</h3>
        <p class="note" style="margin-top:0">Ask for the totals. Get back
           <span class="accent">216 rows</span> and nothing else. The readings never
           leave the disk they are already on.</p>
      </div>
    </div>
    <p class="note">A view entity is the second one, written down and given a name.</p>`
},
{
  id: "what", label: "The idea", kind: "command",
  narration: "So that is what a view entity is. A saved question, not a table. Nothing is stored and nothing is kept in sync, so there is no copy that can go stale.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 3 }],
  html: `
    <h2>A saved question, not a table</h2>
    <p class="sub">What is and is not on disk</p>
    <div class="cols">
      <div class="col card">
        <h3>Persistable entity</h3>
        <p class="note" style="margin-top:0">A table. Rows are written, updated and
           deleted. It takes space. You can put a database index on it.</p>
      </div>
      <div class="col card step" data-step="1">
        <h3>View entity</h3>
        <p class="note" style="margin-top:0">A query with a name. No rows, no space,
           <span class="accent">nothing to keep in sync</span>. Answered from the
           tables as they are at that moment.</p>
      </div>
    </div>
    <p class="note step" data-step="2">Read one ten times and the database answers it
       ten times &mdash; always from today's rows, never from a copy taken last night.</p>`
},
{
  id: "oql", label: "OQL", kind: "command",
  narration: "The question is written in OQL, Mendix's query language. Three clauses do nearly all the work: which columns you want, where to get them, and what to group rows on.",
  steps: 3, cues: [{ step: 1, s: 1 }, { step: 2, s: 1 }, { step: 3, s: 1 }],
  html: `
    <h2>Three clauses</h2>
    <p class="sub">OQL &mdash; the language a view entity is written in</p>
    <div class="card">
<pre><span class="kw">select</span>   <span class="cm">-- which columns you want back</span>
<span class="kw">from</span>     <span class="cm">-- where to get them</span>
<span class="kw">group by</span> <span class="cm">-- what to collapse rows together on</span></pre>
    </div>
    <div class="cols" style="margin-top:26px">
      <div class="col card step" data-step="1">
        <h3>select</h3>
        <p class="note" style="margin-top:0">One entry per column of the answer,
           each with a name: <code>as TotalKwh</code>.</p>
      </div>
      <div class="col card step" data-step="2">
        <h3>from</h3>
        <p class="note" style="margin-top:0">The entity to read, plus any entity you
           reach through an association.</p>
      </div>
      <div class="col card step" data-step="3">
        <h3>group by</h3>
        <p class="note" style="margin-top:0"><span class="accent">One row out per
           distinct combination</span> of the terms you name here.</p>
      </div>
    </div>`
},
{
  id: "view", label: "The view entity", kind: "command",
  narration: "Here is the real one, whole. Six columns out, readings joined to their meter, grouped by meter, year and month. That is what makes one row per meter per month.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>The whole view entity</h2>
    <p class="sub">mdl/20-basics-view.mdl</p>
    <div class="card">
<pre><span class="kw">create view entity</span> Trends.MeterMonthVE (
  MeterCode: <span class="kw">String</span>(20), Region: <span class="kw">String</span>(40), PeriodYear: <span class="kw">Integer</span>,
  MonthNo: <span class="kw">Integer</span>, TotalKwh: <span class="kw">Decimal</span>, ReadingCount: <span class="kw">Integer</span>
) <span class="kw">as</span> (
  <span class="kw">select</span> m.MeterCode <span class="kw">as</span> MeterCode, m.Region <span class="kw">as</span> Region
  ,      <span class="kw">datepart</span>(YEAR, r.ReadAt) <span class="kw">as</span> PeriodYear, <span class="kw">datepart</span>(MONTH, r.ReadAt) <span class="kw">as</span> MonthNo
  ,      <span class="step" data-step="1"><span class="kw">sum</span>(r.Kwh) <span class="kw">as</span> TotalKwh, <span class="kw">count</span>(r.ID) <span class="kw">as</span> ReadingCount</span>
  <span class="kw">from</span> Trends.Reading <span class="kw">as</span> r
    <span class="kw">inner join</span> r/Trends.Reading_Meter/Trends.Meter <span class="kw">as</span> m
  <span class="mark" data-step="2"><span class="kw">group by</span> m.MeterCode, m.Region, <span class="kw">datepart</span>(YEAR, r.ReadAt), <span class="kw">datepart</span>(MONTH, r.ReadAt)</span>
);</pre>
    </div>`
},
{
  id: "rule", label: "The one rule", kind: "result",
  narration: "Group by has one rule. Every column you select is either something you grouped on, or something you aggregated. Break it and the view will not build.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>Every column is a key or an aggregate</h2>
    <p class="sub">The one rule <code>group by</code> enforces</p>
    <div class="cols">
      <div class="col card">
        <h3>Grouped on &mdash; a key</h3>
        <table>
          <tr><td>MeterCode</td></tr>
          <tr><td>Region</td></tr>
          <tr><td>datepart(YEAR, ReadAt)</td></tr>
          <tr><td>datepart(MONTH, ReadAt)</td></tr>
        </table>
      </div>
      <div class="col card step" data-step="1">
        <h3>Aggregated &mdash; one value per group</h3>
        <table>
          <tr><td>sum(Kwh)</td></tr>
          <tr><td>count(ID)</td></tr>
          <tr><td class="dim">avg, min, max</td></tr>
        </table>
      </div>
    </div>
    <p class="note step" data-step="2">Ask for <code>r.Kwh</code> on its own and there is no
       answer to give: <span class="accent">a group holds thirty of them</span>. That is
       the whole rule.</p>`
},
{
  id: "rows", label: "The answer", kind: "result",
  narration: "And these are the rows. Two hundred and sixteen of them: six meters, thirty-six months each. All computed, none of it stored.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>216 rows, computed on the spot</h2>
    <p class="sub">mxcli oql &middot; Trends.MeterMonthVE, first rows</p>
    <div class="cols">
      <div class="col card" style="flex:1.6">
        <table>
          <tr><th>MeterCode</th><th>Region</th><th class="n">PeriodYear</th><th class="n">MonthNo</th><th class="n">TotalKwh</th><th class="n">ReadingCount</th></tr>
          <tr><td>M-001</td><td>Region 1</td><td class="n">2023</td><td class="n">1</td><td class="n">456</td><td class="n">31</td></tr>
          <tr><td>M-001</td><td>Region 1</td><td class="n">2023</td><td class="n">2</td><td class="n">415</td><td class="n">28</td></tr>
          <tr><td>M-001</td><td>Region 1</td><td class="n">2023</td><td class="n">3</td><td class="n">470</td><td class="n">31</td></tr>
          <tr><td colspan="6" class="dim">... 213 more</td></tr>
        </table>
      </div>
      <div class="col">
        <div class="card step" data-step="1">
          <h3>Where 216 comes from</h3>
          <table>
            <tr><td>meters</td><td class="n">6</td></tr>
            <tr><td>months of data</td><td class="n">36</td></tr>
            <tr><td><b>rows</b></td><td class="n"><b>216</b></td></tr>
          </table>
        </div>
        <p class="note step" data-step="2">February has 28 readings and January 31,
          so <span class="accent">the count column is doing real work</span>.</p>
      </div>
    </div>`
},
{
  id: "page", label: "On a page", kind: "command",
  narration: "Now put it to work. A data grid on a page, and its datasource is the view entity itself. No microflow, no list variable, nothing in between.",
  steps: 1, cues: [{ step: 1, s: 2 }],
  html: `
    <h2>The grid's datasource is the view entity</h2>
    <p class="sub">mdl/21-basics-page.mdl</p>
    <div class="card">
<pre><span class="kw">create page</span> Trends.MeterMonths (
  Title: 'Energy per meter per month', Url: 'meter-months'
) {
  <span class="kw">DATAGRID</span> gridMeterMonth (
    DataSource: <span class="mark" data-step="1"><span class="kw">DATABASE</span> Trends.MeterMonthVE</span>, PageSize: 15
  ) {
    <span class="kw">COLUMN</span> colMeter (Attribute: MeterCode, Caption: 'Meter')
    ...  <span class="cm">-- 5 more columns</span>
  }
}</pre>
    </div>
    <p class="note">A view entity is used exactly like any other entity. That is the point
       of it having a name.</p>`
},
{
  id: "running", label: "The page", kind: "result",
  narration: "Fifteen rows on screen, out of two hundred and sixteen. The other two hundred and one were never sent.",
  steps: 2, cues: [{ step: 1, s: 0 }, { step: 2, s: 1 }],
  html: `
    <h2>Fifteen rows on screen</h2>
    <p class="sub">Trends.MeterMonths, first page &mdash; values read off the running app</p>
    <div class="card">
      <table>
        <tr><th>Meter</th><th>Region</th><th class="n">Year</th><th class="n">Month</th><th class="n">Total kWh</th><th class="n">Readings</th></tr>
        <tr><td>M-001</td><td>Region 1</td><td class="n">2023</td><td class="n">1</td><td class="n">456</td><td class="n">31</td></tr>
        <tr><td>M-001</td><td>Region 1</td><td class="n">2023</td><td class="n">2</td><td class="n">415</td><td class="n">28</td></tr>
        <tr><td>M-001</td><td>Region 1</td><td class="n">2023</td><td class="n">3</td><td class="n">470</td><td class="n">31</td></tr>
        <tr><td colspan="6" class="dim">... 12 more on this page</td></tr>
      </table>
    </div>
    <div class="cols" style="margin-top:26px">
      <div class="col card step" data-step="1">
        <h3>In the browser</h3>
        <p class="note" style="margin-top:0">15 rows</p>
      </div>
      <div class="col card step" data-step="2">
        <h3>Left in the database</h3>
        <p class="note" style="margin-top:0"><span class="accent">201 rows, and the 6570
           readings behind them</span></p>
      </div>
    </div>`
},
{
  id: "sort", label: "Sorting", kind: "command",
  narration: "Click a column header to sort. A grid holding all its rows would sort them in the browser. This one is not holding them, so it asks again.",
  steps: 1, cues: [{ step: 1, s: 2 }],
  html: `
    <h2>Click <code>Total kWh</code></h2>
    <p class="sub">The grid has 15 of 216 rows &mdash; it cannot sort what it does not have</p>
    <div class="card">
<pre>Meter    Region     Year  Month   Total kWh   Readings
<span class="step" data-step="1">M-006    Region 6   2024      5         784         31
M-006    Region 6   2024      1         784         31
M-006    Region 6   2025     10         782         31
M-006    Region 6   2023      8         782         31
...                                                    <span class="cm">-- 11 more</span></span></pre>
    </div>
    <p class="note">Descending. Every one of the top rows belongs to
       <span class="accent">M-006</span> &mdash; which you could not know from the first page.</p>`
},
{
  id: "sql", label: "What it asked", kind: "result",
  narration: "This is what it asked for. Your view entity's query, wrapped in a second one. Order by total kilowatt hours, limit fifteen. The sorting happened in the database.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>One click, one statement</h2>
    <p class="sub">ConnectionBus_Retrieve at TRACE &middot; docs/sql/08-grid-retrieve.sql &middot; abridged</p>
    <div class="card">
<pre><span class="kw">SELECT</span> "MeterCode", "Region", ...          <span class="cm">-- 4 more columns</span>
<span class="kw">FROM</span> ( <span class="step cm" data-step="1">-- your view entity, pasted in as a subquery</span>
       <span class="kw">SELECT</span> "m"."metercode", SUM("r"."kwh"), ...
       <span class="kw">FROM</span> "trends$reading" "r"
       <span class="kw">INNER JOIN</span> "trends$meter" "m" <span class="kw">ON</span> "m"."id" = "r"."trends$reading_meter"
       <span class="kw">GROUP BY</span> "m"."metercode", ... ) "Trends.MeterMonthVE"
<span class="kw">WHERE</span> ? != ? <span class="kw">AND</span> ? != ?
<span class="mark" data-step="2"><span class="kw">ORDER BY</span> "Trends.MeterMonthVE"."TotalKwh" <span class="kw">DESC</span> <span class="kw">LIMIT</span> ?</span></pre>
    </div>
    <p class="note step" data-step="2">The last line is the click. Everything above it is the
       view entity you wrote.</p>`
},
{
  id: "paging", label: "Paging", kind: "result",
  narration: "Next page adds one word. Offset: fifteen rows, skipping the first fifteen. The runtime says so in its own log.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>Next page adds one word</h2>
    <p class="sub">docs/sql/08-grid-retrieve.sql &middot; same statement, one clause longer</p>
    <div class="card">
<pre><span class="kw">ORDER BY</span> "Trends.MeterMonthVE"."TotalKwh" <span class="kw">DESC</span> <span class="kw">LIMIT</span> ? <span class="step" data-step="1"><span class="kw">OFFSET</span> ?</span></pre>
    </div>
    <div class="card step" data-step="2" style="margin-top:26px">
<pre><span class="cm">-- the runtime's own log line, both times</span>
ConnectionBus_Retrieve: Data table Trends.MeterMonthVE <span class="accent">(15 from 216 row(s))</span></pre>
    </div>
    <p class="note step" data-step="2">Fifteen rows is what the grid receives. 216 is what the
       question was worth. The difference stayed where it was.</p>`
},
{
  id: "filter", label: "Filtering", kind: "result",
  narration: "Filtering works the same way. Ask for one meter in one year, and the condition lands in the where clause as a parameter. Twelve rows come back. The condition travelled to the data, not the data to the condition.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 3 }],
  html: `
    <h2>The condition goes into the query</h2>
    <p class="sub">docs/sql/09-filter-pushdown-101.sql &middot; the same view entity, asked for a slice</p>
    <div class="card">
<pre><span class="cm">-- what was asked for</span>
GET .../MeterMonth?$filter=meterCode eq 'M-004' <span class="kw">and</span> periodYear eq 2025
200  12 rows</pre>
    </div>
    <div class="card step" data-step="1" style="margin-top:26px">
<pre><span class="cm">-- what the database was asked</span>
<span class="kw">WHERE</span> ...  <span class="cm">-- 3 not-null guards</span>
  <span class="kw">AND</span> "Trends.MeterMonthVE"."MeterCode" = ?
  <span class="kw">AND</span> "Trends.MeterMonthVE"."PeriodYear" = ?
<span class="kw">ORDER BY</span> "Trends.MeterMonthVE"."MonthNo" <span class="kw">ASC</span> <span class="kw">LIMIT</span> ?
<span class="mark" data-step="2">-- params 1-3: M-004, 2025, 3000</span></pre>
    </div>`
},
{
  id: "plan-what", label: "Query plans", kind: "command",
  narration: "So the database is doing the work. What is it actually doing? Before running a query it writes a plan: the steps it will take. You can ask to see it.",
  steps: 2, cues: [{ step: 1, s: 3 }, { step: 2, s: 4 }],
  html: `
    <h2>A plan is the recipe, written down</h2>
    <p class="sub">How to read one, in three lines</p>
    <div class="card">
<pre><span class="kw">Limit</span> (actual rows=216)                  <span class="step cm" data-step="1">&lt;- 3rd: what comes out</span>
  -&gt; <span class="kw">HashAggregate</span> (actual rows=216)      <span class="step cm" data-step="1">&lt;- 2nd: the group by</span>
       -&gt; <span class="kw">Seq Scan</span> (actual rows=6570)     <span class="step cm" data-step="1">&lt;- 1st: read the table</span></pre>
    </div>
    <div class="cols" style="margin-top:26px">
      <div class="col card step" data-step="2">
        <h3>Read it inside out</h3>
        <p class="note" style="margin-top:0">The most indented line runs first. Each step
           feeds the one above it.</p>
      </div>
      <div class="col card step" data-step="2">
        <h3>Read the row counts</h3>
        <p class="note" style="margin-top:0"><span class="accent">actual rows</span> is how
           many rows that step really handled. It is the number that matters.</p>
      </div>
    </div>`
},
{
  id: "plan-all", label: "The whole view", kind: "result",
  narration: "Here is the plan for the whole view, unfiltered. Bottom line first: read six thousand five hundred and seventy readings, join them to six meters, collapse them to two hundred and sixteen rows. Six milliseconds.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>Nothing filtered: every reading is touched</h2>
    <p class="sub">EXPLAIN ANALYZE &middot; docs/sql/10-plan-101.txt &middot; 8 of 12 plan lines</p>
    <div class="card">
<pre><span class="kw">Limit</span> (actual rows=216)
  -&gt; <span class="kw">HashAggregate</span> (actual rows=216)
       Group Key: m.metercode, m.region, EXTRACT(year ...), EXTRACT(month ...)
       -&gt; <span class="kw">Hash Join</span> (actual rows=6570)
            Hash Cond: (r."trends$reading_meter" = m.id)
            -&gt; <span class="mark" data-step="1">Seq Scan on "trends$reading" r (actual rows=6570)</span>
            -&gt; Hash (actual rows=6)
                 -&gt; Seq Scan on "trends$meter" m (actual rows=6)
<span class="cm">Execution Time: 5.976 ms</span></pre>
    </div>
    <p class="note step" data-step="2">6570 rows in, 216 out. That is the honest cost of the
       question when you ask for all of it.</p>`
},
{
  id: "plan-filtered", label: "Filtered", kind: "result",
  narration: "Now the same view, asked for one meter in one year. The filter has moved to the bottom. The meter is found through an index, and four thousand three hundred and eighty-six readings are dropped before anything is added up.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 2 }],
  html: `
    <h2>The filter sinks to the bottom</h2>
    <p class="sub">EXPLAIN ANALYZE &middot; docs/sql/10-plan-101.txt &middot; 9 of 23 plan lines</p>
    <div class="card">
<pre><span class="kw">Limit</span> (actual rows=12)
  -&gt; Sort (actual rows=12)
       -&gt; <span class="kw">GroupAggregate</span> (actual rows=12)
            -&gt; <span class="kw">Nested Loop</span> (actual rows=364)
                 -&gt; <span class="mark" data-step="1">Bitmap Index Scan on idx_trends$meter_metercode_asc</span>
                      Index Cond: ((metercode)::text = 'M-004')
                 -&gt; <span class="kw">Seq Scan</span> on "trends$reading" r (actual rows=2184)
                      Filter: (EXTRACT(year FROM readat) = 2025)
                      <span class="step" data-step="2">Rows Removed by Filter: 4386</span>
<span class="cm">Execution Time: 2.933 ms</span></pre>
    </div>`
},
{
  id: "numbers", label: "What to read", kind: "result",
  narration: "If you read one thing in a plan, read the row counts at the bottom. Milliseconds move with the machine; rows touched is the honest number. Notice what the index did and did not do.",
  steps: 3, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }, { step: 3, s: 2 }],
  html: `
    <h2>Rows touched, not milliseconds</h2>
    <div class="card">
      <table>
        <tr><th></th><th class="n">readings touched</th><th class="n">rows returned</th><th class="n">execution</th></tr>
        <tr><td>the whole view</td><td class="n">6570</td><td class="n">216</td><td class="n">5.976 ms</td></tr>
        <tr class="hl"><td>one meter, one year</td><td class="n accent">2184</td><td class="n">12</td><td class="n">2.933 ms</td></tr>
      </table>
    </div>
    <div class="cols" style="margin-top:28px">
      <div class="col card step" data-step="2">
        <h3>The index earned its keep</h3>
        <p class="note" style="margin-top:0">MeterCode has one, so finding M-004 read a
           single row instead of scanning the meter table.</p>
      </div>
      <div class="col card step" data-step="3">
        <h3>And the year did not</h3>
        <p class="note" style="margin-top:0">The year is computed from ReadAt, and no index
           covers a computed value, so that filter still reads the table.</p>
      </div>
    </div>
    <p class="note step" data-step="3">6570 rows is a small table. What grows is the
       difference between these two lines.</p>`
},
{
  id: "errors", label: "What goes wrong", kind: "result",
  narration: "Three errors you will meet writing your first one, with their real text. All three are caught before the app builds, which is the good news.",
  steps: 3, cues: [{ step: 1, s: 1 }, { step: 2, s: 1 }, { step: 3, s: 2 }],
  html: `
    <h2>The three you will actually hit</h2>
    <p class="sub">docs/errors-101.txt &middot; captured with mxcli check</p>
    <div class="card step" data-step="1">
<pre><span class="cm">-- select datepart(YEAR, r.ReadAt) as Year</span>
OQL reserved word "Year" used unquoted - MxBuild rejects the view
with CE0174; quote it as "Year"                          [MDL032]</pre>
    </div>
    <div class="card step" data-step="2" style="margin-top:22px">
<pre><span class="cm">-- order by sum(r.Kwh) desc</span>
ORDER by without limit: view entity OQL queries that use ORDER by
must also specify a limit clause                         [MDL030]</pre>
    </div>
    <div class="card step" data-step="3" style="margin-top:22px">
<pre><span class="cm">-- 3 columns selected, 2 attributes declared</span>
<span class="accent">OQL select has 3 columns but 2 attributes declared</span></pre>
    </div>`
},
{
  id: "recap", label: "All of it", kind: "result",
  narration: "That is the whole film on one screen. A view entity is a saved question, asked in three clauses, where every selected column is a key or an aggregate. Sorting, paging and filtering become order by, limit and where. The plan tells you what really happened.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>All of it, on one screen</h2>
    <div class="cols">
      <div class="col card">
        <h3>The view entity</h3>
<pre style="font-size:26px"><span class="kw">select</span>   <span class="cm">-- columns out</span>
<span class="kw">from</span>     <span class="cm">-- entity + assoc</span>
<span class="kw">group by</span> <span class="cm">-- one row per key</span>

<span class="cm">-- every column is a
-- key or an aggregate</span></pre>
      </div>
      <div class="col card step" data-step="1">
        <h3>What the consumer does</h3>
        <table style="font-size:26px">
          <tr><td>sort a column</td><td>ORDER BY</td></tr>
          <tr><td>turn a page</td><td>LIMIT / OFFSET</td></tr>
          <tr><td>filter</td><td>WHERE col = ?</td></tr>
        </table>
      </div>
      <div class="col card step" data-step="2">
        <h3>What to check</h3>
        <table style="font-size:26px">
          <tr><td>EXPLAIN ANALYZE</td></tr>
          <tr><td class="dim">read it inside out</td></tr>
          <tr><td><span class="accent">actual rows</span></td></tr>
        </table>
      </div>
    </div>
    <p class="note">Nothing here is stored twice, and nothing here can go stale.</p>`
},
{
  id: "lockup", label: "", kind: "lockup",
  narration: "",
  steps: 0, cues: [],
  noChrome: true,
  html: `
    <div id="lockup">
      <div class="wm">mxcli</div>
      <div class="rule accent"></div>
      <div class="take">a view entity is a saved question</div>
    </div>`
},
];
}));
