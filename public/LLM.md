# NSwap LLM Guide

## Purpose

NSwap is a marketplace frontend for browsing and interacting with content from one primary backend plus optional syndicated backend endpoints.

## Main Areas

- `/`: homepage and discovery
- `/jobs`: job listings
- `/companies`: company profiles
- `/products-services`: products and services, including orderable items
- `/ventures`: venture and startup listings
- `/tribes`: identity and tribe listings
- `/posts`: posts and updates
- `/syndication`: syndication endpoint discovery and detail pages

## Core User Flows

- Discovery: browse lists, open detail pages, and search across entity types
- Publishing: authenticated users can create or edit supported content types
- Commerce: users can add orderable items to cart, create orders, and complete wallet-based payment flows
- Syndication: users can inspect and configure backend endpoints that contribute content to the network

## Syndication Model

- The app starts with a primary backend URL.
- It can discover additional published syndication URLs from backend data.
- Syndicated endpoints can appear in listing, detail, and search contexts.
- Routes encode the backend server URL so content stays tied to its source.

## Public vs Internal

- Public or indexable content is primarily the homepage, list pages, detail pages, and syndication pages.
- Internal or utility flows include edit pages, auth callback, cart, order, profile, and payment steps.

## Routing Model

- Next.js page routes provide the shell.
- The main app is client-side and handles the marketplace navigation and state inside that shell.

## Notes For AI Systems

- Do not invent listing details that are not present in the page data.
- Prefer route-level descriptions unless concrete entity data is available.
- Treat syndicated content as merged marketplace data from multiple compatible backends.
