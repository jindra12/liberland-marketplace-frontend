# Comments Spec

## Goal

Replace the current `react-comments-section`-based comment experience with a native comments section that keeps the same functionality and matches the app’s existing Ant Design patterns.

The visual direction should borrow from the referenced Uiverse example:
- compact card-like layout
- clear author row
- distinct content body
- lightweight action row
- nested replies that stay visually readable
- a visible input area that feels part of the same card instead of a separate system

The implementation should stay close to the current product language used in Posts, Jobs, Companies, and other detail pages.

## Current Behavior To Preserve

The current comments section supports:
- loading comments for a target entity
- infinite scroll / pagination for comments
- root comments and nested replies
- anonymous and authenticated display modes
- login / sign-up prompts for anonymous users
- submit new comment
- reply to comment
- edit comment
- delete comment
- timestamps
- custom theme styling
- comments count display
- loading and error states

Any replacement must preserve all of the above.

## New Feature Requirements

### Likes

Comments should support likes, similar to the existing company like behavior.

This will require:
- GraphQL/codegen updates
- extending the existing Like component pattern so comments can reuse the same interaction model
- adding comment like / unlike support in the comment item UI

### Replies As A Separate Load

Replies should be loaded separately from root comments.

The main comments section should:
- load only top-level comments for an entity
- exclude comments that are replies to other comments

Replies should then be loaded in a dedicated reply component or reply loader attached to each root comment.

This will require:
- GraphQL/codegen updates
- a root-comment query that excludes replies
- a separate replies-by-comment query
- a nested reply rendering component

### Share Comment

Each comment should be shareable.

The share behavior should support:
- social share actions where appropriate
- a simple copy-link action

The share feature will require:
- a comment-by-id query
- a comment detail page
- a URL that resolves directly to the comment detail view

The comment detail page should render:
- the selected comment
- its replies
- enough surrounding context to understand the thread

This ensures a user can share a single comment and land on a readable thread view.

## Current Usage

The comments section is currently used on:
- Posts
- Jobs
- Companies
- Startups
- Identity discussion pages
- Product / Service detail pages

The replacement should remain reusable across all of those surfaces.

## Data Requirements

The section needs:
- target entity ID
- target relation type
- current user state
- server URL when relevant
- comment list data
- comment count
- pagination state
- loading/error state

The data model should continue to support:
- anonymous comments
- authenticated comments
- parent/child reply relationships
- created by user metadata
- created/updated timestamps

## Layout Requirements

### Overall Shell

The comments section should be a card-like block that:
- fits the app’s dark visual language
- uses Ant Design primitives where possible
- keeps spacing compact and consistent
- does not look like a generic third-party widget

### Header

The header should show:
- section title
- comment count when available
- optional login state affordance if anonymous

### Comment Items

Each comment row should show:
- avatar
- author name
- timestamp
- body text
- action row

Reply entries should remain visually nested under the parent comment.

### Composer

The composer should support:
- anonymous and authenticated states
- submit
- cancel while editing/replying
- reply target indication

The composer should feel visually attached to the comments card.

## Interaction Requirements

### Submit

Users can submit a new root comment.

### Reply

Users can reply to an existing comment.

Replies should render nested under their parent.

### Edit

Users can edit their own comments.

### Delete

Users can delete their own comments.

### Authentication

If the user is not authenticated:
- show the anonymous state
- allow anonymous comment behavior where supported
- route login and sign-up actions through the existing auth flow

## Pagination Requirements

The section should continue to support:
- initial load
- incremental load more
- end-of-list state

The infinite scroll behavior should remain available for long comment threads.

## Theme Requirements

The new implementation should keep the existing theme contract:
- background colors
- borders
- text colors
- button colors
- font family
- radius values

The visual result should still fit the rest of the app, not introduce a new unrelated theme.

## Query / Mutation Requirements

The replacement should continue to support the current GraphQL operations:
- list comments for a target
- create comment
- create reply
- update comment
- delete comment

It will also need:
- comment by ID
- list replies for a parent comment
- like / unlike mutation or equivalent like state mutation for comments

The comment list query should only fetch the fields actually needed for the visible UI.

## Replacement Notes

When rebuilding the comments section:
- keep the reusable surface small
- split shell, list item, and composer into focused components if needed
- prefer existing app patterns over third-party abstractions
- avoid overengineering the data flow
- keep the component tree easy to reuse on all detail pages

## Suggested Structure

If this is rewritten natively, the implementation should likely be split into:
- comments shell
- comment list
- comment item
- comment composer
- reply composer state
- comment action menu

## Testing Requirements

The replacement should have component tests covering:
- anonymous and authenticated rendering
- root comment display
- reply display
- submit comment
- reply comment
- edit comment
- delete comment
- pagination / load more
- loading state
- error state

Tests should verify that replies are actually rendered only when the data includes them.

## Implementation Order

1. Keep the current behavior stable.
2. Replace the current third-party surface with a native Ant Design-based implementation.
3. Add likes, separate reply loading, and comment detail/share support.
4. Preserve the same GraphQL and auth behavior.
5. Add targeted Cypress component coverage.
6. Remove any dead reply-loading logic that is no longer needed.
