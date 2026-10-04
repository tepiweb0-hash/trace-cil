const KEY = 'trace.cyberlab.state.v1';

const DEFAULT_CASE_STATE = Object.freeze({
  notes: '',
  pinned: [],
  actions: {},
  terminal: [],
  theory: { finding: '', impact: '', response: '' },
  review: null,
  hintLevel: 0,
  mailId: null,
  browserId: null,
  logId: null,
  updatedAt: null,
  openedAt: null
});

export function freshState() {
  return {
    activeCase: 'C001',
    activeTool: 'overview',
    cases: {},
    updatedAt: new Date().toISOString()
  };
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function validDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null;
}

export function normalizeCaseState(input) {
  const raw = asObject(input);
  const theory = asObject(raw.theory);
  return {
    ...DEFAULT_CASE_STATE,
    ...raw,
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    pinned: Array.isArray(raw.pinned) ? [...new Set(raw.pinned.filter(x => typeof x === 'string'))] : [],
    actions: asObject(raw.actions),
    terminal: Array.isArray(raw.terminal) ? raw.terminal.slice(-80) : [],
    theory: {
      finding: typeof theory.finding === 'string' ? theory.finding : '',
      impact: typeof theory.impact === 'string' ? theory.impact : '',
      response: typeof theory.response === 'string' ? theory.response : ''
    },
    review: Array.isArray(raw.review) ? raw.review : null,
    hintLevel: Number.isFinite(raw.hintLevel) ? Math.max(0, Math.floor(raw.hintLevel)) : 0,
    mailId: typeof raw.mailId === 'string' ? raw.mailId : null,
    browserId: typeof raw.browserId === 'string' ? raw.browserId : null,
    logId: typeof raw.logId === 'string' ? raw.logId : null,
    updatedAt: validDate(raw.updatedAt),
    openedAt: validDate(raw.openedAt)
  };
}

export function getCaseState(state, caseId) {
  return normalizeCaseState(state?.cases?.[caseId]);
}

export function normalizeState(input) {
  const base = freshState();
  const raw = asObject(input);
  const rawCases = asObject(raw.cases);
  const normalizedCases = Object.fromEntries(
    Object.entries(rawCases)
      .filter(([id]) => /^C\d{3}$/.test(id))
      .map(([id, value]) => [id, normalizeCaseState(value)])
  );

  return {
    ...base,
    ...raw,
    activeCase: typeof raw.activeCase === 'string' ? raw.activeCase : base.activeCase,
    activeTool: typeof raw.activeTool === 'string' ? raw.activeTool : base.activeTool,
    cases: normalizedCases,
    updatedAt: validDate(raw.updatedAt) || base.updatedAt
  };
}

export function mergeStates(localInput, remoteInput) {
  const local = normalizeState(localInput);
  const remote = normalizeState(remoteInput);
  const ids = new Set([...Object.keys(local.cases), ...Object.keys(remote.cases)]);
  const cases = {};

  for (const id of ids) {
    const a = local.cases[id];
    const b = remote.cases[id];
    if (!a) { cases[id] = b; continue; }
    if (!b) { cases[id] = a; continue; }
    const aTime = Date.parse(a.updatedAt || local.updatedAt || 0) || 0;
    const bTime = Date.parse(b.updatedAt || remote.updatedAt || 0) || 0;
    cases[id] = bTime > aTime ? b : a;
  }

  const localTime = Date.parse(local.updatedAt || 0) || 0;
  const remoteTime = Date.parse(remote.updatedAt || 0) || 0;
  const newer = remoteTime > localTime ? remote : local;

  return normalizeState({
    ...newer,
    cases,
    updatedAt: new Date(Math.max(localTime, remoteTime, Date.now())).toISOString()
  });
}

export function loadLocalState() {
  try {
    const raw = localStorage.getItem(KEY);
    return normalizeState(raw ? JSON.parse(raw) : null);
  } catch {
    return freshState();
  }
}

export function saveLocalState(state) {
  const next = normalizeState({ ...state, updatedAt: new Date().toISOString() });
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* keep working in-memory */ }
  return next;
}

export function clearLocalState() {
  try { localStorage.removeItem(KEY); } catch { /* storage may be unavailable */ }
}
