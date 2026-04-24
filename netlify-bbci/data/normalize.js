function pickFirst(source, keys, fallback = null) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
}

function normalizeCarbon(source) {
  const nested = source?.carbon_sequestered ?? source?.carbon ?? null;

  if (nested && typeof nested === "object") {
    return {
      value: Number(
        pickFirst(nested, ["value", "amount", "carbon_value", "sequestered"], 0)
      ) || 0,
      units: pickFirst(nested, ["units", "unit"], "tons_co2e"),
      basis: pickFirst(nested, ["basis", "period", "time_basis"], "annual")
    };
  }

  return {
    value:
      Number(
        pickFirst(source, ["carbon_sequestered", "carbon_value", "sequestered_carbon"], 0)
      ) || 0,
    units: pickFirst(source, ["carbon_units"], "tons_co2e"),
    basis: pickFirst(source, ["carbon_basis"], "annual")
  };
}

function normalizeBirdIds(source) {
  const raw = pickFirst(source, ["bird_ids", "birds", "birdIds"], []);

  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeGallery(source) {
  const raw = pickFirst(source, ["gallery_images", "gallery", "media_gallery"], []);
  if (!Array.isArray(raw)) return [];

  return raw.map((item, index) => ({
    url: pickFirst(item, ["url", "src"], ""),
    caption: pickFirst(item, ["caption", "title"], `Image ${index + 1}`),
    alt: pickFirst(item, ["alt", "description"], `Project image ${index + 1}`)
  }));
}

function normalizeSimpleList(source, keys) {
  const raw = pickFirst(source, keys, []);
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeStoryAccess(source) {
  const raw = pickFirst(source, ["story_access", "storyAccess", "contributor_content"], {});
  const modules = Array.isArray(raw?.modules)
    ? raw.modules.map((module) => ({
        type: pickFirst(module, ["type", "kind"], "content"),
        label: pickFirst(module, ["label", "title"], "Content"),
        count: Number(pickFirst(module, ["count", "items"], 0)) || 0
      }))
    : [];

  return {
    contribution_unlock: Boolean(pickFirst(raw, ["contribution_unlock", "unlock"], false)),
    modules,
    narrative: pickFirst(raw, ["narrative", "description"], "")
  };
}

function normalizeSourceConnection(source) {
  const raw = pickFirst(source, ["source_connection", "sourceConnection"], {});
  return {
    account_name: pickFirst(raw, ["account_name", "accountName"], "Merge account"),
    record_name: pickFirst(raw, ["record_name", "recordName"], "Source record"),
    synced_at: pickFirst(raw, ["synced_at", "syncedAt"], "Pending sync"),
    status: pickFirst(raw, ["status", "connection_status"], "unlinked")
  };
}

function normalizeBuilderConfig(source) {
  const raw = pickFirst(source, ["builder_config", "builderConfig"], {});
  return {
    public_title: pickFirst(raw, ["public_title", "publicTitle"], pickFirst(source, ["project_name", "name"], "")),
    short_description: pickFirst(raw, ["short_description", "shortDescription"], pickFirst(source, ["short_description", "summary"], "")),
    long_story: pickFirst(raw, ["long_story", "longStory"], pickFirst(source, ["storyline", "story"], "")),
    customer_language: pickFirst(raw, ["customer_language", "customerLanguage"], "Support this project"),
    custom_terms: normalizeSimpleList(raw, ["custom_terms", "customTerms"]),
    campaign_tags: normalizeSimpleList(raw, ["campaign_tags", "campaignTags", "tags"]),
    featured: Boolean(pickFirst(raw, ["featured"], false)),
    publish_status: pickFirst(raw, ["publish_status", "publishStatus"], pickFirst(source, ["publish_status", "status"], "draft")),
    story_unlock: pickFirst(raw, ["story_unlock", "storyUnlock"], "")
  };
}

function normalizePaymentSetup(source) {
  const raw = pickFirst(source, ["payment_setup", "paymentSetup"], {});
  const suggested = pickFirst(raw, ["suggested_amounts", "suggestedAmounts"], []);
  return {
    gateway: pickFirst(raw, ["gateway"], "Unconfigured"),
    contribution_type: pickFirst(raw, ["contribution_type", "contributionType"], "custom"),
    suggested_amounts: Array.isArray(suggested) ? suggested : [],
    success_text: pickFirst(raw, ["success_text", "successText"], ""),
    routing_rule: pickFirst(raw, ["routing_rule", "routingRule"], ""),
    test_status: pickFirst(raw, ["test_status", "testStatus"], "pending")
  };
}

function normalizeUpdates(source) {
  const raw = pickFirst(source, ["updates", "project_updates"], []);
  if (!Array.isArray(raw)) return [];

  return raw.map((item) => ({
    title: pickFirst(item, ["title"], "Project update"),
    date: pickFirst(item, ["date", "published_at"], "Pending date"),
    body: pickFirst(item, ["body", "description"], "")
  }));
}

export function normalizeSourceRecord(raw) {
  const habitatType = pickFirst(raw, ["habitat_type", "habitatType", "ecosystem_type"], "Habitat");
  const projectName = pickFirst(raw, ["project_name", "projectName", "name"], "Untitled habitat project");

  return {
    source_id: String(pickFirst(raw, ["source_id", "id", "project_id"], "unknown-record")),
    project_name: projectName,
    farm_name: pickFirst(raw, ["farm_name", "farmName", "partner_name"], "Unassigned farm"),
    habitat_type: habitatType,
    boundary: pickFirst(raw, ["boundary", "geometry", "habitat_boundary"], "Boundary pending"),
    carbon_sequestered: normalizeCarbon(raw),
    habi_sensor_reference: String(
      pickFirst(raw, ["habi_sensor_reference", "habiSensorReference", "sensor_id"], "Unlinked")
    ),
    bird_ids: normalizeBirdIds(raw),
    hero_image: pickFirst(raw, ["hero_image", "heroImage", "image"], ""),
    gallery_images: normalizeGallery(raw),
    trust_markers: normalizeSimpleList(raw, ["trust_markers", "trustMarkers"]),
    location_label: pickFirst(raw, ["location_label", "location", "region", "state"], "Region pending"),
    publish_status: pickFirst(raw, ["publish_status", "status", "listing_status"], "draft"),
    featured: Boolean(pickFirst(raw, ["featured", "is_featured"], false)),
    campaign_tags: pickFirst(raw, ["campaign_tags", "campaignTags", "tags"], []),
    storyline: pickFirst(raw, ["storyline", "story", "public_story"], ""),
    story_access: normalizeStoryAccess(raw),
    short_description: pickFirst(
      raw,
      ["short_description", "summary", "description"],
      "A habitat opportunity ready for review."
    ),
    source_connection: normalizeSourceConnection(raw),
    builder_config: normalizeBuilderConfig(raw),
    payment_setup: normalizePaymentSetup(raw),
    updates: normalizeUpdates(raw),
    contribution_target_usd:
      Number(pickFirst(raw, ["contribution_target_usd", "funding_target", "target_usd"], 0)) || 0,
    progress_percent:
      Number(pickFirst(raw, ["progress_percent", "progress", "activation_progress"], 0)) || 0,
    updated_at: pickFirst(raw, ["updated_at", "updatedAt", "last_modified"], "Pending update")
  };
}
