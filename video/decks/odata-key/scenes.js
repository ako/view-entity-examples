// Film 1 - the fan-out view entity and the OData key.
//
// Conformed to video-system/DESIGN-LANGUAGE.md: one accent event per frame,
// flat plane, mono at the 30px floor, no glyph outside the shipped cmap. The
// narration and every captured artefact are unchanged from the first cut; what
// changed is how they are presented, and that captured output too long for the
// frame is now cut explicitly and marked.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SCENES = factory();
}(typeof self !== 'undefined' ? self : this, function () {

return [
{
  id: "title", label: "", kind: "declarative",
  narration: "A view entity that fans out has a compound key, and one part of it is almost always an enumeration. Mendix will not let that enumeration into an OData key. Here is why, what quietly breaks if you work around it the obvious way, and what the database actually does with the fix.",
  steps: 2, cues: [{"step": 1, "s": 2}],
  noChrome: true,
  html: `
    <div class="tag">Mendix 10.24.24 &middot; view entities &middot; published OData</div>
    <h1>The fan-out view entity<br>and the OData key</h1>
    <p class="sub" style="max-width:1500px">One profile, one quarter, three contract types &mdash;
       and <span class="accent">an enumeration that is not allowed to identify the row it identifies</span>.</p>
    <div class="step" data-step="1" style="font-size:28px;color:var(--dim)">
      Everything on screen is captured from a running app: the build error, the JSON,
      the SQL and the query plan.
    </div>`
},
{
  id: "model", label: "Domain model", kind: "command",
  narration: "The domain model is ordinary. A profile holds contracts. Every contract has a type, and that type is an enumeration: permanent, temporary or freelance. Submission lines hang off a contract, one per quarter. Three persistable entities, two associations, nothing clever.",
  steps: 2, cues: [{"step": 1, "s": 2}, {"step": 2, "s": 4}],
  html: `
    <h2>Three persistable entities</h2>
    <p class="sub">Module <code>Submissions</code></p>
    <div class="dm">
      <svg>
        <line x1="1248" y1="110" x2="1104" y2="110" stroke="#262828" stroke-width="1"/>
        <line x1="624"  y1="110" x2="480"  y2="110" stroke="#262828" stroke-width="1"/>
      </svg>
      <div class="ent" style="left:0;top:20px">
        <div class="hd"><span>Profile</span></div>
        <div class="at"><span>ProfileNumber</span><span class="t">Integer</span></div>
        <div class="at"><span>Name</span><span class="t">String(100)</span></div>
      </div>
      <div class="ent" style="left:624px;top:20px">
        <div class="hd"><span>Contract</span></div>
        <div class="at"><span>ContractNumber</span><span class="t">String(20)</span></div>
        <div class="at"><span class="mark" data-step="1">ContractType</span><span class="t">Enumeration</span></div>
      </div>
      <div class="ent" style="left:1248px;top:20px">
        <div class="hd"><span>SubmissionLine</span></div>
        <div class="at"><span>SubmissionYear</span><span class="t">Integer</span></div>
        <div class="at"><span>QuarterNo</span><span class="t">Integer</span></div>
        <div class="at"><span>Amount</span><span class="t">Decimal</span></div>
      </div>
      <div class="lbl" style="left:342px;top:290px;width:420px;text-align:center">Contract_Profile</div>
      <div class="lbl" style="left:966px;top:290px;width:420px;text-align:center">SubmissionLine_Contract</div>
      <div class="callout step" data-step="2" style="left:624px;top:370px;max-width:1000px">
        Permanent, Temporary, Freelance. An enumeration, like every other status
        or category field in every other app &mdash; and a profile can hold
        contracts of several types at once.
      </div>
    </div>`
},
{
  id: "fanout", label: "The fan-out", kind: "result",
  narration: "Two view entities over the same twelve submission lines. The first gives one row per profile per quarter. Add contract type to it and profile three hundred, which holds all three types, fans out into three rows for the same quarter. Both views are correct; only the grain differs.",
  steps: 2, cues: [{"step": 1, "s": 2}, {"step": 2, "s": 3}],
  html: `
    <h2>Same data, two grains</h2>
    <p class="sub">12 submission lines &middot; 3 profiles &middot; 2 quarters of 2025</p>
    <div class="cols">
      <div class="col card">
        <h3>QuarterSubmissionVE &mdash; 6 rows</h3>
        <table>
          <tr><th>profile</th><th>year</th><th>Q</th><th class="n">total</th></tr>
          <tr><td>100</td><td>2025</td><td>1</td><td class="n">1000.00</td></tr>
          <tr><td>200</td><td>2025</td><td>1</td><td class="n">2250.00</td></tr>
          <tr class="hl"><td>300</td><td>2025</td><td>1</td><td class="n">3455.50</td></tr>
          <tr><td colspan="4" class="dim">... 3 more</td></tr>
        </table>
        <p class="note">Key: profile + year + quarter. Three Integers, all publishable.</p>
      </div>
      <div class="col card step" data-step="1">
        <h3>QuarterSubmissionPerTypeVE &mdash; 12 rows</h3>
        <table>
          <tr><th>profile</th><th>Q</th><th>contract type</th><th class="n">total</th></tr>
          <tr class="hl"><td>300</td><td>1</td><td>Freelance</td><td class="n">55.50</td></tr>
          <tr class="hl"><td>300</td><td>1</td><td>Permanent</td><td class="n">3000.00</td></tr>
          <tr class="hl"><td>300</td><td>1</td><td>Temporary</td><td class="n">400.00</td></tr>
          <tr><td colspan="4" class="dim">... 9 more</td></tr>
        </table>
        <p class="note step" data-step="2">One quarter of profile 300 is
           <span class="accent">three rows</span>, separated only by the enumeration.</p>
      </div>
    </div>`
},
{
  id: "oql", label: "OQL", kind: "command",
  narration: "The fan-out is one term in the group by. Leave contract type out and you get six rows; put it in and you get twelve. That single term is also the whole difficulty, because it is now part of what identifies a row.",
  steps: 2, cues: [{"step": 2, "s": 1}, {"step": 1, "s": 2}],
  html: `
    <h2>The fan-out is one term in <span class="kw">group by</span></h2>
    <p class="sub">mdl/02-view-entities.mdl &middot; 8 of 21 lines</p>
    <div class="card">
<pre><span class="kw">create view entity</span> Submissions.QuarterSubmissionPerTypeVE (
  ...  <span class="cm">-- 5 attribute lines</span>
) <span class="kw">as</span> (
  <span class="kw">select</span> p.ProfileNumber, sl.SubmissionYear, sl.QuarterNo
  ,      <span class="step" data-step="1">c.ContractType    <span class="kw">as</span> ContractType</span>
  ,      <span class="kw">sum</span>(sl.Amount), <span class="kw">count</span>(sl.ID)
  <span class="kw">from</span>   Submissions.SubmissionLine <span class="kw">as</span> sl  <span class="cm">-- 2 joins</span>
  <span class="kw">group by</span> p.ProfileNumber, sl.SubmissionYear, sl.QuarterNo<span class="mark" data-step="2">, c.ContractType</span>
);</pre>
    </div>
    <p class="note step" data-step="2">Drop the marked term and this is
      <code>QuarterSubmissionVE</code>. Keep it and the row can only be
      identified with the enumeration in hand.</p>`
},
{
  id: "block", label: "The constraint", kind: "result",
  narration: "Publish it, mark the enumeration as the fourth part of the key, and the build stops. Read the message carefully: the allowed set is stored String, Integer, Long and AutoNumber. Enumerations are not the only thing excluded. Decimal, DateTime, Boolean and any calculated attribute fail in exactly the same way.",
  steps: 2, cues: [{"step": 1, "s": 0, "d": 2.4}, {"step": 2, "s": 1}],
  html: `
    <h2>Publish it &mdash; and the build stops</h2>
    <p class="sub">docs/build-error.txt &middot; Mendix 10.24.24.119653</p>
    <div class="card">
<pre>  <span class="kw">expose</span> (
    ProfileNumber <span class="kw">as</span> 'profileNumber'  (key, Filterable),
    ...  <span class="cm">-- periodYear, quarterNo, both key</span>
    <span class="mark" data-step="1">ContractType  <span class="kw">as</span> 'contractType'   (key, Filterable)</span>,
    ...  <span class="cm">-- 2 more</span>
  );</pre>
    </div>
    <div class="card step" data-step="2" style="margin-top:26px">
<pre style="white-space:pre-wrap"><span class="cm">ERROR</span> at Submissions, Published OData service 'BlockedApi',
Published entity 'QuarterSubmissionPerTypeVE': Only stored
attributes which are of type (String, Integer, Long or
AutoNumber) are supported as a key.</pre>
    </div>`
},
{
  id: "trap", label: "The trap", kind: "result",
  narration: "So the obvious move is to take the enumeration out of the key and leave the other three. That builds. It is also the worst outcome available. Three rows now share one key, and asking for that key answers two hundred OK with an arbitrary one of them: fifty-five fifty, out of a quarter that totals three thousand four hundred and fifty-five fifty. Nothing in the metadata or the payload says the key is not unique.",
  steps: 3, cues: [{"step": 1, "s": 2}, {"step": 2, "s": 3, "d": 3}, {"step": 3, "s": 4}],
  html: `
    <h2>Dropping the enumeration from the key is not a workaround</h2>
    <p class="sub">docs/responses/03 and 04 &middot; QuarterSubmissionPerTypeBroken</p>
    <div class="cols">
      <div class="col card">
        <h3>Three rows, one key</h3>
        <table>
          <tr><th>profile</th><th>year</th><th>Q</th><th>contractType</th><th class="n">totalAmount</th></tr>
          <tr><td>300</td><td>2025</td><td>1</td><td>Freelance</td><td class="n">55.50</td></tr>
          <tr><td>300</td><td>2025</td><td>1</td><td>Permanent</td><td class="n">3000.00</td></tr>
          <tr><td>300</td><td>2025</td><td>1</td><td>Temporary</td><td class="n">400.00</td></tr>
        </table>
        <p class="note">Key <code>(300, 2025, 1)</code> for all three.
           Quarter total 3455.50.</p>
      </div>
      <div class="col">
        <div class="card step" data-step="1">
          <h3>GET that key</h3>
<pre>GET .../QuarterSubmissionPerTypeBroken(
      profileNumber=300,periodYear=2025,quarterNo=1)</pre>
        </div>
        <div class="card step" data-step="2" style="margin-top:26px">
          <h3>200 OK</h3>
<pre>{ "profileNumber": 300, "quarterNo": 1,
  "contractType": "Freelance",
  <span class="mark" data-step="3">"totalAmount": 55.50000000</span> }</pre>
        </div>
        <p class="note step" data-step="3">55.50 of 3455.50. No error, no
          duplicate-key complaint, nothing in <code>$metadata</code>.</p>
      </div>
    </div>`
},
{
  id: "cast", label: "Workaround A", kind: "result",
  narration: "The fix is one line of OQL. Cast the enumeration to a string. What comes back is the enumeration value name - Freelance, not its caption - as a two hundred character string, which is exactly what a key is allowed to be. Group by stays on the enumeration; the cast is an expression over a column that is already grouped.",
  steps: 2, cues: [{"step": 1, "s": 1}, {"step": 2, "s": 3}],
  html: `
    <h2>Cast the enumeration to a String</h2>
    <p class="sub">mdl/02-view-entities.mdl &middot; QuarterSubmissionPerTypeApiVE</p>
    <div class="cols">
      <div class="col card">
<pre>  <span class="kw">select</span> p.ProfileNumber, sl.SubmissionYear,
         sl.QuarterNo, c.ContractType
  ,      <span class="mark" data-step="1"><span class="kw">cast</span>(c.ContractType <span class="kw">as string</span>)
           <span class="kw">as</span> ContractTypeKey</span>
  ,      <span class="kw">sum</span>(sl.Amount)
  <span class="kw">from</span>   ...
  <span class="kw">group by</span> p.ProfileNumber, sl.SubmissionYear,
           sl.QuarterNo, c.ContractType</pre>
        <p class="note step" data-step="2">No extra grouping term: the cast is an
          expression over a column already in the <code>group by</code>.</p>
      </div>
      <div class="col card step" data-step="1">
        <h3>One row of the result</h3>
        <table>
          <tr><th>attribute</th><th>type</th><th>value</th></tr>
          <tr><td>QuarterNo</td><td class="dim">Integer</td><td>1</td></tr>
          <tr><td>ContractType</td><td class="dim">Enumeration</td><td>Freelance</td></tr>
          <tr class="hl"><td>ContractTypeKey</td><td class="dim">String(200)</td><td>'Freelance'</td></tr>
          <tr><td>TotalAmount</td><td class="dim">Decimal</td><td>55.50</td></tr>
          <tr><td colspan="3" class="dim">... 3 more</td></tr>
        </table>
      </div>
    </div>`
},
{
  id: "keyed", label: "The working resource", kind: "result",
  narration: "Publish that String as the fourth part of the key and the resource works. And look at what the URL carries: the word Freelance - the same word the body carries, because Mendix already serialises an enumeration as a string. Both properties are Edm dot String in the metadata.",
  steps: 3, cues: [{"step": 1, "s": 0, "d": 2.2}, {"step": 3, "s": 1}, {"step": 2, "s": 2}],
  html: `
    <h2>The key the service will accept</h2>
    <p class="sub">docs/metadata/submissions-v1.xml &middot; docs/responses/05</p>
    <div class="card">
<pre>&lt;<span class="kw">Key</span>&gt;
  &lt;PropertyRef Name="profileNumber"/&gt;  &lt;PropertyRef Name="periodYear"/&gt;
  &lt;PropertyRef Name="quarterNo"/&gt;  <span class="mark" data-step="1">&lt;PropertyRef Name="contractTypeKey"/&gt;</span>
&lt;/<span class="kw">Key</span>&gt;
<span class="step" data-step="2">&lt;Property Name="contractTypeKey" Type="Edm.String" MaxLength="200"/&gt;</span></pre>
    </div>
    <div class="card step" data-step="3" style="margin-top:26px">
<pre>GET .../QuarterSubmissionPerType(profileNumber=300,periodYear=2025,
        quarterNo=1,contractTypeKey='Freelance')

200  { "contractTypeKey": "Freelance", "contractType": "Freelance",
       "totalAmount": 55.50000000 }</pre>
    </div>`
},
{
  id: "sql", label: "In the database", kind: "result",
  narration: "Now, underneath. A view entity is not a table and nothing is materialised. One GET produces one statement: the view's OQL inlined as a derived table, and the OData query options wrapped around it. Your filter arrives as a bound parameter in the outer where clause. The cast is a plain SQL cast - the workaround costs one expression in a select list. And every key column gets a not-null guard, because a null key could not be addressed.",
  steps: 4, cues: [{"step": 1, "s": 2}, {"step": 3, "s": 3}, {"step": 2, "s": 4}, {"step": 4, "s": 5}],
  html: `
    <h2>One <code>GET</code>, one statement</h2>
    <p class="sub">ConnectionBus_Retrieve at TRACE &middot; docs/sql/01-filter-pushdown.sql</p>
    <div class="card">
<pre><span class="cm">-- GET .../QuarterSubmissionPerType?$filter=contractTypeKey eq 'Freelance'
-- SELECT "v"."ProfileNumber", ... 7 columns, then:</span>
<span class="kw">FROM</span> <span class="step" data-step="1">( <span class="kw">SELECT</span> "p"."profilenumber", "sl"."submissionyear", "sl"."quarterno",
         "c"."contracttype",
         <span class="step" data-step="2"><span class="kw">CAST</span>("c"."contracttype" <span class="kw">AS</span> varchar) <span class="kw">AS</span> "ContractTypeKey",</span>
         <span class="kw">SUM</span>("sl"."amount"), <span class="kw">COUNT</span>("sl"."id")
  <span class="kw">FROM</span> "submissions$submissionline" "sl"  <span class="cm">-- + 2 INNER JOINs</span>
  <span class="kw">GROUP BY</span> "p"."profilenumber", ... <span class="cm">-- 4 grouping terms</span> )</span> "v"
<span class="kw">WHERE</span> <span class="step" data-step="4">(<span class="kw">NOT</span> "v"."ProfileNumber" <span class="kw">IS NULL</span>) <span class="kw">AND</span> ... <span class="cm">-- 3 guards</span></span>
  <span class="kw">AND</span> <span class="mark" data-step="3">"v"."ContractTypeKey" = ?</span>
<span class="kw">LIMIT</span> ?          <span class="cm">-- params: Freelance, 3000</span></pre>
    </div>`
},
{
  id: "plan", label: "Query plan", kind: "result",
  narration: "And PostgreSQL pushes that filter further than Mendix did. Watch where it lands: not on the aggregate, but on the base table scan, underneath the join. Six contracts become two before anything is joined or grouped, so four rows are aggregated instead of twelve. Notice too that contract type has dropped out of the group key - the planner knows an equality filter pinned it to a single value.",
  steps: 3, cues: [{"step": 1, "s": 1, "d": 1.6}, {"step": 2, "s": 2}, {"step": 3, "s": 3, "d": 1.5}],
  html: `
    <h2>The filter lands on the base table, not on the view</h2>
    <p class="sub">EXPLAIN ANALYZE &middot; docs/sql/02-plan-with-filter.txt &middot; 9 of 23 plan lines</p>
    <div class="cols">
      <div class="col card" style="flex:1.5">
<pre><span class="kw">Limit</span>  (actual rows=4)
  -&gt; <span class="kw">GroupAggregate</span>  (actual rows=4)
       <span class="step" data-step="3">Group Key: p.profilenumber, sl.submissionyear, sl.quarterno</span>
       -&gt; Sort
            -&gt; Hash Join  (actual rows=4)
                 -&gt; Seq Scan on submissions$profile p  (rows=3)
                 -&gt; Hash  ... <span class="cm">-- 2 lines</span>
                      -&gt; <span class="kw">Seq Scan on</span> submissions$contract c  (rows=2)
                           <span class="mark" data-step="1">Filter: contracttype = 'Freelance'
                           Rows Removed by Filter: 4</span>
<span class="cm">Execution Time: 0.241 ms</span></pre>
      </div>
      <div class="col">
        <div class="card step" data-step="2">
          <h3>Without the filter</h3>
<pre><span class="kw">HashAggregate</span> (rows=12)
  Group Key: ... , c.contracttype
  -&gt; Seq Scan c (rows=6)</pre>
          <p class="note">12 rows grouped, 12 returned.</p>
        </div>
        <p class="note step" data-step="3">6 contracts -&gt; 2, before the join.
          And <code>contracttype</code> is gone from the group key: the equality
          pinned it.</p>
      </div>
    </div>`
},
{
  id: "broken-sql", label: "The trap, underneath", kind: "result",
  narration: "The non-unique key is worth one more look from down here. A request that must answer with exactly one object runs three predicates and a limit of three thousand. The database returns three rows. There is no limit one, there is no error, and no layer notices. The runtime serialises the first row it was handed.",
  steps: 2, cues: [{"step": 1, "s": 2}, {"step": 2, "s": 3}],
  html: `
    <h2>What the non-unique key runs</h2>
    <p class="sub">GET QuarterSubmissionPerTypeBroken(profileNumber=300,periodYear=2025,quarterNo=1)</p>
    <div class="card">
<pre><span class="kw">WHERE</span> "v"."ProfileNumber" = ? <span class="kw">AND</span> "v"."PeriodYear" = ?
  <span class="kw">AND</span> "v"."QuarterNo" = ?
<span class="kw">LIMIT</span> ?          <span class="cm">-- params: 300, 2025, 1, 3000</span></pre>
    </div>
    <div class="cols" style="margin-top:30px">
      <div class="col card step" data-step="1">
        <h3>Rows the database returned</h3>
        <div class="accent" style="font-size:120px;line-height:1.1;font-weight:700">3</div>
        <p class="note">for a request that must answer with one object</p>
      </div>
      <div class="col card step" data-step="2">
        <h3>What the client got</h3>
        <div style="font-size:120px;line-height:1.1;font-weight:700">200</div>
        <p class="note">the first row of the three &mdash; Freelance, 55.50</p>
      </div>
      <div class="col step" data-step="2">
        <p class="note" style="margin-top:0">No <code>LIMIT 1</code>.<br>No error.<br>
        No annotation in <code>$metadata</code>.<br><br>
        A client that re-reads a row by key reads a different row.</p>
      </div>
    </div>`
},
{
  id: "close", label: "Three options", kind: "result",
  narration: "So: a String shadow of the enumeration, which is one line of OQL and one expression in the SQL. A reference entity, if the enumeration was straining anyway. Or one composite id, when the consumer wants a single opaque key. All three are workarounds for a restriction the wire format does not need - the value is already a string in the payload, Mendix already accepts it as a string in a filter, and OData version four permits an enumeration as a key property.",
  steps: 2, cues: [{"step": 1, "s": 3}, {"step": 2, "s": 3, "d": 4}],
  html: `
    <h2>Three ways to key the fan-out</h2>
    <div class="cols" style="margin-bottom:30px">
      <div class="col card">
        <h3>A &mdash; String shadow</h3>
<pre style="font-size:30px" class="accent"><span class="kw">cast</span>(c.ContractType <span class="kw">as string</span>)</pre>
        <p class="note">One OQL line, one SQL expression.
           Duplicated value in the payload.</p>
      </div>
      <div class="col card">
        <h3>B &mdash; Reference entity</h3>
<pre style="font-size:30px">key on ContractType.Code</pre>
        <p class="note">The right model when the list is real reference data.
           A domain-model change, and a join.</p>
      </div>
      <div class="col card">
        <h3>C &mdash; Composite id</h3>
<pre style="font-size:30px">'300-2025Q1-Temporary'</pre>
        <p class="note">One key segment for consumers that store row references.
           The format becomes a contract.</p>
      </div>
    </div>
    <div class="card step" data-step="1">
      <h3>Why this is worth asking Mendix to lift</h3>
      <p class="note" style="margin-top:0">
        The enumeration is already <code>Edm.String</code> in
        <code>$metadata</code> and already a string in every payload, and
        <code>$filter=contractType eq 'Freelance'</code> works today against the
        enumeration itself.
        <span class="step" data-step="2">The key predicate would carry the identical literal &mdash;
        and OData v4 permits an enumeration type as a key property.</span></p>
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
      <div class="take">an enumeration is already a string on the wire</div>
    </div>`
},
];
}));
