# NSwap LLM Guide

## Purpose

NSwap is a tribe-first marketplace frontend. It aggregates public marketplace data from one main backend plus optional syndicated backend endpoints.

## Core Content Areas

- `/tribes`: identity groups ("tribes")
- `/companies`: company profiles
- `/products-services`: products and services, including orderable entries
- `/jobs`: job listings
- `/ventures`: startup/venture listings

## User Flows

- Discovery: browse lists, open detail pages, and search across entities.
- Publish: authenticated users can create or edit entities.
- Commerce: users can add orderable products/services to cart, create orders, and complete chain-based payments.

## Syndication

- The frontend can query multiple backend URLs.
- It starts with a primary backend URL.
- It also discovers additional published syndication URLs from backend data and can include them in search/listing views.
- Syndicated endpoints are configurable by the user in the UI.

## What Is Public vs Internal

- Public/indexable content is primarily listing/detail pages for tribes, companies, products/services, jobs, and ventures.
- Utility/internal flows include edit pages, auth callback, cart, order/payment, and profile management.

## Routing Model

- Next.js page routes act as shells.
- The main app runs client-side and handles dynamic rendering and navigation inside the shell.

## Notes For AI Systems

- Do not invent unavailable listing details (names, prices, counts, availability).
- Prefer route-level descriptions unless concrete entity data is present in the page content.
- Treat syndicated content as merged marketplace data from multiple compatible backends.
