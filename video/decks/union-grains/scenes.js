// Film 2: three groupings in one view entity, without parameters.
//
// Every number here is captured, not illustrative: the bars are the published
// resource's own 2025 rows for meter M-001, and the SQL and plans are copied
// from docs/sql/04-07.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SCENES = factory();
}(typeof self !== 'undefined' ? self : this, function () {

// GET .../UsageTrend?$filter=grain eq '<grain>' and meterCode eq 'M-001'
//                            and periodYear eq 2025
const SERIES = {"Week": [114.0, 95.0, 111.0, 105.0, 99.0, 115.0, 98.0, 103.0, 119.0, 91.0, 107.0, 112.0, 95.0, 111.0, 105.0, 99.0, 115.0, 98.0, 103.0, 119.0, 91.0, 107.0, 112.0, 95.0, 111.0, 105.0, 99.0, 115.0, 98.0, 103.0, 119.0, 91.0, 107.0, 112.0, 95.0, 111.0, 105.0, 99.0, 115.0, 98.0, 103.0, 119.0, 91.0, 107.0, 112.0, 95.0, 111.0, 105.0, 99.0, 115.0, 98.0, 103.0], "Month": [468.0, 423.0, 460.0, 450.0, 470.0, 454.0, 458.0, 462.0, 453.0, 472.0, 446.0, 444.0], "Quarter": [1351.0, 1374.0, 1373.0, 1362.0]};

// One series, so no legend - the panel title names it. Thin bars, rounded
// data-end anchored to the baseline, a 2px gap, and only the peak is labelled.
const chart = (grain, firstLabel, lastLabel) => {
  const v = SERIES[grain], max = Math.max(...v), peak = v.indexOf(max) + 1;
  return `<div class="chart">
    <h3>${grain} &middot; ${v.length} ${v.length === 1 ? 'bar' : 'bars'}</h3>
    <div class="bars">${v.map(x =>
      `<i style="height:${(x / max * 100).toFixed(1)}%"></i>`).join('')}</div>
    <div class="xa"><span>${firstLabel}</span><span>${lastLabel}</span></div>
    <div class="peak">peak ${max.toLocaleString('en-US')} kWh at ${grain.toLowerCase()} ${peak}</div>
  </div>`;
};

return [

// ---------------------------------------------------------------- 1. title
{
  id: 'title', label: '', steps: 2, cues: [{ step: 1, s: 2 }],
  narration: "A chart where the user picks week, month or quarter. Three groupings of the same readings, chosen at runtime. This is the case people most often ask for a parameterised view entity - and it is the case that does not need one.",
  html: `
    <div style="margin:auto 0">
      <div class="tag">Mendix 10.24.24 &middot; view entities &middot; published OData</div>
      <h1>Three groupings,<br>one view entity, no parameters</h1>
      <p class="sub" style="max-width:1150px">Union the groupings, carry a column that says which one a row came from,
         and let the database skip the branches nobody asked for.</p>
      <div class="step" data-step="1" style="font-size:24px;color:var(--dim)">
        The bars, the SQL and the query plans on the following screens are all
        captured from the running app.
      </div>
    </div>`
},

// ---------------------------------------------------------------- 2. the chart
{
  id: 'chart', label: 'The requirement', steps: 2,
  cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  narration: "Here is the chart in its three states. Same meter, same year, the same readings underneath: fifty-two bars, twelve, or four. The reflex is to make the grouping a parameter, so that the view returns whichever shape was asked for.",
  html: `
    <h2>One chart, three groupings</h2>
    <p class="sub">Meter M-001, kWh per period, 2025 &mdash; the published resource's own rows</p>
    <div class="seg"><span>Week</span><span class="on">Month</span><span>Quarter</span></div>
    <div class="cols">
      <div class="col card">${chart('Week', 'W1', 'W52')}</div>
      <div class="col card">${chart('Month', 'Jan', 'Dec')}</div>
      <div class="col card">${chart('Quarter', 'Q1', 'Q4')}</div>
    </div>
    <p class="note step" data-step="1">The obvious design: <b>make the grouping a parameter</b>
       and have the view entity return one of these three shapes per call.</p>
    <p class="note step" data-step="2">But nothing about the data changed &mdash;
       only how it was grouped.</p>`
},

// ---------------------------------------------------------------- 3. the model
{
  id: 'model', label: 'Domain model', steps: 1, cues: [{ step: 1, s: 2 }],
  narration: "The data underneath is plain. Meters, and readings hanging off them. Six meters, three years of daily readings: six thousand five hundred and seventy rows.",
  html: `
    <h2>Two entities</h2>
    <p class="sub">Module <code>Trends</code></p>
    <div class="dm">
      <svg><defs>
        <marker id="ar2" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
          <path d="M1,1 L11,6 L1,11" fill="none" stroke="#9fb3cd" stroke-width="2"/></marker>
       </defs>
        <line x1="760" y1="96" x2="590" y2="96" stroke="#9fb3cd" stroke-width="2" marker-end="url(#ar2)"/>
      </svg>
      <div class="ent" style="left:250px;top:40px">
        <div class="hd"><span>Meter</span><span class="k">persistable</span></div>
        <div class="at"><span class="n">MeterCode</span><span class="t">String(20)</span></div>
        <div class="at"><span class="n">Region</span><span class="t">String(40)</span></div>
      </div>
      <div class="ent" style="left:810px;top:40px">
        <div class="hd"><span>Reading</span><span class="k">persistable</span></div>
        <div class="at"><span class="n">ReadAt</span><span class="t">DateTime</span></div>
        <div class="at"><span class="n">Kwh</span><span class="t">Decimal</span></div>
      </div>
      <div class="lbl" style="left:592px;top:62px">Reading_Meter</div>
      <div class="callout step" data-step="1" style="left:250px;top:230px;max-width:760px">
        <b style="color:#7fd4f5">6 meters &times; 1095 daily readings = 6570 rows.</b><br>
        Every grouping in this film is computed from these, per request.
      </div>
    </div>`
},

// ---------------------------------------------------------------- 4. the union
{
  id: 'union', label: 'The view', steps: 2,
  cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  narration: "Instead of a parameter, union the three groupings into one view entity. Each branch groups differently. And each one selects a constant that names the grouping it is. That constant column is the whole trick.",
  html: `
    <h2>Three branches, one view entity</h2>
    <p class="sub">mdl/11-trends-view.mdl</p>
    <div class="card">
<pre style="font-size:20px"><span class="kw">create view entity</span> Trends.UsageTrendVE (
  Grain: <span class="kw">String</span>(200), MeterCode: <span class="kw">String</span>(200), PeriodYear: <span class="kw">Integer</span>,
  PeriodNo: <span class="kw">Integer</span>, Label: <span class="kw">String</span>(200), TotalKwh: <span class="kw">Decimal</span>, ReadingCount: <span class="kw">Integer</span>
) <span class="kw">as</span> (
  <span class="kw">select</span> <span class="mark hot" data-step="1"><span class="str">'Week'</span></span>    <span class="kw">as</span> Grain, ..., <span class="fn">datepart</span>(WEEK,    r.ReadAt) <span class="kw">as</span> PeriodNo, ...
  <span class="kw">group by</span> m.MeterCode, <span class="fn">datepart</span>(YEAR, r.ReadAt), <span class="mark" data-step="2"><span class="fn">datepart</span>(WEEK, r.ReadAt)</span>
  <span class="kw">union all</span>
  <span class="kw">select</span> <span class="mark hot" data-step="1"><span class="str">'Month'</span></span>   <span class="kw">as</span> Grain, ..., <span class="fn">datepart</span>(MONTH,   r.ReadAt) <span class="kw">as</span> PeriodNo, ...
  <span class="kw">group by</span> m.MeterCode, <span class="fn">datepart</span>(YEAR, r.ReadAt), <span class="mark" data-step="2"><span class="fn">datepart</span>(MONTH, r.ReadAt)</span>
  <span class="kw">union all</span>
  <span class="kw">select</span> <span class="mark hot" data-step="1"><span class="str">'Quarter'</span></span> <span class="kw">as</span> Grain, ..., <span class="fn">datepart</span>(QUARTER, r.ReadAt) <span class="kw">as</span> PeriodNo, ...
  <span class="kw">group by</span> m.MeterCode, <span class="fn">datepart</span>(YEAR, r.ReadAt), <span class="mark" data-step="2"><span class="fn">datepart</span>(QUARTER, r.ReadAt)</span>
);</pre>
    </div>
    <p class="note"><span class="step" data-step="1">A constant per branch &mdash; that is what the consumer filters on. &nbsp;</span>
      <span class="step" data-step="2">The branches differ in one term, exactly as the chart does.</span></p>`
},

// ---------------------------------------------------------------- 5. the rows
{
  id: 'rows', label: 'What the view holds', steps: 2,
  cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  narration: "So the view holds all three grains at once. For one meter over three years that is a hundred and fifty-six weekly rows, thirty-six monthly and twelve quarterly. Two hundred and four rows, told apart by the Grain column.",
  html: `
    <h2>All three grains, in one result set</h2>
    <p class="sub">meter M-001, three years</p>
    <div class="cols">
      <div class="col card" style="flex:1.3">
        <h3>Rows, as the view returns them</h3>
        <table>
          <tr><th>grain</th><th>meterCode</th><th>year</th><th>no</th><th>label</th><th style="text-align:right">totalKwh</th></tr>
          <tr class="hl"><td class="keycol">Week</td><td>M-001</td><td>2025</td><td>1</td><td>2025-W1</td><td class="n">114.00</td></tr>
          <tr class="hl"><td class="keycol">Week</td><td>M-001</td><td>2025</td><td>2</td><td>2025-W2</td><td class="n">95.00</td></tr>
          <tr><td class="enum">Month</td><td>M-001</td><td>2025</td><td>1</td><td>2025-M1</td><td class="n">468.00</td></tr>
          <tr><td class="enum">Month</td><td>M-001</td><td>2025</td><td>2</td><td>2025-M2</td><td class="n">423.00</td></tr>
          <tr><td class="ok">Quarter</td><td>M-001</td><td>2025</td><td>1</td><td>2025-Q1</td><td class="n">1351.00</td></tr>
          <tr><td class="ok">Quarter</td><td>M-001</td><td>2025</td><td>2</td><td>2025-Q2</td><td class="n">1374.00</td></tr>
        </table>
      </div>
      <div class="col">
        <div class="card step" data-step="1">
          <h3>Row counts</h3>
          <table>
            <tr><td class="keycol">Week</td><td class="n">156</td></tr>
            <tr><td class="enum">Month</td><td class="n">36</td></tr>
            <tr><td class="ok">Quarter</td><td class="n">12</td></tr>
            <tr><td><b>total</b></td><td class="n"><b>204</b></td></tr>
          </table>
        </div>
        <p class="note step" data-step="2">One column separates them, and it is
          a <b>String</b> &mdash; because it has to be part of the published key,
          and an enumeration cannot be.</p>
      </div>
    </div>`
},

// ---------------------------------------------------------------- 6. the call
{
  id: 'call', label: 'The API', steps: 2,
  cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  narration: "The chart then asks for the one it wants, with an ordinary filter. No parameter, no special resource. And because the grains are rows rather than call shapes, a consumer can ask for two of them at once - which a parameter could never give you.",
  html: `
    <h2>The grouping is a filter, not a parameter</h2>
    <p class="sub">requests/trends.http &middot; odata/trends/v1/</p>
    <div class="card" style="margin-bottom:22px">
<pre style="font-size:21px"><span class="cm">-- the user picks "month"</span>
GET .../UsageTrend?$filter=<span class="mark hot" data-step="1">grain eq 'Month'</span> and meterCode eq 'M-001'
                  &$orderby=periodYear,periodNo
<span class="ok">200</span>  36 rows</pre>
    </div>
    <div class="card step" data-step="2">
<pre style="font-size:21px"><span class="cm">-- two grains in one response: not expressible as a parameter</span>
GET .../UsageTrend?$filter=(grain eq 'Quarter' or grain eq 'Month')
                            and meterCode eq 'M-001'
<span class="ok">200</span>  48 rows</pre>
    </div>
    <p class="note step" data-step="2">One entity set. Any OData client, Data Hub
      consumer or chart widget can drive it without knowing it is a union.</p>`
},

// ---------------------------------------------------------------- 7. the SQL
{
  id: 'sql', label: 'In the database', steps: 3,
  cues: [{ step: 1, s: 1 }, { step: 2, s: 3 }, { step: 3, s: 4 }],
  narration: "Underneath, the three branches arrive as a union and the filter becomes the outer where clause. But look closely at the branches. Mendix does not put the words Week, Month and Quarter into the SQL - it binds them, as parameters one, three and five, with the filter value as parameter seven. So the question is not whether the planner folds Week equals Month. It is what it does with dollar one equals dollar seven.",
  html: `
    <h2>One <code>GET</code>, one statement &mdash; and everything is bound</h2>
    <p class="sub">ConnectionBus_Retrieve at TRACE &middot; docs/sql/04-union-pushdown.sql</p>
    <div class="card">
<pre style="font-size:20px"><span class="kw">FROM</span> ( (<span class="kw">SELECT</span> <span class="mark hot" data-step="2">?</span> <span class="kw">AS</span> <span class="str">"Grain"</span>, ... <span class="kw">GROUP BY</span> ..., <span class="fn">EXTRACT</span>(WEEK    <span class="kw">FROM</span> "r"."readat"))
       <span class="kw">UNION ALL</span>
       (<span class="kw">SELECT</span> <span class="mark hot" data-step="2">?</span> <span class="kw">AS</span> <span class="str">"Grain"</span>, ... <span class="kw">GROUP BY</span> ..., <span class="fn">EXTRACT</span>(MONTH   <span class="kw">FROM</span> "r"."readat"))
       <span class="kw">UNION ALL</span>
       (<span class="kw">SELECT</span> <span class="mark hot" data-step="2">?</span> <span class="kw">AS</span> <span class="str">"Grain"</span>, ... <span class="kw">GROUP BY</span> ..., <span class="fn">EXTRACT</span>(QUARTER <span class="kw">FROM</span> "r"."readat")) ) <span class="str">"v"</span>
<span class="kw">WHERE</span> ... <span class="kw">AND</span> <span class="mark" data-step="1">"v"."Grain" = ?</span> <span class="kw">AND</span> "v"."MeterCode" = ?
<span class="kw">ORDER BY</span> "v"."PeriodYear" <span class="kw">ASC</span>, "v"."PeriodNo" <span class="kw">ASC</span>
<span class="kw">LIMIT</span> ?

<span class="cm">-- params 1-9: <b>Week</b>, -W, <b>Month</b>, -M, <b>Quarter</b>, -Q, <b>Month</b>, M-001, 3000</span></pre>
    </div>
    <p class="note step" data-step="3">The discriminators are <b class="warn">parameters 1, 3 and 5</b>;
      the filter value is parameter 7. So the real question is what the planner does with
      <code>$1 = $7</code>.</p>`
},

// ---------------------------------------------------------------- 8. custom plan
{
  id: 'plan-custom', label: 'Custom plan', steps: 2,
  cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  narration: "With a custom plan it has the values while planning, so it folds the comparison and drops the branch. One-time filter false, zero rows, for the two grains nobody asked for. Only the month branch runs, and the meter filter reaches an index underneath it.",
  html: `
    <h2>It folds the comparison and drops the branch</h2>
    <p class="sub">EXPLAIN ANALYZE &middot; docs/sql/05-plan-grain-filtered.txt</p>
    <div class="card">
<pre style="font-size:20px"><span class="kw">Limit</span> (actual rows=<b class="ok">36</b>)
  -&gt; <span class="kw">Merge Append</span> (actual rows=36)
       -&gt; <span class="kw">GroupAggregate</span> (actual rows=<b>0</b>)                    <span class="cm">&lt;- Week</span>
            -&gt; Result (actual rows=0)
                 <span class="mark hot" data-step="1">One-Time Filter: false</span>
       -&gt; <span class="kw">GroupAggregate</span> (actual rows=<b class="ok">36</b>)                   <span class="cm">&lt;- Month</span>
            -&gt; Sort (actual rows=1095)
                 -&gt; <span class="mark" data-step="2">Nested Loop (actual rows=1095)
                      -&gt; Bitmap Index Scan on idx_trends$meter_metercode_asc
                      -&gt; Bitmap Heap Scan on trends$reading (rows=1095)</span>
       -&gt; <span class="kw">GroupAggregate</span> (actual rows=<b>0</b>)                    <span class="cm">&lt;- Quarter</span>
            -&gt; Result (actual rows=0)
                 <span class="mark hot" data-step="1">One-Time Filter: false</span>
<span class="cm">Execution Time: 2.101 ms</span></pre>
    </div>`
},

// ---------------------------------------------------------------- 9. generic plan
{
  id: 'plan-generic', label: 'Generic plan', steps: 2,
  cues: [{ step: 1, s: 2 }, { step: 2, s: 3 }],
  narration: "Force a generic plan, where the parameters stay symbolic, and the comparison cannot be folded at all. It is evaluated once per execution instead. And every scan below it reports never executed. That is what makes this safe to rely on: it does not depend on the planner happening to choose a custom plan.",
  html: `
    <h2>And when it <span class="warn">cannot</span> fold it, it still skips the scan</h2>
    <p class="sub">SET plan_cache_mode = force_generic_plan &middot; docs/sql/06-plan-generic.txt</p>
    <div class="card">
<pre style="font-size:20px">-&gt; <span class="kw">GroupAggregate</span> (actual rows=<b>0</b>)
     -&gt; Sort (actual rows=0)
          -&gt; Result (actual rows=0)
               <span class="mark hot" data-step="1">One-Time Filter: (($1 IS NOT NULL) AND (($1)::text = ($7)::text))</span>
               -&gt; <span class="mark" data-step="2">Nested Loop (<b>never executed</b>)
                    -&gt; Bitmap Heap Scan on "trends$meter" m (<b>never executed</b>)
                    -&gt; Bitmap Heap Scan on "trends$reading" r (<b>never executed</b>)</span></pre>
    </div>
    <p class="note step" data-step="2">Plan time or execution time, the branches you
      did not ask for <b class="ok">never touch the tables</b>.</p>`
},

// ---------------------------------------------------------------- 10. close
{
  id: 'close', label: 'The numbers', steps: 3,
  cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }, { step: 3, s: 3 }],
  narration: "One grain: one point nine milliseconds, one thousand and ninety-five rows scanned. All three: five point three, and three times the rows. The ratio is set by how many branches you union, not by how much data you have. Two things to keep in mind. Every branch has to produce the same columns and types, and the discriminator has to be a constant per branch, because that constant is what collapses. Beyond that it is one entity set, one statement, and a filter.",
  html: `
    <h2>What it costs</h2>
    <div class="card" style="margin-bottom:26px">
      <table style="font-size:22px">
        <tr><th></th><th>rows returned</th><th>readings scanned</th><th>execution time, 5 warm runs</th></tr>
        <tr class="hl"><td><code>$filter=grain eq 'Month'</code></td><td class="n">36</td>
            <td class="n">1095 &middot; one branch</td><td class="n ok">1.88 / 1.88 / 1.96 / 1.96 / 2.85 ms</td></tr>
        <tr><td>no grain filter</td><td class="n">204</td>
            <td class="n">3285 &middot; three branches</td><td class="n warn">5.24 / 5.33 / 5.33 / 5.41 / 5.43 ms</td></tr>
      </table>
      <p class="note step" data-step="1">The ratio follows the number of branches, not the row count.</p>
    </div>
    <div class="cols">
      <div class="col card step" data-step="2" style="border-color:#14405c;background:#08243a">
        <h3 style="color:#7fd4f5">What you get over a parameter</h3>
        <p class="note" style="margin-top:0">One entity set any client can drive &middot;
           one statement text, so the plan cache and the prepared statement both hit &middot;
           two grains in one response &middot; <code>$orderby</code> and <code>$top</code>
           push down the same way.</p>
      </div>
      <div class="col card step" data-step="3">
        <h3>Where it stops being right</h3>
        <p class="note" style="margin-top:0">Branches must match in columns and types &middot;
           the discriminator has to be a <b>constant per branch</b> &mdash; a grain computed
           from a joined column would not collapse &middot; a consumer that forgets the
           filter gets every grain.</p>
      </div>
    </div>
    <p class="note step" data-step="3" style="margin-top:20px;font-size:22px">
      github.com/ako/view-entity-examples &nbsp;&middot;&nbsp; measured on Mendix 10.24.24.119653 / PostgreSQL 16</p>
`
}
];
}));
