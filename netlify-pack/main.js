const CONFIG = {
  apiBaseUrl: "https://script.google.com/macros/s/AKfycby-O6InQi3f1ATNBF5heIhTCndNL-GBlMhqwd7s7xJYrjv67qAjjZif3FCipJ2f0s3uGQ/exec",
  lowStockThreshold: 5,
};

const state = {
  inventory: [],
  recipes: [],
  selectedProductId: "",
  pendingDelta: 0,
  scannerMode: "adjust",
  scanner: null,
};

const elements = {
  refreshButton: document.querySelector("#refreshButton"),
  metricInventoryCount: document.querySelector("#metricInventoryCount"),
  metricLowStockCount: document.querySelector("#metricLowStockCount"),
  metricRecipeCount: document.querySelector("#metricRecipeCount"),
  productSearch: document.querySelector("#productSearch"),
  searchResults: document.querySelector("#searchResults"),
  scanButton: document.querySelector("#scanButton"),
  closeScannerButton: document.querySelector("#closeScannerButton"),
  scannerPanel: document.querySelector("#scannerPanel"),
  scannerStatus: document.querySelector("#scannerStatus"),
  adjustmentEmpty: document.querySelector("#adjustmentEmpty"),
  adjustmentForm: document.querySelector("#adjustmentForm"),
  selectedProductName: document.querySelector("#selectedProductName"),
  selectedProductMeta: document.querySelector("#selectedProductMeta"),
  selectedOnHand: document.querySelector("#selectedOnHand"),
  selectedAvailable: document.querySelector("#selectedAvailable"),
  pendingDelta: document.querySelector("#pendingDelta"),
  customAmount: document.querySelector("#customAmount"),
  applyCustomAmount: document.querySelector("#applyCustomAmount"),
  adjustmentNote: document.querySelector("#adjustmentNote"),
  saveAdjustmentButton: document.querySelector("#saveAdjustmentButton"),
  addProductForm: document.querySelector("#addProductForm"),
  newProductName: document.querySelector("#newProductName"),
  newProductCategory: document.querySelector("#newProductCategory"),
  newProductStock: document.querySelector("#newProductStock"),
  newProductBarcode: document.querySelector("#newProductBarcode"),
  scanNewProductButton: document.querySelector("#scanNewProductButton"),
  ingredientList: document.querySelector("#ingredientList"),
  productionForm: document.querySelector("#productionForm"),
  productionProduct: document.querySelector("#productionProduct"),
  productionQuantity: document.querySelector("#productionQuantity"),
  recipePreview: document.querySelector("#recipePreview"),
  toast: document.querySelector("#toast"),
};

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  registerServiceWorker();
  loadAppData();
});

function bindEvents() {
  elements.refreshButton.addEventListener("click", loadAppData);
  elements.productSearch.addEventListener("input", handleSearchInput);
  elements.productSearch.addEventListener("focus", handleSearchInput);
  elements.scanButton.addEventListener("click", () => openScanner("adjust"));
  elements.scanNewProductButton.addEventListener("click", () => openScanner("new-product"));
  elements.closeScannerButton.addEventListener("click", closeScanner);
  elements.applyCustomAmount.addEventListener("click", applyCustomAmount);
  elements.adjustmentForm.addEventListener("submit", saveAdjustment);
  elements.addProductForm.addEventListener("submit", addProduct);
  elements.productionForm.addEventListener("submit", produceBatch);
  elements.productionProduct.addEventListener("change", updateRecipePreview);

  document.querySelectorAll("[data-delta]").forEach((button) => {
    button.addEventListener("click", () => {
      changePendingDelta(Number(button.dataset.delta));
    });
  });

  document.addEventListener("click", (event) => {
    if (
      event.target === elements.productSearch ||
      elements.searchResults.contains(event.target)
    ) {
      return;
    }
    hideSearchResults();
  });
}

async function loadAppData() {
  if (!hasApiUrl()) {
    showToast("Set CONFIG.apiBaseUrl in app/main.js before using the app.", true);
    return;
  }

  try {
    setStatus("Loading inventory from Apps Script...");
    const [inventoryResponse, dashboardResponse] = await Promise.all([
      apiGet("inventory"),
      apiGet("dashboard"),
    ]);

    state.inventory = inventoryResponse.inventory || [];
    state.recipes = dashboardResponse.recipes || [];

    renderMetrics();
    renderProductionOptions();
    renderIngredientDashboard();
    renderSelectedProduct();
    updateRecipePreview();
    setStatus("Inventory synced.");
  } catch (error) {
    console.error(error);
    setStatus("Unable to load data from the Apps Script endpoint.");
    showToast(error.message || "Failed to load app data.", true);
  }
}

function renderMetrics() {
  elements.metricInventoryCount.textContent = String(state.inventory.length);
  elements.metricRecipeCount.textContent = String(state.recipes.length);
  elements.metricLowStockCount.textContent = String(
    state.inventory.filter((item) => Number(item.available) < CONFIG.lowStockThreshold).length,
  );
}

function handleSearchInput() {
  const query = elements.productSearch.value.trim().toLowerCase();

  if (!query) {
    hideSearchResults();
    return;
  }

  const matches = state.inventory
    .filter((item) => {
      return (
        String(item.productId).toLowerCase().includes(query) ||
        String(item.name).toLowerCase().includes(query)
      );
    })
    .slice(0, 8);

  if (!matches.length) {
    elements.searchResults.innerHTML = '<div class="search-item muted">No matching products.</div>';
    elements.searchResults.hidden = false;
    return;
  }

  elements.searchResults.innerHTML = matches
    .map(
      (item) => `
        <button class="search-item" type="button" data-product-id="${escapeHtml(item.productId)}">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${escapeHtml(item.productId)} · ${escapeHtml(item.category)}</span>
        </button>
      `,
    )
    .join("");

  [...elements.searchResults.querySelectorAll("[data-product-id]")].forEach((button) => {
    button.addEventListener("click", () => {
      selectProduct(button.dataset.productId);
    });
  });

  elements.searchResults.hidden = false;
}

function hideSearchResults() {
  elements.searchResults.hidden = true;
}

function selectProduct(productId) {
  state.selectedProductId = productId;
  state.pendingDelta = 0;
  elements.productSearch.value = "";
  elements.customAmount.value = "";
  hideSearchResults();
  renderSelectedProduct();
}

function renderSelectedProduct() {
  const product = getSelectedProduct();

  if (!product) {
    elements.adjustmentEmpty.hidden = false;
    elements.adjustmentForm.hidden = true;
    return;
  }

  elements.adjustmentEmpty.hidden = true;
  elements.adjustmentForm.hidden = false;
  elements.selectedProductName.textContent = product.name;
  elements.selectedProductMeta.textContent = `${product.productId} · ${product.category}`;
  elements.selectedOnHand.textContent = formatNumber(product.onHand);
  elements.selectedAvailable.textContent = formatNumber(product.available);
  elements.pendingDelta.textContent = formatSignedNumber(state.pendingDelta);
}

function getSelectedProduct() {
  return state.inventory.find((item) => item.productId === state.selectedProductId) || null;
}

function changePendingDelta(amount) {
  if (!state.selectedProductId) {
    showToast("Select a product before adjusting stock.", true);
    return;
  }

  state.pendingDelta += amount;
  elements.pendingDelta.textContent = formatSignedNumber(state.pendingDelta);
}

function applyCustomAmount() {
  const value = Number(elements.customAmount.value);

  if (!state.selectedProductId) {
    showToast("Select a product before applying a custom amount.", true);
    return;
  }

  if (!Number.isFinite(value) || value === 0) {
    showToast("Enter a non-zero custom amount.", true);
    return;
  }

  state.pendingDelta += value;
  elements.customAmount.value = "";
  elements.pendingDelta.textContent = formatSignedNumber(state.pendingDelta);
}

async function saveAdjustment(event) {
  event.preventDefault();

  if (!state.selectedProductId) {
    showToast("No product selected.", true);
    return;
  }

  if (state.pendingDelta === 0) {
    showToast("Set an adjustment amount before saving.", true);
    return;
  }

  try {
    toggleBusy(elements.saveAdjustmentButton, true, "Saving...");
    await apiPost("adjustStock", {
      productId: state.selectedProductId,
      delta: state.pendingDelta,
      note: elements.adjustmentNote.value.trim(),
    });

    state.pendingDelta = 0;
    elements.adjustmentNote.value = "";
    await loadAppData();
    renderSelectedProduct();
    showToast("Inventory adjustment saved.");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Failed to save adjustment.", true);
  } finally {
    toggleBusy(elements.saveAdjustmentButton, false, "Save Adjustment");
  }
}

async function addProduct(event) {
  event.preventDefault();

  const payload = {
    productId: elements.newProductBarcode.value.trim(),
    name: elements.newProductName.value.trim(),
    category: elements.newProductCategory.value,
    initialStock: Number(elements.newProductStock.value),
  };

  if (!payload.productId || !payload.name || !Number.isFinite(payload.initialStock)) {
    showToast("Fill in all add-product fields.", true);
    return;
  }

  const submitButton = elements.addProductForm.querySelector('button[type="submit"]');

  try {
    toggleBusy(submitButton, true, "Adding...");
    await apiPost("addProduct", payload);
    elements.addProductForm.reset();
    elements.newProductCategory.value = "Finished Good";
    await loadAppData();
    showToast("Product added to inventory.");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Failed to add product.", true);
  } finally {
    toggleBusy(submitButton, false, "Add Product");
  }
}

function renderProductionOptions() {
  const finishedGoods = state.inventory.filter((item) => item.category === "Finished Good");

  if (!finishedGoods.length) {
    elements.productionProduct.innerHTML = "<option value=''>No finished goods found</option>";
    return;
  }

  const currentValue = elements.productionProduct.value;

  elements.productionProduct.innerHTML = [
    "<option value=''>Select a finished good</option>",
    ...finishedGoods.map((item) => {
      return `<option value="${escapeHtml(item.productId)}">${escapeHtml(item.name)} (${escapeHtml(item.productId)})</option>`;
    }),
  ].join("");

  if (finishedGoods.some((item) => item.productId === currentValue)) {
    elements.productionProduct.value = currentValue;
  }
}

function renderIngredientDashboard() {
  const rows = state.inventory.filter((item) =>
    ["Major Ingredient", "Minor Ingredient", "Packaging"].includes(item.category),
  );

  if (!rows.length) {
    elements.ingredientList.innerHTML =
      '<div class="inventory-row"><span>No ingredients found.</span></div>';
    return;
  }

  elements.ingredientList.innerHTML = rows
    .map((item) => {
      const trulyAvailable = Number(item.available) - Number(item.currentDemand || 0);
      const lowClass = trulyAvailable < CONFIG.lowStockThreshold ? "danger-text" : "";

      return `
        <article class="inventory-row">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <p>${escapeHtml(item.productId)} · ${escapeHtml(item.category)}</p>
          </div>
          <div class="inventory-values">
            <span>On Hand <strong>${formatNumber(item.onHand)}</strong></span>
            <span>Required <strong>${formatNumber(item.currentDemand || 0)}</strong></span>
            <span class="${lowClass}">Truly Available <strong>${formatNumber(trulyAvailable)}</strong></span>
          </div>
        </article>
      `;
    })
    .join("");
}

function updateRecipePreview() {
  const finishedGoodId = elements.productionProduct.value;
  const quantity = Math.max(1, Number(elements.productionQuantity.value) || 1);

  if (!finishedGoodId) {
    elements.recipePreview.textContent = "Select a finished good to preview ingredient usage.";
    return;
  }

  const recipeRows = state.recipes.filter((row) => row.finishedGoodId === finishedGoodId);

  if (!recipeRows.length) {
    elements.recipePreview.textContent = "No recipe rows found for this finished good.";
    return;
  }

  elements.recipePreview.innerHTML = recipeRows
    .map((row) => {
      const ingredient = state.inventory.find((item) => item.productId === row.rawIngredientId);
      const totalNeeded = Number(row.quantityNeededPerUnit) * quantity;

      return `
        <div class="recipe-row">
          <span>${escapeHtml(ingredient?.name || row.rawIngredientId)}</span>
          <strong>${formatNumber(totalNeeded)}</strong>
        </div>
      `;
    })
    .join("");
}

async function produceBatch(event) {
  event.preventDefault();

  const finishedGoodId = elements.productionProduct.value;
  const quantity = Number(elements.productionQuantity.value);

  if (!finishedGoodId || !Number.isFinite(quantity) || quantity <= 0) {
    showToast("Choose a finished good and a valid batch quantity.", true);
    return;
  }

  const submitButton = elements.productionForm.querySelector('button[type="submit"]');

  try {
    toggleBusy(submitButton, true, "Producing...");
    await apiPost("produceBatch", { finishedGoodId, quantity });
    elements.productionQuantity.value = "";
    await loadAppData();
    updateRecipePreview();
    showToast("Production batch posted.");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Failed to produce batch.", true);
  } finally {
    toggleBusy(submitButton, false, "Produce Batch");
  }
}

async function openScanner(mode) {
  if (!window.Html5Qrcode) {
    showToast("Scanner library not loaded. Check network access for Html5Qrcode.", true);
    return;
  }

  state.scannerMode = mode;
  elements.scannerPanel.hidden = false;
  setStatus(mode === "new-product" ? "Scanning barcode for new product..." : "Scanning product...");

  if (state.scanner) {
    await closeScanner();
  }

  state.scanner = new Html5Qrcode("reader");

  try {
    await state.scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 240, height: 140 } },
      async (decodedText) => {
        if (state.scannerMode === "new-product") {
          elements.newProductBarcode.value = decodedText;
          showToast("Barcode assigned to new product form.");
        } else {
          const existing = state.inventory.find((item) => item.productId === decodedText);
          if (existing) {
            selectProduct(decodedText);
            showToast(`Loaded ${existing.name}.`);
          } else {
            showToast("Barcode not found in inventory.", true);
          }
        }
        await closeScanner();
      },
    );
  } catch (error) {
    console.error(error);
    setStatus("Camera could not be started.");
    showToast("Unable to access the camera. Check browser permissions.", true);
  }
}

async function closeScanner() {
  elements.scannerPanel.hidden = true;
  setStatus("Scanner ready. You can search manually or use the camera.");

  if (!state.scanner) {
    return;
  }

  try {
    await state.scanner.stop();
    await state.scanner.clear();
  } catch (error) {
    console.warn("Scanner stop issue", error);
  } finally {
    state.scanner = null;
  }
}

function setStatus(message) {
  elements.scannerStatus.textContent = message;
}

function hasApiUrl() {
  return CONFIG.apiBaseUrl && !CONFIG.apiBaseUrl.includes("PASTE_YOUR");
}

async function apiGet(action) {
  const url = new URL(CONFIG.apiBaseUrl);
  url.searchParams.set("action", action);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return parseApiResponse(response);
}

async function apiPost(action, payload) {
  const response = await fetch(CONFIG.apiBaseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action,
      ...payload,
    }),
  });

  return parseApiResponse(response);
}

async function parseApiResponse(response) {
  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "API request failed.");
  }

  return data;
}

function toggleBusy(button, isBusy, label) {
  button.disabled = isBusy;
  button.textContent = label;
}

function showToast(message, isError = false) {
  elements.toast.hidden = false;
  elements.toast.textContent = message;
  elements.toast.classList.toggle("error", isError);

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 3200);
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatSignedNumber(value) {
  const number = Number(value || 0);
  return number > 0 ? `+${number}` : String(number);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register("./sw.js");
  } catch (error) {
    console.warn("Service worker registration failed", error);
  }
}
