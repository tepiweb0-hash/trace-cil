# TRACE V10.2 — Investigation Game Rework

## Goal
Transform the existing cyber-themed lab from an exercise/quiz-feeling interface into a dark investigation game that is playable by someone with zero prior networking or cybersecurity knowledge.

## What changed

- Preserved all C001–C100 case datasets and V10.1 fixes.
- Added a dark investigation-workstation visual layer: incident alerts, dossier treatment, subtle CRT scanlines, status signals, and case-focused tool presentation.
- Reframed the home screen around accepting and investigating incidents rather than completing lessons.
- Added an Investigation Pulse that reflects workflow progress only: inspect, collect evidence, write notes, draft a report, review evidence.
- Added a permanent Field Guide to every case even though the original case data does not need to be rewritten.
- Added context-sensitive plain-English glossary entries for foundational and advanced terms.
- Added beginner instructions directly inside Inbox, Browser, System Logs, Terminal, Evidence Locker, Evidence Board, Response Console, Notes, and Final Report.
- Added clickable terminal commands extracted from each case's existing help command so players do not need command-line knowledge.
- Reworked the case briefing around Observe → Connect → Collect → Explain.
- Reworked theory submission into a guided Final Investigator Report with sentence starters.
- Retained progressive TRACE Assistant nudges with no penalty for using help.
- Added saved `visitedTools` state to power investigation progress without changing case answers.

## Beginner design rule

TRACE must teach a concept before relying on that concept. The player is evaluated on evidence-based reasoning, not on prior knowledge of cybersecurity vocabulary.

## Validation

`npm test` passes:
- JavaScript syntax checks
- all 100 case data validations
- state normalization and merge smoke tests
- visited-tool normalization tests
