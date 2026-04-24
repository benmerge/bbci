# Planet Portfolio Data Contract

This project should assume the existing Merge database remains the source of truth.

Planet Portfolio will act as:

- a consumer-facing front end
- an ops-facing review and activation layer
- a translation layer between source records and publishable listings

## Core assumption

The incoming project data is intentionally simple.

At minimum, each habitat opportunity may include:

- habitat boundary
- carbon sequestered by the habitat
- Habi Sensor connection or reference
- bird ID list

For a strong consumer experience, the project should also eventually support simple contributor
content such as:

- bird recordings
- video feed or camera clips
- bird lists
- vegetation lists
- project photos

That is enough to build a strong first version.

## Recommended source model

We should treat each incoming record as a `habitat project` coming from the Merge system.

Suggested source fields:

- `source_id`
- `project_name`
- `farm_name`
- `habitat_type`
- `boundary`
- `carbon_sequestered`
- `habi_sensor_reference`
- `bird_ids`
- `story_access`
- `status`
- `updated_at`

## Public listing model

The consumer site should not expose raw source data directly.

Instead, each source record should be transformed into a `listing`.

Suggested listing fields:

- `listing_id`
- `source_id`
- `title`
- `slug`
- `short_description`
- `storyline`
- `habitat_type`
- `location_label`
- `boundary`
- `carbon_sequestered`
- `habi_sensor_reference`
- `bird_ids`
- `story_access`
- `hero_image`
- `publish_status`
- `featured`
- `campaign_tags`

## Ops-side responsibility

The Merge ops layer should do the following:

1. Receive or sync source records from the existing database.
2. Review whether each record is consumer-ready.
3. Add presentation fields such as title, story copy, imagery, and campaign placement.
4. Confirm the contributor-access story is strong enough to publish.
5. Activate the listing for public display.

## Publish lifecycle

Recommended listing states:

- `draft`
- `review`
- `active`
- `paused`
- `archived`

This lets the database stay simple while the front end remains well curated.

## Field notes

### `boundary`

This should be stored in whatever source format you already use.

Possible examples:

- GeoJSON
- polygon coordinates
- bounding box
- reference to a GIS record

For the first frontend version, we do not need advanced GIS tooling.
We only need enough structure to:

- understand the habitat footprint
- optionally show a simple map or region label
- preserve the source geometry for future mapping work

### `carbon_sequestered`

This should remain a simple measurable value.

Suggested structure:

- numeric value
- units
- optional time basis

Example:

- `12.4`
- `tons_co2e`
- `annual`

### `habi_sensor_reference`

For now, this can be a lightweight reference rather than a deep integration.

Possible shapes:

- sensor ID
- product SKU
- device type
- linked sensor record

This should be enough to attach monitoring context to a project page and leave room for later expansion.

### `bird_ids`

This can remain a simple list.

Possible shapes:

- species IDs
- observation IDs
- normalized bird codes

We do not need a complex biodiversity model on day one.
We only need a stable way to:

- store associated birds
- show known species presence
- support future enrichment if needed

### `story_access`

This is important for the product model even if the underlying data remains simple.

The consumer contribution should unlock access to the project story itself.

Suggested structure:

- `contribution_unlock`
- `modules`
- `narrative`

Example modules:

- bird recordings
- video feed
- bird list
- vegetation list
- project gallery

This does not require a heavy media system on day one.
It only requires enough metadata to tell the front end what kinds of story assets exist for a
project and whether they are ready for contributor access.

## First implementation recommendation

The first functional backend for this front end should do only three things:

1. Read habitat project records from the existing Merge-connected source.
2. Transform them into listing-ready objects.
3. Let ops approve and publish them with a contributor-ready story layer.

That keeps the build high-quality and durable without overengineering the first release.

## CTO recommendation

Because the incoming data is simple, the complexity should live in workflow and presentation, not in the data model.

That means we should prioritize:

- a clean adapter layer
- a durable publish workflow
- a polished consumer-facing listing experience
- a strong post-contribution story experience

Not:

- overbuilt schemas
- premature analytics complexity
- heavy GIS tooling before we need it
