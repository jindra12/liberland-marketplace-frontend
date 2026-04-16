# Posts Spec

This document tracks the work needed to add `Posts` as a first-class marketplace entity, matching the existing `Companies` and `Jobs` flows.

## Goal

Add Post support across the app in the same way as Companies and Jobs:

- list pages
- detail pages
- create/edit pages
- search
- navigation and entry points
- share/like/dislike behavior
- comments, where applicable
- SEO and route metadata
- tests and generated GraphQL artifacts
- follow the currently implemented patterns as closely as possible

## Existing Post GraphQL Surface

These query files already exist and are the starting point for the Posts feature:

- `src/queries/posts.list.graphql`
- `src/queries/posts.search.graphql`
- `src/queries/posts.byId.graphql`
- `src/queries/posts.create.graphql`
- `src/queries/posts.update.graphql`
- `src/queries/posts.delete.graphql`
- `src/queries/posts.like.graphql`
- `src/queries/posts.dislike.graphql`
- `src/queries/posts.comments.list.graphql`
- `src/queries/posts.comments.create.graphql`
- `src/queries/posts.comments.update.graphql`
- `src/queries/posts.comments.delete.graphql`
- `src/queries/posts.comments.reply.graphql`
- `src/queries/posts.comments.replies.graphql`

These will need to be wired into the UI in the same way the Job and Company query families already are.

## Files Likely To Change

### Routing and page entry points

Add Posts routes and page wrappers alongside the existing entity routes:

- `src/pages/posts/index.tsx`
- `src/pages/posts/[id].tsx`
- `src/pages/posts/edit/[id].tsx`

Route metadata also needs updating:

- `src/ShellPage.tsx`
- `src/components/AppRouteTitle.tsx`
- `src/pages/sitemap.xml.ts`

### Navigation

Posts should be reachable from the existing entity navigation patterns, but do not add a top-level marketplace section yet:

- `src/components/AppHeader.tsx`
- `src/components/MobileDrawer/constants.ts`
- `src/components/MobileDrawer/MobileDrawerContent.tsx`
- `src/components/SearchButton.tsx`
- `src/components/Splash.tsx`
- `src/components/splash/MarketAccordion.tsx`

### GraphQL wiring

After the query documents are finalized, regenerate generated artifacts and add wrapper hooks:

- `src/generated/graphql.ts`
- `src/components/hooks.ts`

If Posts should support sorting like the other content feeds, the query documents and wrappers need to accept the same sort behavior already used elsewhere.

### List surface

Create the same list-layer structure used by Jobs, Companies, Products, and Ventures:

- `src/components/cards/PostCard.tsx`
- `src/components/lists/PostListInternal.tsx`
- `src/components/detail/` post list helpers if a shared internal list pattern is needed

The list view should support:

- pagination
- loading state
- empty state
- `likeCount`
- `hasLiked`
- click-through to detail pages
- a large hero image, title, SEO description as the snippet, and related-post link layout

### Detail surface

Add the Posts detail page and supporting components:

- `src/components/detail/PostDetail.tsx`
- any post-specific summary/header components
- any post-specific tab or sidebar helpers

The detail view should support:

- a large hero image splashed at the top
- title
- full markdown content rendering
- related-post link underneath the content
- author or creator information
- `likeCount`
- `hasLiked`
- like/dislike actions
- edit entry point for authenticated creators
- comments section
- keep the list view lightweight and reserve full markdown rendering for detail only

### Create and edit surface

Add create/edit forms in the same pattern used for Jobs and Companies:

- `src/components/publish/PostForm.tsx`
- `src/components/publish/postForm/*` if the form grows
- create/edit route pages under `src/pages/posts/edit/[id].tsx`

These forms should cover:

- title
- content/body
- company linking, using the same ownership/selection flow as the job form, so the user can link the post to their own company
- media
- metadata fields required by the backend schema
- publish/update flow
- the current component patterns already used by the other entity forms

### Markdown ingestion and SEO autofill

The Post editor should parse markdown so it can derive metadata from the user's content.

Requirements:

- use `marked` for markdown parsing; among the parser candidates reviewed it has the highest current NPM weekly downloads and ships built-in TypeScript declarations
- extract the first link present in the post markdown
- if the user did not add a hero image, derive a preview image from that link before submit
- auto-fill the SEO description field with the first 100 characters of the post content, stripped of markdown formatting
- keep the implementation aligned with the repo's existing patterns instead of introducing a separate markdown pipeline

Feasibility note:

- parsing markdown and finding the first link is straightforward with an AST-based parser such as `remark`/`remark-parse` plus a tree walker like `unist-util-visit`
- extracting a preview image from a linked page is only reliable if the target URL can be fetched and inspected for Open Graph metadata such as `og:image`
- that preview-image step is not something the browser can always do directly because remote pages can block cross-origin access, so the safe implementation is a backend or server-side fetch/proxy that reads metadata and returns the chosen image
- if server-side link unfurling is not available, the spec should fall back to using the existing user-provided hero image rules instead of pretending the browser can always extract one

Suggested flow:

1. parse the markdown when the form is submitted or when preview data is needed
2. locate the first markdown link
3. if no explicit hero image was provided, attempt to resolve a preview image from that linked URL
4. strip markdown formatting from the content and populate the SEO description with the first 100 characters
5. upload the resolved hero image, if any, before submitting the form

### Delete flow

Add delete support for Posts in the same way the other entity detail/edit flows handle destructive actions:

- `src/queries/posts.delete.graphql`
- delete action wiring in `src/components/detail/PostDetail.tsx`
- edit page or form delete affordance if the existing pattern uses it
- any confirmation modal or shared delete action helper already used by Companies or Jobs

The delete flow should:

- confirm before deletion
- remove the item from the cache or navigate away after success
- respect the same auth/ownership rules the other entity delete flows use

### Search surface

Posts search should match the existing search pattern:

- `src/components/search/PostsSearch.tsx`
- `src/components/search/utils.ts`
- `src/components/SearchContainer.tsx`
- `src/components/SearchButton.tsx`

Search needs to return:

- title
- SEO description as the snippet
- click-through to the post detail page
- SEO description if available

### Related Post

Use the existing drawer search interaction pattern to let the user select a related item while editing a Post.

Requirements:

- reuse the drawer search component/pattern already implemented in the app
- allow the user to search and select a Post, Company, Job, Product, or Venture as the related target
- store the related target in the post form state and submit it with the form

Hero image fallback rules when the user selected a related target but did not upload a hero image:

1. If the related item is a Post, use the post hero image.
2. If the related item is a Company, use the company image if any.
3. If the related item is a Job, Product, or Venture, use that item's image, falling back to the company image if needed.

The list and detail components should use the same fallback image logic so the UI stays consistent.

### Comments

Posts already have comment queries, so the Posts detail view should connect to the existing comment stack or the post-specific variant:

- `src/queries/posts.comments.*.graphql`
- `src/components/comments/*` if a reusable comment module is needed
- `src/components/detail/EntityCommentsSection.tsx` if it can be reused directly

If the existing comment flow is already generic enough, reuse it instead of creating a separate Posts-only implementation.

### Share, subscribe, and notifications

Posts should participate in the same share and notification patterns as the other entities where applicable:

- `src/components/share/SubscribeButton/*`
- `src/components/share/*`
- `src/components/Unsubscribe/*`
- `src/components/share/SubscribeButton/constants.ts`
- `src/components/share/SubscribeButton/useSubscriptionActions.ts`

If Posts is likable but not subscribable, only wire the relevant pieces.

### SEO and social metadata

Posts needs route titles, descriptions, and JSON-LD metadata consistent with the other entities:

- `src/ShellPage.tsx`
- `src/AppHead.tsx`
- `src/components/detail/*` route-specific metadata if needed

The Next.js server-rendered metadata should stay generic and should not fetch or embed the full Post data. It should behave like the existing company/job pages: provide a descriptive page summary, not a full post preview.

### Tests

Add Cypress component coverage for the expanded Detail / Search / List surfaces and update existing fixtures if needed:

- `cypress/component/*Detail*.cy.tsx`
- `cypress/component/*Search*.cy.tsx`
- `cypress/component/*List*.cy.tsx`
- `cypress/support/component-tests/utils.tsx`
- `package.json` test scripts for the new spec file

Likely test cases:

- list renders posts
- detail renders one post
- create/edit flow works
- delete flow works
- search returns posts
- like/dislike state updates
- comments render and submit correctly
- markdown-derived hero image and description autofill behave as expected
- related-post image fallback rules behave as expected

## Implementation Order

1. Add or confirm the GraphQL documents for Posts.
2. Regenerate `src/generated/graphql.ts`.
3. Add the Posts route pages.
4. Add list, card, and detail components.
5. Wire create/edit forms.
6. Wire search and navigation.
7. Add comments, like/dislike, and any subscription behavior.
8. Update SEO metadata and sitemap.
9. Add Cypress coverage and run the targeted tests.

## Notes

- Follow the existing Jobs and Companies structure instead of inventing a separate Posts architecture.
- Keep Posts-specific code grouped by feature, the same way the other entity families are organized.
- Reuse shared list/detail/search components where possible, and only split out Posts-specific code when the entity needs unique rendering or actions.
