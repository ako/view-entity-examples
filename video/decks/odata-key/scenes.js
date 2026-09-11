// The film's content. One entry per scene: what is said, what is on screen, and
// how many progressive reveals the recorder should step through.
//
// Everything factual here is copied from the repo's captured artefacts -
// docs/responses/, docs/sql/, docs/build-error.txt - not retyped from memory.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SCENES = factory();
}(typeof self !== 'undefined' ? self : this, function () {

const ROW = (c, cells, cls) =>
  `<tr class="${cls || ''}">` + cells.map((v, i) =>
    `<td class="${c[i] || ''}">${v}</td>`).join('') + '</tr>';

return [

// ---------------------------------------------------------------- 1. title
{
  id: 'title', label: '',
  narration: "A view entity that fans out has a compound key, and one part of it is almost always an enumeration. Mendix will not let that enumeration into an OData key. Here is why, what quietly breaks if you work around it the obvious way, and what the database actually does with the fix.",
  steps: 2,
  cues: [{"step": 1, "s": 2}],
  html: `
    <div style="margin:auto 0">
      <div class="tag">Mendix 10.24.24 &middot; view entities &middot; published OData</div>
      <h1>The fan-out view entity<br>and the OData key</h1>
      <p class="sub" style="max-width:1180px">One profile, one quarter, three contract types &mdash;
         and an enumeration that is not allowed to identify the row it identifies.</p>
      <div class="step" data-step="1" style="font-size:24px;color:var(--dim)">
        Everything on screen is captured from a running app: the build error, the JSON,
        the SQL and the query plan.
      </div>
    </div>`
},

// ---------------------------------------------------------------- 2. domain model
{
  id: 'model', label: 'Domain model',
  narration: "The domain model is ordinary. A profile holds contracts. Every contract has a type, and that type is an enumeration: permanent, temporary or freelance. Submission lines hang off a contract, one per quarter. Three persistable entities, two associations, nothing clever.",
  steps: 2,
  cues: [{"step": 1, "s": 2}, {"step": 2, "s": 4}],
  html: `
    <h2>Three persistable entities</h2>
    <p class="sub">Module <code>Submissions</code></p>
    <div class="dm">
      <svg><defs>
        <marker id="ar" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
          <path d="M1,1 L11,6 L1,11" fill="none" stroke="#9fb3cd" stroke-width="2"/></marker>
       </defs>
        <line x1="1180" y1="96" x2="1010" y2="96" stroke="#9fb3cd" stroke-width="2" marker-end="url(#ar)"/>
        <line x1="620"  y1="96" x2="450"  y2="96" stroke="#9fb3cd" stroke-width="2" marker-end="url(#ar)"/>
      </svg>
      <div class="ent" style="left:110px;top:40px">
        <div class="hd"><span>Profile</span><span class="k">persistable</span></div>
        <div class="at"><span class="n">ProfileNumber</span><span class="t">Integer</span></div>
        <div class="at"><span class="n">Name</span><span class="t">String(100)</span></div>
      </div>
      <div class="ent" style="left:670px;top:40px">
        <div class="hd"><span>Contract</span><span class="k">persistable</span></div>
        <div class="at"><span class="n">ContractNumber</span><span class="t">String(20)</span></div>
        <div class="at e"><span class="n">ContractType</span><span class="t">Enumeration</span></div>
      </div>
      <div class="ent" style="left:1230px;top:40px">
        <div class="hd"><span>SubmissionLine</span><span class="k">persistable</span></div>
        <div class="at"><span class="n">SubmissionYear</span><span class="t">Integer</span></div>
        <div class="at"><span class="n">QuarterNo</span><span class="t">Integer</span></div>
        <div class="at"><span class="n">Amount</span><span class="t">Decimal</span></div>
      </div>
      <div class="lbl" style="left:452px;top:62px">Contract_Profile</div>
      <div class="lbl" style="left:1012px;top:62px">SubmissionLine_Contract</div>
      <div class="callout step" data-step="1" style="left:670px;top:250px">
        <b style="color:#7fd4f5">ContractType</b> &mdash; Permanent, Temporary, Freelance.<br>
        An enumeration, like every other status or category field in every other app.
      </div>
      <div class="callout step" data-step="2" style="left:110px;top:250px;max-width:380px">
        A profile can hold contracts of <b>several types at once</b>.<br>
        That is where the fan-out comes from.
      </div>
    </div>`
},

// ---------------------------------------------------------------- 3. the fan-out
{
  id: 'fanout', label: 'The fan-out',
  narration: "Two view entities over the same twelve submission lines. The first gives one row per profile per quarter. Add contract type to it and profile three hundred, which holds all three types, fans out into three rows for the same quarter. Both views are correct; only the grain differs.",
  steps: 2,
  cues: [{"step": 1, "s": 2}, {"step": 2, "s": 3}],
  html: `
    <h2>Same data, two grains</h2>
    <p class="sub">12 submission lines &middot; 3 profiles &middot; 2 quarters of 2025</p>
    <div class="cols">
      <div class="col card">
        <h3>QuarterSubmissionVE &mdash; 6 rows</h3>
        <table>
          <tr><th>profile</th><th>year</th><th>Q</th><th style="text-align:right">total</th></tr>
          ${ROW(['','','','n'],['100','2025','1','1000.00'])}
          ${ROW(['','','','n'],['100','2025','2','1100.00'])}
          ${ROW(['','','','n'],['200','2025','1','2250.00'])}
          ${ROW(['','','','n'],['200','2025','2','2360.00'])}
          ${ROW(['','','','n'],['300','2025','1','3455.50'],'hl')}
          ${ROW(['','','','n'],['300','2025','2','3576.50'])}
        </table>
        <p class="note">Key: profile + year + quarter. Three Integers, all publishable.</p>
      </div>
      <div class="col card step" data-step="1">
        <h3>QuarterSubmissionPerTypeVE &mdash; 12 rows</h3>
        <table>
          <tr><th>profile</th><th>year</th><th>Q</th><th>contract type</th><th style="text-align:right">total</th></tr>
          ${ROW(['','','','enum','n'],['100','2025','1','Permanent','1000.00'])}
          ${ROW(['','','','enum','n'],['200','2025','1','Freelance','250.00'])}
          ${ROW(['','','','enum','n'],['200','2025','1','Permanent','2000.00'])}
          ${ROW(['','','','enum','n'],['300','2025','1','Freelance','55.50'],'hl')}
          ${ROW(['','','','enum','n'],['300','2025','1','Permanent','3000.00'],'hl')}
          ${ROW(['','','','enum','n'],['300','2025','1','Temporary','400.00'],'hl')}
          ${ROW(['','','','','n'],['&hellip;','','','',''])}
        </table>
        <p class="note step" data-step="2">One quarter of profile 300 is now
           <b class="warn">three rows</b>, separated only by the enumeration.</p>
      </div>
    </div>`
},

// ---------------------------------------------------------------- 4. the OQL
{
  id: 'oql', label: 'OQL',
  narration: "The fan-out is one term in the group by. Leave contract type out and you get six rows; put it in and you get twelve. That single term is also the whole difficulty, because it is now part of what identifies a row.",
  steps: 2,
  cues: [{"step": 2, "s": 1}, {"step": 1, "s": 2}],
  html: `
    <h2>The fan-out is one term in <span class="kw">group by</span></h2>
    <p class="sub">mdl/02-view-entities.mdl</p>
    <div class="card">
<pre><span class="kw">create view entity</span> Submissions.QuarterSubmissionPerTypeVE (
  ProfileNumber: <span class="kw">Integer</span>, PeriodYear: <span class="kw">Integer</span>, QuarterNo: <span class="kw">Integer</span>,
  ContractType: <span class="kw">Enumeration</span>(Submissions.ContractType),
  TotalAmount: <span class="kw">Decimal</span>, LineCount: <span class="kw">Integer</span>
) <span class="kw">as</span> (
  <span class="kw">select</span> p.ProfileNumber   <span class="kw">as</span> ProfileNumber
  ,      sl.SubmissionYear <span class="kw">as</span> PeriodYear
  ,      sl.QuarterNo      <span class="kw">as</span> QuarterNo
  ,      <span class="mark" data-step="1">c.ContractType    <span class="kw">as</span> ContractType</span>
  ,      <span class="fn">sum</span>(sl.Amount)    <span class="kw">as</span> TotalAmount
  ,      <span class="fn">count</span>(sl.ID)      <span class="kw">as</span> LineCount
  <span class="kw">from</span>   Submissions.SubmissionLine <span class="kw">as</span> sl
    <span class="kw">inner join</span> sl/Submissions.SubmissionLine_Contract/Submissions.Contract <span class="kw">as</span> c
    <span class="kw">inner join</span> c/Submissions.Contract_Profile/Submissions.Profile <span class="kw">as</span> p
  <span class="kw">group by</span> p.ProfileNumber, sl.SubmissionYear, sl.QuarterNo<span class="mark hot" data-step="2">, c.ContractType</span>
);</pre>
      <p class="note step" data-step="2">Drop the marked term and this is
        <code>QuarterSubmissionVE</code>. Keep it and the row can only be
        identified with the enumeration in hand.</p>
    </div>`
},

// ---------------------------------------------------------------- 5. the block
{
  id: 'block', label: 'The constraint',
  narration: "Publish it, mark the enumeration as the fourth part of the key, and the build stops. Read the message carefully: the allowed set is stored String, Integer, Long and AutoNumber. Enumerations are not the only thing excluded. Decimal, DateTime, Boolean and any calculated attribute fail in exactly the same way.",
  steps: 2,
  cues: [{"step": 1, "s": 0, "d": 2.4}, {"step": 2, "s": 1}],
  html: `
    <h2>Publish it &mdash; and the build stops</h2>
    <p class="sub">docs/build-error.txt &middot; Mendix 10.24.24.119653</p>
    <div class="card" style="margin-bottom:24px">
<pre>  <span class="cm">publish entity</span> Submissions.QuarterSubmissionPerTypeVE <span class="kw">as</span> <span class="str">'QuarterSubmissionPerType'</span>
  <span class="kw">expose</span> (
    ProfileNumber <span class="kw">as</span> <span class="str">'profileNumber'</span>  (<span class="keycol">key</span>, Filterable, Sortable),
    PeriodYear    <span class="kw">as</span> <span class="str">'periodYear'</span>     (<span class="keycol">key</span>, Filterable, Sortable),
    QuarterNo     <span class="kw">as</span> <span class="str">'quarterNo'</span>      (<span class="keycol">key</span>, Filterable, Sortable),
    <span class="mark hot" data-step="1">ContractType  <span class="kw">as</span> <span class="str">'contractType'</span>   (<span class="keycol">key</span>, Filterable, Sortable)</span>,
    TotalAmount   <span class="kw">as</span> <span class="str">'totalAmount'</span>    (Filterable, Sortable)
  );</pre>
    </div>
    <div class="err step" data-step="2">
      <b>ERROR</b> at Submissions, Published OData service 'BlockedApi',
      Published entity 'QuarterSubmissionPerTypeVE':<br>
      Only stored attributes which are of type
      <b>(String, Integer, Long or AutoNumber)</b> are supported as a key.
    </div>
    <p class="note step" data-step="2">Four types, and the attribute must be stored.
       Decimal, DateTime, Boolean and calculated attributes are out too.</p>`
},

// ---------------------------------------------------------------- 6. the trap
{
  id: 'trap', label: 'The trap',
  narration: "So the obvious move is to take the enumeration out of the key and leave the other three. That builds. It is also the worst outcome available. Three rows now share one key, and asking for that key answers two hundred OK with an arbitrary one of them: fifty-five fifty, out of a quarter that totals three thousand four hundred and fifty-five fifty. Nothing in the metadata or the payload says the key is not unique.",
  steps: 3,
  cues: [{"step": 1, "s": 2}, {"step": 2, "s": 3, "d": 3.0}, {"step": 3, "s": 4}],
  html: `
    <h2>Dropping the enumeration from the key <span class="bad">is not a workaround</span></h2>
    <p class="sub">docs/responses/03 and 04 &middot; QuarterSubmissionPerTypeBroken</p>
    <div class="cols">
      <div class="col card">
        <h3>Three rows, one key</h3>
        <table>
          <tr><th>profile</th><th>year</th><th>Q</th><th>contractType</th><th style="text-align:right">totalAmount</th></tr>
          ${ROW(['','','','enum','n'],['300','2025','1','Freelance','55.50'],'hl')}
          ${ROW(['','','','enum','n'],['300','2025','1','Permanent','3000.00'],'hl')}
          ${ROW(['','','','enum','n'],['300','2025','1','Temporary','400.00'],'hl')}
        </table>
        <p class="note">The key is <code>(300, 2025, 1)</code> for all three.
           Quarter total: <b>3455.50</b>.</p>
      </div>
      <div class="col">
        <div class="card step" data-step="1">
          <h3>GET that key</h3>
<pre style="font-size:19px">GET .../QuarterSubmissionPerTypeBroken(
      profileNumber=300,periodYear=2025,quarterNo=1)</pre>
        </div>
        <div class="card step" data-step="2" style="margin-top:22px">
          <h3><span class="ok">200 OK</span></h3>
<pre style="font-size:20px">{ "profileNumber": 300, "periodYear": 2025, "quarterNo": 1,
  <span class="enum">"contractType": "Freelance"</span>,
  <span class="bad">"totalAmount": 55.50000000</span>, "lineCount": 1 }</pre>
        </div>
        <p class="note step" data-step="3">
          <b class="bad">55.50 of 3455.50.</b> No error, no duplicate-key complaint,
          and nothing in <code>$metadata</code> that would warn a client.</p>
      </div>
    </div>`
},

// ---------------------------------------------------------------- 7. the cast
{
  id: 'cast', label: 'Workaround A',
  narration: "The fix is one line of OQL. Cast the enumeration to a string. What comes back is the enumeration value name - Freelance, not its caption - as a two hundred character string, which is exactly what a key is allowed to be. Group by stays on the enumeration; the cast is an expression over a column that is already grouped.",
  steps: 2,
  cues: [{"step": 1, "s": 1}, {"step": 2, "s": 3}],
  html: `
    <h2>Cast the enumeration to a String</h2>
    <p class="sub">mdl/02-view-entities.mdl &middot; QuarterSubmissionPerTypeApiVE</p>
    <div class="cols">
      <div class="col card">
<pre>  <span class="kw">select</span> p.ProfileNumber   <span class="kw">as</span> ProfileNumber
  ,      sl.SubmissionYear <span class="kw">as</span> PeriodYear
  ,      sl.QuarterNo      <span class="kw">as</span> QuarterNo
  ,      c.ContractType    <span class="kw">as</span> ContractType
  ,      <span class="mark hot" data-step="1"><span class="fn">cast</span>(c.ContractType <span class="kw">as string</span>) <span class="kw">as</span> ContractTypeKey</span>
  ,      <span class="fn">sum</span>(sl.Amount)    <span class="kw">as</span> TotalAmount
  <span class="kw">from</span>   ...
  <span class="kw">group by</span> p.ProfileNumber, sl.SubmissionYear,
           sl.QuarterNo, c.ContractType</pre>
        <p class="note step" data-step="2">No extra grouping term: the cast is an
          expression over a column that is already in the <code>group by</code>.</p>
      </div>
      <div class="col card step" data-step="1">
        <h3>One row of the result</h3>
        <table>
          <tr><th>attribute</th><th>type</th><th>value</th></tr>
          ${ROW([], ['ProfileNumber','<span class="t">Integer</span>','300'])}
          ${ROW([], ['PeriodYear','<span class="t">Integer</span>','2025'])}
          ${ROW([], ['QuarterNo','<span class="t">Integer</span>','1'])}
          ${ROW([], ['ContractType','<span class="enum">Enumeration</span>','<span class="enum">Freelance</span>'])}
          ${ROW([], ['<span class="keycol">ContractTypeKey</span>','<span class="keycol">String(200)</span>','<span class="keycol">\'Freelance\'</span>'],'hl')}
          ${ROW([], ['TotalAmount','<span class="t">Decimal</span>','55.50'])}
        </table>
        <p class="note step" data-step="2">The enumeration <b>stays</b>, for readers.
          The String copy is what carries the key.</p>
      </div>
    </div>`
},

// ---------------------------------------------------------------- 8. keyed
{
  id: 'keyed', label: 'The working resource',
  narration: "Publish that String as the fourth part of the key and the resource works. And look at what the URL carries: the word Freelance - the same word the body carries, because Mendix already serialises an enumeration as a string. Both properties are Edm dot String in the metadata.",
  steps: 3,
  cues: [{"step": 1, "s": 0, "d": 2.2}, {"step": 3, "s": 1}, {"step": 2, "s": 2}],
  html: `
    <h2>The key the service will accept</h2>
    <p class="sub">docs/metadata/submissions-v1.xml &middot; docs/responses/05</p>
    <div class="card" style="margin-bottom:20px">
<pre style="font-size:20px">&lt;<span class="kw">EntityType</span> Name=<span class="str">"QuarterSubmissionPerTypeApiVE"</span>&gt;
  &lt;<span class="kw">Key</span>&gt;
    &lt;PropertyRef Name=<span class="str">"profileNumber"</span>/&gt; &lt;PropertyRef Name=<span class="str">"periodYear"</span>/&gt;
    &lt;PropertyRef Name=<span class="str">"quarterNo"</span>/&gt;     <span class="mark hot" data-step="1">&lt;PropertyRef Name=<span class="str">"contractTypeKey"</span>/&gt;</span>
  &lt;/<span class="kw">Key</span>&gt;
  &lt;Property Name=<span class="str">"contractTypeKey"</span> Type=<span class="str">"Edm.String"</span> MaxLength=<span class="str">"200"</span> Nullable=<span class="str">"false"</span>/&gt;
  <span class="mark" data-step="2">&lt;Property Name=<span class="str">"contractType"</span>    Type=<span class="str">"Edm.String"</span>/&gt;</span>
&lt;/<span class="kw">EntityType</span>&gt;</pre>
    </div>
    <div class="card step" data-step="3">
<pre style="font-size:20px">GET .../QuarterSubmissionPerType(profileNumber=300,periodYear=2025,
                                quarterNo=1,<span class="keycol">contractTypeKey='Freelance'</span>)

<span class="ok">200</span>  { ..., <span class="keycol">"contractTypeKey": "Freelance"</span>, <span class="enum">"contractType": "Freelance"</span>,
       "totalAmount": 55.50000000, "lineCount": 1 }</pre>
    </div>
    <p class="note step" data-step="3">Same literal in the URL and in the body.
      Both properties are <code>Edm.String</code>.</p>`
},

// ---------------------------------------------------------------- 9. the SQL
{
  id: 'sql', label: 'In the database',
  narration: "Now, underneath. A view entity is not a table and nothing is materialised. One GET produces one statement: the view's OQL inlined as a derived table, and the OData query options wrapped around it. Your filter arrives as a bound parameter in the outer where clause. The cast is a plain SQL cast - the workaround costs one expression in a select list. And every key column gets a not-null guard, because a null key could not be addressed.",
  steps: 4,
  cues: [{"step": 1, "s": 2}, {"step": 3, "s": 3}, {"step": 2, "s": 4}, {"step": 4, "s": 5}],
  html: `
    <h2>One <code>GET</code>, one statement</h2>
    <p class="sub">ConnectionBus_Retrieve at TRACE &middot; docs/sql/01-filter-pushdown.sql</p>
    <div class="card">
<pre style="font-size:19px"><span class="cm">-- GET .../QuarterSubmissionPerType?$filter=contractTypeKey eq 'Freelance'</span>

<span class="kw">SELECT</span> "v"."ProfileNumber", "v"."PeriodYear", "v"."QuarterNo",
       "v"."ContractType", "v"."ContractTypeKey", "v"."TotalAmount", "v"."LineCount"
<span class="kw">FROM</span> <span class="mark" data-step="1">( <span class="kw">SELECT</span> "p"."profilenumber" <span class="kw">AS</span> "ProfileNumber", "sl"."submissionyear" <span class="kw">AS</span> "PeriodYear",
              "sl"."quarterno" <span class="kw">AS</span> "QuarterNo", "c"."contracttype" <span class="kw">AS</span> "ContractType",
              <span class="mark hot" data-step="2"><span class="fn">CAST</span>("c"."contracttype" <span class="kw">AS</span> varchar) <span class="kw">AS</span> "ContractTypeKey"</span>,
              <span class="fn">SUM</span>("sl"."amount") <span class="kw">AS</span> "TotalAmount", <span class="fn">COUNT</span>("sl"."id") <span class="kw">AS</span> "LineCount"
       <span class="kw">FROM</span> "submissions$submissionline" "sl"
       <span class="kw">INNER JOIN</span> "submissions$contract" "c" <span class="kw">ON</span> "c"."id" = "sl"."..._contract"
       <span class="kw">INNER JOIN</span> "submissions$profile" "p" <span class="kw">ON</span> "p"."id" = "c"."..._profile"
       <span class="kw">GROUP BY</span> "p"."profilenumber", "sl"."submissionyear",
                "sl"."quarterno", "c"."contracttype" )</span> "v"
<span class="kw">WHERE</span> <span class="mark" data-step="4">(<span class="kw">NOT</span> "v"."ProfileNumber" <span class="kw">IS NULL</span>) <span class="kw">AND</span> ... <span class="kw">AND</span> (<span class="kw">NOT</span> "v"."ContractTypeKey" <span class="kw">IS NULL</span>)</span>
  <span class="kw">AND</span> <span class="mark hot" data-step="3">"v"."ContractTypeKey" = ?</span>
<span class="kw">LIMIT</span> ?                       <span class="cm">-- params: <b>Freelance</b>, 3000</span></pre>
    </div>
    <p class="note">
      <span class="step" data-step="1">Derived table, planned per call &mdash; nothing materialised. &nbsp;</span>
      <span class="step" data-step="3"><b class="warn">$filter arrives as a bound parameter.</b>
        <code>$top</code> becomes <code>LIMIT</code>, <code>$orderby</code> becomes <code>ORDER BY</code>. &nbsp;</span>
      <span class="step" data-step="4">The not-null guards are Mendix enforcing the key in SQL.</span>
    </p>`
},

// ---------------------------------------------------------------- 10. the plan
{
  id: 'plan', label: 'Query plan',
  narration: "And PostgreSQL pushes that filter further than Mendix did. Watch where it lands: not on the aggregate, but on the base table scan, underneath the join. Six contracts become two before anything is joined or grouped, so four rows are aggregated instead of twelve. Notice too that contract type has dropped out of the group key - the planner knows an equality filter pinned it to a single value.",
  steps: 3,
  cues: [{"step": 1, "s": 1, "d": 1.6}, {"step": 2, "s": 2}, {"step": 3, "s": 3, "d": 1.5}],
  html: `
    <h2>The filter lands on the base table, not on the view</h2>
    <p class="sub">EXPLAIN ANALYZE &middot; docs/sql/02-plan-with-filter.txt</p>
    <div class="cols">
      <div class="col card" style="flex:1.45">
<pre style="font-size:19px"><span class="kw">Limit</span>  (actual rows=<b class="ok">4</b>)
  -&gt; <span class="kw">GroupAggregate</span>  (actual rows=<b class="ok">4</b>)
       <span class="mark" data-step="3">Group Key: p.profilenumber, sl.submissionyear, sl.quarterno</span>
       -&gt; Sort
            -&gt; Hash Join  (actual rows=4)
                 -&gt; Seq Scan on submissions$profile p   (actual rows=3)
                 -&gt; Hash
                      -&gt; Hash Join  (actual rows=4)
                           -&gt; Seq Scan on submissions$submissionline sl  (rows=12)
                           -&gt; Hash
                                -&gt; <span class="kw">Seq Scan on</span> submissions$contract c  (actual rows=<b class="ok">2</b>)
                                     <span class="mark hot" data-step="1">Filter: ((contracttype)::text = 'Freelance')</span>
                                     <span class="mark hot" data-step="1">Rows Removed by Filter: 4</span>
<span class="cm">Execution Time: 0.241 ms</span></pre>
      </div>
      <div class="col">
        <div class="card step" data-step="2">
          <h3>Without the filter</h3>
<pre style="font-size:19px"><span class="kw">Limit</span> (actual rows=<b>12</b>)
  -&gt; <span class="kw">HashAggregate</span> (actual rows=<b>12</b>)
       Group Key: ... , c.contracttype
       -&gt; Hash Join (actual rows=12)
            -&gt; Seq Scan sl (rows=12)
            -&gt; Seq Scan c  (rows=<b>6</b>)</pre>
          <p class="note">12 rows grouped, 12 returned.</p>
        </div>
        <p class="note step" data-step="3">
          <b class="warn">6 contracts &rarr; 2, before the join.</b><br>
          And <code>contracttype</code> is gone from the group key:
          the equality pinned it.</p>
      </div>
    </div>`
},

// ---------------------------------------------------------------- 11. broken in SQL
{
  id: 'broken-sql', label: 'The trap, underneath',
  narration: "The non-unique key is worth one more look from down here. A request that must answer with exactly one object runs three predicates and a limit of three thousand. The database returns three rows. There is no limit one, there is no error, and no layer notices. The runtime serialises the first row it was handed.",
  steps: 2,
  cues: [{"step": 1, "s": 2}, {"step": 2, "s": 3}],
  html: `
    <h2>What the non-unique key runs</h2>
    <p class="sub">GET QuarterSubmissionPerTypeBroken(profileNumber=300,periodYear=2025,quarterNo=1)</p>
    <div class="card" style="margin-bottom:26px">
<pre><span class="kw">WHERE</span> "v"."ProfileNumber" = ? <span class="kw">AND</span> "v"."PeriodYear" = ? <span class="kw">AND</span> "v"."QuarterNo" = ?
<span class="kw">LIMIT</span> ?          <span class="cm">-- params: 300, 2025, 1, <b>3000</b></span></pre>
    </div>
    <div class="cols">
      <div class="col card step" data-step="1">
        <h3>Rows the database returned</h3>
        <div class="big bad" style="font-size:64px;margin:8px 0 4px">3</div>
        <p class="note">for a request that must answer with one object</p>
      </div>
      <div class="col card step" data-step="2">
        <h3>What the client got</h3>
        <div class="big ok" style="font-size:64px;margin:8px 0 4px">200</div>
        <p class="note">the first row of the three &mdash; <code>Freelance, 55.50</code></p>
      </div>
      <div class="col step" data-step="2">
        <p class="note" style="margin-top:0">No <code>LIMIT 1</code>.<br>No error.<br>
        No annotation in <code>$metadata</code>.<br><br>
        <b class="bad">A client that re-reads a row by key reads a different row.</b></p>
      </div>
    </div>`
},

// ---------------------------------------------------------------- 12. close
{
  id: 'close', label: 'Three options',
  narration: "So: a String shadow of the enumeration, which is one line of OQL and one expression in the SQL. A reference entity, if the enumeration was straining anyway. Or one composite id, when the consumer wants a single opaque key. All three are workarounds for a restriction the wire format does not need - the value is already a string in the payload, Mendix already accepts it as a string in a filter, and OData version four permits an enumeration as a key property.",
  steps: 3,
  cues: [{"step": 1, "s": 3}, {"step": 2, "s": 3, "d": 4.0}, {"step": 3, "s": 3, "d": 8.2}],
  html: `
    <h2>Three ways to key the fan-out</h2>
    <div class="cols" style="flex:0 0 auto;margin-bottom:30px">
      <div class="col card">
        <h3>A &mdash; String shadow</h3>
        <pre style="font-size:19px"><span class="fn">cast</span>(c.ContractType <span class="kw">as string</span>)</pre>
        <p class="note">One OQL line, one SQL expression.<br>
           Duplicated value in the payload.</p>
      </div>
      <div class="col card">
        <h3>B &mdash; Reference entity</h3>
        <pre style="font-size:19px">key on ContractType.Code</pre>
        <p class="note">The right model when the list is real reference data.<br>
           A domain-model change, and a join.</p>
      </div>
      <div class="col card">
        <h3>C &mdash; Composite id</h3>
        <pre style="font-size:19px"><span class="str">'300-2025Q1-Temporary'</span></pre>
        <p class="note">One key segment for consumers that store row references.<br>
           The format becomes a contract.</p>
      </div>
    </div>
    <div class="card step" data-step="1" style="border-color:#14405c;background:#08243a">
      <h3 style="color:#7fd4f5">Why this is worth asking Mendix to lift</h3>
      <div style="font-size:24px;line-height:1.65">
        <span class="step" data-step="2">The enumeration is already <code>Edm.String</code> in <code>$metadata</code>
        and already a string in every payload. &nbsp;</span>
        <span class="step" data-step="2"><code>$filter=contractType eq 'Freelance'</code> works today, against the
        enumeration itself. &nbsp;</span>
        <span class="step" data-step="3">The key predicate would carry the identical literal &mdash;
        and OData v4 permits an enumeration type as a key property.</span>
      </div>
    </div>
    <p class="note step" data-step="3" style="margin-top:auto;font-size:22px">
      github.com/ako/view-entity-examples &nbsp;&middot;&nbsp; built and captured on Mendix 10.24.24.119653</p>`
}

];
}));
