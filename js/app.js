import { cases, caseById } from './cases.js';
import { loadLocalState, saveLocalState, getCaseState, normalizeState, mergeStates } from './storage.js';
import { CloudStore } from './supabase.js';
import { caseSceneAsset, evidenceSceneAsset, caseVisualBadges, caseMoodCopy, caseGallery } from './visuals.js';


const appEl = document.getElementById('app');
const cloud = new CloudStore();
let state = loadLocalState();
let ui = { view: 'desk', mobileNav: false, authOpen: false, authMode: 'signin', authMessage: '', offlineDismissed: false, sync: 'local', caseQuery: '' };
let cloudSaveTimer = null;

const icons = {
  desk:'⌂', cases:'▦', overview:'◫', guide:'i', terminal:'>_', browser:'◎', mail:'✉', logs:'≡', evidence:'◇', board:'⌘', actions:'⚙', notes:'✎', hints:'?', theory:'∴'
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
function setTool(tool) {
  state.activeTool = tool;
  const c = caseById(state.activeCase);
  if (c) {
    const cs = getCaseState(state, c.id);
    state.cases = { ...(state.cases || {}), [c.id]: { ...cs, visitedTools: [...new Set([...(cs.visitedTools || []), tool])], updatedAt: new Date().toISOString() } };
  }
  persist();
  render();
}

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
  const featured = cases.slice(0,3);
  return `<div class="signal-strip"><span class="signal-dot"></span> TRACE NODE ONLINE <span>training network isolated</span><span>beginner assistance enabled</span></div>
  <section class="hero game-hero">
    <div class="hero-card">
      <div class="hero-grid">
        <div>
          <div class="eyebrow">Incoming incident // training channel</div>
          <h1>You do not need to know cybersecurity to start.</h1>
          <p class="lead">TRACE plays like a dark investigation game. You open a case, inspect messages and system traces, collect clues, build a theory, and write the final report. Every technical screen includes plain-English help, so you learn the cyber concepts while solving the mystery.</p>
          <div class="hero-actions">${state.cases?.[state.activeCase]?`<button class="primary-btn" data-open-case="${esc(state.activeCase)}">Resume ${esc(state.activeCase)}</button>`:`<button class="primary-btn" data-open-case="${first.id}">Accept first case</button>`}<button class="secondary-btn" data-nav="cases">Open case archive</button></div>
          <div class="rookie-banner"><strong>Rookie protocol active.</strong><span>No networking, terminal, or cybersecurity knowledge is assumed. TRACE explains unfamiliar terms inside the case.</span></div>
        </div>
        <div class="hero-visual-wall">${featured.map((c,i)=>`<article class="hero-visual-card ${i===0?'focus':''}"><img src="${caseSceneAsset(c)}" alt="Visual preview for ${esc(c.id)}"><div><strong>${esc(c.id)}</strong><span>${esc(caseMoodCopy(c))}</span></div></article>`).join('')}</div>
      </div>
    </div>
    <div class="brief-card mission-card">
      <div class="eyebrow">How an investigation works</div><h3>Find the story hidden in the evidence.</h3>
      <div class="mission-step"><b>01</b><span><strong>Observe</strong>Open the inbox, logs, browser, or system snapshot.</span></div>
      <div class="mission-step"><b>02</b><span><strong>Connect</strong>Pin clues that seem related and write simple notes.</span></div>
      <div class="mission-step"><b>03</b><span><strong>Respond</strong>Choose safe actions only when the evidence supports them.</span></div>
      <div class="mission-step"><b>04</b><span><strong>Report</strong>Explain what happened in your own words.</span></div>
    </div>
  </section>
  <div class="section-head"><div><div class="eyebrow">Recommended entry point</div><h2>Case C001 teaches the controls while you investigate.</h2><p>Nothing is timed. Hints and the Field Guide do not reduce your result.</p></div></div>
  <div class="case-grid">${featured.map((c,i)=>caseCard(c,i===0)).join('')}</div>`;
}

function caseCard(c, featured=false) {
  const cs = state.cases?.[c.id];
  const reviewed = Boolean(cs?.review?.length && cs.review.every(r=>r.status==='supported'));
  const touched = Boolean(cs);
  const searchable = `${c.id} ${c.title} ${c.subtitle} ${c.tier}`.toLowerCase();
  const badges = caseVisualBadges(c);
  return `<button class="case-card ${featured?'featured':''}" data-open-case="${c.id}" data-case-text="${esc(searchable)}">
    <div class="case-thumb"><img src="${caseSceneAsset(c)}" alt="Case visual for ${esc(c.id)}"></div>
    <div class="case-num">${esc(c.id)} ${featured?' / RECOMMENDED START':''}</div>
    <h3>${esc(c.title)}</h3><p>${esc(c.subtitle)}</p>
    <div class="case-badges">${badges.map(b=>`<span>${esc(b)}</span>`).join('')}</div>
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
  const availableTools = ['overview','guide',...c.tools.filter(t=>t!=='overview')];
  const active = availableTools.includes(state.activeTool) ? state.activeTool : 'overview';
  state.activeTool = active;
  const progress = investigationProgress(c, cs);
  return `<div class="case-alert"><span class="case-alert-pulse"></span> ACTIVE CASE ${esc(c.id)} <span>Do not guess. Build the timeline.</span></div>
  <section class="case-header">
    <div class="case-briefing dossier"><div class="dossier-grid"><div><div class="eyebrow">${esc(c.id)} / ${esc(c.tier)}</div><h1>${esc(c.title)}</h1><p class="case-subtitle">${esc(c.subtitle)}</p><div class="classified-line"></div><p>${esc(c.brief)}</p><div class="case-badges header">${caseVisualBadges(c).map(b=>`<span>${esc(b)}</span>`).join('')}</div></div><div class="dossier-visual"><img src="${caseSceneAsset(c)}" alt="Illustration for ${esc(c.id)}"><div class="dossier-visual-copy"><strong>${esc(caseMoodCopy(c))}</strong><span>${esc(c.environment)}</span></div></div></div></div>
    <aside class="case-side progress-panel"><div class="eyebrow">Investigation pulse</div><div class="pulse-number">${progress.percent}%</div><div class="pulse-track"><i style="width:${progress.percent}%"></i></div>${progress.steps.map(x=>`<div class="pulse-step ${x.done?'done':''}"><span>${x.done?'✓':'○'}</span>${esc(x.label)}</div>`).join('')}<div class="divider"></div><p><strong>Environment:</strong><br>${esc(c.environment)}</p><button class="danger-btn" data-reset-case="${c.id}">Reset case</button></aside>
  </section>
  <section class="workspace game-workspace">
    <nav class="toolrail" aria-label="Case tools">${availableTools.map(t=>`<button class="tool-btn ${t===active?'active':''}" data-tool="${t}" ${t===active?'aria-current="page"':''}><span class="tool-icon">${icons[t]||'·'}</span><span>${toolName(t)}</span>${t==='guide'?'<em>NEW</em>':''}</button>`).join('')}</nav>
    <div class="tool-view">${renderTool(c,cs,active)}</div>
  </section>`;
}

function toolName(t){ return ({overview:'Case briefing',guide:'Field guide',terminal:'Terminal',browser:'Browser',mail:'Inbox',logs:'System logs',evidence:'Evidence locker',board:'Evidence board',actions:'Response console',notes:'Investigator notes',hints:'TRACE assistant',theory:'Final report'})[t] || t; }

function investigationProgress(c,cs) {
  const visited = new Set(cs.visitedTools || []);
  const examined = ['mail','logs','browser','terminal'].some(t => visited.has(t) || (t==='terminal' && (cs.terminal||[]).length));
  const pinned = (cs.pinned||[]).length >= Math.min(2, (c.evidence||[]).length);
  const noted = (cs.notes||'').trim().length >= 12;
  const reported = ['finding','impact','response'].filter(k => (cs.theory?.[k]||'').trim().length >= 12).length >= 2;
  const reviewed = Boolean(cs.review?.length);
  const steps = [
    {label:'Inspect at least one source',done:examined},
    {label:'Pin useful evidence',done:pinned},
    {label:'Write an observation',done:noted},
    {label:'Draft your explanation',done:reported},
    {label:'Run evidence review',done:reviewed}
  ];
  return {steps, percent:Math.round(steps.filter(x=>x.done).length/steps.length*100)};
}

function renderTool(c,cs,t) {
  const title = `<div class="tool-titlebar"><strong>${toolName(t)}</strong><span>${esc(c.id)} / isolated training environment</span></div>`;
  let body = '';
  if (t==='overview') body = overviewTool(c,cs);
  if (t==='guide') body = guideTool(c,cs);
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
  const sources = [c.mails?.length&&'inbox', c.logs?.length&&'system logs', c.browser?.length&&'browser pages', c.terminal?.length&&'computer snapshot', c.actions?.length&&'response console'].filter(Boolean);
  const gallery = caseGallery(c);
  return `<div class="briefing-screen"><div class="eyebrow">Case transmission received</div><h2>Your job: explain the incident, not the jargon.</h2>
    <p class="lead beginner-lead">${esc(c.brief)}</p>
    <div class="rookie-banner"><strong>New investigator?</strong><span>You are not expected to know what an IP, log, token, DNS record, process, or terminal command means yet. Open <button class="inline-link" data-tool="guide">Field Guide</button> whenever a term is unfamiliar.</span></div>
    <div class="case-visual-strip">${gallery.map(item=>`<article class="case-visual-card"><img src="${item.asset}" alt="${esc(item.label)} visual"><div><strong>${esc(item.label)}</strong><span>${esc(caseMoodCopy(c))}</span></div></article>`).join('')}</div>
    <div class="objective-grid"><div><small>01 / LOOK</small><strong>Inspect the available sources</strong><p>${esc(sources.join(', '))}.</p></div><div><small>02 / CONNECT</small><strong>Ask what changed, when, and who was involved</strong><p>Repeated names, times, devices, domains, and actions are often the useful clues.</p></div><div><small>03 / COLLECT</small><strong>Pin evidence that supports your story</strong><p>You do not need to pin everything. Keep only what helps explain what happened.</p></div><div><small>04 / EXPLAIN</small><strong>Write a final report in normal language</strong><p>Technical vocabulary is optional if your reasoning is clear and evidence-based.</p></div></div>
    <div class="divider"></div><button class="primary-btn" data-tool="${nextUsefulTool(c)}">Enter investigation</button><button class="secondary-btn" data-tool="guide" style="margin-left:8px">Open Field Guide</button></div>`;
}
function nextUsefulTool(c){ return ['mail','logs','browser','terminal'].find(t=>c.tools.includes(t)) || 'evidence'; }

const FIELD_GUIDE = [
  ['IP address','A number used to identify where network traffic came from or went to. In TRACE, you usually compare whether an IP is familiar or unusual; you do not need to memorize IP ranges.',[' ip=',' ip ','ip:','address:']],
  ['Domain','The readable name of a website or online service, such as example.test. Lookalike spellings can be a clue.',['domain','http://','https://','.test']],
  ['Log','A chronological record created by a system. Read it like a timeline: time → person/device → action → result.',['log','telemetry','event=','result=']],
  ['MFA','Multi-factor authentication: an extra proof of identity beyond a password, often an app prompt or code.',['mfa','authenticator']],
  ['Token / session','A temporary digital pass that can keep someone signed in. Changing a password does not always cancel existing sessions.',['token','session']],
  ['Process','A running program on a computer. A parent/child relationship shows which program launched another program.',['process','powershell','explorer.exe','cmd.exe','thread']],
  ['DNS / nslookup','DNS translates a domain name into a network address. nslookup is a read-only command that asks for that mapping.',['dns','nslookup','resolver']],
  ['Hash','A fingerprint calculated from data or a file. Matching hashes are used to compare whether content is the same.',['hash','sha256','md5']],
  ['Port','A numbered network doorway used by a service. You only need the case context; you are never expected to memorize every port.',['port',':443',':445',':22',':80']],
  ['Privilege / admin','The level of authority an account or program has. More privilege means it can perform more sensitive actions.',['admin','root','sudo','privilege']],
  ['Phishing','A message designed to trick someone into opening a file, visiting a fake page, or giving away credentials.',['phish','lookalike','reply-to','dmarc','spf']],
  ['Persistence','A way for access or code to survive a restart, password change, or other interruption.',['persistence','startup','run key','cron','refresh token','scheduled task']],
  ['API','A structured way for software to request data or actions from another service. Think of it as a service counter for programs.',['api','endpoint','/api/']],
  ['HTTP request / response','A web request asks a server for something; the response contains a status and data. Codes such as 200 usually mean the request succeeded.',['http/1.1','curl','status code','response']],
  ['Header','Extra information attached to an email or web request. Headers can reveal identity, routing, authentication, or how a request should be handled.',['header','x-forwarded','authorization:','authentication-results']],
  ['JSON','A common text format that stores named fields and values, often used by APIs. Read it as labels paired with data.',['json','{"','":']],
  ['ACL / permissions','A list of who is allowed to read, write, run, or administer something. The key question is whether that access is necessary.',['acl','permission','writable','readable']],
  ['RBAC','Role-based access control: permissions are grouped into roles, and identities receive those roles.',['rbac','rolebinding','clusterrole','role=']],
  ['Service account','A non-human identity used by an application or automation. It should normally have only the permissions its job requires.',['service account','service-account','service_account','service identity']],
  ['Certificate','A digital identity document used to prove who a system or user is, often for encrypted or passwordless connections.',['certificate','cert','x509','tls']],
  ['TLS','Encryption and identity checking used by secure network connections. A lock icon alone does not prove the site itself is trustworthy.',['tls','https','certificate']],
  ['Proxy','A middle system that receives traffic and forwards it to another service. Security can fail if the final service trusts information the proxy did not truly verify.',['proxy','reverse-proxy','x-forwarded']],
  ['Cache','Stored copies used to answer future requests faster. A bad cache rule can accidentally serve one user’s data to another.',['cache','cache key','cached']],
  ['Container','A packaged application environment. It isolates software, but dangerous permissions or host access can weaken that boundary.',['container','docker','image','runtime socket']],
  ['Kubernetes','A system that runs and manages containers. You can treat pods as workloads, service accounts as their identities, and RBAC as their permissions.',['kubernetes','kubectl','pod','namespace','admission']],
  ['Cloud role / IAM','A cloud identity or permission set. Ask which identity received the role, what it can do, and whether that scope is broader than needed.',['iam','assumerole','cloud role','role arn','policy']],
  ['Secret / credential','Information that proves identity or grants access, such as a password, token, API key, certificate key, or database credential.',['secret','credential','api key','password','private key']],
  ['Environment variable','A named value supplied to a program when it runs. It is often used for configuration or secrets, but its permissions still matter.',['environment variable','environmentfile','env var']],
  ['Firewall / segmentation','Rules that limit which systems can talk to each other. Segmentation reduces how far an attacker can move after one machine is compromised.',['firewall','segmentation','east-west','vlan','acl rule']],
  ['SMB / file share','A Windows-style network file-sharing service. In TRACE, focus on who connected, what identity was used, and whether the access was necessary.',['smb','file share',':445','\\\\']],
  ['Kerberos','A ticket-based authentication system commonly used in Windows domains. Treat tickets as proof that an identity was allowed to access a service.',['kerberos','ticket','tgt','spn']],
  ['SAML / OIDC','Standards for signing in across services. Focus on who issued the identity, who it was meant for, and whether the receiving service validated those details.',['saml','oidc','assertion','audience','recipient']],
  ['CI/CD pipeline','Automation that builds, tests, signs, and deploys software. A compromised build path can affect what reaches production.',['ci/cd','pipeline','workflow','build','runner']],
  ['Digital signature','Cryptographic proof that data was signed by a particular key. A valid signature proves the signer, not that the underlying build or content was trustworthy.',['signature','signed','signer','attestation']],
  ['Backup / snapshot','A stored copy used for recovery. Old backups can also restore old accounts, keys, permissions, or vulnerabilities if recovery does not reconcile them.',['backup','snapshot','restore']],
  ['Webhook','An automated message one service sends to another when an event happens. If validation fails open, requests may be accepted when they should be checked.',['webhook','failurepolicy']],
  ['Metadata','Descriptive information about an artifact, such as timestamps, source, owner, file type, or identity. Metadata often helps connect events into a timeline.',['metadata','timestamp','created','modified']],
  ['Least privilege','Give an identity only the permissions needed for its actual job, and no more. This limits damage when that identity is misused.',['least privilege','overprivilege','scope','admin:*']]
];

function guideTool(c) {
  const haystack = JSON.stringify(c).toLowerCase();
  const relevant = FIELD_GUIDE.filter(([, , keys]) => keys.some(k => haystack.includes(k.toLowerCase()))).slice(0,8);
  return `<div class="guide-intro"><div><div class="eyebrow">Rookie protocol // always available</div><h2>Translate the screen before you solve it.</h2><p>You can finish TRACE without prior networking or cybersecurity classes. Use this guide to understand what a tool is showing, then reason from the evidence.</p></div><div class="guide-badge">NO PRIOR<br>KNOWLEDGE<br>REQUIRED</div></div>
  <div class="tool-lessons"><article><span>✉</span><div><strong>Inbox</strong><p>Compare the visible sender with the real address, wording, links, attachments, and timing. Something urgent is not automatically malicious.</p></div></article><article><span>≡</span><div><strong>System logs</strong><p>Treat each line like a CCTV timestamp for a computer: when, who/what, what action, and whether it succeeded.</p></div></article><article><span>>_</span><div><strong>Terminal</strong><p>This is a text-based viewer for the simulated machine. TRACE gives you clickable commands; you never need to know commands beforehand.</p></div></article><article><span>◇</span><div><strong>Evidence board</strong><p>Pin clues only when they help support a timeline or explanation. One clue can be suspicious without proving the whole case.</p></div></article></div>
  <div class="section-head compact"><div><h2>Terms that may appear in ${esc(c.id)}</h2><p>Plain-English definitions selected from this case.</p></div></div>
  <div class="glossary-grid">${(relevant.length?relevant:FIELD_GUIDE.slice(0,6)).map(([term,meaning])=>`<article class="glossary-card"><strong>${esc(term)}</strong><p>${esc(meaning)}</p></article>`).join('')}</div>`;
}

function terminalTool(c,cs) {
  const hist = cs.terminal || [];
  const lines = hist.length ? hist.map(x=>`<div class="term-line prompt">analyst@trace:$ ${esc(x.cmd)}</div><div class="term-line ${x.error?'error':''}">${esc(x.out)}</div>`).join('') : `<div class="term-line">Snapshot ready. If this is your first terminal, click a suggested command below. Start with <span style="color:var(--accent)">help</span>.</div>`;
  const commands = suggestedCommands(c);
  return `<div class="beginner-tip"><b>What is this?</b><span>The terminal is just another way to inspect the fictional computer. Click a command; TRACE will run it for you. You do not need to memorize syntax.</span></div><div class="command-chips">${commands.map(cmd=>`<button class="command-chip" data-command="${esc(cmd)}">${esc(cmd)}</button>`).join('')}</div><div class="terminal"><div class="terminal-output" id="terminal-output">${lines}</div><div class="term-input-wrap"><span class="term-prompt">analyst@trace:$</span><input class="term-input" id="terminal-input" autocomplete="off" spellcheck="false" placeholder="or type a command" aria-label="Terminal command" /></div></div>`;
}

function suggestedCommands(c) {
  const helpRow = (c.terminal||[]).find(([rx]) => rx instanceof RegExp && rx.test('help'));
  const help = typeof helpRow?.[1] === 'string' ? helpRow[1] : '';
  const after = help.includes('Try:') ? help.split('Try:')[1] : '';
  const parsed = after.split(',').map(x=>x.trim()).filter(x=>x && !/[<>]/.test(x));
  return ['help', ...parsed].filter((x,i,a)=>a.indexOf(x)===i).slice(0,7);
}

function browserTool(c,cs) {
  const pages = c.browser || [];
  if (!pages.length) return `<div class="empty">No browser surface is attached to this case.</div>`;
  const activeId = cs.browserId || pages[0].id;
  const p = pages.find(x=>x.id===activeId) || pages[0];
  const pageContent = typeof p.html === 'string'
    ? p.html
    : `<div class="fake-site"><div class="box browser-text">${nl(p.body || '')}</div></div>`;
  return `<div class="beginner-tip"><b>Beginner lens</b><span>Look for names, URLs, dates, unusual wording, or a page that does not match what the user expected. You are comparing details, not trying to hack the site.</span></div><div class="browser-sidebar"><div class="route-list">${pages.map(x=>`<button class="route-btn ${x.id===p.id?'active':''}" data-browser="${x.id}" ${x.id===p.id?'aria-current="page"':''}>${esc(x.title)}<br><small>${esc(x.url)}</small></button>`).join('')}</div><div class="browser-shell"><div class="browser-chrome"><span class="browser-dot"></span><span class="browser-dot"></span><span class="browser-dot"></span><div class="address">${esc(p.url)}</div></div><div class="browser-page">${pageContent}</div></div></div>`;
}

function mailTool(c,cs) {
  const mails = c.mails || [];
  if (!mails.length) return `<div class="empty">No mailbox is attached to this case.</div>`;
  const activeId = cs.mailId || mails[0].id;
  const m = mails.find(x=>x.id===activeId) || mails[0];
  return `<div class="beginner-tip"><b>Beginner lens</b><span>Read this like a detective: who appears to have sent it, what the real address says, what the message asks the person to do, and whether the timing connects to later events.</span></div><div class="mail-layout"><div class="mail-list">${mails.map(x=>`<button class="mail-item ${x.id===m.id?'active':''}" data-mail="${x.id}" type="button" ${x.id===m.id?'aria-current="true"':''}><strong>${esc(x.subject)}</strong><span>${esc(x.from)} · ${esc(x.date)}</span></button>`).join('')}</div><div class="mail-pane"><div class="mail-header"><h3>${esc(m.subject)}</h3><div class="kv"><div>From</div><div>${esc(m.from)}</div><div>To</div><div>${esc(m.to)}</div><div>Date</div><div>${esc(m.date)}</div></div></div><div class="mail-body">${nl(m.body)}</div><details><summary style="margin-top:18px;color:var(--accent);cursor:pointer;font-size:12px">View raw headers / metadata</summary><div class="raw-box">${esc(m.raw)}</div></details></div></div>`;
}

function logsTool(c,cs) {
  const logs = c.logs || [];
  if (!logs.length) return `<div class="empty">No log surface is attached to this case.</div>`;
  const activeId = cs.logId || logs[0].id;
  const l = logs.find(x=>x.id===activeId) || logs[0];
  return `<div class="beginner-tip"><b>How to read logs</b><span>Each line is one recorded event. Start with the timestamp, then compare repeated users, devices, addresses, sessions, or SUCCESS/FAILED results. You do not need to understand every field.</span></div><div class="log-toolbar"><select class="log-select" id="log-source" aria-label="Log source">${logs.map(x=>`<option value="${esc(x.id)}" ${x.id===l.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select><input class="log-search" id="log-filter" aria-label="Filter current log" placeholder="filter current log (e.g. user, IP, process, session)" /></div><div class="log-viewer" id="log-viewer" data-raw="${encodeURIComponent(l.text)}">${esc(l.text)}</div>`;
}

function evidenceTool(c,cs) {
  const pinned = new Set(cs.pinned || []);
  return `<div class="beginner-tip"><b>Evidence locker</b><span>These are preserved artifacts from the case. Pin a clue when it helps answer: what happened, when did it happen, who/what was involved, or what should happen next.</span></div><div class="evidence-grid">${(c.evidence||[]).map(x=>`<article class="evidence-card"><div class="evidence-thumb"><img src="${evidenceSceneAsset(x)}" alt="Evidence preview for ${esc(x.title)}"></div><div class="eyebrow">${esc(x.type)}</div><h4>${esc(x.title)}</h4><p>${esc(x.summary)}</p><details><summary style="cursor:pointer;color:var(--accent);font-size:11px">Inspect details</summary><div class="raw-box">${esc(x.detail)}</div></details><div class="evidence-actions"><button class="micro-btn ${pinned.has(x.id)?'pinned':''}" data-pin="${x.id}">${pinned.has(x.id)?'Pinned to board':'Pin to case board'}</button></div></article>`).join('')}</div>`;
}

function boardTool(c,cs) {
  const ids = cs.pinned || [];
  const items = ids.map(id=>c.evidence.find(e=>e.id===id)).filter(Boolean);
  return `<div class="beginner-tip"><b>Your working board</b><span>This is not a checklist of “correct answers.” It is your selected evidence. A stronger board contains clues that connect into one believable timeline.</span></div><div class="board">${items.length?items.map(x=>`<article class="board-card"><div class="board-thumb"><img src="${evidenceSceneAsset(x)}" alt="Pinned evidence visual for ${esc(x.title)}"></div><small>${esc(x.type)}</small><h4>${esc(x.title)}</h4><p>${esc(x.summary)}</p><button class="micro-btn" data-pin="${x.id}">Remove</button></article>`).join(''):`<div class="board-empty"><strong>No evidence pinned.</strong><br><br>Use the Evidence surface to place only the artifacts you think belong in your working theory.</div>`}</div>`;
}

function actionsTool(c,cs) {
  const done = cs.actions || {};
  return `<div class="beginner-tip warning"><b>Response rule</b><span>When possible: preserve important evidence first, then contain the danger. You can make a poor choice and see the consequence; this is a training simulation.</span></div><div style="height:12px"></div><div class="action-grid">${(c.actions||[]).map(a=>`<article class="action-card"><div><h4>${esc(a.label)}</h4><p>${esc(a.description)}</p></div><button class="secondary-btn" data-action="${a.id}" ${done[a.id]?'disabled':''}>${done[a.id]?'Applied':'Apply'}</button>${done[a.id]?`<div class="action-result ${a.quality==='good'?'good':'bad'}">${esc(a.outcome)}</div>`:''}</article>`).join('')}</div>`;
}

function notesTool(c,cs) {
  return `<div class="beginner-tip"><b>Write like a detective, not an expert</b><span>Simple notes are enough: “03:17 login is from a new device,” “email domain spelling is different,” “same session appears after password reset.”</span></div><textarea class="note-area" id="notes" aria-label="Case notebook" placeholder="Write observations, timestamps, contradictions, hypotheses, commands to retry, and what you still need to prove…">${esc(cs.notes||'')}</textarea><div class="autosave">Saved automatically to this case.</div>`;
}

function hintsTool(c,cs) {
  const level = cs.hintLevel || 0;
  return `<div class="beginner-tip"><b>TRACE Assistant</b><span>Open these whenever you are stuck. Using help does not lower a score or penalize the case.</span></div><div style="height:12px"></div><div class="hint-stack">${c.hints.map((h,i)=>`<div class="hint-card ${i>=level?'locked':''}"><strong>Nudge ${i+1}</strong>${i<level?`<p>${esc(h)}</p>`:`<p>Not opened.</p>`}</div>`).join('')}</div><div style="height:12px"></div>${level<c.hints.length?`<button class="secondary-btn" data-hint>Open next nudge</button>`:`<span class="tag">All nudges opened</span>`}`;
}

function theoryTool(c,cs) {
  const t = cs.theory || {finding:'',impact:'',response:''};
  const pinned = (cs.pinned||[]).length;
  return `<div class="report-header"><div><div class="eyebrow">Final investigator report</div><h2>Tell the story your evidence supports.</h2><p>Write normally. You are evaluated on the connections you make, not on using advanced cybersecurity words.</p></div><div class="report-seal">${esc(c.id)}<small>${pinned} clue${pinned===1?'':'s'} pinned</small></div></div>${pinned===0?'<div class="beginner-tip warning"><b>No evidence pinned yet</b><span>You can still write, but your report will be easier to defend after you place useful clues on the Evidence Board.</span></div>':''}<div class="theory-grid">
    <div class="field"><label for="theory-finding">1. What do you think happened?</label><small>Starter: “I think the incident began when… I believe this because…”</small><textarea id="theory-finding" placeholder="Describe the likely incident and mention the clues that connect together.">${esc(t.finding)}</textarea></div>
    <div class="field"><label for="theory-impact">2. What was affected or placed at risk?</label><small>Starter: “The evidence shows… We still do not know…”</small><textarea id="theory-impact" placeholder="State what the attacker/person/system could access, change, expose, or disrupt.">${esc(t.impact)}</textarea></div>
    <div class="field"><label for="theory-response">3. What should be done next?</label><small>Starter: “First preserve… Then stop… Finally prevent…”</small><textarea id="theory-response" placeholder="Put the response in an order you can justify.">${esc(t.response)}</textarea></div>
    <button class="primary-btn" data-review>Run evidence review</button>
  </div>${cs.review?reviewBlock(cs.review):''}`;
}

function reviewBlock(review) {
  return `<div class="review"><div class="review-head"><strong>Case review</strong><span class="tag">reasoning, not trivia</span></div>${review.map(r=>`<div class="review-item"><div class="review-status ${r.status}">${r.status==='supported'?'supported':r.status==='partial'?'needs support':'unsupported'}</div><div><strong>${esc(r.label)}</strong><p>${esc(r.message)}</p></div></div>`).join('')}</div>`;
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

  document.querySelectorAll('[data-command]').forEach(b=>b.addEventListener('click',()=>{
    const c=caseById(state.activeCase), cs=caseState(c.id), result=executeCommand(c,b.dataset.command||'');
    if(!result)return;
    const history=result.clear?[]:[...(cs.terminal||[]),result].slice(-80);
    patchCase(c.id,{terminal:history,visitedTools:[...new Set([...(cs.visitedTools||[]),'terminal'])]}); render();
    setTimeout(()=>{const out=document.getElementById('terminal-output');if(out)out.scrollTop=out.scrollHeight;},0);
  }));

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