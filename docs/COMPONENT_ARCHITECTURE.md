# Component Architecture (spec only — no code)
**Pages (app router):** `/` Landing · `/app` Dashboard · `/app/applications` · `/app/applications/new` · `/app/applications/[id]` · `/app/notifications` · `/app/settings`.
**Layouts:** `MarketingLayout` (Lenis, grain, overlay nav) · `AppLayout` (slim nav, model-health dot, notification bell, SSE subscriber).
**Primitives:** `Display`, `Text`, `MonoData`, `Button`, `LinkArrow`, `Field` (text/textarea/select/stepper), `StatusChip`, `Hairline`, `Grain`, `Section` (color-block), `Counter`.
**Domain components:** `ApplicationRow`, `ApplicationHeader`, `TrailTimeline`, `TimelineNode`, `CountdownMono`, `HuntControls`, `DraftReviewPanel`, `DraftEditor`, `FollowUpList`, `WorkflowPanel`, `ModelStatus`, `NotificationItem`, `EmptyState`, `ErrorState`, `DegradedBanner`, `CreateApplicationStepper`.
**Animation components:** `RevealText`, `ClipReveal`, `Magnetic`, `PinnedStory`, `HorizontalScroller`, `RadarSweep`, `PageCurtain`, `StreamText`.
**Hooks:** `useApplications`, `useApplication(id)`, `useCreateApplication`, `useHuntActions(id)` (start/reply/cancel/decision), `useEventStream` (SSE → query invalidation), `useModelHealth`, `useNotifications`, `useReducedMotion`, `useCountdown(targetISO)`.
**Data layer:** TanStack Query; `api/client.ts` typed fetch wrapper; zod schemas shared from `packages/shared`. SSE events invalidate `applications`, `application:id`, `notifications` keys.
**State:** server state in Query; ephemeral UI in component state; settings (demo mode) in localStorage.
**Types:** Application, FollowUp, Event, Notification, WorkflowState, enums for status — defined once in `packages/shared`.
**Assets:** SVG radar/trail/ghost-waveform set, fonts via `next/font`, noise SVG.
**Responsive:** mobile-first; asymmetry collapses to stacked; type via clamp; pinned stories degrade to vertical.
