import { cases, caseById } from '../js/cases.js';
import { getCaseState, mergeStates, normalizeState } from '../js/storage.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(cases.length === 100, 'Expected exactly 100 cases');
assert(caseById('C001')?.id === 'C001', 'caseById should resolve C001');
assert(caseById('C100')?.id === 'C100', 'caseById should resolve C100');

const local = normalizeState({
  activeCase: 'C001',
  updatedAt: '2026-10-04T01:00:00Z',
  cases: {
    C001: { notes: 'newer local work', updatedAt: '2026-10-04T02:00:00Z' }
  }
});
const remote = normalizeState({
  activeCase: 'C002',
  updatedAt: '2026-10-04T03:00:00Z',
  cases: {
    C001: { notes: 'older remote work', updatedAt: '2026-10-04T01:30:00Z' },
    C002: { notes: 'remote-only work', updatedAt: '2026-10-04T02:30:00Z' }
  }
});
const merged = mergeStates(local, remote);
assert(getCaseState(merged, 'C001').notes === 'newer local work', 'Merge must preserve newer per-case local work');
assert(getCaseState(merged, 'C002').notes === 'remote-only work', 'Merge must preserve remote-only case work');
assert(merged.activeCase === 'C002', 'Merge should use navigation state from the newer global state');

const malformed = normalizeState({
  activeCase: 123,
  cases: { C003: { pinned: ['e1','e1',null], terminal: new Array(120).fill({cmd:'x',out:'y'}) } }
});
assert(malformed.activeCase === 'C001', 'Malformed active case should normalize safely');
assert(getCaseState(malformed, 'C003').pinned.length === 1, 'Pinned evidence should be de-duplicated');
assert(getCaseState(malformed, 'C003').terminal.length === 80, 'Terminal history should be bounded');
assert(Array.isArray(getCaseState(normalizeState({cases:{C004:{visitedTools:['mail','mail','guide']}}}), 'C004').visitedTools), 'Visited tools should normalize as an array');
assert(getCaseState(normalizeState({cases:{C004:{visitedTools:['mail','mail','guide']}}}), 'C004').visitedTools.length === 2, 'Visited tools should be de-duplicated');

console.log('TRACE smoke tests passed.');
