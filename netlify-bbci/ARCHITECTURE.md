# Planet Portfolio Build Sequence

## Goal

Build a two-sided platform where:

- consumers discover and support live habitat opportunities
- Merge ops teams enroll new farms/projects and activate them efficiently

## Phase 1: Prototype refinement

Output:

- sharpened public landing page
- clearer consumer journey
- clearer ops journey

Questions to settle:

- what fields define a publishable opportunity
- how many listing types exist at launch
- what campaign/channel types matter first

## Phase 2: Data model

We should define the minimum viable schema before building admin screens.

Recommended first-pass tables:

- `farms`
- `projects`
- `listings`
- `campaigns`
- `brands`
- `listing_campaigns`
- `contribution_events`
- `project_updates`

Recommended key fields:

- source record id
- title
- slug
- ecosystem type
- geography
- partner/farm name
- funding status
- publish status
- hero image
- short story
- long description
- activation date

## Phase 3: Ops dashboard

This is the operational heart of the product.

Minimum viable ops features:

- intake queue from Merge database
- draft listing builder
- status management
- publish/unpublish controls
- project search and filtering
- campaign assignment

## Phase 4: Consumer listing system

Replace hardcoded cards with dynamic listing pages powered by real project data.

Minimum viable consumer features:

- browse listings
- filter by ecosystem or geography
- listing detail page
- campaign-linked entry pages
- contribution progress display

## Phase 5: Activation and reporting

Connect consumer actions back to ops.

Needed capabilities:

- campaign attribution
- action tracking
- reporting by listing
- reporting by brand/channel
- project status updates

## CTO recommendation

The next build should prioritize this order:

1. Choose app stack.
2. Stand up a shared data model.
3. Build the ops dashboard first enough to create listings.
4. Feed the consumer site from those listings.

Reason:

Without the ops layer, the public front end will keep becoming a manual marketing site instead of a functional platform.
