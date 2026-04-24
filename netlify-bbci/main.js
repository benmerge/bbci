import { toListing, summarizeListings } from "./data/adapter.js";
import { mergeSourceRecords } from "./data/mock-records.js";
import { normalizeSourceRecord } from "./data/normalize.js";

const STORAGE_KEY = "planet-portfolio-workflow-edits-v1";
const DRAFT_STORAGE_KEY = "planet-portfolio-workflow-drafts-v1";
const VALID_SCREENS = [
  "consumer-project",
  "listing-grid",
  "source-connection",
  "project-builder",
  "media-manager",
  "payment-setup",
  "consumer-preview",
  "publish-controls"
];
const PUBLISH_STATES = ["draft", "review", "active", "paused", "archived"];

const baseListings = mergeSourceRecords.map(normalizeSourceRecord).map(toListing);

const screenPanels = [...document.querySelectorAll(".screen-panel")];
const workflowLinks = [...document.querySelectorAll(".workflow-link")];
const recordSwitcher = document.querySelector("#record-switcher");
const recordSummary = document.querySelector("#record-summary");

const consumerProjectScreen = document.querySelector("#consumer-project-screen");
const listingGridScreen = document.querySelector("#listing-grid-screen");
const sourceConnectionScreen = document.querySelector("#source-connection-screen");
const projectBuilderScreen = document.querySelector("#project-builder-screen");
const mediaManagerScreen = document.querySelector("#media-manager-screen");
const paymentSetupScreen = document.querySelector("#payment-setup-screen");
const consumerPreviewScreen = document.querySelector("#consumer-preview-screen");
const publishControlsScreen = document.querySelector("#publish-controls-screen");

function loadEdits() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveEdits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.edits));
}

function loadDrafts() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveDrafts() {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state.drafts));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base, patch) {
  if (!isObject(base) || !isObject(patch)) return patch;

  const merged = { ...base };
  Object.entries(patch).forEach(([key, value]) => {
    if (isObject(value) && isObject(base[key])) {
      merged[key] = deepMerge(base[key], value);
    } else {
      merged[key] = value;
    }
  });
  return merged;
}

function getInitialState() {
  const params = new URLSearchParams(window.location.search);
  const requestedScreen = params.get("screen");
  const requestedProject = params.get("project");
  const fallbackId = baseListings[0]?.id ?? null;

  return {
    activeScreen: VALID_SCREENS.includes(requestedScreen) ? requestedScreen : "consumer-project",
    activeListingId: baseListings.some((listing) => listing.id === requestedProject)
      ? requestedProject
      : fallbackId,
    edits: loadEdits(),
    drafts: loadDrafts()
  };
}

const state = getInitialState();

function writeUrl() {
  const params = new URLSearchParams();
  params.set("screen", state.activeScreen);
  params.set("project", state.activeListingId);
  history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
}

function getListingById(id) {
  return baseListings.find((listing) => listing.id === id) ?? baseListings[0];
}

function getCommittedListings() {
  return baseListings.map((listing) => deepMerge(clone(listing), state.edits[listing.id] || {}));
}

function getDraftPatch(listingId) {
  return state.drafts[listingId] || {};
}

function getDraftListing(listingId, committedListing) {
  return deepMerge(clone(committedListing), getDraftPatch(listingId));
}

function buildPatch(path, value) {
  const patch = {};
  let cursor = patch;
  path.forEach((segment, index) => {
    if (index === path.length - 1) {
      cursor[segment] = value;
    } else {
      cursor[segment] = cursor[segment] || {};
      cursor = cursor[segment];
    }
  });
  return patch;
}

function hasPendingDraft(listingId) {
  return Object.keys(getDraftPatch(listingId)).length > 0;
}

function statusTone(status) {
  return {
    active: "Live",
    review: "In review",
    draft: "Draft",
    paused: "Paused",
    archived: "Archived"
  }[status] || status;
}

function updateListingEdits(listingId, patch) {
  const current = state.edits[listingId] || {};
  state.edits[listingId] = deepMerge(current, patch);
  saveEdits();
  renderApp();
}

function updateListingDraft(listingId, patch, options = {}) {
  const current = state.drafts[listingId] || {};
  state.drafts[listingId] = deepMerge(current, patch);
  saveDrafts();
  if (options.rerender) renderApp();
}

function applyDraftEdits(listingId) {
  const draft = getDraftPatch(listingId);
  if (!hasPendingDraft(listingId)) return;
  const current = state.edits[listingId] || {};
  state.edits[listingId] = deepMerge(current, draft);
  delete state.drafts[listingId];
  saveEdits();
  saveDrafts();
  renderApp();
}

function discardDraftEdits(listingId) {
  if (!hasPendingDraft(listingId)) return;
  delete state.drafts[listingId];
  saveDrafts();
  renderApp();
}

function setActiveScreen(screen) {
  state.activeScreen = VALID_SCREENS.includes(screen) ? screen : "consumer-project";
  renderApp();
}

function setActiveListing(listingId, nextScreen = state.activeScreen) {
  state.activeListingId = getListingById(listingId).id;
  state.activeScreen = nextScreen;
  renderApp();
}

function renderRecordSwitcher(displayListings) {
  if (!recordSwitcher) return;

  recordSwitcher.innerHTML = displayListings
    .map(
      (listing) => `
        <button class="record-chip ${listing.id === state.activeListingId ? "is-active" : ""}" data-record-id="${listing.id}">
          <span>${listing.region}</span>
          <strong>${listing.title}</strong>
        </button>
      `
    )
    .join("");

  recordSwitcher.querySelectorAll("[data-record-id]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveListing(button.dataset.recordId);
    });
  });
}

function renderRecordSummary(listing) {
  if (!recordSummary) return;

  recordSummary.innerHTML = `
    <article class="summary-card">
      <span>Selected</span>
      <strong>${listing.title}</strong>
    </article>
    <article class="summary-card">
      <span>Status</span>
      <strong>${statusTone(listing.publishStatus)}</strong>
    </article>
    <article class="summary-card">
      <span>Progress</span>
      <strong>${listing.progressPercent}%</strong>
    </article>
    <article class="summary-card">
      <span>Access</span>
      <strong>${listing.accessSummary}</strong>
    </article>
    <article class="summary-card">
      <span>Draft changes</span>
      <strong>${hasPendingDraft(listing.id) ? "Pending" : "None"}</strong>
    </article>
  `;
}

function renderDraftActions(listingId) {
  return `
    <div class="draft-actions">
      <span class="draft-state ${hasPendingDraft(listingId) ? "is-dirty" : ""}">
        ${hasPendingDraft(listingId) ? "Draft changes pending" : "No draft changes"}
      </span>
      <div class="builder-actions">
        <button class="button-primary-solid" data-apply-draft="${listingId}" ${hasPendingDraft(listingId) ? "" : "disabled"}>
          Apply draft
        </button>
        <button class="button-ghost" data-discard-draft="${listingId}" ${hasPendingDraft(listingId) ? "" : "disabled"}>
          Discard draft
        </button>
      </div>
    </div>
  `;
}

function renderConsumerProject(listing) {
  if (!consumerProjectScreen) return;

  consumerProjectScreen.innerHTML = `
    <div class="screen-header">
      <div>
        <p class="eyebrow">01 · Consumer project page</p>
        <h2>Why support this?</h2>
      </div>
      <button class="header-chip header-chip-strong">${listing.builder.customer_language}</button>
    </div>

    <article class="consumer-project">
      <div class="consumer-hero">
        <img src="${listing.heroImage}" alt="${listing.title}" />
        <div class="consumer-hero-copy">
          <p class="project-region">${listing.locationEcosystem}</p>
          <h3>${listing.title}</h3>
          <p>${listing.shortDescription}</p>
          <div class="project-meta">
            ${listing.trustMarkers.map((marker) => `<span>${marker}</span>`).join("")}
          </div>
          <div class="contribution-panel">
            <div>
              <span>Raised</span>
              <strong>${listing.raisedLabel}</strong>
            </div>
            <div>
              <span>Goal</span>
              <strong>${listing.targetLabel}</strong>
            </div>
            <div>
              <span>Access</span>
              <strong>${listing.accessSummary}</strong>
            </div>
            <button class="button-primary-solid">${listing.builder.customer_language}</button>
          </div>
          <div class="progress-strip">
            <div class="progress-bar" aria-hidden="true"><span style="width: ${listing.progressPercent}%"></span></div>
            <div class="progress-meta">
              <strong>${listing.progressPercent}% funded</strong>
              <span>${listing.sensorLabel} · ${listing.birdsLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="consumer-grid">
        <section class="content-card">
          <div class="card-head">
            <p class="eyebrow">Project story</p>
            <h3>Short story</h3>
          </div>
          <p class="story-copy">${listing.description}</p>
        </section>

        <section class="content-card">
          <div class="card-head">
            <p class="eyebrow">Proof</p>
            <h3>Trust markers</h3>
          </div>
          <dl class="fact-grid">
            <div><dt>Farm</dt><dd>${listing.farmName}</dd></div>
            <div><dt>Boundary</dt><dd>${listing.boundaryLabel}</dd></div>
            <div><dt>Carbon</dt><dd>${listing.carbonLabel}</dd></div>
            <div><dt>Sensor</dt><dd>${listing.sensorLabel}</dd></div>
          </dl>
        </section>
      </div>

      <section class="content-card">
        <div class="card-head">
          <p class="eyebrow">Field gallery</p>
          <h3>Real project images</h3>
        </div>
        <div class="gallery-strip">
          ${listing.gallery
            .map(
              (image) => `
                <figure class="gallery-card">
                  <img src="${image.url}" alt="${image.alt}" />
                  <figcaption>${image.caption}</figcaption>
                </figure>
              `
            )
            .join("")}
        </div>
      </section>

      <section class="content-card">
        <div class="card-head">
          <p class="eyebrow">Unlocked story</p>
          <h3>What contributors get</h3>
        </div>
        <div class="unlock-grid">
          ${listing.accessModules
            .map(
              (module) => `
                <article class="mini-stat">
                  <span>${module.label}</span>
                  <strong>${module.count}</strong>
                </article>
              `
            )
            .join("")}
        </div>
        <p class="story-copy">${listing.storyNarrative}</p>
      </section>

      <section class="content-card">
        <div class="card-head">
          <p class="eyebrow">Updates</p>
          <h3>Simple project story feed</h3>
        </div>
        <div class="update-list">
          ${listing.updates
            .map(
              (update) => `
                <article class="update-row">
                  <span>${update.date}</span>
                  <div>
                    <strong>${update.title}</strong>
                    <p>${update.body}</p>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    </article>
  `;
}

function renderListingGrid(displayListings) {
  if (!listingGridScreen) return;

  listingGridScreen.innerHTML = `
    <div class="screen-header">
      <div>
        <p class="eyebrow">02 · Consumer listing card/grid</p>
        <h2>What should be browsed?</h2>
      </div>
      <div class="tiny-summary">${summarizeListings(displayListings)
        .map((item) => `<span>${item.label}: <strong>${item.value}</strong></span>`)
        .join("")}</div>
    </div>
    <div class="listing-grid">
      ${displayListings
        .map(
          (listing) => `
            <article class="listing-card ${listing.id === state.activeListingId ? "is-selected" : ""}">
              <img src="${listing.heroImage}" alt="${listing.title}" />
              <div class="listing-card-body">
                <p class="project-region">${listing.locationEcosystem}</p>
                <h3>${listing.title}</h3>
                <p>${listing.shortDescription}</p>
                <div class="progress-bar" aria-hidden="true"><span style="width: ${listing.progressPercent}%"></span></div>
                <div class="progress-meta">
                  <strong>${listing.progressPercent}%</strong>
                  <span>${listing.targetLabel}</span>
                </div>
                <div class="project-meta">
                  <span>${listing.habitatType}</span>
                  <span>${statusTone(listing.publishStatus)}</span>
                </div>
                <button class="inline-action" data-select-record="${listing.id}">${listing.builder.customer_language}</button>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;

  listingGridScreen.querySelectorAll("[data-select-record]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveListing(button.dataset.selectRecord, "consumer-project");
    });
  });
}

function renderSourceConnection(listing) {
  if (!sourceConnectionScreen) return;
  const connection = listing.sourceConnection;

  sourceConnectionScreen.innerHTML = `
    <div class="screen-header">
      <div>
        <p class="eyebrow">03 · Project source connection</p>
        <h2>Is the data connected correctly?</h2>
      </div>
      ${renderDraftActions(listing.id)}
    </div>
    <div class="builder-layout">
      <section class="content-card">
        <div class="card-head">
          <p class="eyebrow">Connection</p>
          <h3>Merge source</h3>
        </div>
        <div class="form-grid-app">
          <label><span>Account</span><input data-edit-path="sourceConnection.account_name" value="${connection.account_name}" /></label>
          <label><span>Source record</span><input data-edit-path="sourceConnection.record_name" value="${connection.record_name}" /></label>
          <label><span>Last sync</span><input data-edit-path="sourceConnection.synced_at" value="${connection.synced_at}" /></label>
          <label><span>Status</span><input data-edit-path="sourceConnection.status" value="${connection.status}" /></label>
        </div>
        <div class="builder-actions">
          <button class="button-primary-solid">Sync source</button>
          <button class="button-ghost">Create Planet Portfolio project</button>
        </div>
      </section>
      <section class="content-card">
        <div class="card-head">
          <p class="eyebrow">Source preview</p>
          <h3>Incoming record</h3>
        </div>
        <dl class="fact-grid">
          <div><dt>Title</dt><dd>${listing.title}</dd></div>
          <div><dt>Location</dt><dd>${listing.region}</dd></div>
          <div><dt>Habitat</dt><dd>${listing.habitatType}</dd></div>
          <div><dt>Bird IDs</dt><dd>${listing.birdsLabel}</dd></div>
          <div><dt>Boundary</dt><dd>${listing.boundaryLabel}</dd></div>
          <div><dt>Sensor</dt><dd>${listing.sensorLabel}</dd></div>
        </dl>
      </section>
    </div>
  `;
}

function renderProjectBuilder(listing) {
  if (!projectBuilderScreen) return;
  const builder = listing.builder;

  projectBuilderScreen.innerHTML = `
    <div class="screen-header">
      <div>
        <p class="eyebrow">04 · Project builder</p>
        <h2>What is needed to publish this?</h2>
      </div>
      ${renderDraftActions(listing.id)}
    </div>
    <section class="content-card">
      <div class="card-head">
        <p class="eyebrow">Public fields</p>
        <h3>Builder</h3>
      </div>
      <div class="form-grid-app form-grid-app-wide">
        <label><span>Public title</span><input data-edit-path="title" data-builder-path="builder.public_title" value="${builder.public_title}" /></label>
        <label><span>Customer language</span><input data-edit-path="builder.customer_language" value="${builder.customer_language}" /></label>
        <label class="field-span-2"><span>Short description</span><textarea data-edit-path="shortDescription" data-builder-path="builder.short_description" rows="3">${builder.short_description}</textarea></label>
        <label class="field-span-2"><span>Long story</span><textarea data-edit-path="description" data-builder-path="builder.long_story" rows="6">${builder.long_story}</textarea></label>
        <label><span>Custom terms</span><input data-edit-array="builder.custom_terms" value="${builder.custom_terms.join(", ")}" /></label>
        <label><span>Campaign tags</span><input data-edit-array="campaignTags,builder.campaign_tags" value="${builder.campaign_tags.join(", ")}" /></label>
        <label><span>Featured</span><select data-edit-boolean="builder.featured">${["true", "false"]
          .map((value) => `<option value="${value}" ${String(builder.featured) === value ? "selected" : ""}>${value === "true" ? "Yes" : "No"}</option>`)
          .join("")}</select></label>
        <label><span>Publish status</span><select data-edit-status="publishStatus,builder.publish_status">${PUBLISH_STATES.map(
          (status) => `<option value="${status}" ${builder.publish_status === status ? "selected" : ""}>${status}</option>`
        ).join("")}</select></label>
        <label class="field-span-2"><span>Story unlock settings</span><textarea data-edit-path="builder.story_unlock" data-edit-story rows="3">${builder.story_unlock}</textarea></label>
      </div>
    </section>
  `;
}

function renderMediaManager(listing) {
  if (!mediaManagerScreen) return;

  mediaManagerScreen.innerHTML = `
    <div class="screen-header">
      <div>
        <p class="eyebrow">05 · Media manager</p>
        <h2>Is the story visual enough?</h2>
      </div>
      ${renderDraftActions(listing.id)}
    </div>
    <div class="builder-layout">
      <section class="content-card">
        <div class="card-head">
          <p class="eyebrow">Hero image</p>
          <h3>Primary visual</h3>
        </div>
        <div class="hero-media-card">
          <img src="${listing.heroImage}" alt="${listing.title}" />
          <div class="builder-actions">
            <button class="button-primary-solid">Upload project image</button>
            <button class="button-ghost">Preview crop</button>
          </div>
        </div>
      </section>
      <section class="content-card">
        <div class="card-head">
          <p class="eyebrow">Gallery</p>
          <h3>Project images</h3>
        </div>
        <div class="media-grid">
          ${listing.gallery
            .map(
              (image, index) => `
                <button class="media-card ${image.url === listing.heroImage ? "is-hero" : ""}" data-hero-url="${image.url}">
                  <img src="${image.url}" alt="${image.alt}" />
                  <strong>${index === 0 ? "Hero candidate" : image.caption}</strong>
                  <span>${image.alt}</span>
                </button>
              `
            )
            .join("")}
        </div>
        <div class="builder-actions">
          <button class="button-primary-solid">Upload images</button>
          <button class="button-ghost">Reorder gallery</button>
          <button class="button-ghost">Edit captions</button>
        </div>
      </section>
    </div>
  `;

      mediaManagerScreen.querySelectorAll("[data-hero-url]").forEach((button) => {
    button.addEventListener("click", () => {
      updateListingDraft(listing.id, { heroImage: button.dataset.heroUrl }, { rerender: true });
    });
  });
}

function renderPaymentSetup(listing) {
  if (!paymentSetupScreen) return;
  const payment = listing.payment;

  paymentSetupScreen.innerHTML = `
    <div class="screen-header">
      <div>
        <p class="eyebrow">06 · Payment setup</p>
        <h2>Can support be routed cleanly?</h2>
      </div>
      ${renderDraftActions(listing.id)}
    </div>
    <section class="content-card">
      <div class="card-head">
        <p class="eyebrow">Contribution flow</p>
        <h3>Payment setup</h3>
      </div>
      <div class="form-grid-app">
        <label><span>Gateway</span><input data-edit-path="payment.gateway" value="${payment.gateway}" /></label>
        <label><span>Contribution type</span><input data-edit-path="payment.contribution_type" value="${payment.contribution_type}" /></label>
        <label><span>Suggested amounts</span><input data-edit-array="payment.suggested_amounts" value="${payment.suggested_amounts.join(", ")}" /></label>
        <label><span>Test payment</span><input data-edit-path="payment.test_status" value="${payment.test_status}" /></label>
        <label class="field-span-2"><span>Routing rule</span><input data-edit-path="payment.routing_rule" value="${payment.routing_rule}" /></label>
        <label class="field-span-2"><span>Success state text</span><textarea data-edit-path="payment.success_text" rows="4">${payment.success_text}</textarea></label>
      </div>
      <div class="builder-actions">
        <button class="button-primary-solid">Run test payment</button>
        <button class="button-ghost">View contribution routing</button>
      </div>
    </section>
  `;
}

function renderConsumerPreview(listing) {
  if (!consumerPreviewScreen) return;

  consumerPreviewScreen.innerHTML = `
    <div class="screen-header">
      <div>
        <p class="eyebrow">07 · Consumer preview</p>
        <h2>What will the customer see?</h2>
      </div>
    </div>
    <div class="preview-grid">
      <section class="content-card">
        <div class="card-head">
          <p class="eyebrow">Desktop preview</p>
          <h3>Detail page</h3>
        </div>
        <div class="preview-frame preview-frame-desktop">
          <img src="${listing.heroImage}" alt="${listing.title}" />
          <div>
            <strong>${listing.title}</strong>
            <p>${listing.shortDescription}</p>
          </div>
        </div>
      </section>
      <section class="content-card">
        <div class="card-head">
          <p class="eyebrow">Mobile preview</p>
          <h3>Contribution card</h3>
        </div>
        <div class="preview-frame preview-frame-mobile">
          <img src="${listing.heroImage}" alt="${listing.title}" />
          <strong>${listing.title}</strong>
          <span>${listing.locationEcosystem}</span>
          <button class="inline-action">${listing.builder.customer_language}</button>
        </div>
      </section>
      <section class="content-card">
        <div class="card-head">
          <p class="eyebrow">Confirmation preview</p>
          <h3>Success state</h3>
        </div>
        <div class="preview-frame">
          <strong>Contribution confirmed</strong>
          <p>${listing.payment.success_text}</p>
        </div>
      </section>
      <section class="content-card">
        <div class="card-head">
          <p class="eyebrow">Unlocked story</p>
          <h3>Post-contribution view</h3>
        </div>
        <div class="unlock-grid">
          ${listing.accessModules
            .map(
              (module) => `
                <article class="mini-stat">
                  <span>${module.label}</span>
                  <strong>${module.count}</strong>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderPublishControls(listing) {
  if (!publishControlsScreen) return;

  publishControlsScreen.innerHTML = `
    <div class="screen-header">
      <div>
        <p class="eyebrow">08 · Publish controls</p>
        <h2>What state is it in?</h2>
      </div>
      ${renderDraftActions(listing.id)}
    </div>
    <section class="content-card">
      <div class="card-head">
        <p class="eyebrow">Lifecycle</p>
        <h3>Publish state</h3>
      </div>
      <div class="status-strip">
        ${PUBLISH_STATES.map(
          (status) => `
            <button class="status-pill ${listing.publishStatus === status ? "is-active" : ""}" data-status="${status}">
              ${status}
            </button>
          `
        ).join("")}
      </div>
      <div class="publish-grid">
        <article class="summary-card">
          <span>Current status</span>
          <strong>${statusTone(listing.publishStatus)}</strong>
        </article>
        <article class="summary-card">
          <span>Featured</span>
          <strong>${listing.builder.featured ? "Yes" : "No"}</strong>
        </article>
        <article class="summary-card">
          <span>Payment test</span>
          <strong>${listing.payment.test_status}</strong>
        </article>
        <article class="summary-card">
          <span>Source sync</span>
          <strong>${listing.sourceConnection.status}</strong>
        </article>
      </div>
      <div class="builder-actions">
        <button class="button-primary-solid" data-status-action="review">Move to review</button>
        <button class="button-ghost" data-status-action="active">Publish live</button>
        <button class="button-ghost" data-status-action="paused">Pause listing</button>
      </div>
    </section>
  `;

  publishControlsScreen.querySelectorAll("[data-status], [data-status-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextStatus = button.dataset.status || button.dataset.statusAction;
      updateListingDraft(listing.id, {
        publishStatus: nextStatus,
        builder: { publish_status: nextStatus }
      }, { rerender: true });
    });
  });
}

function renderScreens(listing, displayListings) {
  renderConsumerProject(listing);
  renderListingGrid(displayListings);
  renderSourceConnection(listing);
  renderProjectBuilder(listing);
  renderMediaManager(listing);
  renderPaymentSetup(listing);
  renderConsumerPreview(listing);
  renderPublishControls(listing);
}

function bindWorkflowNav() {
  workflowLinks.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveScreen(button.dataset.screen);
    });
  });
}

function bindFieldEditors(listing) {
  document.querySelectorAll("[data-edit-path]").forEach((field) => {
    field.addEventListener("input", () => {
      let patch = buildPatch(field.dataset.editPath.split("."), field.value);

      if (field.dataset.builderPath) {
        patch = deepMerge(patch, buildPatch(field.dataset.builderPath.split("."), field.value));
      }

      updateListingDraft(listing.id, patch);
    });
  });

  document.querySelectorAll("[data-edit-array]").forEach((field) => {
    field.addEventListener("input", () => {
      const values = field.value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const patch = {};
      field.dataset.editArray.split(",").forEach((rawPath) => {
        patch = deepMerge(patch, buildPatch(rawPath.split("."), values));
      });
      updateListingDraft(listing.id, patch);
    });
  });

  document.querySelectorAll("[data-edit-boolean]").forEach((field) => {
    field.addEventListener("change", () => {
      const value = field.value === "true";
      updateListingDraft(listing.id, buildPatch(field.dataset.editBoolean.split("."), value));
    });
  });

  document.querySelectorAll("[data-edit-status]").forEach((field) => {
    field.addEventListener("change", () => {
      const [publicPath, builderPathRaw] = field.dataset.editStatus.split(",");
      let patch = buildPatch(publicPath.split("."), field.value);
      patch = deepMerge(patch, buildPatch(builderPathRaw.split("."), field.value));
      updateListingDraft(listing.id, patch);
    });
  });

  document.querySelectorAll("[data-edit-story]").forEach((field) => {
    field.addEventListener("input", () => {
      updateListingDraft(listing.id, {
        builder: { story_unlock: field.value },
        storyNarrative: field.value || getListingById(listing.id).storyNarrative
      });
    });
  });

  document.querySelectorAll("[data-apply-draft]").forEach((button) => {
    button.addEventListener("click", () => {
      applyDraftEdits(button.dataset.applyDraft);
    });
  });

  document.querySelectorAll("[data-discard-draft]").forEach((button) => {
    button.addEventListener("click", () => {
      discardDraftEdits(button.dataset.discardDraft);
    });
  });
}

function syncActiveScreen() {
  workflowLinks.forEach((button) => {
    const active = button.dataset.screen === state.activeScreen;
    button.classList.toggle("is-active", active);
  });

  screenPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === `screen-${state.activeScreen}`);
  });
}

function renderApp() {
  const committedListings = getCommittedListings();
  const committedListing =
    committedListings.find((item) => item.id === state.activeListingId) ?? committedListings[0];

  const draftListing = getDraftListing(state.activeListingId, committedListing);

  if (!committedListing) return;

  renderRecordSwitcher(committedListings);
  renderRecordSummary(committedListing);
  renderConsumerProject(draftListing);
  renderListingGrid(committedListings);
  renderSourceConnection(draftListing);
  renderProjectBuilder(draftListing);
  renderMediaManager(draftListing);
  renderPaymentSetup(draftListing);
  renderConsumerPreview(draftListing);
  renderPublishControls(draftListing);
  bindFieldEditors(draftListing);
  syncActiveScreen();
  writeUrl();
}

window.addEventListener("popstate", () => {
  const params = new URLSearchParams(window.location.search);
  state.activeScreen = VALID_SCREENS.includes(params.get("screen"))
    ? params.get("screen")
    : "consumer-project";
  state.activeListingId = baseListings.some((listing) => listing.id === params.get("project"))
    ? params.get("project")
    : baseListings[0]?.id;
  renderApp();
});

bindWorkflowNav();
renderApp();
