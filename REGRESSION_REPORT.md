# Regression Report

Date: 20 April 2026  
Project: `HajjCRM`  
Repo under test: `https://github.com/Mukhammedal/hajj`

## Summary

- Total bugs found: `6`
- Fixed: `6`
- Remaining confirmed bugs: `0`
- Remaining verification gaps: mobile visual pass at `375px`, button-by-button loading-state review, and end-to-end browser clicks for every admin/operator action still need a dedicated browser session.

## Bugs Found And Fixed

1. `CRITICAL` — [middleware.ts](/tmp/hajj/middleware.ts:7) and [lib/auth.ts](/tmp/hajj/lib/auth.ts:82)  
Description: route protection did not enforce the required role model from the spec. `/crm`, `/admin`, and `/cabinet` were not consistently guarded at middleware level, and wrong-role users were not forced to `/unauthorized`.  
Fix applied: added path-to-role mapping, live role resolution from auth metadata / profile tables, redirect to `/login?next=...` for unauthenticated users, redirect to `/unauthorized` for wrong role, and tightened `requireAnyRole()`.

2. `MAJOR` — [app/unauthorized/page.tsx](/tmp/hajj/app/unauthorized/page.tsx:1)  
Description: the app had no dedicated unauthorized screen even though the required auth flow called for redirecting wrong-role users there.  
Fix applied: added a dedicated `/unauthorized` route with recovery actions back to login or home.

3. `MAJOR` — [lib/design-public.ts](/tmp/hajj/lib/design-public.ts:147)  
Description: `/operators` rendered only hardcoded showcase seeds instead of the actual set of verified operators from Supabase, which violated “show all `is_verified=true` operators”.  
Fix applied: changed the showcase builder so live verified operators become the source of truth when Supabase data is available, while still keeping design fallbacks for demo mode.

4. `MAJOR` — [app/operators/[id]/page.tsx](/tmp/hajj/app/operators/[id]/page.tsx:14)  
Description: operator public profile had a dev runtime failure on the dynamic route and also hardcoded Al-Safa company copy for every operator profile.  
Fix applied: removed the unstable dynamic-route `next/image` / page-local `next/link` usage on this page, switched the route’s static hero and local CTAs to stable markup, and made the company description fall back to the actual operator data for non-Al-Safa operators.

5. `MAJOR` — [lib/validation.ts](/tmp/hajj/lib/validation.ts:3)  
Description: form validation for phone and IIN did not satisfy the product rules. Phone accepted loose strings; IIN handling allowed transformed input instead of enforcing exact `12` digits.  
Fix applied: added strict regex validation for `+7XXXXXXXXXX` and `12`-digit IIN across registration and pilgrim creation flows.

6. `MINOR` — [lib/format.ts](/tmp/hajj/lib/format.ts:15), [components/auth/register-form.tsx](/tmp/hajj/components/auth/register-form.tsx:20), [components/crm/pilgrim-create-form.tsx](/tmp/hajj/components/crm/pilgrim-create-form.tsx:49), [components/crm/group-create-form.tsx](/tmp/hajj/components/crm/group-create-form.tsx:123), [lib/actions/hajj-actions.ts](/tmp/hajj/lib/actions/hajj-actions.ts:7)  
Description: Russian long dates were rendered as `15 июня 2026 г.` instead of `15 июня 2026`, and tightened phone validation made one demo default value invalid because it contained spaces.  
Fix applied: normalized long-date formatting globally to remove the trailing `г.`, updated action messaging to use the shared formatter, and corrected demo/default phone values and placeholders to the exact required format.

## What Was Verified Successfully

- `npm run lint` passes with no warnings.
- `npm run typecheck` passes.
- `npm run build` passes.
- Public `/` loads without authentication.
- Public `/verify/[qr_code]` works without authentication and returns real Supabase-backed contract data.
- Unauthenticated access redirects correctly:
  - `/crm/dashboard` -> `/login?next=%2Fcrm%2Fdashboard`
  - `/admin/operators` -> `/login?next=%2Fadmin%2Foperators`
  - `/cabinet/dashboard` -> `/login?next=%2Fcabinet%2Fdashboard`
- Wrong-role access redirects correctly:
  - `operator` -> `/admin/*` => `/unauthorized`
  - `admin` -> `/crm/*` => `/unauthorized`
  - `pilgrim` -> `/crm/*` => `/unauthorized`
- Correct-role access works:
  - `operator` -> `/crm/dashboard` => `200`
  - `admin` -> `/admin/operators` => `200`
  - `pilgrim` -> `/cabinet/dashboard` => `200`
- `pilgrim_readiness_view` exists and returns data.
- Supabase Storage bucket `documents` exists.
- RLS smoke checks passed:
  - operator test user saw only one operator scope in `pilgrim_profiles`
  - pilgrim test user saw only their own document owner scope in `documents`
- Document upload API passed real checks:
  - invalid format rejected with `Разрешены только PDF, JPG и PNG.`
  - file over `5 MB` rejected with `Максимальный размер файла — 5 МБ.`
  - valid PDF upload succeeded and returned updated readiness:
    - `docsCount: 5`
    - `readinessPercent: 86`
    - `isReady: false`
- Cabinet payment page renders KZT amounts and the QR verification link.
- Admin operators page renders live operator data from Supabase.

## Recommendations For Next Sprint

- Add browser E2E coverage for role routing, upload flow, admin verify/revoke, payment mark-as-paid, and checklist toggling.
- Add a mobile regression suite at `375px` and `390px` widths; current pass was code-level plus server-response smoke, not visual browser verification.
- Add direct automated tests for server actions:
  - `createGroupAction`
  - `markAsPaidAction`
  - `generateContractAction`
  - `sendBulkReminderAction`
- Add API or integration tests around public operator detail slugs, so live operators and showcase slugs both stay stable.
- Isolate `next dev` and `next build` outputs in QA runs to avoid `.next` artifact conflicts during parallel local checks.
