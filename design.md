# Prompt: TestHub app design (15 screens)

Design a calm, professional, desktop-first web app UI for **TestHub**, an AI-assisted test management platform. It covers manual testing, automation, CI/CD results, defects and AI insights. Produce 15 artboards at 1440px wide. Each is a fluid page, not a fixed-size poster. Lay them out on one canvas in a 3-column grid.

## Visual system
- **Font:** IBM Plex Sans (400/500/600/700), with a system-ui fallback.
- **Colours:**
  - Page ground #F5F7F9, cards #FFFFFF with a 1px #E1E5EA border and 10px radius.
  - Ink #1B2430, muted text #5B6675, input and button borders #C9D0D8.
  - Single accent #1F6F8B, with a light tint #E4F0F4 and dark text #134F63 for active nav and info badges.
- **Status colours (always paired with a text label, never colour alone):**
  - Pass: bg #E3F2EA, text #14633E.
  - Fail: bg #FBE7E4, text #8F2A20.
  - Blocked/warn: bg #FBEFD9, text #7A4600.
  - Flaky/AI: bg #EEE8F7, text #55398C.
  - Neutral: bg #EDF0F3, text #444F5E.
- **Type scale:** page title 24px, card title 15px, body 13–14px, KPI numbers 28px/600.
- **Controls:** buttons and inputs are 40px high (32px for small row actions) with a 6px radius. Primary buttons are filled accent with white text. Destructive buttons use red text and a pale red border.
- **Spacing:** 28px page padding, 16–20px gaps, generous whitespace.
- **Other:** thin-bordered tables with muted 500-weight headers. Stacked progress bars are 12px tall, with a text legend underneath.
- **AI content** sits in a dashed purple (#6B4FA3) bordered box on #FAF8FD, with an "AI generated" or "AI suggestion" badge. It cites evidence links, and states that confidence is a prioritisation signal, not proof.
- No emoji, gradients or decorative charts.

## Shared app shell (all screens except Sign in)
- **Left sidebar (232px):** white, with the "TestHub" wordmark in accent bold. Nav items, with the active one tinted:
  1. Overview
  2. Projects
  3. Test Cases
  4. Test Plans
  5. Test Runs
  6. Test Strategies
  7. Automation
  8. CI/CD Runs
  9. Defects
  10. Reports / Allure
  11. Analytics / AI Insights
  12. Integrations
  13. Team and Access
  14. Settings
- **Top bar:**
  - Project switcher select ("Checkout Web").
  - Search input.
  - Notifications and profile buttons on the right.
- **Page header:**
  - A breadcrumb in muted text above the title.
  - Contextual actions on the right.
  - Filters, saved views, sort and pagination wherever lists appear.
- **Responsive:** below 900px the sidebar hides and grids stack to one column.
- **Accessibility:** real buttons, links, inputs and labels. Text meets 4.5:1 contrast and focus states are visible.

## Data rules
Never invent metrics. KPI cards show "—" until data exists. Any illustrative numbers carry a blue "Sample data" badge. Show time windows, denominators and data freshness.

## Screens
1. **Sign in:** a centred card with email, password, "keep me signed in", forgot password, a filled Sign in button, a Continue with GitHub button and a create-account link. A right panel in the info tint carries a headline about "one source of truth for test evidence" and a line on roles, audit history and tenant isolation.
2. **Overview:**
   - Date-range select and a Save view button.
   - Four KPI cards: manual pass rate, automation pass rate, mapping coverage and pipeline success. Each states its formula.
   - Two stacked bars: manual (passed/failed/blocked/not run) and automated (passed/failed/flaky/skipped).
   - A pass-rate trend line chart.
   - A release-readiness card with entry/exit criteria, plan progress and a quality gate.
   - Recent CI runs and a defect severity table.
   - Flaky tests, integration health and recent activity cards.
   - An AI summary box with evidence links.
3. **Projects:**
   - A table with key, name, owner, cases, last run, pass rate and members.
   - Three small cards below: create project, empty state and error state with a Retry button.
4. **Test Cases:**
   - A suites tree on the left.
   - A filter row, bulk actions and a table with key, title, type, priority, status, automation and owner.
   - A detail panel for one case with objective, preconditions, ordered steps with expected results, version, links and Clone / Version history / Compare actions.
   - An AI duplicate-detection suggestion.
   - Import CSV and Export buttons in the header.
5. **Test Plans:**
   - A plan list with progress bars.
   - A summary panel with scope, entry and exit criteria, environments, risks and reviewers.
   - A cycles and assignments table, with Export summary and Snapshot actions.
6. **Test Runs (execution):**
   - A run progress bar.
   - A three-column layout: case queue, a step table with Pass/Fail buttons plus an actual-result textarea, and an outcome panel.
   - The outcome panel has Attach evidence, a "Not applicable" action with a reason, and create/link defect.
   - A keyboard-shortcut hint.
7. **Test Strategies:**
   - A section outline with 12 sections.
   - A structured editor for one section.
   - An approval panel, version history with Compare, and an AI review suggestion.
   - Export Markdown, Request review and Save version buttons.
8. **Automation:**
   - Repositories / Scripts / Mappings tabs.
   - Three coverage KPIs: mapped, manual only and scripts without a case.
   - A mappings table with confidence, source, verified time, and Accept/Reject/Change actions.
   - A repositories table and coverage by component.
   - A note that code changes need a reviewable diff and user approval.
9. **CI/CD Runs:**
   - A runs table with workflow, branch, commit, actor, pipeline status, test counts, duration and an Allure link or a "No artifact" badge.
   - A run detail card with jobs, failure types, retries and a link to the original GitHub run.
   - A quality gates card with Met/Failed outcomes.
10. **Defects:**
    - A table with severity, status, assignee and links.
    - A detail panel with expected and actual result, environment and build, links to test case, execution, CI run and Jira issue, plus activity.
    - An AI root-cause hypothesis with evidence and a duplicate suggestion.
    - A Create GitHub issue button.
11. **Reports / Allure:**
    - A reports table, including a "Results missing" state.
    - A selected report summary with trend, attachments and history.
    - A failures table linking test, script, mapped case and evidence.
12. **Analytics / AI Insights:**
    - A reconciliation review queue with an Approve / Reject / Correct decision per row, and a note on the approved-mapping requirement. Auto-complete is off by default.
    - Recommendations with evidence and Accept/Dismiss.
    - Coverage and flaky trend charts.
    - An assistant panel with a question box that states it never sends secrets to the model.
13. **Integrations:** four cards (GitHub, Jira with an expired-credential error, Azure DevOps, Trello not connected), each with status, scopes, last sync and Sync / Reconnect / Disconnect. Below them, a field-mapping table showing which system is authoritative.
14. **Team and Access:** a members table with role, projects and status. Below it, a role-permissions matrix and an audit history list. Invite and Add member actions.
15. **Settings:**
    - A settings nav.
    - An AI and data use form: enable AI, auto-complete policy off by default, a confidence threshold, retention days and a fallback note.
    - A quality-gates form.
    - A danger zone with Export data and Delete workspace, with confirmation.

Keep copy realistic and free of lorem ipsum.