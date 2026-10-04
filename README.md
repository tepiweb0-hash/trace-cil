# TRACE — Cyber Investigation Lab V10.1

**Build:** V10.1 / Cases C001–C100

A Vercel-ready, self-learning cybersecurity detective game focused on practical investigation, authorized penetration-testing logic, incident response, security configuration, and defensive hardening.

## V10.1 quality and resilience pass

This audited build keeps the C001–C100 investigation content intact while improving the surrounding application:

- Fixed the C075 simulated browser renderer so pages using text `body` content display correctly alongside HTML-backed pages.
- Added searchable case archive with in-progress and evidence-review status cues.
- Added a Continue action on the investigation desk for the active case.
- Added per-case save timestamps and safer local/cloud merge behavior to avoid a stale cloud save blindly replacing newer local case work.
- Hardened local-state normalization against malformed or older saved data and bounded terminal history during normalization.
- Improved cloud sync status reporting and best-effort Supabase logout.
- Improved mobile navigation, keyboard Escape handling, `/` shortcut for case search, focus styles, labels, dialog semantics, reduced-motion support, and small-screen layouts.
- Strengthened Vercel security headers and made `/api/config` GET-only.
- Made the Supabase schema safe to re-run and added explicit authenticated table grants.
- Expanded validation for browser/mail/log case data and added smoke tests for state merging and normalization.

Run the full verification suite with:

```bash
npm test
```

See `AUDIT_REPORT.md` for the findings and changes.

## What is included

- 100 data-driven cases. V10 adds C091–C100 without replacing the first 90 cases.
- Practical case work instead of a conventional lesson/module/quiz structure.
- Simulated terminal with case-specific commands and evidence.
- Simulated browser, HTTP, API, identity, file-share, directory, packet-analysis, cloud-storage, container, certificate, network-segmentation, and host-analysis surfaces.
- Mail and raw-header inspection where cases need it.
- Log filtering and cross-system correlation.
- Evidence board.
- Response/hardening actions with consequences.
- Free-form notebook and theory submission.
- Evidence-based review with no XP, levels, streaks, progress bars, or numeric scores.
- Local browser persistence by default.
- Optional Supabase email/password login and per-user cloud save.
- Vercel serverless `/api/config` endpoint for public Supabase configuration.

## V5 case arc: C041–C050

- C041 — Kerberos service delegation investigation: distinguish delegated identity from interactive user activity and remove obsolete delegation.
- C042 — enterprise certificate-template assessment: unsafe subject control, authentication EKU, enrollment scope, and safe template redesign.
- C043 — Kubernetes workload identity and RBAC: unnecessary service-account tokens, secret access, and least-privilege/network hardening.
- C044 — container supply-chain integrity: mutable tags, retired CI credentials, unsigned image provenance, immutable digests, and admission controls.
- C045 — network segmentation assessment: first-match ACL errors, management-plane exposure, blast-radius reasoning, and regression testing.
- C046 — secrets in Git history: provider-side revocation, evidence preservation, history cleanup, and secret scanning.
- C047 — rogue DHCP/DNS investigation: resolver redirection, switch-port attribution, TLS identity warnings, and DHCP-snooping controls.
- C048 — Windows privileged scheduled-task integrity: writable SYSTEM-executed content, harmless proof, ACL redesign, and signed-script validation.
- C049 — SaaS session lifecycle after offboarding: IdP disablement versus surviving refresh sessions, revocation integration, and shorter conditional sessions.
- C050 — advanced cross-domain capstone spanning stale certificate VPN access, management routing, Kubernetes secret permissions, registry image integrity, and private object-store data access.

## V6 case arc: C051–C060

- C051 — transitive Active Directory delegation: inherited group-write authority, nested server-admin impact, safe proof, and least-privilege redesign.
- C052 — endpoint credential-material investigation: LSASS access, memory-dump evidence, outbound movement, evidence limits, and Credential Guard hardening.
- C053 — Windows logon persistence: HKCU Run keys, script/process correlation, fleet scoping, installer origin, and behavior-focused hunting.
- C054 — cloud workload identity: overprivileged instance roles, safe IAM simulation, IMDS control separation, and resource-scoped redesign.
- C055 — reverse-proxy identity trust: direct-route bypass, spoofable identity headers, proxy-origin validation, and network/app defense in depth.
- C056 — Linux SSH persistence: unauthorized authorized_keys entries, successful-key usage, offboarding gaps, and managed key lifecycle.
- C057 — policy-distribution privilege: writable GPO startup content, harmless write validation, share/NTFS hardening, and integrity controls.
- C058 — hybrid directory-to-cloud federation: transitive group eligibility, scoped assertion proof, exposure-vs-exploitation discipline, and trust redesign.
- C059 — endpoint exclusion engineering: broad build-cache blind spots, behavioral scoping, performance-aware narrowing, and executable separation.
- C060 — advanced hybrid capstone spanning directory delegation, transitive server/cloud privilege, endpoint blind paths, reverse-proxy bypass, precise impact scoping, and root-cause containment.

## V7 case arc: C061–C070

- C061 — managed service-account secret access: nested effective readers, exposure-vs-compromise discipline, and safe credential rotation.
- C062 — production computer-object delegation: stale GenericWrite, trust-setting changes, Kerberos-use evidence, and ACL redesign.
- C063 — Kubernetes runtime boundary: privileged support pods, containerd socket exposure, observed-use scoping, and admission hardening.
- C064 — cloud storage + KMS compound permissions: direct object retrieval, decrypt rights, denied listing, and split-control redesign.
- C065 — Windows legacy authentication fallback: protocol-use inventory, approved versus unapproved NTLM, dependency migration, and phased enforcement.
- C066 — service-mesh identity boundary: permissive namespace exceptions, mTLS identity, network reachability, denied requests, and stale-path removal.
- C067 — Linux user-level systemd persistence: unit files, linger behavior, journal correlation, and targeted removal.
- C068 — detection engineering after schema drift: parser failure, normalized fields, backtesting, blind-interval analysis, and false-positive control.
- C069 — just-in-time privileged access versus session lifetime: expired assignments, surviving tokens, revocation, and continuous authorization.
- C070 — advanced maintenance-window capstone spanning directory delegation, Kubernetes runtime exposure, cloud encryption permissions, legitimate-change separation, and evidence-bounded containment.

## V8 case arc: C071–C080

- C071 — certificate-backed shadow identity: explicit certificate mapping, orphaned service identity, privileged VPN access, and offboarding governance.
- C072 — cloud workload federation trust: OIDC subject wildcards, safe IAM simulation, exact workflow binding, and short-lived credential preservation.
- C073 — incomplete secret rotation: parallel database principals, retired consumers, evidence-bounded use, and revocation-centered rotation design.
- C074 — endpoint visibility validation: healthy sensor versus broad telemetry exclusion, controlled reproduction, performance-aware narrowing, and evidence discipline.
- C075 — service-to-service impersonation: direct-route bypass, spoofable identity headers, verified workload identity, and defense-in-depth regression testing.
- C076 — network egress assessment: any-HTTPS exposure, hostname versus direct-IP enforcement, dependency-derived allowlisting, and monitored exceptions.
- C077 — Linux privileged configuration boundary: root systemd service, writable EnvironmentFile, harmless proof marker, and allowlisted deployer configuration.
- C078 — incident-response sequencing: destructive identity deletion, automatic break-glass fallback, evidence preservation, workload isolation, and staged restoration.
- C079 — vault authorization after asset retirement: stale machine certificates, broad OU policy, exposure-versus-use discipline, and current-workload identity binding.
- C080 — advanced compound-trust capstone spanning CI OIDC trust, production manifest access, broad egress, endpoint blind spots, stale DB credentials, causality discipline, and availability-preserving containment.

## V9 case arc: C081–C090

- C081 — SAML relying-party binding: valid signature versus wrong audience/recipient, safe replay proof, and exact ACS validation.
- C082 — cross-account cloud role chaining: transitive AssumeRole paths, observed-use scoping, and trust-graph redesign.
- C083 — endpoint maintenance-control abuse: healthy sensor versus intentional telemetry suppression, evidence limits, and ticket-bound anti-tamper governance.
- C084 — authenticated reverse-proxy cache leakage: incomplete cache keys, origin-versus-edge attribution, and private-response cache bypass.
- C085 — Kubernetes admission fail-open: webhook outage, `failurePolicy: Ignore`, harmless bypass proof, high availability, and governed break-glass.
- C086 — Linux sudo policy ownership: writable `sudoers.d` include, harmless root marker proof, and separation of deploy versus authorization control.
- C087 — enterprise browser extension supply chain: abandoned custom update infrastructure, retained force-install trust, fleet scoping, and lifecycle governance.
- C088 — secrets in dead-letter queues: decoded failure payloads, short-lived token persistence, least-data debugging, reader scope, and retention.
- C089 — volatile incident-response sequencing: network isolation, in-memory runspace/token capture, persistent artifact collection, and evidence-aware reboot timing.
- C090 — Recovery Window capstone spanning cross-service SAML acceptance, fail-open Kubernetes admission, brokered cloud role access, legitimate recovery changes, correlation discipline, volatile evidence, and continuity-aware containment.

## Local preview

From this folder:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

Local preview intentionally falls back to browser-local saves because the Vercel `/api/config` function is not running under the simple Python server.

## Verification

```bash
npm run check
node validate.mjs
```

This project has no runtime npm dependencies.

## Supabase files

`supabase/schema.sql` contains the save table and row-level security policies. When cloud save is enabled on Vercel, set `SUPABASE_URL` and `SUPABASE_ANON_KEY` as environment variables.

All case hosts, domains, IPs, credentials, logs, vulnerabilities, and assessment targets are fictional training artifacts. The interactive environment does not connect its testing tools to arbitrary external systems.


## V10 case arc: C091–C100

- C091 — reverse-proxy/origin request-boundary desynchronization: dual parser traces, harmless canary proof, impact discipline, and parser-alignment regression.
- C092 — Windows authentication relay defenses: SMB signing, LDAP signing/channel binding, evidence-bounded relay proof, and staged legacy migration.
- C093 — endpoint memory/process forensics: private executable memory, remote-thread provenance, socket correlation, and volatile-evidence sequencing.
- C094 — dependency-confusion supply-chain assessment: public fallback resolution, benign proof package, pipeline scoping, private namespaces, source pinning, and provenance.
- C095 — conditional cloud IAM privilege: mutable authorization tags, safe simulation, exposure-versus-use discipline, and immutable/admin-controlled eligibility.
- C096 — recovery trust regression: old snapshots resurrecting revoked SSH access, restore-time attribution, approved validation use, and post-restore identity reconciliation.
- C097 — browser `postMessage` trust: exact origin validation, strict message schemas, bounded preview impact, and server-side authorization defense in depth.
- C098 — stale Active Directory replication rights: effective ACLs, observed non-DC replication use, source-session correlation, least-privilege containment, and credential response.
- C099 — CI/CD signer provenance: valid signatures on untrusted build inputs, emergency-builder policy gaps, artifact quarantine, and attestation-gated signing.
- C100 — expert enterprise capstone spanning dependency resolution, mutable cloud authorization, production data access, signing/provenance, correlation discipline, independent endpoint/recovery findings, and continuity-aware containment.
