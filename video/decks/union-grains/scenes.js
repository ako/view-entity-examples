// Film 2 - three groupings in one view entity, without parameters.
//
// Conformed to video-system/DESIGN-LANGUAGE.md. Narration and captured
// artefacts unchanged; presentation, accent discipline and the 30px mono floor
// are the system's.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SCENES = factory();
}(typeof self !== 'undefined' ? self : this, function () {

// GET .../UsageTrend?$filter=grain eq '<grain>' and meterCode eq 'M-001'
//                            and periodYear eq 2025
const SERIES = {"Week": [114.0, 95.0, 111.0, 105.0, 99.0, 115.0, 98.0, 103.0, 119.0, 91.0, 107.0, 112.0, 95.0, 111.0, 105.0, 99.0, 115.0, 98.0, 103.0, 119.0, 91.0, 107.0, 112.0, 95.0, 111.0, 105.0, 99.0, 115.0, 98.0, 103.0, 119.0, 91.0, 107.0, 112.0, 95.0, 111.0, 105.0, 99.0, 115.0, 98.0, 103.0, 119.0, 91.0, 107.0, 112.0, 95.0, 111.0, 105.0, 99.0, 115.0, 98.0, 103.0], "Month": [468.0, 423.0, 460.0, 450.0, 470.0, 454.0, 458.0, 462.0, 453.0, 472.0, 446.0, 444.0], "Quarter": [1351.0, 1374.0, 1373.0, 1362.0]};

// One series, so no legend - the panel title names it. The accented panel is
// the grain the chart is currently showing; the other two are --dim.
const chart = (grain, firstLabel, lastLabel, on) => {
  const v = SERIES[grain], max = Math.max(...v), peak = v.indexOf(max) + 1;
  return `<div class="chart${on ? ' accent-series' : ''}">
    <h3>${grain} &middot; ${v.length} bars</h3>
    <div class="bars">${v.map(x =>
      `<i style="height:${(x / max * 100).toFixed(1)}%"></i>`).join('')}</div>
    <div class="xa"><span>${firstLabel}</span><span>${lastLabel}</span></div>
    <div class="peak">peak ${max.toLocaleString('en-US')} kWh at ${grain.toLowerCase()} ${peak}</div>
  </div>`;
};

return [
{
  id: "title", label: "", kind: "declarative",
  narration: "A chart where the user picks week, month or quarter. Three groupings of the same readings, chosen at runtime. This is the case people most often ask for a parameterised view entity - and it is the case that does not need one.",
  steps: 2, cues: [{"step": 1, "s": 2}],
  noChrome: true,
  html: `
    <div class="tag">Mendix 10.24.24 &middot; view entities &middot; published OData</div>
    <h1>Three groupings,<br>one view entity, no parameters</h1>
    <p class="sub" style="max-width:1500px">Union the groupings, carry a column that says which one a row
       came from, and <span class="accent">let the database skip the branches nobody asked for</span>.</p>
    <div class="step" data-step="1" style="font-size:28px;color:var(--dim)">
      The bars, the SQL and the query plans on the following screens are all
      captured from the running app.
    </div>`
},
{
  id: "chart", label: "The requirement", kind: "result",
  narration: "Here is the chart in its three states. Same meter, same year, the same readings underneath: fifty-two bars, twelve, or four. The reflex is to make the grouping a parameter, so that the view returns whichever shape was asked for.",
  steps: 2, cues: [{"step": 1, "s": 1}, {"step": 2, "s": 2}],
  html: `
    <h2>One chart, three groupings</h2>
    <p class="sub">Meter M-001, kWh per period, 2025 &mdash; the published resource's own rows</p>
    <div class="seg"><span>Week</span><span class="on">Month</span><span>Quarter</span></div>
    <div class="cols">
      <div class="col card">${chart('Week', 'W1', 'W52', false)}</div>
      <div class="col card">${chart('Month', 'Jan', 'Dec', true)}</div>
      <div class="col card">${chart('Quarter', 'Q1', 'Q4', false)}</div>
    </div>
    <p class="note step" data-step="1">The obvious design: make the grouping a parameter
       and have the view entity return one of these three shapes per call.</p>
    <p class="note step" data-step="2">But nothing about the data changed &mdash;
       only how it was grouped.</p>`
},
{
  id: "model", label: "Domain model", kind: "command",
  narration: "The data underneath is plain. Meters, and readings hanging off them. Six meters, three years of daily readings: six thousand five hundred and seventy rows.",
  steps: 1, cues: [{"step": 1, "s": 2}],
  html: `
    <h2>Two entities</h2>
    <p class="sub">Module <code>Trends</code></p>
    <div class="dm">
      <svg><defs>
        <marker id="ar2" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
          <path d="M1,1 L11,6 L1,11" fill="none" stroke="#98a3b3" stroke-width="2"/></marker>
       </defs>
        <line x1="1020" y1="110" x2="900" y2="110" stroke="#262828" stroke-width="1"/>
      </svg>
      <div class="ent" style="left:420px;top:20px">
        <div class="hd"><span>Meter</span></div>
        <div class="at"><span>MeterCode</span><span class="t">String(20)</span></div>
        <div class="at"><span>Region</span><span class="t">String(40)</span></div>
      </div>
      <div class="ent" style="left:1020px;top:20px">
        <div class="hd"><span>Reading</span></div>
        <div class="at"><span>ReadAt</span><span class="t">DateTime</span></div>
        <div class="at"><span>Kwh</span><span class="t">Decimal</span></div>
      </div>
      <div class="lbl" style="left:706px;top:250px;width:420px;text-align:center">Reading_Meter</div>
      <div class="callout step" data-step="1" style="left:420px;top:300px;max-width:1000px">
        <span class="accent">6 meters x 1095 daily readings = 6570 rows.</span><br>
        Every grouping in this film is computed from these, per request.
      </div>
    </div>`
},
{
  id: "union", label: "The view", kind: "command",
  narration: "Instead of a parameter, union the three groupings into one view entity. Each branch groups differently. And each one selects a constant that names the grouping it is. That constant column is the whole trick.",
  steps: 2, cues: [{"step": 1, "s": 1}, {"step": 2, "s": 2}],
  html: `
    <h2>Three branches, one view entity</h2>
    <p class="sub">mdl/11-trends-view.mdl &middot; 8 of 55 lines</p>
    <div class="card">
<pre><span class="kw">create view entity</span> Trends.UsageTrendVE (
  Grain: <span class="kw">String</span>(200), ...  <span class="cm">-- 6 more attributes</span>
) <span class="kw">as</span> (
  <span class="kw">select</span> <span class="step" data-step="1">'Week'</span>    <span class="kw">as</span> Grain, ..., <span class="kw">datepart</span>(WEEK,    r.ReadAt)
  <span class="kw">group by</span> m.MeterCode, <span class="kw">datepart</span>(YEAR, r.ReadAt)<span class="step" data-step="2">, <span class="kw">datepart</span>(WEEK, ...)</span>
  <span class="kw">union all</span>
  <span class="kw">select</span> <span class="mark" data-step="1">'Month'</span>   <span class="kw">as</span> Grain, ..., <span class="kw">datepart</span>(MONTH,   r.ReadAt)
  <span class="kw">union all</span>
  <span class="kw">select</span> <span class="step" data-step="1">'Quarter'</span> <span class="kw">as</span> Grain, ..., <span class="kw">datepart</span>(QUARTER, r.ReadAt)
);</pre>
    </div>
    <p class="note step" data-step="2">A constant per branch &mdash; that is what the consumer
      filters on. The branches differ in one term, exactly as the chart does.</p>`
},
{
  id: "rows", label: "What the view holds", kind: "result",
  narration: "So the view holds all three grains at once. For one meter over three years that is a hundred and fifty-six weekly rows, thirty-six monthly and twelve quarterly. Two hundred and four rows, told apart by the Grain column.",
  steps: 2, cues: [{"step": 1, "s": 1}, {"step": 2, "s": 2}],
  html: `
    <h2>All three grains, in one result set</h2>
    <p class="sub">meter M-001, three years</p>
    <div class="cols">
      <div class="col card" style="flex:1.4">
        <h3>Rows, as the view returns them</h3>
        <table>
          <tr><th>grain</th><th>year</th><th>no</th><th>label</th><th class="n">totalKwh</th></tr>
          <tr><td>Week</td><td>2025</td><td>1</td><td>2025-W1</td><td class="n">114.00</td></tr>
          <tr><td>Month</td><td>2025</td><td>1</td><td>2025-M1</td><td class="n">468.00</td></tr>
          <tr><td>Quarter</td><td>2025</td><td>1</td><td>2025-Q1</td><td class="n">1351.00</td></tr>
          <tr><td colspan="5" class="dim">... 201 more</td></tr>
        </table>
      </div>
      <div class="col">
        <div class="card step" data-step="1">
          <h3>Row counts</h3>
          <table>
            <tr><td>Week</td><td class="n">156</td></tr>
            <tr><td>Month</td><td class="n">36</td></tr>
            <tr><td>Quarter</td><td class="n">12</td></tr>
            <tr><td><b>total</b></td><td class="n"><b>204</b></td></tr>
          </table>
        </div>
        <p class="note step" data-step="2">One column separates them, and it is a
          <span class="accent">String</span> &mdash; because it has to be part of the
          published key, and an enumeration cannot be.</p>
      </div>
    </div>`
},
{
  id: "call", label: "The API", kind: "result",
  narration: "The chart then asks for the one it wants, with an ordinary filter. No parameter, no special resource. And because the grains are rows rather than call shapes, a consumer can ask for two of them at once - which a parameter could never give you.",
  steps: 2, cues: [{"step": 1, "s": 1}, {"step": 2, "s": 2}],
  html: `
    <h2>The grouping is a filter, not a parameter</h2>
    <p class="sub">requests/trends.http &middot; odata/trends/v1/</p>
    <div class="card">
<pre><span class="cm">-- the user picks "month"</span>
GET .../UsageTrend?$filter=<span class="mark" data-step="1">grain eq 'Month'</span> and meterCode eq 'M-001'
                  &amp;$orderby=periodYear,periodNo
200  36 rows</pre>
    </div>
    <div class="card step" data-step="2" style="margin-top:26px">
<pre><span class="cm">-- two grains in one response: not expressible as a parameter</span>
GET .../UsageTrend?$filter=(grain eq 'Quarter' or grain eq 'Month')
                            and meterCode eq 'M-001'
200  48 rows</pre>
    </div>
    <p class="note step" data-step="2">One entity set. Any OData client, Data Hub
      consumer or chart widget can drive it without knowing it is a union.</p>`
},
{
  id: "sql", label: "In the database", kind: "result",
  narration: "Underneath, the three branches arrive as a union and the filter becomes the outer where clause. But look closely at the branches. Mendix does not put the words Week, Month and Quarter into the SQL - it binds them, as parameters one, three and five, with the filter value as parameter seven. So the question is not whether the planner folds Week equals Month. It is what it does with dollar one equals dollar seven.",
  steps: 3, cues: [{"step": 1, "s": 1}, {"step": 2, "s": 3}, {"step": 3, "s": 4}],
  html: `
    <h2>One <code>GET</code>, one statement &mdash; and everything is bound</h2>
    <p class="sub">ConnectionBus_Retrieve at TRACE &middot; docs/sql/04-union-pushdown.sql &middot; abridged</p>
    <div class="card">
<pre><span class="cm">-- each branch selects 7 columns and groups by 3 terms; both elided here</span>
<span class="kw">FROM</span> ( (<span class="kw">SELECT</span> <span class="step" data-step="2">?</span> <span class="kw">AS</span> "Grain", ... <span class="kw">GROUP BY</span> ..., EXTRACT(WEEK ...))
  <span class="kw">UNION ALL</span> (<span class="kw">SELECT</span> <span class="step" data-step="2">?</span> <span class="kw">AS</span> "Grain", ... EXTRACT(MONTH ...))
  <span class="kw">UNION ALL</span> (<span class="kw">SELECT</span> <span class="step" data-step="2">?</span> <span class="kw">AS</span> "Grain", ... EXTRACT(QUARTER ...)) ) "v"
<span class="kw">WHERE</span> ...  <span class="cm">-- 4 not-null guards</span>
  <span class="step" data-step="1"><span class="kw">AND</span> "v"."Grain" = ?</span> <span class="kw">AND</span> "v"."MeterCode" = ?
<span class="kw">ORDER BY</span> "v"."PeriodYear" <span class="kw">ASC</span>, "v"."PeriodNo" <span class="kw">ASC</span>, <span class="kw">LIMIT</span> ?
<span class="mark" data-step="2">-- params 1-9: Week, -W, Month, -M, Quarter, -Q, Month, M-001, 3000</span></pre>
    </div>
    <p class="note step" data-step="3">The discriminators are parameters 1, 3 and 5;
      the filter value is parameter 7. So the real question is what the planner does
      with <code>$1 = $7</code>.</p>`
},
{
  id: "plan-custom", label: "Custom plan", kind: "result",
  narration: "With a custom plan it has the values while planning, so it folds the comparison and drops the branch. One-time filter false, zero rows, for the two grains nobody asked for. Only the month branch runs, and the meter filter reaches an index underneath it.",
  steps: 2, cues: [{"step": 1, "s": 1}, {"step": 2, "s": 2}],
  html: `
    <h2>It folds the comparison and drops the branch</h2>
    <p class="sub">EXPLAIN ANALYZE &middot; docs/sql/05-plan-grain-filtered.txt &middot; 11 of 26 plan lines</p>
    <div class="card">
<pre><span class="kw">Limit</span> (actual rows=36)
  -&gt; <span class="kw">Merge Append</span> (actual rows=36)
       -&gt; <span class="kw">GroupAggregate</span> (actual rows=0)            <span class="cm">&lt;- Week</span>
            -&gt; Result (actual rows=0)
                 <span class="mark" data-step="1">One-Time Filter: false</span>
       -&gt; <span class="kw">GroupAggregate</span> (actual rows=36)           <span class="cm">&lt;- Month</span>
            -&gt; <span class="step" data-step="2">Nested Loop (actual rows=1095)
                 -&gt; Bitmap Index Scan on idx_trends$meter_metercode
                 -&gt; Bitmap Heap Scan on trends$reading (rows=1095)</span>
       -&gt; <span class="kw">GroupAggregate</span> (actual rows=0)            <span class="cm">&lt;- Quarter</span>
            ...  <span class="cm">-- One-Time Filter: false, 2 lines</span>
<span class="cm">Execution Time: 2.101 ms</span></pre>
    </div>`
},
{
  id: "plan-generic", label: "Generic plan", kind: "result",
  narration: "Force a generic plan, where the parameters stay symbolic, and the comparison cannot be folded at all. It is evaluated once per execution instead. And every scan below it reports never executed. That is what makes this safe to rely on: it does not depend on the planner happening to choose a custom plan.",
  steps: 2, cues: [{"step": 1, "s": 2}, {"step": 2, "s": 3}],
  html: `
    <h2>And when it cannot fold it, it still skips the scan</h2>
    <p class="sub">SET plan_cache_mode = force_generic_plan &middot; docs/sql/06-plan-generic.txt</p>
    <div class="card">
<pre>-&gt; <span class="kw">GroupAggregate</span> (actual rows=0)
     -&gt; Sort (actual rows=0)
          -&gt; Result (actual rows=0)
               <span class="step" data-step="1">One-Time Filter: (($1 IS NOT NULL) AND (($1)::text = ($7)::text))</span>
               -&gt; <span class="mark" data-step="2">Nested Loop (never executed)
                    -&gt; Bitmap Heap Scan on "trends$meter" m (never executed)
                    -&gt; Bitmap Heap Scan on "trends$reading" r (never executed)</span></pre>
    </div>
    <p class="note step" data-step="2">Plan time or execution time, the branches you
      did not ask for never touch the tables.</p>`
},
{
  id: "close", label: "The numbers", kind: "result",
  narration: "One grain: one point nine milliseconds, one thousand and ninety-five rows scanned. All three: five point three, and three times the rows. The ratio is set by how many branches you union, not by how much data you have. Two things to keep in mind. Every branch has to produce the same columns and types, and the discriminator has to be a constant per branch, because that constant is what collapses. Beyond that it is one entity set, one statement, and a filter.",
  steps: 3, cues: [{"step": 1, "s": 1}, {"step": 2, "s": 2}, {"step": 3, "s": 3}],
  html: `
    <h2>What it costs</h2>
    <div class="card">
      <table>
        <tr><th></th><th class="n">rows</th><th class="n">readings scanned</th><th class="n">execution, 5 warm runs</th></tr>
        <tr class="hl"><td>$filter=grain eq 'Month'</td><td class="n">36</td>
            <td class="n">1095 &middot; one branch</td>
            <td class="n accent">1.88 / 1.88 / 1.96 / 1.96 / 2.85 ms</td></tr>
        <tr><td>no grain filter</td><td class="n">204</td>
            <td class="n">3285 &middot; three branches</td>
            <td class="n">5.24 / 5.33 / 5.33 / 5.41 / 5.43 ms</td></tr>
      </table>
      <p class="note step" data-step="1">The ratio follows the number of branches, not the row count.</p>
    </div>
    <div class="cols" style="margin-top:28px">
      <div class="col card step" data-step="2">
        <h3>What you get over a parameter</h3>
        <p class="note" style="margin-top:0">One entity set any client can drive &middot;
           one statement text, so the plan cache and the prepared statement both hit &middot;
           two grains in one response.</p>
      </div>
      <div class="col card step" data-step="3">
        <h3>Where it stops being right</h3>
        <p class="note" style="margin-top:0">Branches must match in columns and types &middot;
           the discriminator has to be a constant per branch &middot; a consumer that
           forgets the filter gets every grain.</p>
      </div>
    </div>`
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
      <div class="take">the grouping is a filter, not a parameter</div>
    </div>`
},
];
}));
