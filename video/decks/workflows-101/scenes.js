// Film 5 - why workflows exist, for someone who has never built a process.
//
// Same system as films 1-4 (video-system/DESIGN-LANGUAGE.md). Everything on
// screen is captured from app-workflow/ in this repository - Mendix 11.14.0,
// security on - and the source is named on each frame. The captures are in
// docs/workflow/.
//
// Frame 23 ("whole") is the slot for a Studio Pro screenshot of the workflow
// editor. Until one exists it carries the model's own outline instead; when the
// screenshot lands, caption it with its Studio Pro version the way film 3's
// photographed frames are.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SCENES = factory();
}(typeof self !== 'undefined' ? self : this, function () {

return [
{
  id: "title", label: "", kind: "declarative",
  narration: "Some work finishes before you let go of the mouse. Some waits three days for a manager on holiday. Mendix has a tool for each. This is the second.",
  steps: 1, cues: [{ step: 1, s: 1 }],
  noChrome: true,
  html: `
    <div class="tag">Mendix 11.14.0 &middot; workflows &middot; from zero</div>
    <h1>Why workflows exist</h1>
    <p class="sub" style="max-width:1500px">A microflow finishes. A process
       <span class="accent">waits</span> &mdash; and the waiting is the whole reason.</p>
    <div class="step" data-step="1" style="font-size:28px;color:var(--dim)">
      Every log line, row and activity record on the following screens was
      captured from the app in this repository.
    </div>`
},
{
  id: "microflow", label: "A microflow", kind: "command",
  narration: "A microflow is one transaction: Start, one retrieve, End. Four milliseconds, and then it is gone. All of it happens, or none of it.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>One transaction, start to finish</h2>
    <p class="sub">docs/workflow/09-microflow-trace.txt &middot; MicroflowEngine at TRACE</p>
    <div class="card">
<pre>09:07:18.<span class="mark">177</span>  Starting execution of microflow 'Trends.DS_CheckForTask'
09:07:18.177  Executing activity: <span class="str">"type":"Start"</span>
09:07:18.177  Executing activity: <span class="str">"caption":"Retrieve ReadingCheck from database"</span>
09:07:18.181  Executing activity: <span class="str">"type":"End"</span>
09:07:18.<span class="mark">181</span>  Finished execution of microflow 'Trends.DS_CheckForTask'</pre>
    </div>
    <p class="note step" data-step="2"><span class="accent">Four milliseconds.</span>
       Nothing is left behind, and there is nothing to come back to.</p>`
},
{
  id: "wait", label: "Now add a person", kind: "result",
  narration: "Now put a person in the middle. You cannot hold a transaction open until they are back from lunch. Something has to remember where.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 3 }],
  html: `
    <h2>A transaction cannot wait</h2>
    <p class="sub">The same flow, with a decision only a person can make in it</p>
    <div class="card">
<pre>Start  ->  flag the reading  ->  <span class="cm">[ somebody looks at it ]</span>  ->  record what they said  ->  End
                                <span class="step cm" data-step="1">^ minutes, or three days</span></pre>
    </div>
    <p class="note step" data-step="2">The transaction has to close here, so the work splits in two.
       <span class="accent">Something has to hold the place in between</span>, and it has to survive
       the app being restarted.</p>`
},
{
  id: "by-hand", label: "What people build", kind: "command",
  narration: "Here is what everyone builds first. A status attribute, a page filtered on it, a microflow for each move. Thousands of apps run on this.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 3 }],
  html: `
    <h2>A status attribute, and three microflows</h2>
    <p class="sub">mdl/workflow/40-domain.mdl &middot; this app carries one too</p>
    <div class="card">
<pre><span class="kw">create enumeration</span> Trends.ENUM_CheckStatus (
  Open            <span class="str">'Waiting for review'</span>,
  Accepted        <span class="str">'Accepted'</span>,
  Rejected        <span class="str">'Rejected'</span>,
  ReReadRequested <span class="str">'Re-read requested'</span>,
  Escalated       <span class="str">'Escalated to a supervisor'</span>
);</pre>
    </div>
    <p class="note step" data-step="2">Five values, a page that filters on them, and a microflow that
       moves each one along. <span class="accent">This is not wrong.</span> It is where everybody
       starts, and it carries real apps.</p>`
},
{
  id: "by-hand-cost", label: "What it cannot say", kind: "result",
  narration: "Until it is asked something it cannot answer. Who has this one. How long has it sat there. And what is the process?",
  steps: 3, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }, { step: 3, s: 4 }],
  html: `
    <h2>Four questions, and nothing to point at</h2>
    <p class="sub">All of them ordinary; none of them answerable from an enumeration</p>
    <div class="card">
<pre>Who has this one right now?              <span class="step cm" data-step="1">-- the attribute does not say</span>
How long has it been sitting there?      <span class="step cm" data-step="1">-- nor when it changed</span>
What happened to it before?              <span class="step cm" data-step="2">-- overwritten each time</span>
And what IS the process?                 <span class="step cm" data-step="2">-- read the microflows and hope</span></pre>
    </div>
    <p class="note step" data-step="3">The process is real, and it is
       <span class="accent">nowhere in the model</span>. It lives in whichever microflows happen to
       set that attribute, and in somebody's head.</p>`
},
{
  id: "what-is", label: "Two words", kind: "declarative",
  narration: "A workflow is that process drawn once, and run by an engine that keeps its place. The drawing is the definition. Each thing going through it is an instance.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 3 }],
  noChrome: true,
  html: `
    <h2 style="margin-bottom:38px">Definition, and instance</h2>
    <div class="cols">
      <div class="col">
        <div class="tag">definition</div>
        <p class="sub" style="margin-top:18px">The drawing. One per process, in the model, versioned
           with the app. <code>Trends.CheckReading</code>.</p>
      </div>
      <div class="col step" data-step="1">
        <div class="tag">instance</div>
        <p class="sub" style="margin-top:18px">One thing going through it. Rows in the database,
           with a place in the drawing.</p>
      </div>
    </div>
    <p class="note step" data-step="2" style="margin-top:44px">Everything that follows is about the
       second one: <span class="accent">where an instance keeps its place, and what that buys you</span>.</p>`
},
{
  id: "case", label: "The case", kind: "result",
  narration: "Six meters, three years of readings, and this one is three times its neighbours. No query knows if that is a fault or a cold week. A person looks.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 3 }],
  html: `
    <h2>One reading, and nobody to ask</h2>
    <p class="sub">docs/workflow/01-outlier.txt &middot; meter M-004, March 2025</p>
    <div class="card">
<pre>| ReadAt                       | Kwh |
| Sun Mar 09 00:00:00 UTC 2025 |  22 |
| Mon Mar 10 00:00:00 UTC 2025 |  23 |
| Tue Mar 11 00:00:00 UTC 2025 |  <span class="mark">62</span> |   <span class="step cm" data-step="1">&lt;- three times its neighbours</span>
| Wed Mar 12 00:00:00 UTC 2025 |  25 |
| Thu Mar 13 00:00:00 UTC 2025 |  26 |</pre>
    </div>
    <p class="note step" data-step="2">A broken meter, or a cold week?
       <span class="accent">Nothing in the data decides this.</span> Somebody has to look, and that
       is where a query stops being the answer.</p>`
},
{
  id: "context", label: "Context entity", kind: "command",
  narration: "One flagged reading, one instance. That is the context entity, and it must be persistent: the instance outlives the request.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>Every instance is <em>about</em> something</h2>
    <p class="sub">mdl/workflow/40-domain.mdl &middot; the same model in Studio Pro 11.14.0 Beta</p>
    <div class="card">
<pre><span class="kw">create or replace workflow</span> Trends.CheckReading
  <span class="kw">parameter</span> $Context: Trends.ReadingCheck</pre>
    </div>
    <img class="shot step" data-step="1" style="margin-top:16px;max-height:286px"
         src="shots/wf-domain-model.png" alt="the Trends domain model">
    <p class="note step" data-step="2">One <code>ReadingCheck</code>, one instance &mdash; with its own
       association to <code>System.Workflow</code>, off to the left.
       <span class="accent">It has to be persistent</span>: the instance outlives the request.</p>`
},
{
  id: "first", label: "The smallest one", kind: "command",
  narration: "The smallest workflow that does anything: one user task, one page. Thirteen lines, and mxcli writes it into the model.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>One task is a workflow</h2>
    <p class="sub">mxcli exec mdl/workflow/44-workflow.mdl -p WorkflowExample.mpr</p>
    <div class="card">
<pre><span class="kw">user task</span> Review <span class="str">'Review the flagged reading'</span>
  <span class="kw">page</span> Trends.TaskReview
  <span class="kw">outcomes</span>
    <span class="str">'Accept'</span> { }
    <span class="str">'Reject'</span> { }
    <span class="str">'Ask for a re-read'</span> { };</pre>
    </div>
    <div class="card step" data-step="1" style="margin-top:24px">
<pre>Connected to: WorkflowExample.mpr (Mendix 11.14.0)
<span class="accent">Created workflow: Trends.CheckReading</span></pre>
    </div>`
},
{
  id: "usertask", label: "User task", kind: "result",
  narration: "A user task is a page plus outcomes. The outcomes are the branches — accept, reject, ask for a re-read — each one a button, and a path out.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 2 }],
  html: `
    <h2>The outcomes are the branches</h2>
    <p class="sub">docs/workflow/06-describe.txt &middot; describe workflow Trends.CheckReading</p>
    <div class="card">
<pre><span class="kw">outcomes</span>
  <span class="str">'Accept'</span>            { <span class="cm">-- a supervisor countersigns a big one</span> }
  <span class="str">'Reject'</span>            { <span class="cm">-- record it and close</span> }
  <span class="str">'Ask for a re-read'</span> { <span class="cm">-- wait, then ask again</span> }</pre>
    </div>
    <p class="note step" data-step="2">Each outcome is a button on the task's page and
       <span class="accent">a path out of the box</span>. Whichever one is chosen, the instance
       carries on from there.</p>`
},
{
  id: "page", label: "The task page", kind: "command",
  narration: "The page binds to System dot WorkflowUserTask, the platform's own entity for a step somebody has to do.",
  steps: 1, cues: [{ step: 1, s: 1 }],
  html: `
    <h2>A page bound to the platform's own entity</h2>
    <p class="sub">docs/workflow/shots/02-task-crop.png &middot; captured from the running app</p>
    <img class="shot" src="../docs/workflow/shots/02-task-crop.png" alt="the task page">
    <p class="note">Three buttons, and the reading it is asking about.
       <span class="accent">You did not make <code>System.WorkflowUserTask</code></span> &mdash;
       every workflow in every Mendix app uses it.</p>`
},
{
  id: "start", label: "Starting one", kind: "command",
  narration: "Instances do not start themselves. A microflow calls the workflow with the object it is about, and returns immediately.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>A microflow starts it, and lets go</h2>
    <p class="sub">mdl/workflow/46-start.mdl &middot; Trends.ACT_StartCheck</p>
    <div class="card">
<pre>$Wf = <span class="kw">call workflow</span> Trends.CheckReading(WorkflowContext = $Check);
<span class="kw">change</span> $Check (Trends.ReadingCheck_Workflow = $Wf);
<span class="kw">commit</span> $Check;</pre>
    </div>
    <div class="card step" data-step="1" style="margin-top:24px">
<pre>08:51:24.531 INFO - Trends: <span class="accent">Started a review for meter M-004</span></pre>
    </div>
    <p class="note step" data-step="2">It returns straight away. Whatever happens next happens
       without it.</p>`
},
{
  id: "state", label: "Where it went", kind: "result",
  narration: "So where did it go? Into the database. One row for the step the instance is on, one for the open task.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 3 }],
  html: `
    <h2>An instance is rows</h2>
    <p class="sub">docs/workflow/02-instance.txt &middot; OQL against the running app</p>
    <div class="card">
<pre>| Instance          | State      | Definition          |
| 13510798882111622 | InProgress | Trends.CheckReading |</pre>
    </div>
    <div class="card step" data-step="1" style="margin-top:22px">
<pre>| Task              | State      | Name                       |
| 14918173765664919 | InProgress | Review the flagged reading |</pre>
    </div>
    <p class="note step" data-step="2">Two rows the engine wrote.
       <span class="accent">The process's place is a row</span> &mdash; not a variable, not a thread,
       not a queue in memory.</p>`
},
{
  id: "restart", label: "The proof", kind: "result",
  narration: "Which is the point. Stop the app. Start it again. Same instance, same step, same open task. That is what the status attribute pretended to be.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 4 }],
  html: `
    <h2>Stop the app. Start it again.</h2>
    <p class="sub">docs/workflow/03-restart.txt &middot; nothing else touched the database</p>
    <div class="card">
<pre>08:36:10.204 INFO - Core: Mendix Runtime is now shut down.
08:36:57.800 INFO - Core: Mendix Runtime successfully started.</pre>
    </div>
    <div class="card step" data-step="1" style="margin-top:22px">
<pre>| Instance          | State      |        | Task              | State      |
| <span class="mark">13510798882111622</span> | InProgress |        | <span class="mark">14918173765664919</span> | InProgress |</pre>
    </div>
    <p class="note step" data-step="2">The same two ids, on the same step.
       <span class="accent">That is the whole difference</span>, and everything else in this film is
       detail hanging off it.</p>`
},
{
  id: "targeting", label: "Who sees it", kind: "command",
  narration: "Who sees it. Targeting takes an XPath or a microflow, and decides who the task shows up for.",
  steps: 1, cues: [{ step: 1, s: 2 }],
  html: `
    <h2>Targeting decides whose list it is on</h2>
    <p class="sub">mdl/workflow/44-workflow.mdl &middot; the user task's targeting clause</p>
    <div class="card">
<pre><span class="kw">user task</span> Review <span class="str">'Review the flagged reading'</span>
  <span class="kw">targeting xpath</span> <span class="str">'[System.UserRoles/System.UserRole/Name = ''Reviewer'']'</span></pre>
    </div>
    <p class="note"><span class="accent">A plain grid over the open tasks</span> is all a task
       inbox is &mdash; this one is the reviewer's.</p>
    <img class="shot step" data-step="1" style="margin-top:18px"
         src="../docs/workflow/shots/01-inbox-crop.png" alt="the reviewer's inbox">`
},
{
  id: "claim", label: "The afternoon", kind: "result",
  narration: "Now the one that costs everybody an afternoon. Targeting decides who can see a task. It does not assign it. Complete an unclaimed task and nothing happens.",
  steps: 3, cues: [{ step: 1, s: 2 }, { step: 2, s: 3 }, { step: 3, s: 4 }],
  html: `
    <h2>Targeting is not assignment</h2>
    <p class="sub">docs/workflow/04-unclaimed.txt &middot; the trap, run on purpose</p>
    <div class="card">
<pre><span class="kw">set task outcome</span> $Task <span class="str">'Accept'</span>;   <span class="cm">-- without claiming it first</span></pre>
    </div>
    <div class="card step" data-step="1" style="margin-top:20px">
<pre>mx check:  0 errors, 0 warnings.        the build:  succeeded.
the screen after clicking:  unchanged.</pre>
    </div>
    <div class="card step" data-step="2" style="margin-top:20px">
<pre><span class="accent">08:40:54.153 ERROR - Client: You can’t complete this user task,
             it is not assigned to you.</span></pre>
    </div>
    <p class="note step" data-step="3">One line in a log nobody had open. That is the entire
       report.</p>`
},
{
  id: "outcome", label: "Claiming", kind: "command",
  narration: "Claiming is a plain write to Assignees. Then set task outcome finishes the task with the name of a branch.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }],
  html: `
    <h2>Three statements, and the order matters</h2>
    <p class="sub">mdl/workflow/42-task-actions.mdl &middot; Trends.ACT_Accept</p>
    <div class="card">
<pre><span class="kw">change</span> $Task (System.WorkflowUserTask_Assignees = [%CurrentUser%]);
<span class="kw">commit</span> $Task;
<span class="kw">set task outcome</span> $Task <span class="str">'Accept'</span>;</pre>
    </div>
    <p class="note step" data-step="1">There is no <code>assign task</code> statement and no
       <code>complete task</code>: claiming is
       <span class="accent">an ordinary write to an ordinary association</span>.</p>
    <p class="note step" data-step="2" style="margin-top:16px">mxcli check warns when the claim is
       missing (MDL-WORKFLOW10). Mendix does not.</p>`
},
{
  id: "decision", label: "Branching", kind: "result",
  narration: "A decision is an expression over WorkflowContext. Whatever you named the parameter, the engine calls it that, and it is case-sensitive.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 2 }],
  html: `
    <h2>A decision reads the context</h2>
    <p class="sub">mdl/workflow/44-workflow.mdl &middot; docs/workflow/08-full-run.txt</p>
    <div class="card">
<pre><span class="kw">decision</span> decisionBig <span class="str">'$WorkflowContext/Kwh &gt; 50'</span>
  <span class="kw">outcomes</span>
    <span class="kw">true</span>  -&gt; { <span class="cm">-- notify the owner, then a supervisor countersigns</span> }
    <span class="kw">false</span> -&gt; { <span class="cm">-- record it and close</span> };</pre>
    </div>
    <div class="card step" data-step="1" style="margin-top:22px">
<pre>08:51:38 | Decision | Finished | <span class="accent">true</span>        <span class="cm">-- 62 kWh, so it goes up</span></pre>
    </div>
    <p class="note">Whatever you called the parameter, the engine calls it
       <code>$WorkflowContext</code> &mdash; and from 11.9 the spelling is case-sensitive.</p>`
},
{
  id: "timer", label: "The timer", kind: "command",
  narration: "Three days, no answer, escalate. Attach a timer to the task and the engine wakes it. No microflow does this.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 3 }],
  html: `
    <h2>Three days, no answer</h2>
    <p class="sub">mdl/workflow/44-workflow.mdl &middot; the same event in Studio Pro 11.14.0 Beta</p>
    <div class="card">
<pre><span class="kw">boundary event interrupting timer</span> <span class="str">'addDays([%CurrentDateTime%], 3)'</span> {
  <span class="kw">call microflow</span> Trends.ACT_Escalate <span class="kw">with</span> (Check = <span class="str">'$WorkflowContext'</span>);
  <span class="cm">-- 2 more lines: the jump back, and the close</span></pre>
    </div>
    <img class="shot step" data-step="1" style="margin-top:18px;max-height:296px"
         src="shots/wf-boundary-kind.png" alt="the boundary event's interrupting and timer properties">
    <p class="note step" data-step="2"><span class="accent">There is no microflow that does this.</span>
       Not a slow one &mdash; none.</p>`
},
{
  id: "timer-fired", label: "It fires", kind: "result",
  narration: "Filmed at sixty seconds rather than three days, and the frame says so. Nobody was logged in. The instance moved on its own.",
  steps: 2, cues: [{ step: 1, s: 1 }, { step: 2, s: 3 }],
  html: `
    <h2>Nobody was logged in</h2>
    <p class="sub">docs/workflow/05-timer.txt &middot; filmed at 60 seconds, not three days</p>
    <div class="card">
<pre>08:53:45 | (boundary timer)           | Finished
08:54:45 | ACT_Escalate               | Finished    <span class="step cm" data-step="1">&lt;- 60 seconds later</span>
08:54:45 | Review                     | Finished    <span class="step cm" data-step="1">&lt;- the jump</span>
08:54:45 | Review the flagged reading | Suspended   <span class="step cm" data-step="1">&lt;- a fresh task</span></pre>
    </div>
    <p class="note step" data-step="2">No browser was open between those two lines.
       <span class="accent">The instance moved on its own</span>, and the task that had been waiting
       is Aborted &mdash; which is what <em>interrupting</em> means.</p>`
},
{
  id: "jump", label: "Loops", kind: "command",
  narration: "And a loop. Ask for a re-read jumps back to the review task. The same statement rescues a stuck instance.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 3 }],
  html: `
    <h2>A jump is a loop, and an escape hatch</h2>
    <p class="sub">mdl/workflow/44-workflow.mdl &middot; two of them in this process</p>
    <div class="card">
<pre><span class="str">'Ask for a re-read'</span> {
  <span class="kw">wait for timer</span> timerReread <span class="str">'addDays([%CurrentDateTime%], 1)'</span>;
  <span class="kw">jump to</span> Review;
}</pre>
    </div>
    <p class="note step" data-step="1">The meter is read again out in the field, and the same question
       goes back in front of the same people.</p>
    <p class="note step" data-step="2" style="margin-top:16px">An administrator moving a stuck instance
       uses <span class="accent">the same statement</span>.</p>`
},
{
  id: "trace", label: "The record", kind: "result",
  narration: "And this is what it leaves behind. Every step, when it happened, which way it went. Nobody wrote that table.",
  steps: 2, cues: [{ step: 1, s: 3 }, { step: 2, s: 3 }],
  html: `
    <h2>One instance, start to finish</h2>
    <p class="sub">docs/workflow/08-full-run.txt &middot; two people, four buttons, minutes apart</p>
    <div class="card">
<pre>08:51:24 | Start                          | Finished |
08:51:24 | Review the flagged reading     | Finished | Accept
08:51:24 | (boundary timer)               | Aborted  |
08:51:38 | Decision                       | Finished | true
08:51:38 | ACT_NotifyOwner                | Finished |
08:51:38 | Countersign a large correction | Finished | Accept
08:52:22 | ACT_LogOutcome                 | Finished |
08:52:22 | End                            | Finished |</pre>
    </div>
    <p class="note step" data-step="1">Nobody wrote that table.
       <span class="accent">It is what a process leaves behind by being one</span> &mdash; and it is
       the answer to all four questions the status attribute could not take.</p>`
},
{
  id: "whole", label: "The whole thing", kind: "result",
  narration: "That is the whole process, as Studio Pro draws it. You are not meant to read it — only to see that it has a shape.",
  steps: 1, cues: [{ step: 1, s: 2 }],
  html: `
    <h2>One process, two ways of holding it</h2>
    <p class="sub">mdl/workflow/44-workflow.mdl &middot; the same document, in Studio Pro 11.14.0 Beta</p>
    <div class="cols">
      <div class="col">
        <img class="shot" style="max-height:420px" src="shots/wf-canvas.png"
             alt="the CheckReading workflow on the Studio Pro canvas">
      </div>
      <div class="col">
        <div class="card">
<pre><span class="kw">user task</span> Review
  <span class="kw">outcomes</span>
    <span class="str">'Accept'</span> { <span class="kw">decision</span> decisionBig }
    <span class="str">'Reject'</span> { log }
    <span class="str">'Ask for a re-read'</span> { <span class="kw">jump</span> }
  <span class="kw">boundary event interrupting timer</span>
    { escalate; <span class="kw">jump to</span> Review; };
<span class="cm">-- 47 more lines, written out</span></pre>
        </div>
      </div>
    </div>
    <p class="note step" data-step="1">One task, three branches, a second look, a timer off to the side.
       <span class="accent">The status attribute never had a shape.</span></p>`
},
{
  id: "edges", label: "What gets past", kind: "result",
  narration: "And the same lesson, worse. A boundary timer that does not say whether it interrupts passes check and passes the build. Then the app does not start at all.",
  steps: 3, cues: [{ step: 1, s: 1 }, { step: 2, s: 2 }, { step: 3, s: 3 }],
  html: `
    <h2>check passed. 0 errors. No app.</h2>
    <p class="sub">docs/workflow/10-bare-boundary-timer.txt &middot; mxcli's own documented example</p>
    <div class="card">
<pre><span class="kw">boundary event timer</span> <span class="str">'addDays([%CurrentDateTime%], 3)'</span> {   <span class="cm">&lt;- no kind named</span>
  <span class="kw">call microflow</span> Trends.ACT_Escalate <span class="kw">with</span> (Check = <span class="str">'$WorkflowContext'</span>);
};</pre>
    </div>
    <div class="card step" data-step="1" style="margin-top:20px">
<pre>mxcli check:  Check passed!        mxbuild:  0 errors.</pre>
    </div>
    <div class="card step" data-step="2" style="margin-top:20px">
<pre><span class="accent">RuntimeException: aborting model initialization
(Class 'Workflows$TimerBoundaryEvent' could not be found).</span></pre>
    </div>
    <p class="note step" data-step="3">Not the workflow &mdash; the app. Write
       <code>interrupting</code> or <code>non interrupting</code> and it boots.</p>`
},
{
  id: "when-not", label: "When not to", kind: "result",
  narration: "Most of your logic is not this. No person, no waiting, nothing to watch — that is a microflow. Use one when the process must survive somebody going home.",
  steps: 2, cues: [{ step: 1, s: 2 }, { step: 2, s: 3 }],
  html: `
    <h2>Most logic is still a microflow</h2>
    <p class="sub">The test, in one line</p>
    <div class="cols">
      <div class="col">
        <div class="tag">microflow</div>
        <p class="sub" style="margin-top:18px">No person in the middle. No waiting. No branch anybody
           needs to watch. It finishes.</p>
      </div>
      <div class="col step" data-step="1">
        <div class="tag">workflow</div>
        <p class="sub" style="margin-top:18px">Somebody has to decide, and the process has to be there
           when they get back.</p>
      </div>
    </div>
    <p class="note step" data-step="2" style="margin-top:40px">A workflow around a two-hundred
       millisecond calculation is an engine with nothing to do.
       <span class="accent">Use one when the process has to survive somebody going home.</span></p>`
},
{
  id: "lockup", label: "", kind: "declarative",
  narration: "",
  steps: 1, cues: [],
  noChrome: true,
  html: `
    <h1 style="margin-bottom:30px">Why workflows exist</h1>
    <p class="sub" style="max-width:1400px">app-workflow/ &middot; mdl/workflow/ &middot;
       docs/09-workflows.md</p>
    <p class="note" style="margin-top:44px"><span class="accent">github.com/ako/view-entity-examples</span></p>`
}
];
}));
