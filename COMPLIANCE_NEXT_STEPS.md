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

### 1. Data request workflow

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

### 2. Data retention and deletion behavior

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

### 3. Behavior tracking transparency

The privacy notice says we track page visits and requests, but the runtime UI should still be honest and understandable.

Required work:

- Make sure the tracking behavior is documented in app settings or help surfaces where appropriate.
- If non-essential tracking is ever added, give the user a clear explanation.
- Keep the implementation consistent with the actual data we store.

Implementation notes:

- Do not add cookies unless the product model changes.
- Keep the current behavior-data collection narrow and documented.

### 4. Security and access controls

The compliance docs assume we can safely handle reports and data requests. That requires basic operational security.

Required work:

- Restrict who can view reports and data requests.
- Add an audit trail for sensitive actions.
- Define who can delete, export, or edit sensitive records.
- Add incident handling notes for abuse, leaks, or compromised accounts.

Implementation notes:

- This can be simple for a small team.
- The key point is controlled access and traceability.

### 5. UI entry points for the policies

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

1. data request workflow
2. retention and deletion behavior
3. security and access controls
4. behavior tracking transparency
5. policy entry-point cleanup

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
