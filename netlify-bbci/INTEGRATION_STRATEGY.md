# Integration Strategy

Yes, we can move forward before the real payload exists.

The safe approach is:

1. Keep a stable internal app model.
2. Treat the database payload as external and uncertain.
3. Normalize incoming records at one boundary.
4. Render the UI only from normalized records.

## Current boundary

The project now uses this flow:

- raw source record
- `normalizeSourceRecord(...)`
- `toListing(...)`
- UI render

Files:

- [data/normalize.js](/Users/baimac/Documents/Playground/netlify-bbci/data/normalize.js)
- [data/adapter.js](/Users/baimac/Documents/Playground/netlify-bbci/data/adapter.js)
- [main.js](/Users/baimac/Documents/Playground/netlify-bbci/main.js)

## Why this is safe

This prevents us from spreading payload guesses throughout the app.

When the real Merge-connected payload arrives, we only need to update the normalization layer instead of rewriting:

- consumer cards
- ops preview
- listing rendering
- status logic

## Current tolerance

The normalizer already supports alternate field names for likely variants such as:

- `source_id`, `id`, `project_id`
- `project_name`, `projectName`, `name`
- `habitat_type`, `habitatType`, `ecosystem_type`
- `publish_status`, `status`, `listing_status`
- `bird_ids`, `birds`, `birdIds`
- `habi_sensor_reference`, `habiSensorReference`, `sensor_id`

## When the real payload arrives

We will do three things:

1. Compare the real fields to the current normalizer.
2. Update field mapping and defaults.
3. Add a couple of representative fixtures from production-like data.

That should be a contained change, not a rebuild.

## CTO recommendation

Until we have the real payload, we should continue building:

- listing detail views
- ops status interactions
- consumer discovery patterns

We should avoid building:

- payload-specific assumptions
- hardcoded backend contracts outside the normalizer
- deep database coupling in the UI
