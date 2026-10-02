# Page Flow
Routes: `/` landing, `/app` dashboard, `/app/applications`, `/app/applications/new`, `/app/applications/[id]`, `/app/notifications`, `/app/settings` (includes model status).

Template per page: Purpose · Goal · Info · Primary · Secondary · Hierarchy · Interactions · Animations · Responsive.

1. **Landing** — Pitch + scroll story. Goal: understand in 20s. Info: tagline "Silence is data.", 5-step story, giant stat (e.g. "73% of applications never get a reply" only if sourced—else omit), local-privacy section, Temporal explainer. Primary: Open app. Secondary: Watch demo, GitHub. Hierarchy: Display type → pinned story → CTA block (signal color). Animations: full set (ANIMATION_SYSTEM). Responsive: vertical story.
2. **Dashboard** — Goal: what needs me now? Info: giant count "N awaiting review", hunting count, next timer countdown, list of active hunts with status chips, model health dot. Primary: New application. Secondary: open item. Layout: asymmetrical, left giant numerals, right list. Anim: counters, live status transitions.
3. **Applications** — table-like editorial list; filters by status; search. Primary: open detail. Empty state: giant "Nothing to hunt yet." + create CTA.
4. **Application Detail** — Goal: full picture of one hunt. Info: header (company/role huge), status, countdown, trail timeline, outreach context, follow-ups. Primary: contextual (Start hunt / Review draft / Mark replied). Secondary: edit, cancel, snooze. Anim: node transitions.
5. **Create Application** — stepped single-column form (company → role → recruiter → outreach context → cadence). Primary: Start Ghost-Hunter (creates + starts). Secondary: save as draft. Validation inline.
6. **Outreach Timeline** — component within detail; also full-width view. Events from DB, current stage from Query.
7. **Follow-up Configuration** — within create/edit: delay (with demo-mode toggle), max follow-ups, review timeout.
8. **Active Workflow view** — panel: workflow ID, status, stage, next fire time, "Temporal history" link (to local UI :8233), restart-proof note. WOW-moment surface.
9. **AI Draft Review** — Goal: decide fast. Info: draft subject/body (editable), source badge (Gemma/template), context recap, word count. Primary: Approve & copy. Secondary: Regenerate, Skip, Snooze. Anim: text streams in.
10. **Recruiter Response State** — Moss full-bleed confirmation "They replied. Hunt over." with timeline; reached via Mark replied. Anim: trail line completes.
11. **Notifications** — chronological feed, unread dots; mark all read.
12. **Settings** — demo mode, default delay, Ollama URL/model, notification permission.
13. **AI/Local Model Status** — card in Settings + dot in nav: reachable, model installed, last latency, "Test generate".
14. **Empty states** — oversized type + one action each.
15. **Error states** — API down, Temporal down, Ollama down (DEGRADED banner with template option), 404, form errors; copy is calm and specific.
