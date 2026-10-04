import { cases, caseById } from './cases.js';
import { loadLocalState, saveLocalState, getCaseState, normalizeState, mergeStates } from './storage.js';
import { CloudStore } from './supabase.js';

const appEl = document.getElementById('app');
const cloud = new CloudStore();
let state = loadLocalState();
let ui = { view: 'desk', mobileNav: false, authOpen: false, authMode: 'signin', authMessage: '', offlineDismissed: false, sync: 'local', caseQuery: '' };
let cloudSaveTimer = null;

const icons = {
  desk:'⌂', cases:'▦', overview:'◫', terminal:'>_', browser:'◎', mail:'✉', logs:'≡', evidence:'◇', board:'⌘', actions:'⚙', notes:'✎', hints:'?', theory:'∴'
};

const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const nl = (s='') => esc(s).replace(/\n/g,'<br>');

function persist({cloudToo=true} = {}) {
  state = saveLocalState(state);
  ui.sync = cloud.signedIn ? 'saving' : 'local';
  if (cloudToo && cloud.signedIn) {
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(async () => {
      try { await cloud.saveState(state); ui.sync = 'cloud'; renderTopbarOnly(); }
      catch { ui.sync = 'error'; renderTopbarOnly(); }
    }, 700);
  }
}

function caseState(caseId=state.activeCase) { return getCaseState(state, caseId); }
function setCaseState(caseId, next) {
  state.cases = { ...(state.cases || {}), [caseId]: { ...next, updatedAt: new Date().toISOString() } };
  persist();
}
function patchCase(caseId, patch) { setCaseState(caseId, { ...getCaseState(state, caseId), ...patch }); }

function openCase(id) {
  if (!caseById(id)) id = cases[0].id;
  state.activeCase = id;
  state.activeTool = 'overview';
  state.cases = { ...(state.cases || {}), [id]: { ...getCaseState(state, id), openedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } };
  ui.view = 'case';
  ui.mobileNav = false;
  persist();
  render();
  window.scrollTo({top:0,behavior:'smooth'});
}
function setTool(tool) { state.activeTool = tool; persist(); render(); }

function navItem(id, label, icon) {
  const active = ui.view === id || (id === 'case' && ui.view === 'case');
  return `<button class="nav-btn ${active?'active':''}" data-nav="${id}"><span class="nav-icon">${icon}</span>${label}</button>`;
}

function layout(content) {
  const c = caseById(state.activeCase);
  const identity = cloud.signedIn ? esc(cloud.user?.email || 'Cloud investigator') : 'Local investigator';
  return `<div class="shell">
    <aside class="sidebar ${ui.mobileNav?'open':''}" id="sidebar">
      <div class="brand"><div class="brand-mark">T/</div><div class="brand-copy"><strong>TRACE</strong><span>Cyber Investigation Lab</span></div></div>
      <nav class="nav">
        ${navItem('desk','Investigation desk',icons.desk)}
        ${navItem('cases','Case files',icons.cases)}
        ${navItem('case','Open case',icons.evidence)}
      </nav>
      <div class="sidebar-bottom">
        <div class="identity"><strong>${identity}</strong><span>${cloud.signedIn?'Cloud save enabled':'Saved in this browser'}</span></div>
        ${cloud.enabled ? `<button class="tiny-btn" data-auth>${cloud.signedIn?'Account / sync':'Sign in for cloud save'}</button>` : ''}
      </div>
    </aside>
    ${ui.mobileNav?'<button class="mobile-scrim" data-mobile-close aria-label="Close navigation"></button>':''}
    <main class="main">
      <header class="topbar" id="topbar">
        <div class="topbar-title"><button class="mobile-menu" data-mobile>☰</button><small>${ui.view==='case'?esc(c.id):'TRACE / LAB'}</small><strong>${ui.view==='case'?esc(c.title):ui.view==='cases'?'Case files':'Investigation desk'}</strong></div>
        ${syncPill()}
      </header>
      <div class="content">${content}</div>
    </main>
  </div>${authModal()}`;
}

function syncPill() {
  if (cloud.signedIn) {
    if (ui.sync === 'saving') return `<div class="sync-pill cloud" role="status">saving…</div>`;
    if (ui.sync === 'error') return `<div class="sync-pill sync-error" role="status" title="Cloud sync failed; local copy is still available">sync issue</div>`;
    return `<div class="sync-pill cloud" role="status">cloud saved</div>`;
  }
  return `<div class="sync-pill" role="status">local save</div>`;
}

function renderTopbarOnly() {
  const el = document.getElementById('topbar');
  if (!el) return;
  const c = caseById(state.activeCase);
  el.innerHTML = `<div class="topbar-title"><button class="mobile-menu" data-mobile>☰</button><small>${ui.view==='case'?esc(c.id):'TRACE / LAB'}</small><strong>${ui.view==='case'?esc(c.title):ui.view==='cases'?'Case files':'Investigation desk'}</strong></div>${syncPill()}`;
  el.querySelector('[data-mobile]')?.addEventListener('click',()=>{ui.mobileNav=!ui.mobileNav; document.getElementById('sidebar')?.classList.toggle('open',ui.mobileNav);});
}

function deskView() {
  const first = cases[0];
  return `<section class="hero">
    <div class="hero-card">
      <div class="eyebrow">Practical cyber investigation</div>
      <h1>Learn by finding out what actually happened.</h1>
      <p class="lead">No lecture track. No XP. No “memorize this definition” gate. Every environment gives you a problem, evidence, and working tools. Investigate, test a theory, contain what you can justify, then explain the result.</p>
      <div class="hero-actions">${state.cases?.[state.activeCase]?`<button class="primary-btn" data-open-case="${esc(state.activeCase)}">Continue ${esc(state.activeCase)}</button>`:`<button class="primary-btn" data-open-case="${first.id}">Open ${first.id}</button>`}<button class="secondary-btn" data-nav="cases">Browse all cases</button></div>
    </div>
    <div class="brief-card">
      <div class="eyebrow">Operating rules</div><h3>Evidence before assumptions.</h3>
      <div class="brief-row"><span>Targets</span><span>Fictional, isolated simulations only.</span></div>
      <div class="brief-row"><span>Method</span><span>Observe → test → correlate → act → explain.</span></div>
      <div class="brief-row"><span>Difficulty</span><span>Guidance fades as cases become more open-ended.</span></div>
      <div class="brief-row"><span>Skills</span><span>Investigation, pentesting logic, response, and defensive configuration.</span></div>
    </div>
  </section>
  <div class="section-head"><div><h2>Start with a case, not a lesson.</h2><p>The first three files are designed to teach the interface while still requiring real reasoning.</p></div></div>
  <div class="case-grid">${cases.slice(0,3).map((c,i)=>caseCard(c,i===0)).join('')}</div>`;
}

function caseCard(c, featured=false) {
  const cs = state.cases?.[c.id];
  const reviewed = Boolean(cs?.review?.length && cs.review.every(r=>r.status==='supported'));
  const touched = Boolean(cs);
  const searchable = `${c.id} ${c.title} ${c.subtitle} ${c.tier}`.toLowerCase();
  return `<button class="case-card ${featured?'featured':''}" data-open-case="${c.id}" data-case-text="${esc(searchable)}">
    <div class="case-num">${esc(c.id)} ${featured?' / RECOMMENDED START':''}</div>
    <h3>${esc(c.title)}</h3><p>${esc(c.subtitle)}</p>
    <div class="case-meta"><span class="tag ${featured?'hot':''}">${esc(c.tier)}</span><span class="tag">${c.tools.length-1} work surfaces</span>${reviewed?'<span class="tag status-done">review supported</span>':touched?'<span class="tag status-active">in progress</span>':''}</div>
  </button>`;
}

function casesView() {
  return `<div class="section-head"><div><div class="eyebrow">Case archive</div><h2>Operational files</h2><p>All cases are available. Search by case ID, title, scenario, or tier.</p></div></div>
  <div class="case-searchbar"><label class="sr-only" for="case-search">Search cases</label><input id="case-search" class="case-search" type="search" value="${esc(ui.caseQuery)}" placeholder="Search C042, Kubernetes, identity, phishing…" autocomplete="off"><button class="secondary-btn search-clear" data-clear-search type="button">Clear</button><span class="case-count" id="case-count">${cases.length} cases</span></div>
  <div class="case-grid" id="case-grid">${cases.map((c,i)=>caseCard(c,i===0)).join('')}</div>
  <div class="empty case-no-results" id="case-no-results" hidden>No cases match that search.</div>`;
}

function caseView() {
  const c = caseById(state.activeCase) || cases[0];
  if (state.activeCase !== c.id) state.activeCase = c.id;
  const cs = caseState(c.id);
  const active = c.tools.includes(state.activeTool) ? state.activeTool : 'overview';
  state.activeTool = active;
  return `<section class="case-header">
    <div class="case-briefing"><div class="eyebrow">${esc(c.id)} / ${esc(c.tier)}</div><h1>${esc(c.title)}</h1><p>${esc(c.brief)}</p></div>
    <aside class="case-side"><h4>Environment</h4><p>${esc(c.environment)}</p><div class="divider"></div><p>There may be irrelevant or misleading findings. A real weakness is not automatically the cause of the incident in front of you.</p><button class="danger-btn" data-reset-case="${c.id}">Reset this simulation</button></aside>
  </section>
  <section class="workspace">
    <nav class="toolrail" aria-label="Case tools">${c.tools.map(t=>`<button class="tool-btn ${t===active?'active':''}" data-tool="${t}" ${t===active?'aria-current="page"':''}><span class="dot"></span>${toolName(t)}</button>`).join('')}</nav>
    <div class="tool-view">${renderTool(c,cs,active)}</div>
  </section>`;
}

function toolName(t){ return ({overview:'Brief',terminal:'Terminal',browser:'Browser',mail:'Mail',logs:'Logs',evidence:'Evidence',board:'Case board',actions:'Actions',notes:'Notebook',hints:'Ask for a nudge',theory:'Submit theory'})[t] || t; }

function renderTool(c,cs,t) {
  const title = `<div class="tool-titlebar"><strong>${toolName(t)}</strong><span>${esc(c.id)} / isolated training environment</span></div>`;
  let body = '';
  if (t==='overview') body = overviewTool(c,cs);
  if (t==='terminal') body = terminalTool(c,cs);
  if (t==='browser') body = browserTool(c,cs);
  if (t==='mail') body = mailTool(c,cs);
  if (t==='logs') body = logsTool(c,cs);
  if (t==='evidence') body = evidenceTool(c,cs);
  if (t==='board') body = boardTool(c,cs);
  if (t==='actions') body = actionsTool(c,cs);
  if (t==='notes') body = notesTool(c,cs);
  if (t==='hints') body = hintsTool(c,cs);
  if (t==='theory') body = theoryTool(c,cs);
  return title + `<div class="tool-body">${body}</div>`;
}

function overviewTool(c,cs) {
  const sources = [c.mails?.length&&'mailbox', c.logs?.length&&'telemetry', c.browser?.length&&'web app', c.terminal?.length&&'host/terminal snapshot', c.actions?.length&&'response console'].filter(Boolean);
  return `<div class="eyebrow">Assignment</div><h2 style="margin:8px 0 12px">Build a defensible explanation.</h2>
    <p class="lead" style="font-size:14px">${esc(c.brief)}</p><div class="divider"></div>
    <div class="brief-row"><span>Available</span><span>${esc(sources.join(', '))}</span></div>
    <div class="brief-row"><span>Notebook</span><span>Your notes auto-save. Use the case board only for evidence you believe matters.</span></div>
    <div class="brief-row"><span>Decision rule</span><span>Do not take disruptive action just because something looks strange. Tie action to evidence and preserve what you may need first.</span></div>
    <div class="divider"></div><button class="primary-btn" data-tool="${nextUsefulTool(c)}">Begin examining the environment</button>`;
}
function nextUsefulTool(c){ return ['mail','logs','browser','terminal'].find(t=>c.tools.includes(t)) || 'evidence'; }

function terminalTool(c,cs) {
  const hist = cs.terminal || [];
  const lines = hist.length ? hist.map(x=>`<div class="term-line prompt">analyst@trace:$ ${esc(x.cmd)}</div><div class="term-line ${x.error?'error':''}">${esc(x.out)}</div>`).join('') : `<div class="term-line">Training snapshot loaded for ${esc(c.id)}. Type <span style="color:var(--accent)">help</span> for commands relevant to this environment.</div>`;
  return `<div class="terminal"><div class="terminal-output" id="terminal-output">${lines}</div><div class="term-input-wrap"><span class="term-prompt">analyst@trace:$</span><input class="term-input" id="terminal-input" autocomplete="off" spellcheck="false" placeholder="type a command" aria-label="Terminal command" /></div></div>`;
}

function browserTool(c,cs) {
  const pages = c.browser || [];
  if (!pages.length) return `<div class="empty">No browser surface is attached to this case.</div>`;
  const activeId = cs.browserId || pages[0].id;
  const p = pages.find(x=>x.id===activeId) || pages[0];
  const pageContent = typeof p.html === 'string'
    ? p.html
    : `<div class="fake-site"><div class="box browser-text">${nl(p.body || '')}</div></div>`;
  return `<div class="browser-sidebar"><div class="route-list">${pages.map(x=>`<button class="route-btn ${x.id===p.id?'active':''}" data-browser="${x.id}" ${x.id===p.id?'aria-current="page"':''}>${esc(x.title)}<br><small>${esc(x.url)}</small></button>`).join('')}</div><div class="browser-shell"><div class="browser-chrome"><span class="browser-dot"></span><span class="browser-dot"></span><span class="browser-dot"></span><div class="address">${esc(p.url)}</div></div><div class="browser-page">${pageContent}</div></div></div>`;
}

function mailTool(c,cs) {
  const mails = c.mails || [];
  if (!mails.length) return `<div class="empty">No mailbox is attached to this case.</div>`;
  const activeId = cs.mailId || mails[0].id;
  const m = mails.find(x=>x.id===activeId) || mails[0];
  return `<div class="mail-layout"><div class="mail-list">${mails.map(x=>`<button class="mail-item ${x.id===m.id?'active':''}" data-mail="${x.id}" type="button" ${x.id===m.id?'aria-current="true"':''}><strong>${esc(x.subject)}</strong><span>${esc(x.from)} · ${esc(x.date)}</span></button>`).join('')}</div><div class="mail-pane"><div class="mail-header"><h3>${esc(m.subject)}</h3><div class="kv"><div>From</div><div>${esc(m.from)}</div><div>To</div><div>${esc(m.to)}</div><div>Date</div><div>${esc(m.date)}</div></div></div><div class="mail-body">${nl(m.body)}</div><details><summary style="margin-top:18px;color:var(--accent);cursor:pointer;font-size:12px">View raw headers / metadata</summary><div class="raw-box">${esc(m.raw)}</div></details></div></div>`;
}

function logsTool(c,cs) {
  const logs = c.logs || [];
  if (!logs.length) return `<div class="empty">No log surface is attached to this case.</div>`;
  const activeId = cs.logId || logs[0].id;
  const l = logs.find(x=>x.id===activeId) || logs[0];
  return `<div class="log-toolbar"><select class="log-select" id="log-source" aria-label="Log source">${logs.map(x=>`<option value="${esc(x.id)}" ${x.id===l.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select><input class="log-search" id="log-filter" aria-label="Filter current log" placeholder="filter current log (e.g. user, IP, process, session)" /></div><div class="log-viewer" id="log-viewer" data-raw="${encodeURIComponent(l.text)}">${esc(l.text)}</div>`;
}

function evidenceTool(c,cs) {
  const pinned = new Set(cs.pinned || []);
  return `<div class="evidence-grid">${(c.evidence||[]).map(x=>`<article class="evidence-card"><div class="eyebrow">${esc(x.type)}</div><h4>${esc(x.title)}</h4><p>${esc(x.summary)}</p><details><summary style="cursor:pointer;color:var(--accent);font-size:11px">Inspect details</summary><div class="raw-box">${esc(x.detail)}</div></details><div class="evidence-actions"><button class="micro-btn ${pinned.has(x.id)?'pinned':''}" data-pin="${x.id}">${pinned.has(x.id)?'Pinned to board':'Pin to case board'}</button></div></article>`).join('')}</div>`;
}

function boardTool(c,cs) {
  const ids = cs.pinned || [];
  const items = ids.map(id=>c.evidence.find(e=>e.id===id)).filter(Boolean);
  return `<div class="board">${items.length?items.map(x=>`<article class="board-card"><small>${esc(x.type)}</small><h4>${esc(x.title)}</h4><p>${esc(x.summary)}</p><button class="micro-btn" data-pin="${x.id}">Remove</button></article>`).join(''):`<div class="board-empty"><strong>No evidence pinned.</strong><br><br>Use the Evidence surface to place only the artifacts you think belong in your working theory.</div>`}</div>`;
}

function actionsTool(c,cs) {
  const done = cs.actions || {};
  return `<div class="notice">Actions are part of the simulation. Some are intentionally poor choices. The environment records consequences; it does not prevent you from making a defensible mistake.</div><div style="height:12px"></div><div class="action-grid">${(c.actions||[]).map(a=>`<article class="action-card"><div><h4>${esc(a.label)}</h4><p>${esc(a.description)}</p></div><button class="secondary-btn" data-action="${a.id}" ${done[a.id]?'disabled':''}>${done[a.id]?'Applied':'Apply'}</button>${done[a.id]?`<div class="action-result ${a.quality==='good'?'good':'bad'}">${esc(a.outcome)}</div>`:''}</article>`).join('')}</div>`;
}

function notesTool(c,cs) {
  return `<textarea class="note-area" id="notes" aria-label="Case notebook" placeholder="Write observations, timestamps, contradictions, hypotheses, commands to retry, and what you still need to prove…">${esc(cs.notes||'')}</textarea><div class="autosave">Saved automatically to this case.</div>`;
}

function hintsTool(c,cs) {
  const level = cs.hintLevel || 0;
  return `<div class="notice">Hints are deliberately progressive. Open only as much help as you need; there is no score attached to using them.</div><div style="height:12px"></div><div class="hint-stack">${c.hints.map((h,i)=>`<div class="hint-card ${i>=level?'locked':''}"><strong>Nudge ${i+1}</strong>${i<level?`<p>${esc(h)}</p>`:`<p>Not opened.</p>`}</div>`).join('')}</div><div style="height:12px"></div>${level<c.hints.length?`<button class="secondary-btn" data-hint>Open next nudge</button>`:`<span class="tag">All nudges opened</span>`}`;
}

function theoryTool(c,cs) {
  const t = cs.theory || {finding:'',impact:'',response:''};
  return `<div class="notice">Write a case conclusion in your own words. The review checks whether your explanation is supported by the environment; it is not a multiple-choice quiz.</div><div style="height:14px"></div><div class="theory-grid">
    <div class="field"><label for="theory-finding">What happened? Include the evidence chain that makes you believe it.</label><textarea id="theory-finding">${esc(t.finding)}</textarea></div>
    <div class="field"><label for="theory-impact">What was exposed or at risk? What is still uncertain?</label><textarea id="theory-impact">${esc(t.impact)}</textarea></div>
    <div class="field"><label for="theory-response">What would you do now, and in what order?</label><textarea id="theory-response">${esc(t.response)}</textarea></div>
    <button class="primary-btn" data-review>Review against evidence</button>
  </div>${cs.review?reviewBlock(cs.review):''}`;
}

function reviewBlock(review) {
  return `<div class="review"><div class="review-head"><strong>Evidence review</strong><span class="tag">No numeric score</span></div>${review.map(r=>`<div class="review-item"><div class="review-status ${r.status}">${r.status==='supported'?'supported':r.status==='partial'?'needs support':'unsupported'}</div><div><strong>${esc(r.label)}</strong><p>${esc(r.message)}</p></div></div>`).join('')}</div>`;
}

function evaluateCase(c, t) {
  const text = `${t.finding} ${t.impact} ${t.response}`.toLowerCase();
  return c.evaluation.map(rule => {
    const hits = rule.groups.map(group => group.some(term => text.includes(term.toLowerCase())));
    const count = hits.filter(Boolean).length;
    if (count === hits.length) return { label:rule.label, status:'supported', message:rule.supported };
    if (count > 0) return { label:rule.label, status:'partial', message:rule.partial };
    return { label:rule.label, status:'unsupported', message:rule.missing };
  });
}

function updateCaseSearch() {
  const input = document.getElementById('case-search');
  if (!input) return;
  const q = (ui.caseQuery || '').trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll('[data-case-text]').forEach(card => {
    const show = !q || (card.dataset.caseText || '').includes(q);
    card.hidden = !show;
    if (show) visible += 1;
  });
  const count = document.getElementById('case-count');
  if (count) count.textContent = `${visible} of ${cases.length} cases`;
  const empty = document.getElementById('case-no-results');
  if (empty) empty.hidden = visible !== 0;
}

function authModal() {
  const should = ui.authOpen || (cloud.enabled && !cloud.signedIn && !ui.offlineDismissed);
  if (!should) return '';
  const signed = cloud.signedIn;
  return `<div class="modal-backdrop" data-modal-backdrop><div class="modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><div class="eyebrow">${signed?'Account':'Private save'}</div><h2 id="auth-title">${signed?'Cloud save is active':ui.authMode==='signup'?'Create your private login':'Sign in to TRACE'}</h2><p>${signed?`Signed in as ${esc(cloud.user?.email||'')}. Your investigation state is saved to your own Supabase row.`:'Use Supabase for account-based saves, or continue in local mode and set it up later.'}</p>
  ${ui.authMessage?`<div class="notice ${ui.authMessage.startsWith('Error')?'error':'ok'}">${esc(ui.authMessage)}</div>`:''}
  ${signed?`<div class="form-stack"><button class="danger-btn" data-signout>Sign out</button><button class="secondary-btn" data-close-auth>Close</button></div>`:`<div class="form-stack"><input type="email" id="auth-email" aria-label="Email" placeholder="email" autocomplete="email"><input type="password" id="auth-password" aria-label="Password" placeholder="password" autocomplete="${ui.authMode==='signup'?'new-password':'current-password'}"><button class="primary-btn" data-auth-submit>${ui.authMode==='signup'?'Create account':'Sign in'}</button><div class="form-row"><button class="secondary-btn" data-auth-switch>${ui.authMode==='signup'?'I already have an account':'Create account'}</button><button class="secondary-btn" data-offline>Continue locally</button></div></div>`}
  </div></div>`;
}

function executeCommand(c, cmd) {
  const trimmed = cmd.trim();
  if (!trimmed) return null;
  for (const [pattern, out] of c.terminal || []) {
    const match = trimmed.match(pattern);
    if (match) return { cmd:trimmed, out:typeof out==='function'?out({match,cmd:trimmed}):out, error:false };
  }
  if (/^(clear|cls)$/i.test(trimmed)) return { clear:true };
  if (/^(cd|rm|del|sudo su|ssh|scp)\b/i.test(trimmed)) return {cmd:trimmed,out:'This snapshot exposes only case-relevant read/test operations. Use help to see available commands.',error:true};
  return { cmd:trimmed, out:`command or case artifact not found: ${trimmed}\nType help for available operations in this simulation.`, error:true };
}

function bindEvents() {
  document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>{ ui.view=b.dataset.nav; if(ui.view==='case'&&!state.activeCase)state.activeCase=cases[0].id; ui.mobileNav=false; render(); }));
  document.querySelectorAll('[data-open-case]').forEach(b=>b.addEventListener('click',()=>openCase(b.dataset.openCase)));
  document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>setTool(b.dataset.tool)));
  document.querySelector('[data-mobile]')?.addEventListener('click',()=>{ui.mobileNav=!ui.mobileNav; document.getElementById('sidebar')?.classList.toggle('open',ui.mobileNav);});
  document.querySelector('[data-mobile-close]')?.addEventListener('click',()=>{ui.mobileNav=false;render();});
  document.getElementById('case-search')?.addEventListener('input',e=>{ui.caseQuery=e.target.value;updateCaseSearch();});
  document.querySelector('[data-clear-search]')?.addEventListener('click',()=>{ui.caseQuery='';const input=document.getElementById('case-search');if(input)input.value='';updateCaseSearch();input?.focus();});
  document.querySelector('[data-auth]')?.addEventListener('click',()=>{ui.authOpen=true;ui.authMessage='';render();});

  document.querySelectorAll('[data-reset-case]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.resetCase;
    if(confirm(`Reset all notes, terminal history, board evidence, actions and theory for ${id}?`)) {
      const next={...(state.cases||{})}; delete next[id]; state.cases=next; persist(); render();
    }
  }));

  const term = document.getElementById('terminal-input');
  if (term) {
    term.focus();
    term.addEventListener('keydown',e=>{ if(e.key==='Enter'){
      const c=caseById(state.activeCase), cs=caseState(c.id), result=executeCommand(c,term.value);
      if(!result)return;
      const history = result.clear?[]:[...(cs.terminal||[]),result].slice(-80);
      patchCase(c.id,{terminal:history}); render(); setTimeout(()=>{ const out=document.getElementById('terminal-output'); if(out)out.scrollTop=out.scrollHeight; document.getElementById('terminal-input')?.focus();},0);
    }});
  }

  document.querySelectorAll('[data-browser]').forEach(b=>b.addEventListener('click',()=>{const c=caseById(state.activeCase);patchCase(c.id,{browserId:b.dataset.browser});render();}));
  document.querySelectorAll('[data-mail]').forEach(b=>b.addEventListener('click',()=>{const c=caseById(state.activeCase);patchCase(c.id,{mailId:b.dataset.mail});render();}));
  document.getElementById('log-source')?.addEventListener('change',e=>{const c=caseById(state.activeCase);patchCase(c.id,{logId:e.target.value});render();});
  document.getElementById('log-filter')?.addEventListener('input',e=>{
    const viewer=document.getElementById('log-viewer'); if(!viewer)return;
    const raw=decodeURIComponent(viewer.dataset.raw||''); const q=e.target.value.trim().toLowerCase();
    if(!q){viewer.textContent=raw;return;}
    viewer.textContent=raw.split('\n').filter(line=>line.toLowerCase().includes(q)).join('\n') || 'No matching lines in this log.';
  });

  document.querySelectorAll('[data-pin]').forEach(b=>b.addEventListener('click',()=>{
    const c=caseById(state.activeCase), cs=caseState(c.id), set=new Set(cs.pinned||[]), id=b.dataset.pin;
    set.has(id)?set.delete(id):set.add(id); patchCase(c.id,{pinned:[...set]}); render();
  }));
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{
    const c=caseById(state.activeCase), cs=caseState(c.id), a=c.actions.find(x=>x.id===b.dataset.action);
    patchCase(c.id,{actions:{...(cs.actions||{}),[a.id]:{at:new Date().toISOString(),quality:a.quality}}}); render();
  }));

  document.getElementById('notes')?.addEventListener('input',e=>{const c=caseById(state.activeCase);patchCase(c.id,{notes:e.target.value});});
  document.querySelector('[data-hint]')?.addEventListener('click',()=>{const c=caseById(state.activeCase),cs=caseState(c.id);patchCase(c.id,{hintLevel:Math.min((cs.hintLevel||0)+1,c.hints.length)});render();});

  ['finding','impact','response'].forEach(k=>document.getElementById(`theory-${k}`)?.addEventListener('input',e=>{
    const c=caseById(state.activeCase),cs=caseState(c.id); patchCase(c.id,{theory:{...(cs.theory||{}),[k]:e.target.value},review:null});
  }));
  document.querySelector('[data-review]')?.addEventListener('click',()=>{
    const c=caseById(state.activeCase),cs=caseState(c.id), t=cs.theory||{};
    patchCase(c.id,{review:evaluateCase(c,t)}); render();
  });

  bindAuthEvents();
}

function bindAuthEvents() {
  document.querySelector('[data-close-auth]')?.addEventListener('click',()=>{ui.authOpen=false;render();});
  document.querySelector('[data-offline]')?.addEventListener('click',()=>{ui.offlineDismissed=true;ui.authOpen=false;render();});
  document.querySelector('[data-auth-switch]')?.addEventListener('click',()=>{ui.authMode=ui.authMode==='signin'?'signup':'signin';ui.authMessage='';render();});
  document.querySelector('[data-auth-submit]')?.addEventListener('click',async()=>{
    const email=document.getElementById('auth-email')?.value.trim(); const password=document.getElementById('auth-password')?.value||'';
    if(!email||password.length<6){ui.authMessage='Error: enter an email and a password of at least 6 characters.';render();return;}
    try{
      if(ui.authMode==='signup') {
        const r=await cloud.signUp(email,password);
        if(!r.access_token){ui.authMessage='Account created. If email confirmation is enabled in Supabase, confirm the email, then sign in.';ui.authMode='signin';render();return;}
      } else await cloud.signIn(email,password);
      const remote=await cloud.loadState().catch(()=>null);
      state = remote ? mergeStates(state, remote) : normalizeState(state);
      state = saveLocalState(state);
      await cloud.saveState(state);
      ui.sync='cloud';ui.authOpen=false;ui.authMessage='';render();
    }catch(err){ui.authMessage=`Error: ${err.message}`;render();}
  });
  document.querySelector('[data-signout]')?.addEventListener('click',async()=>{await cloud.signOut();ui.authOpen=false;ui.sync='local';render();});
}

function render() {
  let content = ui.view==='cases'?casesView():ui.view==='case'?caseView():deskView();
  appEl.innerHTML = layout(content);
  bindEvents();
  updateCaseSearch();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (ui.authOpen) { ui.authOpen = false; render(); return; }
    if (ui.mobileNav) { ui.mobileNav = false; render(); return; }
  }
  if (e.key === '/' && ui.view === 'cases' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) {
    e.preventDefault();
    document.getElementById('case-search')?.focus();
  }
});

async function boot() {
  const enabled = await cloud.init();
  if (enabled && cloud.signedIn) {
    try {
      const remote = await cloud.loadState();
      state = remote ? mergeStates(state, remote) : normalizeState(state);
      state = saveLocalState(state);
      await cloud.saveState(state);
      ui.sync='cloud';
    } catch { ui.sync='error'; }
  }
  render();
}

boot();
