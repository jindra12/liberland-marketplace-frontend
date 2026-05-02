# Compliance Next Steps

This document is for developers. It lists the remaining product work needed to make NSWAP operationally aligned with the published compliance docs.

## Scope

The markdown files in `disclaimers/` now cover the user-facing policy text:

- `PRIVACY.md`
- `TERMS_OF_USE.md`
- `REPORT_CONTENT.md`
- `SERVER_POLICY.md`
- `DATA_REQUESTS.md`

Those files are necessary, but they do not complete compliance by themselves. The app still needs real workflows, UI entry points, and operational handling behind the policies.

## What Still Needs To Be Built

### 1. Report submission flow

We need an actual report workflow in the app, not just the policy page.

Required work:

- Add a report action on the main surfaces that can host user-generated content:
  - posts
  - comments
  - listings
  - profiles
  - syndication/server pages where relevant
- Open a modal or drawer with a report form.
- Let the user choose a report reason.
- Capture the target object, server URL, and enough context to route the report correctly.
- Send the report to a backend endpoint or queue.
- Show success and failure states.

Implementation notes:

- Keep the UI small and direct.
- If a page belongs to a remote server, the report must be routed or copied to the right place.
- Add tests for desktop and mobile behavior.

### 2. Data request workflow

The privacy notice and `DATA_REQUESTS.md` explain the policy, but users still need a working request path.

Required work:

- Add a data request entry point in the app.
- Support requests for:
  - access
  - deletion
  - correction
  - portability/export
  - objection or clarification
- Capture the requester identity and the data subject details that are needed to process the request.
- Create a small internal queue or backend endpoint for these requests.
- Show a clear submission confirmation.

Implementation notes:

- The data request flow should be simple enough for a small team to handle manually.
- It should be possible to associate the request with the current account or contact email.
- Requests should have a visible lifecycle state in the internal tooling.

### 3. Trader / private seller clarity

Where the marketplace involves consumer-style offers, users need to understand who they are dealing with.

Required work:

- Add a clear seller/trader indicator where the backend can provide it.
- If the seller is the operator on the main server, say that plainly.
- If the seller is a third party, show that clearly.
- Avoid wording that implies NSWAP is always the seller of record.

Implementation notes:

- This should appear on detail pages and, where useful, list cards.
- It should be hard for the UI to accidentally misrepresent the contracting party.

### 4. Server onboarding safety

Users can add their own servers, so the app needs basic guardrails.

Required work:

- Add validation for server URLs and server metadata.
- Make it obvious when a server is user-added.
- Provide a way to disable or hide a server.
- Add warning copy for remote servers that are not operated by NSWAP.
- Ensure bad or broken servers can be removed from the active list.

Implementation notes:

- Keep the server management UI consistent with the existing syndication pages.
- Prefer a clear allow/disable model over complex trust scoring for now.

### 5. Moderation workflow

Reports need somewhere to go, and someone needs to review them.

Required work:

- Add an internal moderation queue or dashboard.
- Show report status, category, and target.
- Allow manual notes and resolution states.
- Support simple actions like:
  - acknowledged
  - routed
  - resolved
  - dismissed

Implementation notes:

- This can stay minimal.
- The important part is that reports are not dropped on the floor.

### 6. Data retention and deletion behavior

The privacy notice promises limited retention, but the app still needs the actual mechanics.

Required work:

- Define retention rules for:
  - reports
  - support requests
  - request logs
  - profile data
  - behavior logs
- Add deletion paths where the app controls the data.
- Ensure data no longer needed is removed or deactivated.

Implementation notes:

- Keep the retention rules aligned with the privacy notice.
- If a record must stay for legal reasons, make that explicit in the backend handling.

### 7. Behavior tracking transparency

The privacy notice says we track page visits and requests, but the runtime UI should still be honest and understandable.

Required work:

- Make sure the tracking behavior is documented in app settings or help surfaces where appropriate.
- If non-essential tracking is ever added, give the user a clear explanation.
- Keep the implementation consistent with the actual data we store.

Implementation notes:

- Do not add cookies unless the product model changes.
- Keep the current behavior-data collection narrow and documented.

### 8. Security and access controls

The compliance docs assume we can safely handle reports and data requests. That requires basic operational security.

Required work:

- Restrict who can view reports and data requests.
- Add an audit trail for sensitive actions.
- Define who can delete, export, or edit sensitive records.
- Add incident handling notes for abuse, leaks, or compromised accounts.

Implementation notes:

- This can be simple for a small team.
- The key point is controlled access and traceability.

### 9. UI entry points for the policies

The policy documents exist, but the app should expose them from obvious places.

Required work:

- Keep the disclaimers modal reachable from the desktop and mobile navigation.
- Add direct links where they are useful:
  - privacy
  - terms
  - report content
  - server policy
  - data requests
- Make sure the pages that mention these topics link back to the modal when appropriate.

Implementation notes:

- This is already partly done with the disclaimers modal.
- Review every navigation surface to make sure the policy entry points are easy to find.

## Suggested Order

If we want the most value first, the order should be:

1. report submission flow
2. data request workflow
3. marketplace source disclosure
4. trader / private seller clarity
5. server onboarding safety
6. moderation workflow
7. retention and deletion behavior
8. security and access controls
9. behavior tracking transparency
10. policy entry-point cleanup

## Testing Expectations

Each of the above should get targeted Cypress coverage where it affects the UI.

Minimum expectations:

- desktop and mobile screenshots for new modal flows
- route-specific tests for any new settings or detail-page controls
- direct assertions for visibility, selected state, and submission success

## Notes

- Keep the implementation small and practical.
- Prefer explicit UI and data-flow changes over abstract policy language.
- When the product behavior changes, update the policy documents to match.
