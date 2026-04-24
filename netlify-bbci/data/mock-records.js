export const mergeSourceRecords = [
  {
    source_id: "hab-ks-001",
    project_name: "Kaufman Prairie Habitat",
    farm_name: "Kaufman Farms",
    habitat_type: "Prairie",
    boundary: "Polygon on file",
    carbon_sequestered: { value: 18.4, units: "tons_co2e", basis: "annual" },
    habi_sensor_reference: "HS-2048",
    bird_ids: ["EAME", "GRSP", "BOBO"],
    location_label: "Kansas",
    publish_status: "active",
    featured: true,
    campaign_tags: ["Product promotion", "Prairie week"],
    hero_image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    gallery_images: [
      {
        url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&q=80",
        caption: "Peak prairie bloom",
        alt: "Prairie flowers at sunset"
      },
      {
        url: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1200&q=80",
        caption: "Field edge habitat",
        alt: "Tall native grasses near a farm field"
      },
      {
        url: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
        caption: "Pollinator detail",
        alt: "Bee on flowering plant"
      }
    ],
    trust_markers: ["Boundary verified", "Sensor linked", "Bird records live"],
    updates: [
      {
        title: "Spring audio feed added",
        date: "2026-04-21",
        body: "Contributors can now listen to early prairie bird recordings from the site."
      },
      {
        title: "New bloom images published",
        date: "2026-04-16",
        body: "The project gallery now includes fresh pollinator and grassland photos."
      }
    ],
    source_connection: {
      account_name: "Merge OS / Kaufman Farms",
      record_name: "Habitat Project hab-ks-001",
      synced_at: "2026-04-21 08:45 CT",
      status: "connected"
    },
    builder_config: {
      public_title: "Kaufman Prairie Habitat",
      short_description: "Fund prairie return on working land with visible biodiversity proof.",
      long_story:
        "This project restores prairie habitat at the edge of productive farmland and turns contribution into an ongoing field story with bird recordings, sensor data, and seasonal imagery.",
      customer_language: "Support this project",
      custom_terms: ["Prairie return", "Field story"],
      campaign_tags: ["Product promotion", "Prairie week"],
      featured: true,
      publish_status: "active",
      story_unlock: "Contributors unlock recordings, gallery updates, and species evidence."
    },
    payment_setup: {
      gateway: "Stripe",
      contribution_type: "fixed + custom",
      suggested_amounts: [25, 50, 100],
      success_text: "You now have access to the field story for this prairie project.",
      routing_rule: "100% to Kaufman Prairie Habitat",
      test_status: "ready"
    },
    storyline:
      "Support prairie return on working land with visible pollinator habitat, grassland resilience, and a sensor-linked monitoring story.",
    short_description:
      "A consumer-friendly prairie restoration opportunity designed for product promos and seasonal campaigns.",
    story_access: {
      contribution_unlock: true,
      modules: [
        { type: "bird_recordings", label: "Bird recordings", count: 12 },
        { type: "video_feed", label: "Live field feed", count: 1 },
        { type: "bird_list", label: "Bird list", count: 18 },
        { type: "vegetation_list", label: "Vegetation list", count: 24 },
        { type: "gallery", label: "Project photos", count: 36 }
      ],
      narrative:
        "Contributors unlock an evolving field story with recordings, sensor-linked updates, species lists, and visual evidence from the habitat."
    },
    contribution_target_usd: 24000,
    progress_percent: 62,
    updated_at: "2026-04-21"
  },
  {
    source_id: "hab-mn-014",
    project_name: "North Marsh Edge Habitat",
    farm_name: "North Marsh Cooperative",
    habitat_type: "Wetland",
    boundary: "Polygon on file",
    carbon_sequestered: { value: 11.2, units: "tons_co2e", basis: "annual" },
    habi_sensor_reference: "HS-3110",
    bird_ids: ["MALL", "RWBL", "SORA"],
    location_label: "Minnesota",
    publish_status: "review",
    featured: false,
    campaign_tags: ["Water stewardship"],
    hero_image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80",
    gallery_images: [
      {
        url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
        caption: "Wetland edge",
        alt: "Wetland grasses and open water"
      },
      {
        url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
        caption: "Marsh path",
        alt: "Path through wetland vegetation"
      }
    ],
    trust_markers: ["Wetland partner onboard", "Bird list verified"],
    updates: [
      {
        title: "Species list awaiting approval",
        date: "2026-04-20",
        body: "Bird list and marsh clips are attached but still in ops review."
      }
    ],
    source_connection: {
      account_name: "Merge OS / North Marsh Cooperative",
      record_name: "Habitat Project hab-mn-014",
      synced_at: "2026-04-20 15:10 CT",
      status: "connected"
    },
    builder_config: {
      public_title: "North Marsh Edge Habitat",
      short_description: "A wetland story built around water, birds, and resilience.",
      long_story:
        "This wetland edge habitat is being prepared for a public-facing contribution experience with recordings, image proof, and seasonal marsh updates.",
      customer_language: "Support wetland habitat",
      custom_terms: ["Marsh story", "Water-linked habitat"],
      campaign_tags: ["Water stewardship"],
      featured: false,
      publish_status: "review",
      story_unlock: "Contributors will unlock marsh clips, species lists, and habitat updates."
    },
    payment_setup: {
      gateway: "Stripe",
      contribution_type: "fixed",
      suggested_amounts: [20, 40, 80],
      success_text: "You’ll get access as soon as this project moves live.",
      routing_rule: "Reserved for North Marsh Edge Habitat",
      test_status: "pending review"
    },
    storyline:
      "Restore wetland edge habitat with strong water, bird, and resilience storytelling for brands that want a grounded regional story.",
    short_description:
      "A water-linked habitat project ready for ops review before public activation.",
    story_access: {
      contribution_unlock: true,
      modules: [
        { type: "bird_recordings", label: "Bird recordings", count: 5 },
        { type: "video_feed", label: "Marsh camera clips", count: 2 },
        { type: "bird_list", label: "Bird list", count: 11 },
        { type: "gallery", label: "Wetland photo set", count: 14 }
      ],
      narrative:
        "Once active, contributors will be able to follow marsh life through recordings, image sets, and a simplified species presence story."
    },
    contribution_target_usd: 18000,
    progress_percent: 28,
    updated_at: "2026-04-20"
  },
  {
    source_id: "hab-wi-006",
    project_name: "Driftless Pollinator Corridor",
    farm_name: "Three Ridges Farm",
    habitat_type: "Pollinator corridor",
    boundary: "Polygon on file",
    carbon_sequestered: { value: 7.9, units: "tons_co2e", basis: "annual" },
    habi_sensor_reference: "HS-1876",
    bird_ids: ["AMGO", "INBU"],
    location_label: "Wisconsin",
    publish_status: "draft",
    featured: false,
    campaign_tags: ["Consumer engagement", "QR activation"],
    hero_image:
      "https://images.unsplash.com/photo-1493810329807-5d3c5d366b1d?auto=format&fit=crop&w=1400&q=80",
    gallery_images: [
      {
        url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
        caption: "Corridor edge",
        alt: "Wild plants along a field edge"
      }
    ],
    trust_markers: ["Draft only", "Media incomplete"],
    updates: [
      {
        title: "Waiting on hero image",
        date: "2026-04-19",
        body: "Ops still needs stronger media before this listing should publish."
      }
    ],
    source_connection: {
      account_name: "Merge OS / Three Ridges Farm",
      record_name: "Habitat Project hab-wi-006",
      synced_at: "2026-04-19 09:30 CT",
      status: "connected"
    },
    builder_config: {
      public_title: "Driftless Pollinator Corridor",
      short_description: "A corridor listing built for QR scans and audience actions.",
      long_story:
        "This project is in builder mode and still needs stronger imagery, trust markers, and unlocked content before it is consumer-ready.",
      customer_language: "Back this corridor",
      custom_terms: ["Field corridor", "Pollinator route"],
      campaign_tags: ["Consumer engagement", "QR activation"],
      featured: false,
      publish_status: "draft",
      story_unlock: "Contributors will unlock photos, species lists, and field notes."
    },
    payment_setup: {
      gateway: "Stripe",
      contribution_type: "custom",
      suggested_amounts: [15, 30, 60],
      success_text: "This draft flow still needs confirmation text.",
      routing_rule: "Route once listing is active",
      test_status: "not configured"
    },
    storyline:
      "A corridor story built for scans, packaging experiences, and audience actions that unlock habitat support.",
    short_description:
      "A draft listing waiting on ops copy, imagery, and activation settings.",
    story_access: {
      contribution_unlock: true,
      modules: [
        { type: "bird_list", label: "Bird list", count: 6 },
        { type: "vegetation_list", label: "Vegetation list", count: 9 },
        { type: "gallery", label: "Field photos", count: 8 }
      ],
      narrative:
        "This listing is still assembling its contributor experience and needs ops curation before it can become a strong post-contribution story."
    },
    contribution_target_usd: 12000,
    progress_percent: 8,
    updated_at: "2026-04-19"
  }
];
