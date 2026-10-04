# TRACE V10.1 Audit Report

## Scope

Audit of the V10 C001–C100 static web application, covering case-data integrity, rendering, local/cloud persistence, Supabase access patterns, deployment headers, accessibility, responsive behavior, and maintainability. The case scenarios and intended investigation mechanics were preserved.

## Important findings fixed

### 1. C075 browser pages could render incorrectly

C075 stores two simulated browser pages with a `body` field, while the V10 renderer only output `page.html`. Those pages could therefore appear empty or show `undefined` instead of the intended training content.

**Fix:** the browser renderer now safely supports both trusted case HTML and escaped text-body pages. Validation now accepts either representation.

### 2. Cloud sign-in could replace newer local work with stale remote state

V10 loaded the remote Supabase state wholesale after sign-in. If a user's browser had newer work than the cloud row, the local state could be replaced.

**Fix:** saves now carry per-case timestamps. Local and remote states are merged case-by-case, preferring the newer copy for each overlapping case. Navigation state comes from the newer global state, and the merged result is written back locally and to cloud.

### 3. Saved-state normalization was too permissive

Malformed or legacy state values could flow into the UI with little shape checking. LocalStorage write failures could also throw through normal interaction.

**Fix:** added normalization for case state, theory fields, arrays, hint level, timestamps, terminal-history bounds, and safer LocalStorage reads/writes.

### 4. Case archive did not scale well to 100 cases

The archive presented all 100 cards without a search affordance or a lightweight indication of previously opened/reviewed cases.

**Fix:** added instant case search by ID/title/subtitle/tier, result count, clear control, in-progress status, supported-review status, and `/` keyboard shortcut.

### 5. Several interaction/accessibility gaps

Mail rows were non-semantic clickable `div` elements, dialog/input labels were incomplete, mobile navigation lacked a scrim, and reduced-motion preferences were not handled.

**Fix:** semantic buttons and current-state attributes, dialog semantics, input labels, mobile navigation scrim, Escape handling, responsive refinements, disabled-button styling, screen-reader utility class, and reduced-motion CSS.

### 6. Sync status could be misleading after a cloud failure

When a cloud save failed, the top bar could still visually imply a successful cloud save.

**Fix:** added a distinct `sync issue` status while retaining the local copy.

### 7. Deployment/API hardening opportunities

The public config function accepted any HTTP method and the header set could be strengthened.

**Fix:** `/api/config` is GET-only with explicit no-store response behavior. Vercel headers now include HSTS, COOP, CORP, `object-src 'none'`, and `frame-src 'none'` in addition to the existing CSP/frame/referrer/permissions protections.

### 8. Supabase setup was not comfortably re-runnable

Re-running the original schema after policies existed could fail on duplicate policy creation.

**Fix:** policy creation is now idempotent through `drop policy if exists`, and authenticated permissions are explicit.

## Validation improvements

`validate.mjs` now checks additional browser, mail, and log structure. Browser HTML is rejected if it contains active script/frame/object/embed/form content, inline event handlers, or `javascript:` URLs. This protects the simulated-browser trust boundary as new cases are authored.

A new `tests/smoke.mjs` verifies:

- C001 and C100 resolution and 100-case count.
- Per-case local/cloud merge precedence.
- Preservation of remote-only cases.
- Safe handling of malformed state.
- Pinned-evidence de-duplication.
- Terminal-history bounding.

## Verification result

The final audited build passes:

```text
npm run check
node validate.mjs
node tests/smoke.mjs
```

All 100 cases validate successfully.

## Files materially changed

- `js/app.js`
- `js/storage.js`
- `js/supabase.js`
- `styles.css`
- `validate.mjs`
- `api/config.js`
- `supabase/schema.sql`
- `package.json`
- `README.md`

Added:

- `tests/smoke.mjs`
- `AUDIT_REPORT.md`

## Remaining design note

The evidence-review engine intentionally uses phrase-group matching rather than semantic grading. That keeps the project dependency-free and deterministic, but it means the review is a coaching heuristic rather than a full natural-language assessment. This behavior was left intact because changing it would alter the learning mechanic rather than simply harden or polish the existing build.
