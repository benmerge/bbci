const statusTone = {
  active: "Live for consumers",
  review: "In ops review",
  draft: "Draft listing",
  paused: "Temporarily paused",
  archived: "Archived"
};

export function toListing(record) {
  const accessModules = record.story_access?.modules || [];
  const progressPercent = record.progress_percent;
  const gallery = record.gallery_images || [];

  return {
    id: record.source_id,
    title: record.project_name,
    region: record.location_label,
    habitatType: record.habitat_type,
    description: record.storyline || record.short_description,
    shortDescription: record.short_description,
    publishStatus: record.publish_status,
    publishLabel: statusTone[record.publish_status] || "Unclassified",
    featured: Boolean(record.featured),
    campaignTags: record.campaign_tags || [],
    carbonLabel: `${record.carbon_sequestered.value} ${record.carbon_sequestered.units}`,
    sensorLabel: record.habi_sensor_reference,
    birdsLabel: `${record.bird_ids.length} bird IDs`,
    progressPercent,
    targetLabel: `$${record.contribution_target_usd.toLocaleString()}`,
    raisedLabel: `$${Math.round((record.contribution_target_usd * progressPercent) / 100).toLocaleString()}`,
    boundaryLabel: record.boundary,
    updatedAt: record.updated_at,
    farmName: record.farm_name,
    heroImage: record.hero_image,
    gallery,
    trustMarkers: record.trust_markers || [],
    updates: record.updates || [],
    sourceConnection: record.source_connection,
    builder: record.builder_config,
    payment: record.payment_setup,
    storyNarrative: record.story_access?.narrative || "",
    unlockOnContribution: Boolean(record.story_access?.contribution_unlock),
    accessModules,
    accessSummary:
      accessModules.length > 0
        ? `${accessModules.length} contributor content modules`
        : "Contributor content pending",
    locationEcosystem: `${record.location_label} · ${record.habitat_type}`
  };
}

export function summarizeListings(listings) {
  const counts = listings.reduce(
    (acc, listing) => {
      acc.total += 1;
      acc[listing.publishStatus] = (acc[listing.publishStatus] || 0) + 1;
      return acc;
    },
    { total: 0, draft: 0, review: 0, active: 0, paused: 0, archived: 0 }
  );

  return [
    { label: "Source records", value: counts.total },
    { label: "Active listings", value: counts.active },
    { label: "In review", value: counts.review },
    { label: "Drafts", value: counts.draft }
  ];
}
