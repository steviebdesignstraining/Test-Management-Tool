# TODO - Audit Items from Improvement Docs

## Completed (Storage)
- [x] Replace local filesystem with S3/R2 object storage (implemented StorageService with local fallback)
- [x] Update actions.ts upload functions to use storage service
- [x] Update API routes (attachments, [id]) to use storage service
- [x] Add @aws-sdk packages for S3 support

## High Priority Items from Frontend Improvement
- [ ] Redesign Overview dashboard (remove hardcoded values, real data, clickable KPIs)
- [ ] Improve navigation/AppShell (collapsible sidebar, mobile drawer, breadcrumbs, profile menu, project switcher)
- [ ] Improve Test Cases management (search, filters, sorting, pagination, saved views)
- [ ] Standardize forms and validation (labels, accessibility, error messages)

## Security & Backend (from Review doc)
- [ ] Finish remaining 44 routes auth (beyond current coverage) - critical
- [ ] Unify role systems (platform + per-project roles, use enums)
- [ ] Make project key unique per organisation (not globally)
- [ ] Replace in-memory rate limiter with Redis/DB backed
- [ ] Add security headers in next.config.ts
- [ ] Add error.tsx, loading.tsx, global-error.tsx
- [ ] Add service layer for shared auth/validation/audit
- [ ] Prisma Migrate (not db push) in CI
- [ ] Add row-level security as second wall
- [ ] Move imports/CI sync to background queue
- [ ] Add indexes and cursor pagination for large lists
- [ ] Add soft deletes + optimistic concurrency
- [ ] Add structured logs, request IDs, health/ready endpoints

## Missing Pages/Features
- [ ] Organisation detail page
- [ ] Strategy detail page  
- [ ] Integration detail/edit pages
- [ ] Profile/account page
- [ ] Notifications center
- [ ] Global search + command palette (Ctrl/Cmd+K)
- [ ] Test suite detail, case history/compare versions
- [ ] Run detail with shareable read-only link
- [ ] Release/milestone page with readiness/sign-off
- [ ] Traceability matrix view
- [ ] Onboarding checklist/sample project
- [ ] Friendly 403/500 pages
- [ ] ConfirmDialog, Toast, focus-trapped Modal components
- [ ] Responsive AppShell with mobile drawer
- [ ] Focus-visible styles

## AI & Platform Features (Roadmap)
- [ ] Fix AI chat implementation (proper streaming, system instructions, citations)
- [ ] Add pgvector search for embeddings
- [ ] Implement AI agents (Failure Triage, Test Designer first)
- [ ] AI tool-calling with approval workflow
- [ ] Custom fields and templates
- [ ] Shared steps and parameterized datasets
- [ ] Test configurations matrix
- [ ] Milestones/releases
- [ ] Comments, @mentions, activity feed, watchers
- [ ] Importers (TestRail, Zephyr, Xray, CSV)
- [ ] Two-way sync (Jira, ADO, GitHub Issues)
- [ ] Webhooks and scoped API tokens
- [ ] Flaky detection and auto-quarantine
- [ ] SSO, SCIM, audit export, compliance features

## Testing & Quality
- [ ] Update E2E tests for new features
- [ ] Add positive/negative/edge case tests as specified
- [ ] API validation for all endpoints
- [ ] Ensure all analytics/counters are dynamic
