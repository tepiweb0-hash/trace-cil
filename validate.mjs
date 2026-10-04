import { cases } from './js/cases.js';
const allowedTools = new Set(['overview','terminal','browser','mail','logs','evidence','board','actions','notes','hints','theory']);
const failures=[];
const ids=new Set();
for (const c of cases) {
  if (ids.has(c.id)) failures.push(`${c.id}: duplicate case id`); ids.add(c.id);
  for (const k of ['id','title','subtitle','tier','brief','environment']) if (!c[k]) failures.push(`${c.id}: missing ${k}`);
  if (!Array.isArray(c.tools) || !c.tools.includes('overview') || !c.tools.includes('theory')) failures.push(`${c.id}: bad tools`);
  for (const t of c.tools||[]) if (!allowedTools.has(t)) failures.push(`${c.id}: unknown tool ${t}`);
  for (const key of ['evidence','actions','hints','evaluation']) if (!Array.isArray(c[key]) || c[key].length===0) failures.push(`${c.id}: empty ${key}`);
  if ((c.hints||[]).length < 3) failures.push(`${c.id}: fewer than 3 hints`);
  const evid = new Set(); for (const e of c.evidence||[]) { if(evid.has(e.id)) failures.push(`${c.id}: dup evidence ${e.id}`); evid.add(e.id); for(const k of ['id','title','type','summary','detail']) if(!e[k]) failures.push(`${c.id}:${e.id}: missing ${k}`); }
  const act = new Set(); for (const a of c.actions||[]) { if(act.has(a.id)) failures.push(`${c.id}: dup action ${a.id}`); act.add(a.id); for(const k of ['id','label','description','outcome','quality']) if(!a[k]) failures.push(`${c.id}:${a.id}: missing ${k}`); if(!['good','bad'].includes(a.quality)) failures.push(`${c.id}:${a.id}: bad quality`); }
  for (const r of c.evaluation||[]) { if(!r.label || !Array.isArray(r.groups) || r.groups.length===0 || !r.supported || !r.partial || !r.missing) failures.push(`${c.id}: malformed evaluation`); }
  for (const row of c.terminal||[]) { if (!(row[0] instanceof RegExp)) failures.push(`${c.id}: terminal matcher is not RegExp`); }

  const toolData = { terminal:'terminal', browser:'browser', mail:'mails', logs:'logs' };
  for (const [tool,key] of Object.entries(toolData)) {
    if ((c.tools||[]).includes(tool) && (!Array.isArray(c[key]) || c[key].length===0)) failures.push(`${c.id}: tool ${tool} has no backing ${key} data`);
  }
  if ((c.terminal||[]).length && !(c.terminal||[]).some(([rx]) => rx instanceof RegExp && rx.test('help'))) failures.push(`${c.id}: terminal has no help command`);
  for (const key of ['browser','mails','logs']) {
    const seen = new Set();
    for (const item of c[key]||[]) { if (seen.has(item.id)) failures.push(`${c.id}: duplicate ${key} id ${item.id}`); seen.add(item.id); }
  }
  for (const page of c.browser||[]) {
    if (!page.id || !page.title || !page.url || (typeof page.html !== 'string' && typeof page.body !== 'string')) failures.push(`${c.id}: malformed browser page`);
    if (typeof page.html === 'string' && /<(?:script|iframe|object|embed|form)\b|\son[a-z]+\s*=|javascript:/i.test(page.html)) failures.push(`${c.id}:${page.id}: active browser content is not allowed`);
  }
  for (const mail of c.mails||[]) {
    for (const k of ['id','subject','from','to','date','body','raw']) if (typeof mail[k] !== 'string') failures.push(`${c.id}:${mail.id||'mail'}: missing ${k}`);
  }
  for (const log of c.logs||[]) {
    if (!log.id || !log.name || typeof log.text !== 'string') failures.push(`${c.id}:${log.id||'log'}: malformed log`);
  }
}
const expected=Array.from({length:100},(_,i)=>`C${String(i+1).padStart(3,'0')}`);
for(const id of expected) if(!ids.has(id)) failures.push(`missing expected ${id}`);
if(cases.length!==100) failures.push(`expected 100 cases, got ${cases.length}`);
if(failures.length){ console.error(failures.join('\n')); process.exit(1); }
console.log(`Validated ${cases.length} cases.`);
console.log(cases.map(c=>`${c.id} | ${c.title} | ${c.evidence.length} evidence | ${c.actions.length} actions | ${c.evaluation.length} review dimensions`).join('\n'));
