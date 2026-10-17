I read the frontend code (components, layout, styles) but haven’t run the UI in a browser, so these come from the source. The design tokens, status colours and the modal animation are solid foundations. The gaps are mostly in robustness and consistency.

Bugs and gaps I confirmed in the code
No mobile or tablet layout. AppShell always adds pl-[232px] for the sidebar, and the sidebar has no collapse state. Below roughly 900px the content is squeezed. Add a hamburger drawer (the sidebar becomes a slide-over) and collapse to icons on tablet.
The “type the project ID to confirm” delete doesn’t work. SettingsForm calls window.confirm(...), which only offers OK or Cancel, so nobody types anything. Build a real confirm dialog with an input that enables the Delete button only when it matches.
Modal accessibility is incomplete. Modal.tsx handles Esc and scroll lock but has no focus trap, no initial focus, no focus return to the trigger button, and a fixed id="modal-title" that will clash when two modals are mounted. Backdrop click also closes it with no “discard changes?” check, so a long project or plan form can be lost with one misclick.
Four native window.confirm dialogs (delete parameter, integration, bulk delete, workspace) look different from the rest of the app and can’t show consequences. Replace them with one ConfirmDialog component.
No loading, error or feedback states. There are zero skeletons, zero toasts, no aria-live regions, no loading.tsx or error.tsx, and only three uses of a pending state. Add skeleton rows for tables, a toast system for save and delete results with Undo, and inline form error summaries.
Almost no visible keyboard focus. No focus-visible styles anywhere. Add a global ring in the accent colour.
The design tokens aren’t used. globals.css defines the palette in @theme, but there are about 1,200 hardcoded hex values in components and pages (for example border-[#C9D0D8]). That makes theming and dark mode a search-and-replace job. Use the token classes (border-border, bg-card, text-muted) and add a lint rule that flags raw hex.
Tables don’t adapt. There are 30 <table> elements but only 2 overflow-x-auto wrappers, so wide tables will break the page on small screens. Wrap them, make the first column sticky, and consider a card layout on phones.
Every tab has the same title. Only one file exports page metadata. Add a per-page title (for example “Test Cases · Checkout Web”) so tabs, history and screen readers make sense.
Check the font. IBM Plex Sans is named in the CSS but I couldn’t find where it’s loaded (next/font or a link). If it isn’t, users see the system font. Load it with next/font/google to avoid layout shift.
Check form labels. There are 119 <label> and 108 <input> elements but no htmlFor. If the labels wrap their inputs that’s fine; if they sit beside them, screen readers won’t connect them.
UX improvements that would make the biggest difference

Navigation and orientation

Group the sidebar by workflow (Design, Execute, Automate, Analyse, Admin), highlight the current section, and let users pin favourites.
Add breadcrumbs and a project switcher that remembers the last project.
Add a command palette (Ctrl or Cmd + K) for search and quick actions such as “New test case” or “Go to run 88”.

Lists and tables

Saved views, column chooser, filters kept in the URL (so views are shareable), a sticky bulk-action bar, and inline status editing.
Virtualise long lists, and show “Showing 1–25 of 312” with page-size control.
Empty states with one clear action, and “no results” states that offer to clear filters.

Forms and modals

Autosave drafts for the long project, strategy and plan forms, and show a progress stepper.
Field-level errors with a summary at the top, “unsaved changes” confirmation, and disable submit while saving.
Replace free-text fields with pickers where possible (people, requirements, suites), with search.

Test authoring and execution

Drag to reorder steps, paste a table to create steps, shared step templates, and a side-by-side version diff.
Execution view with keyboard shortcuts (Pass, Fail, Next), a timer, clipboard screenshot paste and a “fail and file defect” button that prefills context.

Dashboards

Show the time window and denominator on every metric, and “—” instead of 0% when there is no data.
Make every chart drill down to the records behind it, and show “data updated at” stamps.

AI surfaces

Keep the dashed purple styling consistently for anything AI-generated, show citations, and offer Accept / Edit / Dismiss on each suggestion. Add a docked assistant panel that knows which page you’re on.

Polish

Dark mode (easy once the tokens are used), prefers-reduced-motion support for the modal and sidebar animations, consistent icon sizes, and locale-aware dates.
Suggested order
A reusable ConfirmDialog, Toast and focus-trapped Modal (fixes items 2, 3, 4, 5 together).
Responsive AppShell with a mobile drawer, and wrap tables in scroll containers.
Focus-visible styles, label and aria-live fixes, and per-page titles.
Move hardcoded hex to tokens, then add dark mode.
Skeletons, loading.tsx and error.tsx, then saved table views and the command palette.

Based on the TestHub codebase you shared, I’d focus on making the frontend feel less like a collection of separate testing tools and more like a unified, professional test management platform — with consistent navigation, faster workflows, clearer status indicators and an interface that helps QA teams understand what needs attention.
I’d prioritise improvements in this order: usability and consistency first, then test-management workflows, then visual polish and advanced features.
1. Highest-priority UI/UX improvements









1. Redesign the Overview dashboard
High priority
The current dashboard has useful metrics, but some indicators are misleading or not fully connected to real data.
- The project selector displays a hard-coded Checkout Web option.
- “Save view” appears to have no action wired up.
- The pass-rate chart uses fixed weekday labels, even though its data is derived from execution history.
- The automated-results panel reuses the same passed/failed counts as the manual-results panel.
- “Entry criteria met” is always displayed as “Yes”.
- The flaky-test panel equates failed executions with flaky tests.
Improve it: Use project and date filters, real trend dates, separate manual and automated metrics, configurable quality gates, and clickable KPI cards that open the relevant filtered results.












2. Improve navigation and the application shell
High priority
The sidebar is fixed at 232px, and its current implementation does not provide a visible mobile navigation alternative. The Profile button also has no apparent action.
- Add a collapsible sidebar and mobile navigation drawer.
- Keep the current section expanded when viewing nested pages.
- Highlight parent navigation items on detail and edit pages.
- Add a working profile menu with account settings, help and sign-out.
- Include breadcrumbs on nested pages, such as Projects → Checkout Web → Settings.
- Add a global project/workspace switcher and quick search.
Improve it: Keep navigation predictable across all modules and make every visible control perform a clear action.












3. Make Test Cases easier to manage
High priority
The Test Cases page places the creation form before the case list and displays many table columns at once. This can make finding, reviewing and maintaining cases cumbersome.
- Separate Test Case Library from Create Test Case, or put creation in a modal or dedicated page.
- Add search, filters, sorting, pagination and saved views.
- Add a compact table mode and a column chooser.
- Make bulk actions operate on clearly selected rows.
- Add filters for project, suite, priority, owner, test type and automation status.
- Use human-readable labels such as “Not run” rather than raw enum values such as NOT_RUN.
Improve it: Let testers locate a case quickly, edit it without losing their place, and organise large suites without scrolling through a huge table.












4. Standardise forms and validation
High priority
The project creation flow uses a modal, while test-case creation is embedded in its page. Registration inputs also lack explicit id/htmlFor associations between labels and fields.
- Standardise input, select, date-picker and validation styles.
- Associate every label with its input and expose errors accessibly.
- Show required fields, character limits and example values.
- Keep form values when server-side validation fails.
- Prevent accidental duplicate submissions while saving.
- Confirm destructive actions and provide a recovery option where possible.
Improve it: Use one reusable form pattern across projects, test cases, defects, test plans and team management.



2. Improve the journeys testers use every day
The biggest UX opportunity is to connect the modules into complete workflows instead of making users navigate between disconnected pages.
Recommended end-to-end workflow
1. Create or select a project
   Set the project name, key, team members, environment and integrations.
2. Build the test library
   Create cases, add ordered steps and expected results, organise suites, and link requirements.
3. Create a test plan and run
   Select cases, assign testers, choose the target environment and set a release or sprint.
4. Execute tests
   Provide pass, fail, blocked or skipped outcomes, with notes, screenshots, attachments and actual results.
5. Raise and track defects
   Create a defect directly from a failed execution, automatically linking the test case, run, environment and evidence.
6. Review release readiness
   See coverage, failure rates, unresolved critical defects, automation health and quality-gate results.

For each step, show a clear next action, preserve the user's context, and display progress. For example, after creating a test case, offer “Add another case”, “Add to test plan” and “Run this test”.
3. UI improvements by module
Module	Recommended improvements
Projects	Replace placeholder “Last run” and “Pass rate” values with real metrics, or remove them until available. Add project cards/list toggle and project health.
Test Runs	Show execution progress, remaining cases, elapsed time, environment and owner. Add “Resume run” and “Continue next case”.
Test Plans	Show scope, linked requirements, entry/exit criteria, assignments and progress. Provide a clear plan-to-run action.
Defects	Add severity/priority filters, duplicate detection, evidence preview, linked execution history and a configurable workflow.
Requirements	Provide a traceability view from requirement → test case → execution → defect, with uncovered requirements highlighted.
Automation and CI/CD	Show pipeline status, last run, duration, flaky tests, failed jobs, logs and direct links to external build evidence.
Reports and Analytics	Add date ranges, project/environment filters, drill-down charts and export options. Clearly label the data source and reporting period.
API Monitoring	Use consistent collection URLs and navigation; show endpoint status, response time, history and clear setup guidance.
AI Assistant	Offer task-specific actions, show the source evidence for recommendations, and allow users to review generated test cases before saving.
Settings and Team	Group settings by workspace, project, integrations, notifications, roles and security. Show permissions and unsaved-change warnings.
4. Visual design system
The current UI already uses a restrained palette with white surfaces, grey borders and teal accents. I would refine it rather than replace it with a completely different theme.
Suggested design tokens
Primary actions
Teal · #1F6F8B


Page background
Light grey · #F5F7F9


Passed / success
Green · #E3F2EA


Failed / error
Red · #FBE7E4



Keep colours consistent across all modules. Do not communicate status by colour alone; include text labels and accessible contrast.

Additional design-system changes:
- Spacing: use a consistent spacing scale rather than mixing arbitrary padding values such as p-[28px].
- Typography: establish standard page titles, section headings, table text, helper text and metadata sizes.
- Buttons: use consistent primary, secondary, tertiary and destructive button variants.
- Cards: standardise corner radii, borders, shadows and internal spacing.
- Tables: use consistent row heights, hover states, sticky headers where useful and clear empty states.
- Feedback: provide loading skeletons, success notifications, inline validation and retryable error states.
- Dark mode: consider it after light-mode consistency and accessibility are established.
5. Accessibility and responsive behaviour
These are important improvements for a professional QA tool, particularly because testers may spend hours working in it.
- Ensure keyboard navigation works throughout the sidebar, menus, modals and tables.
- Add visible keyboard focus indicators and logical focus order.
- Ensure modal focus is trapped while open and returned to the trigger when closed.
- Use semantic headings and proper form labels.
- Add accessible names to icon-only buttons.
- Meet WCAG 2.2 AA contrast and interaction requirements where applicable.
- On smaller screens, convert wide tables into responsive layouts or allow controlled horizontal scrolling.
- Test zoom at 200%, keyboard-only operation and screen-reader announcements for status changes.
6. Industry-standard features worth adding
These would help TestHub feel more mature and useful to larger QA teams.

Traceability and impact analysis
Show which requirements, test cases, executions and defects are connected. Warn users when a changed requirement has no relevant tests.



Test-case version history
Record edits, who changed them and when. Preserve the exact version used in each completed execution so historical results remain meaningful.



Saved filters and bulk editing
Allow teams to save queries such as “Critical defects in staging” or “Unautomated regression tests” and share them with permitted team members.



Notifications and subscriptions
Notify users about assignments, failed runs, reopened defects, expiring approvals and quality-gate failures, with configurable frequency.



Release-readiness workspace
Bring execution status, risk, defect severity, coverage and quality gates into a single release decision view, with links to supporting evidence.



7. Make the AI experience part of the workflow
Instead of a generic chatbot that only answers questions, give the AI assistant a persistent panel with context-aware actions. For example, from a failed test execution it could offer:
- Explain the failure using the error, logs and screenshot.
- Suggest whether the issue is a product defect, test defect or infrastructure problem.
- Draft a defect with reproducible steps and attached evidence.
- Recommend additional tests based on the affected requirement.
- Suggest automation candidates and generate a draft Playwright test.
- Summarise release risks from current execution results.
The UI should distinguish AI-generated suggestions from verified facts, show confidence and evidence, and require human approval before creating defects, changing test cases or modifying release status.
8. Suggested implementation plan
Phase	Focus	Priority
1. Fix usability blockers	Broken navigation, inactive controls, placeholder metrics, misleading dashboard values and inconsistent form behaviour	P0
2. Establish consistency	Shared components, responsive sidebar, accessible forms, status badges, table patterns and empty/loading/error states	P1
3. Improve QA workflows	Search/filter, bulk actions, execution experience, traceability and defect creation from failed tests	P1
4. Advanced experience	Saved views, version history, notifications, release dashboard and contextual AI assistant	P2
My recommendation is to start with the Overview dashboard, navigation, Test Cases page and test execution journey. Those areas have the strongest impact on everyday usability and also address specific inconsistencies visible in the code you supplied.
One important distinction: these are source-code-based UI/UX findings and recommendations, not the results of a full visual usability study across every screen size. The next step would be to implement the priority fixes, then validate them with Playwright tests covering desktop, mobile, keyboard navigation and the main end-to-end QA journeys.