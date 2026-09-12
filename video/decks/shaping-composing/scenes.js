// Film 4 - shaping the columns a view entity returns, and composing one view
// entity on another.
//
// Same system as the others (video-system/DESIGN-LANGUAGE.md). Everything on
// screen is captured from the app in this repo; the source is named on each
// frame. The association frames need mxcli with ako/mxcli#452 to reproduce,
// which the frame that writes it says out loud.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SCENES = factory();
}(typeof self !== 'undefined' ? self : this, function () {

return [
{
  id: "title", label: "", kind: "declarative",
  narration: "The columns a view entity returns are yours to shape. One of those choices decides what the client ends up holding, and it is worth making on purpose.",
  steps: 1, cues: [{ step: 1, s: 1 }],
  noChrome: true,
  html: `
    <div class="tag">Mendix 10.24.24 &middot; view entities &middot; part two</div>
    <h1>Shaping and composing</h1>
    <p class="sub" style="max-width:1500px"><code>cast</code>, two ways to carry a reference, and
       <span class="accent">what it costs to build a view on a view</span>.</p>
    <div class="step" data-step="1" style="font-size:28px;color:var(--dim)">
      Every statement, row and plan on the following screens was captured from
      the app in this repository.
    </div>`
},
{
  id: "cast", label: "cast", kind: "command",
  narration: "Start with cast. It changes a value's type inside the query, and it compiles to a plain SQL cast. Nothing is stored, nothing is joined; it costs one expression in the select list.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>One expression, one type change</h2>
    <p class="sub">docs/sql/01-filter-pushdown.sql &middot; the enum key from film one</p>
    <div class="card">
<pre><span class="cm">-- OQL</span>
,      <span class="kw">cast</span>(c.ContractType <span class="kw">as</span> <span class="kw">string</span>) <span class="kw">as</span> ContractTypeKey

<span class="step" data-step="1"><span class="cm">-- what the database is asked</span>
,      <span class="kw">CAST</span>("c"."contracttype" <span class="kw">AS</span> varchar) <span class="kw">AS</span> "ContractTypeKey"</span></pre>
    </div>
    <p class="note step" data-step="2">That is the whole of it. An enumeration cannot be part of a
       published key; <span class="accent">a string can</span>, and this is how the same value
       becomes one.</p>`
},
{
  id: "derived", label: "The length rule", kind: "result",
  narration: "One rule comes with it, and it catches everyone once. A column you pass straight through keeps its own length. A derived column - a cast, a concatenation, a case expression - is string two hundred, always.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 2 }],
  html: `
    <h2>Derived string columns are <code>String(200)</code></h2>
    <p class="sub">docs/errors-shaping.txt &middot; captured with mxcli check</p>
    <div class="card">
<pre><span class="cm">-- declared at the length you might expect</span>
  MeterId: <span class="kw">String</span>(20)
) <span class="kw">as</span> ( <span class="kw">select</span> <span class="kw">cast</span>(m.ID <span class="kw">as</span> <span class="kw">string</span>) <span class="kw">as</span> MeterId ... )  <span class="cm">-- 2 lines elided</span></pre>
    </div>
    <div class="card step" data-step="1" style="margin-top:26px">
<pre><span class="mark" data-step="2">attribute 'MeterId': declared as String(20) but OQL expression
returns String(200)                                   [MDL031]</span>
   -&gt; Fix: change to 'MeterId: String(200)'</pre>
    </div>
    <p class="note step" data-step="2">MxBuild says the same thing later and less kindly:
       <code>CE6770 View Entity is out of sync with the OQL Query</code>.</p>`
},
{
  id: "two-ways", label: "Carrying a reference", kind: "result",
  narration: "Now the choice that matters. A view entity row often needs to point at something: which meter, which customer, which order. There are two ways to carry that, and they are not the same shape.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 2 }],
  html: `
    <h2>Which meter did this row come from?</h2>
    <p class="sub">Two answers, and they cost different things</p>
    <div class="cols">
      <div class="col card step" data-step="1">
        <h3>An association</h3>
<pre style="font-size:26px"><span class="kw">select</span> m.ID <span class="kw">as</span> MeterRef</pre>
        <p class="note" style="margin-top:16px">A real reference. The grid can read
           <code>MeterRef/MeterCode</code> and anything else on the meter.</p>
      </div>
      <div class="col card step" data-step="2">
        <h3>A string copy of the id</h3>
<pre style="font-size:26px"><span class="kw">select</span> <span class="kw">cast</span>(m.ID <span class="kw">as</span> <span class="kw">string</span>)
       <span class="kw">as</span> MeterId</pre>
        <p class="note" style="margin-top:16px">A plain column. Not a reference &mdash;
           <span class="accent">just enough to find one later</span>.</p>
      </div>
    </div>`
},
{
  id: "assoc-write", label: "Writing it", kind: "command",
  narration: "The association has no separate declaration. You select the target's id under an alias, and the alias is the association's name. The column is the declaration.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 3 }],
  html: `
    <h2>The alias is the association</h2>
    <p class="sub">mdl/30-view-entity-association.mdl</p>
    <div class="card">
<pre><span class="kw">create view entity</span> Trends.MeterMonthRefVE (
  PeriodYear: <span class="kw">Integer</span>, MonthNo: <span class="kw">Integer</span>, TotalKwh: <span class="kw">Decimal</span>
) <span class="kw">as</span> (
  <span class="kw">select</span> <span class="mark" data-step="1">m.ID <span class="kw">as</span> MeterRef</span>   <span class="cm">-- not one of the attributes above</span>
  ,      ...                <span class="cm">-- 3 more columns</span>
  <span class="kw">from</span> Trends.Reading <span class="kw">as</span> r
    <span class="kw">inner join</span> r/Trends.Reading_Meter/Trends.Meter <span class="kw">as</span> m
  <span class="kw">group by</span> m.ID, ...
);</pre>
    </div>
    <p class="note step" data-step="2">Three attributes declared, four columns selected &mdash; and that
       is correct, because the id column is the association rather than an attribute.</p>`
},
{
  id: "assoc-made", label: "What that creates", kind: "result",
  narration: "Execute it, and the association is created from the column. It shows up in the domain model as a reference from the view entity to the meter, named after the alias.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>One statement, two elements</h2>
    <p class="sub">mxcli exec &middot; needs the fix in ako/mxcli#452</p>
    <div class="card">
<pre>$ mxcli exec mdl/30-view-entity-association.mdl -p ViewEntityExamples.mpr
Created view entity: Trends.MeterMonthRefVE
<span class="mark" data-step="1">Created view association: Trends.MeterRef -&gt; Trends.Meter</span></pre>
    </div>
    <div class="card step" data-step="2" style="margin-top:26px">
      <table>
        <tr><th>association</th><th>from</th><th>to</th><th>type</th></tr>
        <tr><td>Trends.MeterRef</td><td>Trends.MeterMonthRefVE</td><td>Trends.Meter</td><td>Reference</td></tr>
      </table>
    </div>
    <p class="note step" data-step="2">The name is the alias, and nothing else in the script mentions it.</p>`
},
{
  id: "assoc-grid", label: "It works", kind: "result",
  narration: "And it behaves like any other reference. This grid's first two columns are read over it - meter code and region, neither of them stored on the view entity.",
  steps: 1, cues: [{ step: 1, s: 1 }],
  html: `
    <h2>Two columns read over the association</h2>
    <p class="sub">Trends.MeterRefGrid, running &mdash; values read off the app</p>
    <div class="card">
      <table>
        <tr><th>MeterRef/MeterCode</th><th>MeterRef/Region</th><th class="n">PeriodYear</th><th class="n">MonthNo</th><th class="n">TotalKwh</th></tr>
        <tr><td>M-001</td><td>Region 1</td><td class="n">2023</td><td class="n">1</td><td class="n">456</td></tr>
        <tr><td>M-001</td><td>Region 1</td><td class="n">2023</td><td class="n">2</td><td class="n">415</td></tr>
        <tr><td>M-001</td><td>Region 1</td><td class="n">2023</td><td class="n">3</td><td class="n">470</td></tr>
        <tr><td colspan="5" class="dim">... 12 more on this page</td></tr>
      </table>
    </div>
    <p class="note step" data-step="1">The view entity holds three attributes. <span class="accent">Two of
       these five columns are not among them</span> &mdash; they come from the meter it points at.</p>`
},
{
  id: "assoc-cost", label: "What it costs", kind: "result",
  narration: "Here is the bill. The view's own query got simpler: no join to the meter table at all, because the id compiled to the foreign key the reading already carries. Then a second statement fetches the meters for the rows on screen.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>One grid, two statements</h2>
    <p class="sub">ConnectionBus_Retrieve at TRACE &middot; docs/sql/11-association-retrieve.sql &middot; abridged</p>
    <div class="card">
<pre><span class="cm">-- 1. the view. Note what is missing: no join to trends$meter.</span>
<span class="kw">SELECT</span> ..., "Trends.MeterMonthRefVE"."MeterRef"   <span class="cm">-- 3 more columns</span>
<span class="kw">FROM</span> ( <span class="kw">SELECT</span> <span class="mark" data-step="1">"r"."trends$reading_meter" <span class="kw">AS</span> "MeterRef"</span>, ...
       <span class="kw">FROM</span> "trends$reading" "r"
       <span class="kw">GROUP BY</span> "r"."trends$reading_meter", ... ) "Trends.MeterMonthRefVE"</pre>
    </div>
    <div class="card step" data-step="2" style="margin-top:24px">
<pre><span class="cm">-- 2. and then the meters, for the rows on screen</span>
<span class="kw">SELECT</span> "id", "metercode", "region" <span class="kw">FROM</span> "trends$meter"
<span class="kw">WHERE</span> "trends$meter"."id" <span class="kw">IN</span> (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
<span class="cm">-- params 1-15: the same id, fifteen times      -- 1 row came back</span></pre>
    </div>`
},
{
  id: "assoc-read", label: "Reading the bill", kind: "result",
  narration: "Read that carefully, because it is better than the folklore and still not free. It is not one query per row: the runtime collects the page's references into a single in-list. But the list is not deduplicated, and it is a second round trip that grows with the page.",
  steps: 3, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }, { step: 3, s: 3 }],
  html: `
    <h2>Not N plus one &mdash; but not nothing</h2>
    <div class="cols">
      <div class="col card step" data-step="1">
        <h3>Better than feared</h3>
        <p class="note" style="margin-top:0">One statement for the page, not one per row.
           The runtime batches the references it needs.</p>
      </div>
      <div class="col card step" data-step="2">
        <h3>Worse than free</h3>
        <p class="note" style="margin-top:0">A second round trip, and the id list is not
           deduplicated: <span class="accent">15 rows of one meter sent the same id 15 times</span>
           to fetch 1 row.</p>
      </div>
      <div class="col card step" data-step="3">
        <h3>And they are objects</h3>
        <p class="note" style="margin-top:0">Real <code>Trends.Meter</code> objects, in the client's
           state, with an object's lifetime. The view entity's own rows are not.</p>
      </div>
    </div>
    <p class="note step" data-step="3">Which is the case for the other option, when all you needed was
       to know <em>which one</em>.</p>`
},
{
  id: "id-string", label: "The flat one", kind: "result",
  narration: "So: the string. One statement, one join, no second retrieve, and nothing materialised. What comes back is Mendix's own object id as text - still enough to fetch the real meter the day something needs it.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>The same reference, flat</h2>
    <p class="sub">mdl/31-id-as-string.mdl &middot; docs/sql/11, second half</p>
    <div class="card">
<pre><span class="kw">SELECT</span> ... <span class="kw">FROM</span> ( <span class="kw">SELECT</span> <span class="mark" data-step="1"><span class="kw">CAST</span>("m"."id" <span class="kw">AS</span> varchar) <span class="kw">AS</span> "MeterId"</span>,
       "m"."metercode", ...                      <span class="cm">-- 3 more columns</span>
       <span class="kw">FROM</span> "trends$reading" "r"
       <span class="kw">INNER JOIN</span> "trends$meter" "m" <span class="kw">ON</span> "m"."id" = "r"."trends$reading_meter"
       <span class="kw">GROUP BY</span> "m"."id", ... ) "Trends.MeterMonthIdVE"</pre>
    </div>
    <div class="card step" data-step="2" style="margin-top:26px">
<pre>{ "meterId": "18577348462903560", "periodYear": 2023,
  "monthNo": 10, "meterCode": "M-002", "totalKwh": 522.0 }</pre>
    </div>
    <p class="note step" data-step="2">One statement. The join came back, and the second retrieve went away.</p>`
},
{
  id: "choose", label: "Choosing", kind: "result",
  narration: "Choose by what the screen actually does. If it walks the reference - shows fields off it, navigates to it - take the association. If it only needs to know which one, carry the string.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>Which one, when</h2>
    <div class="card">
      <table>
        <tr><th></th><th>association</th><th>id as string</th></tr>
        <tr><td>statements per page</td><td>2</td><td class="n">1</td></tr>
        <tr><td>the view's own SQL</td><td>no join</td><td>one join</td></tr>
        <tr><td>objects in the client</td><td>one per distinct target</td><td class="accent">none</td></tr>
        <tr><td>read fields off the target</td><td>yes, directly</td><td>only after retrieving it</td></tr>
      </table>
    </div>
    <p class="note step" data-step="1">A screen that shows the meter's code and region wants the
       association: those two columns come for one extra statement.</p>
    <p class="note step" data-step="2">A screen that only groups, filters or links by meter wants the
       string &mdash; and stays one statement wide.</p>`
},
{
  id: "compose", label: "Composing", kind: "command",
  narration: "Now the second half. A view entity can read another view entity. This one reads the monthly view and never mentions the readings table at all.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>A view entity reading a view entity</h2>
    <p class="sub">mdl/22-composed-view.mdl</p>
    <div class="card">
<pre><span class="kw">create view entity</span> Trends.MeterYearVE (
  MeterCode: <span class="kw">String</span>(20), PeriodYear: <span class="kw">Integer</span>,
  TotalKwh: <span class="kw">Decimal</span>, MonthsCovered: <span class="kw">Integer</span>, BusiestMonthKwh: <span class="kw">Decimal</span>
) <span class="kw">as</span> (
  <span class="kw">select</span> v.MeterCode <span class="kw">as</span> MeterCode, v.PeriodYear <span class="kw">as</span> PeriodYear
  ,      <span class="kw">sum</span>(v.TotalKwh) <span class="kw">as</span> TotalKwh, <span class="kw">count</span>(v.MonthNo) <span class="kw">as</span> MonthsCovered
  ,      <span class="kw">max</span>(v.TotalKwh) <span class="kw">as</span> BusiestMonthKwh
  <span class="kw">from</span>   <span class="mark" data-step="1">Trends.MeterMonthVE <span class="kw">as</span> v</span>
  <span class="kw">group by</span> v.MeterCode, v.PeriodYear
);</pre>
    </div>
    <p class="note step" data-step="2">No <code>Trends.Reading</code> anywhere in it. &ldquo;Per month&rdquo;
       is defined once, and this builds on the definition rather than repeating it.</p>`
},
{
  id: "compose-rows", label: "The rows", kind: "result",
  narration: "Eighteen rows: six meters, three years. Each one is a sum of twelve monthly totals, which were themselves sums of daily readings.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>6570, then 216, then 18</h2>
    <p class="sub">mxcli oql &middot; Trends.MeterYearVE, first rows</p>
    <div class="cols">
      <div class="col card" style="flex:1.5">
        <table>
          <tr><th>MeterCode</th><th class="n">PeriodYear</th><th class="n">TotalKwh</th><th class="n">Months</th><th class="n">Busiest month</th></tr>
          <tr><td>M-001</td><td class="n">2023</td><td class="n">5466</td><td class="n">12</td><td class="n">472</td></tr>
          <tr><td>M-001</td><td class="n">2024</td><td class="n">5484</td><td class="n">12</td><td class="n">474</td></tr>
          <tr><td>M-001</td><td class="n">2025</td><td class="n">5460</td><td class="n">12</td><td class="n">472</td></tr>
          <tr><td colspan="5" class="dim">... 15 more</td></tr>
        </table>
      </div>
      <div class="col">
        <div class="card step" data-step="1">
          <h3>Rows at each level</h3>
          <table>
            <tr><td>readings</td><td class="n">6570</td></tr>
            <tr><td>MeterMonthVE</td><td class="n">216</td></tr>
            <tr><td><b>MeterYearVE</b></td><td class="n"><b>18</b></td></tr>
          </table>
        </div>
        <p class="note step" data-step="2"><span class="accent">BusiestMonthKwh is a max of sums</span> &mdash;
          only expressible because the month view exists.</p>
      </div>
    </div>`
},
{
  id: "compose-sql", label: "Underneath", kind: "result",
  narration: "Underneath it is still one statement. Your view entity becomes a subquery, and the one it reads becomes a subquery inside that. Two levels, one round trip.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>One statement, nested twice</h2>
    <p class="sub">docs/sql/13-composed-view.sql &middot; abridged</p>
    <div class="card">
<pre><span class="kw">SELECT</span> "MeterCode", "PeriodYear", ...          <span class="cm">-- 3 more columns</span>
<span class="kw">FROM</span> ( <span class="step cm" data-step="1">-- MeterYearVE</span>
       <span class="kw">SELECT</span> "v"."MeterCode", <span class="kw">SUM</span>("v"."TotalKwh"), <span class="kw">MAX</span>("v"."TotalKwh"), ...
       <span class="kw">FROM</span> ( <span class="step cm" data-step="1">-- MeterMonthVE, unchanged and unaware</span>
              <span class="kw">SELECT</span> "m"."metercode", <span class="kw">SUM</span>("r"."kwh"), ...
              <span class="kw">FROM</span> "trends$reading" "r"
              <span class="kw">INNER JOIN</span> "trends$meter" "m" <span class="kw">ON</span> ...
              <span class="kw">GROUP BY</span> "m"."metercode", ... ) "v"
       <span class="kw">GROUP BY</span> "v"."MeterCode", "v"."PeriodYear" ) "Trends.MeterYearVE"</pre>
    </div>
    <p class="note step" data-step="2">The inner view does not know it is being read.
       <span class="accent">Nothing about it changed</span> when this one was written.</p>`
},
{
  id: "compose-plan", label: "The plan", kind: "result",
  narration: "The plan shows the two groupings stacked. Read it bottom up: six and a half thousand readings, collapsed to two hundred and sixteen months, collapsed to eighteen years. Five point six milliseconds.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>Two aggregates, stacked</h2>
    <p class="sub">EXPLAIN ANALYZE &middot; docs/sql/14-plan-composed.txt &middot; 8 of 15 plan lines</p>
    <div class="card">
<pre><span class="kw">Limit</span> (actual rows=18)
  -&gt; <span class="kw">HashAggregate</span> (actual rows=18)              <span class="step cm" data-step="1">&lt;- the year view</span>
       Group Key: m.metercode, EXTRACT(year ...)
       -&gt; <span class="kw">HashAggregate</span> (actual rows=216)        <span class="step cm" data-step="1">&lt;- the month view</span>
            Group Key: m.metercode, EXTRACT(year ...), EXTRACT(month ...)
            -&gt; <span class="kw">Hash Join</span> (actual rows=6570)
                 -&gt; <span class="kw">Seq Scan</span> on "trends$reading" r (actual rows=6570)
                 -&gt; Hash -&gt; Seq Scan on "trends$meter" m (actual rows=6)
<span class="cm">Execution Time: 5.627 ms</span></pre>
    </div>
    <p class="note step" data-step="2"><span class="accent">Each level you compose is one more grouping the planner keeps.</span>
       Nothing is materialised in between.</p>`
},
{
  id: "compose-filter", label: "Still pushes down", kind: "result",
  narration: "And the question that decides whether composing is safe: does a filter on the outer view still reach the bottom? It does. Filter the year view by meter, and the condition travels through both groupings to the index on the meter table.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 3 }],
  html: `
    <h2>The filter still reaches the index</h2>
    <p class="sub">EXPLAIN ANALYZE &middot; docs/sql/14-plan-composed.txt &middot; the same view, <code>WHERE MeterCode = 'M-004'</code></p>
    <div class="card">
<pre><span class="kw">Limit</span> (actual rows=3)
  -&gt; <span class="kw">GroupAggregate</span> (actual rows=3)
       -&gt; <span class="kw">GroupAggregate</span> (actual rows=36)
            -&gt; Sort (actual rows=1095)
                 -&gt; <span class="kw">Hash Join</span> (actual rows=1095)
                      -&gt; Seq Scan on "trends$reading" r (actual rows=6570)
                      -&gt; Hash -&gt; <span class="mark" data-step="1">Bitmap Index Scan on
                              idx_trends$meter_metercode_asc (rows=1)</span>
<span class="cm">Execution Time: 1.664 ms</span></pre>
    </div>
    <p class="note step" data-step="2">1095 readings, 36 months, 3 years &mdash; against 6570, 216 and 18.
       Composing did not cost the pushdown.</p>`
},
{
  id: "limits", label: "Where it stops", kind: "result",
  narration: "Two limits worth knowing before you build a tower. Each level is a grouping the planner has to keep, so nesting is not free even when it is cheap. And order by needs a limit, which makes a nested top-N a different animal from a nested aggregate.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>Two things to know before you stack them</h2>
    <div class="cols">
      <div class="col card step" data-step="1">
        <h3>Levels are not free</h3>
        <p class="note" style="margin-top:0">Every level is one more grouping in the plan. Cheap here at
           three levels and 6570 rows; measure it before assuming at thirty times that.</p>
      </div>
      <div class="col card step" data-step="2">
        <h3><code>order by</code> needs <code>limit</code></h3>
        <p class="note" style="margin-top:0"><span class="accent">A sorted view entity is a top-N view</span>,
           not a sorted list. Leave the sorting to the page unless the cut is the point.</p>
      </div>
    </div>
    <p class="note step" data-step="2">Both are in <code>docs/errors-shaping.txt</code> with the text the
       tools actually print.</p>`
},
{
  id: "recap", label: "All of it", kind: "result",
  narration: "That is the second half on one screen. Cast changes a type in the query. A selected id is an association; a cast id is a string. And a view entity reading a view entity is still one statement that pushes down.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 3 }],
  html: `
    <h2>All of it, on one screen</h2>
    <div class="cols">
      <div class="col card">
        <h3>Shaping</h3>
<pre style="font-size:26px"><span class="kw">cast</span>(x <span class="kw">as</span> <span class="kw">string</span>)
  <span class="cm">-- a plain SQL CAST</span>
  <span class="cm">-- derived =&gt; String(200)</span></pre>
      </div>
      <div class="col card step" data-step="1">
        <h3>Carrying a reference</h3>
        <table style="font-size:26px">
          <tr><td>m.ID as Ref</td><td>association</td></tr>
          <tr><td>cast(m.ID …)</td><td>a string</td></tr>
          <tr><td class="dim">2 statements</td><td class="dim">1 statement</td></tr>
        </table>
      </div>
      <div class="col card step" data-step="2">
        <h3>Composing</h3>
        <table style="font-size:26px">
          <tr><td>from a view entity</td></tr>
          <tr><td class="dim">nested subqueries</td></tr>
          <tr><td><span class="accent">filters still reach</span></td></tr>
        </table>
      </div>
    </div>
    <p class="note">Define the question once, and build the next one on top of it.</p>`
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
      <div class="take">define the question once</div>
    </div>`
},
];
}));
