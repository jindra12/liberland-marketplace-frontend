# NSwap Frontend

NSwap is the frontend for a syndicated marketplace network.

It lets people browse, search, and open detail pages for jobs, companies, products and services, ventures, tribes, posts, and syndication endpoints. It also supports publishing, commenting, liking, sharing, carting, ordering, and chain-based payment flows when the connected backend exposes those features.

## What it is for

- Discovery across multiple compatible marketplace backends
- Detail pages for marketplace entities and syndication endpoints
- Publishing and editing marketplace content
- Commerce flows for cart, order, and payment
- Identity and tribe-based browsing

## Tech Stack

- Next.js
- React 18
- TypeScript
- React Router
- Ant Design
- GraphQL
- Cypress component tests

## Structure

- `src/Main.tsx` mounts the app and route tree
- `src/routes.ts` defines shared route helpers
- `src/components/` contains the UI and business flows
- `cypress/component/` contains the component test suite

## Notes

- The app is designed around syndication, so route URLs include backend server context.
- The public homepage is a discovery surface, not just a landing page.
- The UI expects multiple account, wallet, and shipping-address states across different flows.
