const DEFAULT_SETTINGS = {
  backgroundMode: "cover",
  backgroundPosition: "center center",
  backgroundManualSize: 100,
  backgroundManualX: 50,
  backgroundManualY: 50,
  backgroundCarouselEnabled: false,
  backgroundCarouselInterval: 5,
  backgroundCarouselUnit: "minutes",
  backgroundCarouselImageIds: [],
  accentColor: "#6b0d18",
  fontFamily: "modern",
  fontSize: 13,
  letterSpacing: 0,
  panelOpacity: 40,
  bookmarkBorderWidth: 1,
  bookmarkBorderColor: "#ffffff",
  bookmarkHoverGlow: 70,
  shortcutHoverGlow: 80,
  hoverGlowColor: "#c91e3c",
  shortcutBorderColor: "#ffffff",
  bookmarkIconSize: 18,
  shortcutIconSize: 23,
  elementPadding: 9,
  shortcutTileSize: 54,
  shortcutBorderWidth: 1,
  shortcuts: []
};

const CAROUSEL_STATE_KEY = "lounaCarouselState";

const FONT_MAP = {
  modern: '"Segoe UI", Arial, sans-serif',
  interlike: 'Arial, Helvetica, sans-serif',
  verdana: 'Verdana, Geneva, sans-serif',
  tahoma: 'Tahoma, Verdana, sans-serif',
  century: '"Century Gothic", "Segoe UI", sans-serif',
  franklin: '"Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif',
  condensed: '"Arial Narrow", "Segoe UI", Arial, sans-serif',
  rock: '"Trebuchet MS", "Segoe UI", sans-serif',
  gothic: 'Georgia, "Times New Roman", serif',
  palatino: '"Palatino Linotype", Palatino, Georgia, serif',
  garamond: 'Garamond, Georgia, serif',
  mono: '"Courier New", Courier, monospace',
  console: '"Lucida Console", Monaco, monospace',
  heavy: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif'
};


const els = {
  background: document.getElementById("background"),
  bookmarksBar: document.getElementById("bookmarksBar"),
  shortcutsBar: document.getElementById("shortcutsBar"),
  bottomActions: document.querySelector(".bottom-actions"),
  prevCarouselImage: document.getElementById("prevCarouselImage"),
  nextCarouselImage: document.getElementById("nextCarouselImage"),
  settingsButton: document.getElementById("settingsButton"),
  settingsOverlay: document.getElementById("settingsOverlay"),
  closeSettings: document.getElementById("closeSettings"),
  closeSettingsFooter: document.getElementById("closeSettingsFooter"),
  backgroundFile: document.getElementById("backgroundFile"),
  resetBackground: document.getElementById("resetBackground"),
  backgroundMode: document.getElementById("backgroundMode"),
  backgroundPosition: document.getElementById("backgroundPosition"),
  backgroundManualSize: document.getElementById("backgroundManualSize"),
  backgroundManualSizeValue: document.getElementById("backgroundManualSizeValue"),
  backgroundManualX: document.getElementById("backgroundManualX"),
  backgroundManualXValue: document.getElementById("backgroundManualXValue"),
  backgroundManualY: document.getElementById("backgroundManualY"),
  backgroundManualYValue: document.getElementById("backgroundManualYValue"),
  resetManualBackground: document.getElementById("resetManualBackground"),
  manualBackgroundCard: document.getElementById("manualBackgroundCard"),
  backgroundCarouselEnabled: document.getElementById("backgroundCarouselEnabled"),
  backgroundCarouselFiles: document.getElementById("backgroundCarouselFiles"),
  backgroundCarouselInterval: document.getElementById("backgroundCarouselInterval"),
  backgroundCarouselUnit: document.getElementById("backgroundCarouselUnit"),
  clearBackgroundCarousel: document.getElementById("clearBackgroundCarousel"),
  backgroundCarouselError: document.getElementById("backgroundCarouselError"),
  backgroundCarouselList: document.getElementById("backgroundCarouselList"),
  emptyBackgroundCarousel: document.getElementById("emptyBackgroundCarousel"),
  accentColor: document.getElementById("accentColor"),
  fontFamily: document.getElementById("fontFamily"),
  fontSize: document.getElementById("fontSize"),
  fontSizeValue: document.getElementById("fontSizeValue"),
  letterSpacing: document.getElementById("letterSpacing"),
  letterSpacingValue: document.getElementById("letterSpacingValue"),
  panelOpacity: document.getElementById("panelOpacity"),
  panelOpacityValue: document.getElementById("panelOpacityValue"),
  bookmarkBorderWidth: document.getElementById("bookmarkBorderWidth"),
  bookmarkBorderWidthValue: document.getElementById("bookmarkBorderWidthValue"),
  bookmarkBorderColor: document.getElementById("bookmarkBorderColor"),
  bookmarkHoverGlow: document.getElementById("bookmarkHoverGlow"),
  bookmarkHoverGlowValue: document.getElementById("bookmarkHoverGlowValue"),
  shortcutHoverGlow: document.getElementById("shortcutHoverGlow"),
  shortcutHoverGlowValue: document.getElementById("shortcutHoverGlowValue"),
  hoverGlowColor: document.getElementById("hoverGlowColor"),
  shortcutBorderColor: document.getElementById("shortcutBorderColor"),
  bookmarkIconSize: document.getElementById("bookmarkIconSize"),
  bookmarkIconSizeValue: document.getElementById("bookmarkIconSizeValue"),
  shortcutIconSize: document.getElementById("shortcutIconSize"),
  shortcutIconSizeValue: document.getElementById("shortcutIconSizeValue"),
  elementPadding: document.getElementById("elementPadding"),
  elementPaddingValue: document.getElementById("elementPaddingValue"),
  shortcutTileSize: document.getElementById("shortcutTileSize"),
  shortcutTileSizeValue: document.getElementById("shortcutTileSizeValue"),
  shortcutBorderWidth: document.getElementById("shortcutBorderWidth"),
  shortcutBorderWidthValue: document.getElementById("shortcutBorderWidthValue"),
  newShortcutName: document.getElementById("newShortcutName"),
  newShortcutUrl: document.getElementById("newShortcutUrl"),
  addShortcut: document.getElementById("addShortcut"),
  shortcutError: document.getElementById("shortcutError"),
  shortcutList: document.getElementById("shortcutList"),
  emptyShortcuts: document.getElementById("emptyShortcuts"),
  newBookmarkName: document.getElementById("newBookmarkName"),
  newBookmarkUrl: document.getElementById("newBookmarkUrl"),
  newBookmarkParent: document.getElementById("newBookmarkParent"),
  addBookmark: document.getElementById("addBookmark"),
  bookmarkError: document.getElementById("bookmarkError"),
  newBookmarkFolderName: document.getElementById("newBookmarkFolderName"),
  newBookmarkFolderParent: document.getElementById("newBookmarkFolderParent"),
  addBookmarkFolder: document.getElementById("addBookmarkFolder"),
  bookmarkEditorTree: document.getElementById("bookmarkEditorTree"),
  emptyBookmarksEditor: document.getElementById("emptyBookmarksEditor"),
  saveStatus: document.getElementById("saveStatus")
};

let settings = { ...DEFAULT_SETTINGS };
let draggedIndex = null;
let draggedShortcutIndex = null;
let shortcutClickLockUntil = 0;
let carouselTimer = null;
let carouselIndex = 0;
let carouselGeneration = 0;
let carouselThumbUrls = [];
let draggedBookmark = null;
let bookmarkClickLockUntil = 0;
let openBookmarkFolders = new Set();
let bookmarkMenuScroll = new Map();
let saveTimer = null;

function storageGet(keys) {
  return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
}

function storageSet(data) {
  return new Promise((resolve) => chrome.storage.local.set(data, resolve));
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return [107, 13, 24];
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16)
  ];
}

function recommendedShortcutIconSize(tileSize) {
  return Math.max(14, Math.min(48, Math.round(Number(tileSize) * 0.42)));
}

function applySettings() {
  const root = document.documentElement;
  const [r, g, b] = hexToRgb(settings.accentColor);
  const [gr, gg, gb] = hexToRgb(settings.hoverGlowColor);
  const bookmarkGlow = Math.max(0, Math.min(100, Number(settings.bookmarkHoverGlow))) / 100;
  const shortcutGlow = Math.max(0, Math.min(100, Number(settings.shortcutHoverGlow))) / 100;
  root.style.setProperty("--accent", settings.accentColor);
  root.style.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);
  root.style.setProperty("--hover-glow-color", settings.hoverGlowColor);
  root.style.setProperty("--hover-glow-rgb", `${gr}, ${gg}, ${gb}`);
  root.style.setProperty("--panel-alpha", (Number(settings.panelOpacity) / 100).toFixed(2));
  root.style.setProperty("--ui-font", FONT_MAP[settings.fontFamily] || FONT_MAP.modern);
  root.style.setProperty("--theme-font-size", `${Number(settings.fontSize)}px`);
  root.style.setProperty("--letter-spacing", `${Number(settings.letterSpacing)}px`);
  root.style.setProperty("--bookmark-border-width", `${Number(settings.bookmarkBorderWidth)}px`);
  root.style.setProperty("--bookmark-border-color", settings.bookmarkBorderColor);
  root.style.setProperty("--shortcut-border-color", settings.shortcutBorderColor);
  root.style.setProperty("--bookmark-hover-glow-alpha", (0.08 + bookmarkGlow * 0.88).toFixed(2));
  root.style.setProperty("--bookmark-hover-glow-blur", `${Math.round(6 + bookmarkGlow * 34)}px`);
  root.style.setProperty("--shortcut-hover-glow-alpha", (0.08 + shortcutGlow * 0.88).toFixed(2));
  root.style.setProperty("--shortcut-hover-glow-blur", `${Math.round(6 + shortcutGlow * 36)}px`);
  /* Compatibility variables used by controls and hover-safe layout. */
  root.style.setProperty("--hover-glow-alpha", (0.08 + shortcutGlow * 0.88).toFixed(2));
  root.style.setProperty("--hover-glow-blur", `${Math.round(6 + shortcutGlow * 36)}px`);
  root.style.setProperty("--bookmark-icon-size", `${Number(settings.bookmarkIconSize)}px`);
  root.style.setProperty("--shortcut-icon-size", `${Number(settings.shortcutIconSize)}px`);
  root.style.setProperty("--element-padding", `${Number(settings.elementPadding)}px`);
  root.style.setProperty("--shortcut-tile-size", `${Number(settings.shortcutTileSize)}px`);
  root.style.setProperty("--shortcut-border-width", `${Number(settings.shortcutBorderWidth)}px`);

  const bgStyle = backgroundStyleFor(settings.backgroundMode);
  els.background.style.backgroundSize = bgStyle.size;
  els.background.style.backgroundRepeat = bgStyle.repeat;
  els.background.style.backgroundPosition = bgStyle.position || settings.backgroundPosition;

  els.backgroundMode.value = settings.backgroundMode;
  els.backgroundPosition.value = settings.backgroundPosition;
  els.backgroundManualSize.value = String(settings.backgroundManualSize);
  els.backgroundManualSizeValue.textContent = `${settings.backgroundManualSize}%`;
  els.backgroundManualX.value = String(settings.backgroundManualX);
  els.backgroundManualXValue.textContent = `${settings.backgroundManualX}%`;
  els.backgroundManualY.value = String(settings.backgroundManualY);
  els.backgroundManualYValue.textContent = `${settings.backgroundManualY}%`;
  els.manualBackgroundCard?.classList.toggle("is-manual-active", settings.backgroundMode === "manual");
  if (els.backgroundCarouselEnabled) els.backgroundCarouselEnabled.checked = Boolean(settings.backgroundCarouselEnabled);
  if (els.backgroundCarouselInterval) els.backgroundCarouselInterval.value = String(settings.backgroundCarouselInterval);
  if (els.backgroundCarouselUnit) els.backgroundCarouselUnit.value = settings.backgroundCarouselUnit || "minutes";
  els.accentColor.value = settings.accentColor;
  els.fontFamily.value = settings.fontFamily;
  els.fontSize.value = String(settings.fontSize);
  els.fontSizeValue.textContent = `${settings.fontSize} px`;
  els.letterSpacing.value = String(settings.letterSpacing);
  els.letterSpacingValue.textContent = `${settings.letterSpacing} px`;
  els.panelOpacity.value = String(settings.panelOpacity);
  els.panelOpacityValue.textContent = `${settings.panelOpacity}%`;
  els.bookmarkBorderWidth.value = String(settings.bookmarkBorderWidth);
  els.bookmarkBorderWidthValue.textContent = `${settings.bookmarkBorderWidth} px`;
  els.bookmarkBorderColor.value = settings.bookmarkBorderColor;
  els.bookmarkHoverGlow.value = String(settings.bookmarkHoverGlow);
  els.bookmarkHoverGlowValue.textContent = `${settings.bookmarkHoverGlow}%`;
  els.shortcutHoverGlow.value = String(settings.shortcutHoverGlow);
  els.shortcutHoverGlowValue.textContent = `${settings.shortcutHoverGlow}%`;
  els.hoverGlowColor.value = settings.hoverGlowColor;
  els.shortcutBorderColor.value = settings.shortcutBorderColor;
  els.bookmarkIconSize.value = String(settings.bookmarkIconSize);
  els.bookmarkIconSizeValue.textContent = `${settings.bookmarkIconSize} px`;
  els.shortcutIconSize.value = String(settings.shortcutIconSize);
  els.shortcutIconSizeValue.textContent = `${settings.shortcutIconSize} px`;
  els.elementPadding.value = String(settings.elementPadding);
  els.elementPaddingValue.textContent = `${settings.elementPadding} px`;
  els.shortcutTileSize.value = String(settings.shortcutTileSize);
  els.shortcutTileSizeValue.textContent = `${settings.shortcutTileSize} px`;
  els.shortcutBorderWidth.value = String(settings.shortcutBorderWidth);
  els.shortcutBorderWidthValue.textContent = `${settings.shortcutBorderWidth} px`;

  updateCarouselNavigationButton();
  renderShortcuts();
  renderShortcutEditor();
}

function backgroundStyleFor(mode) {
  switch (mode) {
    case "contain":
      return { size: "contain", repeat: "no-repeat" };
    case "stretch":
      return { size: "100% 100%", repeat: "no-repeat" };
    case "center":
      return { size: "auto", repeat: "no-repeat" };
    case "fit-width":
      return { size: "100% auto", repeat: "no-repeat" };
    case "manual":
      return {
        size: `${Math.max(25, Math.min(300, Number(settings.backgroundManualSize)))}% auto`,
        repeat: "no-repeat",
        position: `${Math.max(0, Math.min(100, Number(settings.backgroundManualX)))}% ${Math.max(0, Math.min(100, Number(settings.backgroundManualY)))}%`
      };
    case "cover":
    default:
      return { size: "cover", repeat: "no-repeat" };
  }
}

function faviconUrl(pageUrl, size = 64) {
  return `${chrome.runtime.getURL("/_favicon/")}?pageUrl=${encodeURIComponent(pageUrl)}&size=${size}`;
}

function makeFavicon(url, className, fallbackText = "•") {
  const img = document.createElement("img");
  img.className = className;
  img.alt = "";
  img.src = faviconUrl(url, 64);
  img.addEventListener("error", () => {
    const fallback = document.createElement("span");
    fallback.className = `${className} favicon-fallback`;
    fallback.textContent = fallbackText.slice(0, 1).toUpperCase() || "•";
    img.replaceWith(fallback);
  }, { once: true });
  return img;
}

function bookmarksGetTree() {
  return new Promise((resolve, reject) => {
    try {
      chrome.bookmarks.getTree((tree) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve(tree);
      });
    } catch (error) {
      reject(error);
    }
  });
}


function bookmarksCreate(data) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.create(data, (node) => {
      const error = chrome.runtime.lastError;
      if (error) return reject(new Error(error.message));
      resolve(node);
    });
  });
}

function bookmarksUpdate(id, changes) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.update(id, changes, (node) => {
      const error = chrome.runtime.lastError;
      if (error) return reject(new Error(error.message));
      resolve(node);
    });
  });
}

function bookmarksRemove(id) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.remove(id, () => {
      const error = chrome.runtime.lastError;
      if (error) return reject(new Error(error.message));
      resolve();
    });
  });
}

function bookmarksRemoveTree(id) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.removeTree(id, () => {
      const error = chrome.runtime.lastError;
      if (error) return reject(new Error(error.message));
      resolve();
    });
  });
}

function bookmarksMove(id, destination) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.move(id, destination, (node) => {
      const error = chrome.runtime.lastError;
      if (error) return reject(new Error(error.message));
      resolve(node);
    });
  });
}

function getBookmarkBarRootFromTree(tree) {
  const root = tree?.[0];
  const roots = Array.isArray(root?.children) ? root.children : [];
  return roots.find((node) => node.id === "1") || roots[0] || null;
}

function getBookmarkRootsFromTree(tree) {
  const root = tree?.[0];
  return Array.isArray(root?.children) ? root.children : [];
}

function getOtherBookmarksRootFromTree(tree) {
  const roots = getBookmarkRootsFromTree(tree);
  return roots.find((node) => node.id === "2")
    || roots.find((node) => /(^|\s)(other|другие)(\s|$)/i.test(node.title || ""))
    || roots.find((node) => node.id !== "1" && !/(mobile|мобиль)/i.test(node.title || ""))
    || null;
}

function makeOtherBookmarksNode(tree, bookmarkBarRoot) {
  const otherRoot = getOtherBookmarksRootFromTree(tree);
  const barChildren = Array.isArray(bookmarkBarRoot?.children) ? bookmarkBarRoot.children : [];
  return {
    id: "__other_bookmarks__",
    title: "Другие Закладки",
    synthetic: true,
    targetParentId: otherRoot?.id || null,
    parentId: bookmarkBarRoot?.id || null,
    index: barChildren.length,
    children: Array.isArray(otherRoot?.children) ? otherRoot.children : []
  };
}

function collectBookmarkFolders(node, depth = 0, out = []) {
  if (!node) return out;
  out.push({ id: node.id, title: depth === 0 ? "Панель закладок" : bookmarkLabel(node), depth });
  const children = Array.isArray(node.children) ? node.children : [];
  children.forEach((child) => {
    if (!child.url) collectBookmarkFolders(child, depth + 1, out);
  });
  return out;
}

function fillBookmarkParentSelects(bookmarkBarRoot) {
  const folders = collectBookmarkFolders(bookmarkBarRoot);
  [els.newBookmarkParent, els.newBookmarkFolderParent].forEach((select) => {
    if (!select) return;
    const previous = select.value;
    select.replaceChildren();
    folders.forEach((folder) => {
      const option = document.createElement("option");
      option.value = folder.id;
      option.textContent = `${"— ".repeat(folder.depth)}${folder.title}`;
      select.appendChild(option);
    });
    if (folders.some((folder) => folder.id === previous)) select.value = previous;
  });
}

function showBookmarkError(message) {
  if (els.bookmarkError) els.bookmarkError.textContent = message;
}

function clearBookmarkError() {
  showBookmarkError("");
}

async function handleBookmarkTitleChange(node, input) {
  const title = input.value.trim();
  if (!title) {
    input.value = bookmarkLabel(node);
    showBookmarkError("Название не может быть пустым.");
    return;
  }
  clearBookmarkError();
  try {
    await bookmarksUpdate(node.id, { title });
  } catch (error) {
    input.value = bookmarkLabel(node);
    showBookmarkError(`Не удалось изменить название: ${error.message}`);
  }
}

async function handleBookmarkUrlChange(node, input) {
  const normalized = normalizeUrl(input.value);
  if (!normalized) {
    input.value = node.url || "";
    showBookmarkError("Некорректный URL. Используй обычный http/https адрес.");
    return;
  }
  clearBookmarkError();
  try {
    await bookmarksUpdate(node.id, { url: normalized });
    input.value = normalized;
  } catch (error) {
    input.value = node.url || "";
    showBookmarkError(`Не удалось изменить URL: ${error.message}`);
  }
}

function createBookmarkEditorRow(node, depth) {
  const row = document.createElement("div");
  row.className = `bookmark-editor-row ${node.url ? "is-bookmark" : "is-folder"}`;
  row.style.setProperty("--bookmark-depth", String(depth));

  const iconWrap = document.createElement("span");
  iconWrap.className = "bookmark-editor-icon";
  if (node.url) {
    iconWrap.appendChild(makeFavicon(node.url, "row-favicon", bookmarkLabel(node)));
  } else {
    const folderIcon = document.createElement("span");
    folderIcon.className = "bookmark-folder-icon";
    iconWrap.appendChild(folderIcon);
  }

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.className = "row-input bookmark-title-input";
  titleInput.maxLength = 120;
  titleInput.value = bookmarkLabel(node);
  titleInput.setAttribute("aria-label", node.url ? "Название закладки" : "Название папки");
  titleInput.addEventListener("change", () => handleBookmarkTitleChange(node, titleInput));

  const typeLabel = document.createElement("span");
  typeLabel.className = "bookmark-type-label";
  typeLabel.textContent = node.url ? "Закладка" : "Папка";

  let urlInput;
  if (node.url) {
    urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.className = "row-input bookmark-url-input";
    urlInput.value = node.url;
    urlInput.setAttribute("aria-label", "URL закладки");
    urlInput.addEventListener("change", () => handleBookmarkUrlChange(node, urlInput));
  } else {
    urlInput = document.createElement("span");
    urlInput.className = "bookmark-folder-summary";
    const count = Array.isArray(node.children) ? node.children.length : 0;
    urlInput.textContent = `${count} ${count === 1 ? "элемент" : "элементов"}`;
  }

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "Удалить";
  deleteButton.addEventListener("click", async () => {
    const title = bookmarkLabel(node);
    if (!node.url) {
      const ok = window.confirm(`Удалить папку «${title}» вместе со всеми вложенными закладками и папками?`);
      if (!ok) return;
    }
    clearBookmarkError();
    try {
      if (node.url) await bookmarksRemove(node.id);
      else await bookmarksRemoveTree(node.id);
      await refreshBookmarksUi();
    } catch (error) {
      showBookmarkError(`Не удалось удалить: ${error.message}`);
    }
  });

  row.append(iconWrap, titleInput, typeLabel, urlInput, deleteButton);
  return row;
}

function appendBookmarkEditorNodes(nodes, depth = 0) {
  (nodes || []).forEach((node) => {
    els.bookmarkEditorTree.appendChild(createBookmarkEditorRow(node, depth));
    if (!node.url && Array.isArray(node.children) && node.children.length) {
      appendBookmarkEditorNodes(node.children, depth + 1);
    }
  });
}

async function renderBookmarkEditor() {
  if (!els.bookmarkEditorTree || !chrome.bookmarks) return;
  try {
    const tree = await bookmarksGetTree();
    const bookmarkBarRoot = getBookmarkBarRootFromTree(tree);
    const children = Array.isArray(bookmarkBarRoot?.children) ? bookmarkBarRoot.children : [];
    fillBookmarkParentSelects(bookmarkBarRoot);
    els.bookmarkEditorTree.replaceChildren();
    appendBookmarkEditorNodes(children, 0);
    els.emptyBookmarksEditor.hidden = children.length > 0;
  } catch (error) {
    console.warn("Не удалось загрузить редактор закладок:", error);
    els.bookmarkEditorTree.replaceChildren();
    els.emptyBookmarksEditor.hidden = false;
    showBookmarkError(`Не удалось загрузить закладки: ${error.message}`);
  }
}

async function refreshBookmarksUi() {
  await Promise.all([renderBookmarksBar(), renderBookmarkEditor()]);
}

async function addChromeBookmark() {
  const name = els.newBookmarkName.value.trim();
  const url = normalizeUrl(els.newBookmarkUrl.value);
  const parentId = els.newBookmarkParent.value;
  if (!url) {
    showBookmarkError("Укажи корректный адрес закладки, например https://youtube.com");
    return;
  }
  clearBookmarkError();
  try {
    await bookmarksCreate({ parentId, title: name || safeHostname(url), url });
    els.newBookmarkName.value = "";
    els.newBookmarkUrl.value = "";
    await refreshBookmarksUi();
  } catch (error) {
    showBookmarkError(`Не удалось добавить закладку: ${error.message}`);
  }
}

async function addChromeBookmarkFolder() {
  const title = els.newBookmarkFolderName.value.trim();
  const parentId = els.newBookmarkFolderParent.value;
  if (!title) {
    showBookmarkError("Укажи название новой папки.");
    return;
  }
  clearBookmarkError();
  try {
    await bookmarksCreate({ parentId, title });
    els.newBookmarkFolderName.value = "";
    await refreshBookmarksUi();
  } catch (error) {
    showBookmarkError(`Не удалось создать папку: ${error.message}`);
  }
}

function bookmarkLabel(node) {
  if (node.title?.trim()) return node.title.trim();
  if (node.url) return safeHostname(node.url);
  return "Папка";
}

function bookmarkFolderStateId(node) {
  return String(node?.id || "");
}

function positionTopLevelBookmarkMenu(folder) {
  if (!folder || folder.closest(".bookmark-menu")) return;
  const menu = folder.querySelector(":scope > .bookmark-menu");
  if (!menu) return;

  // Reset before measuring, then clamp the dropdown to the viewport.
  menu.style.left = "0px";
  menu.style.right = "auto";
  menu.style.maxWidth = `min(360px, calc(100vw - 16px))`;

  const folderRect = folder.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const viewportPadding = 8;
  const maxLeft = Math.max(viewportPadding, window.innerWidth - menuRect.width - viewportPadding);
  const desiredLeft = folderRect.left;
  const clampedLeft = Math.min(Math.max(desiredLeft, viewportPadding), maxLeft);
  const offset = clampedLeft - folderRect.left;
  menu.style.left = `${Math.round(offset)}px`;
}

function positionAllOpenTopLevelBookmarkMenus() {
  els.bookmarksBar?.querySelectorAll(":scope > .bookmark-folder.is-open").forEach(positionTopLevelBookmarkMenu);
}

function setBookmarkFolderOpen(folder, node, shouldOpen) {
  const stateId = bookmarkFolderStateId(node);
  if (!stateId) return;

  folder.classList.toggle("is-open", shouldOpen);
  const button = folder.querySelector(":scope > .bookmark-folder-button");
  button?.setAttribute("aria-expanded", String(shouldOpen));

  if (shouldOpen) {
    openBookmarkFolders.add(stateId);
    requestAnimationFrame(() => positionTopLevelBookmarkMenu(folder));
  } else {
    openBookmarkFolders.delete(stateId);
    const menu = folder.querySelector(":scope > .bookmark-menu");
    if (menu && !folder.closest(".bookmark-menu")) {
      menu.style.left = "";
      menu.style.right = "";
    }
  }
}

function closeBookmarkFolderTree(folder) {
  const nested = [folder, ...folder.querySelectorAll(".bookmark-folder")];
  nested.forEach((entry) => {
    const stateId = entry.dataset.bookmarkId;
    entry.classList.remove("is-open");
    entry.querySelector(":scope > .bookmark-folder-button")?.setAttribute("aria-expanded", "false");
    if (stateId) openBookmarkFolders.delete(stateId);
  });
}

function closeBookmarkFolderSiblings(folder) {
  const parent = folder.parentElement;
  if (!parent) return;
  Array.from(parent.children).forEach((child) => {
    if (child !== folder && child.classList?.contains("bookmark-folder")) {
      closeBookmarkFolderTree(child);
    }
  });
}

function toggleBookmarkFolder(folder, node) {
  if (Date.now() < bookmarkClickLockUntil || draggedBookmark) return;
  const opening = !folder.classList.contains("is-open");
  if (opening) {
    closeBookmarkFolderSiblings(folder);
    setBookmarkFolderOpen(folder, node, true);
  } else {
    closeBookmarkFolderTree(folder);
  }
}

function captureBookmarkMenuScroll() {
  document.querySelectorAll(".bookmark-menu[data-menu-id]").forEach((menu) => {
    bookmarkMenuScroll.set(menu.dataset.menuId, menu.scrollTop);
  });
}

function keepBookmarksVisibleDuringDrag(enabled) {
  document.body.classList.toggle("bookmark-drag-active", enabled);
  els.bookmarksBar?.classList.toggle("bookmark-drag-active", enabled);
}

function clearBookmarkDropIndicators() {
  document.querySelectorAll(".bookmark-drop-before, .bookmark-drop-after, .bookmark-drop-into")
    .forEach((el) => el.classList.remove("bookmark-drop-before", "bookmark-drop-after", "bookmark-drop-into"));
}

function canDragBookmarkNode(node) {
  return Boolean(node && node.id && !node.synthetic && node.parentId);
}

function startBookmarkDrag(event, node, element) {
  if (!canDragBookmarkNode(node)) {
    event.preventDefault();
    return;
  }
  draggedBookmark = {
    id: node.id,
    parentId: node.parentId,
    index: Number.isFinite(node.index) ? node.index : 0,
    isFolder: !node.url,
    title: bookmarkLabel(node)
  };
  bookmarkClickLockUntil = Date.now() + 500;
  element.classList.add("bookmark-dragging");
  keepBookmarksVisibleDuringDrag(true);
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", `bookmark:${node.id}`);
  }
}

function finishBookmarkDrag(element) {
  element?.classList.remove("bookmark-dragging");
  draggedBookmark = null;
  bookmarkClickLockUntil = Date.now() + 250;
  clearBookmarkDropIndicators();
  keepBookmarksVisibleDuringDrag(false);
}

function relativeDropMode(element, event, allowInto = false) {
  const rect = element.getBoundingClientRect();
  const inTopBar = element.closest(".bookmarks-bar") && !element.closest(".bookmark-menu");
  const ratio = inTopBar
    ? (event.clientX - rect.left) / Math.max(1, rect.width)
    : (event.clientY - rect.top) / Math.max(1, rect.height);

  if (allowInto) {
    if (ratio < 0.24) return "before";
    if (ratio > 0.76) return "after";
    return "into";
  }
  return ratio < 0.5 ? "before" : "after";
}

function targetDestinationForNode(targetNode, mode) {
  if (targetNode.synthetic && mode !== "into") {
    if (!targetNode.parentId) return null;
    return { parentId: targetNode.parentId, index: Number(targetNode.index) || 0 };
  }

  if (mode === "into") {
    const parentId = targetNode.synthetic ? targetNode.targetParentId : targetNode.id;
    if (!parentId) return null;
    const childCount = Array.isArray(targetNode.children) ? targetNode.children.length : 0;
    return { parentId, index: childCount, openFolderId: bookmarkFolderStateId(targetNode) };
  }

  if (!targetNode.parentId) return null;
  let index = Number.isFinite(targetNode.index) ? targetNode.index : 0;
  if (mode === "after") index += 1;
  return { parentId: targetNode.parentId, index };
}

async function moveDraggedBookmark(destination) {
  const drag = draggedBookmark ? { ...draggedBookmark } : null;
  if (!drag || !destination?.parentId) return;
  if (drag.id === destination.parentId) return;

  // chrome.bookmarks.move() interprets index against the destination list and
  // handles the source-node removal itself. Do not pre-decrement the index
  // when moving downward inside the same folder: doing so makes an item
  // dragged from above to the next item land back in its original position.
  const index = Math.max(0, Number(destination.index) || 0);

  // True no-op cases only: dropping immediately before itself, or immediately
  // after itself in the same parent. Other downward moves must reach Chrome
  // with the unmodified target index.
  if (drag.parentId === destination.parentId) {
    if (drag.index === index || drag.index + 1 === index) return;
  }

  try {
    clearBookmarkError();
    captureBookmarkMenuScroll();
    if (destination.openFolderId) openBookmarkFolders.add(String(destination.openFolderId));
    await bookmarksMove(drag.id, { parentId: destination.parentId, index });
    await refreshBookmarksUi();
  } catch (error) {
    console.warn("Не удалось переместить закладку:", error);
    showBookmarkError(`Не удалось переместить «${drag.title}»: ${error.message}`);
  }
}

function wireBookmarkDrag(element, node, { allowInto = false } = {}) {
  if (canDragBookmarkNode(node)) {
    element.draggable = true;
    element.classList.add("bookmark-draggable");
    element.addEventListener("dragstart", (event) => startBookmarkDrag(event, node, element));
    element.addEventListener("dragend", () => finishBookmarkDrag(element));
  }

  element.addEventListener("dragover", (event) => {
    if (!draggedBookmark || draggedBookmark.id === node.id) return;
    const mode = relativeDropMode(element, event, allowInto);
    const destination = targetDestinationForNode(node, mode);
    if (!destination) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    clearBookmarkDropIndicators();
    element.classList.add(`bookmark-drop-${mode}`);
  });

  element.addEventListener("dragleave", (event) => {
    if (element.contains(event.relatedTarget)) return;
    element.classList.remove("bookmark-drop-before", "bookmark-drop-after", "bookmark-drop-into");
  });

  element.addEventListener("drop", async (event) => {
    if (!draggedBookmark || draggedBookmark.id === node.id) return;
    const mode = relativeDropMode(element, event, allowInto);
    const destination = targetDestinationForNode(node, mode);
    if (!destination) return;
    event.preventDefault();
    event.stopPropagation();
    bookmarkClickLockUntil = Date.now() + 500;
    clearBookmarkDropIndicators();
    await moveDraggedBookmark(destination);
    finishBookmarkDrag();
  });
}

function wireBookmarkMenuDrop(menu, node) {
  const parentId = node.synthetic ? node.targetParentId : node.id;
  if (!parentId) return;
  menu.addEventListener("dragover", (event) => {
    if (!draggedBookmark || event.target !== menu) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    clearBookmarkDropIndicators();
    menu.classList.add("bookmark-drop-into");
  });
  menu.addEventListener("dragleave", (event) => {
    if (menu.contains(event.relatedTarget)) return;
    menu.classList.remove("bookmark-drop-into");
  });
  menu.addEventListener("drop", async (event) => {
    if (!draggedBookmark || event.target !== menu) return;
    event.preventDefault();
    event.stopPropagation();
    menu.classList.remove("bookmark-drop-into");
    const count = Array.isArray(node.children) ? node.children.length : 0;
    await moveDraggedBookmark({ parentId, index: count, openFolderId: bookmarkFolderStateId(node) });
    finishBookmarkDrag();
  });
}

function createBookmarkLink(node) {
  const item = document.createElement("div");
  item.className = "bookmark-item";
  item.dataset.bookmarkId = node.id;

  const link = document.createElement("a");
  link.className = "bookmark-link";
  link.href = node.url;
  link.title = bookmarkLabel(node);
  link.setAttribute("aria-label", bookmarkLabel(node));

  link.appendChild(makeFavicon(node.url, "bookmark-favicon", bookmarkLabel(node)));

  const title = document.createElement("span");
  title.className = "bookmark-title";
  title.textContent = bookmarkLabel(node);
  link.appendChild(title);

  link.addEventListener("click", (event) => {
    if (Date.now() < bookmarkClickLockUntil) event.preventDefault();
  });

  wireBookmarkDrag(link, node, { allowInto: false });
  item.appendChild(link);
  return item;
}

function createBookmarkFolder(node) {
  const folder = document.createElement("div");
  folder.className = "bookmark-folder";
  folder.dataset.bookmarkId = node.id;
  if (node.synthetic) folder.classList.add("bookmark-folder-synthetic");

  const button = document.createElement("button");
  button.className = "bookmark-folder-button";
  button.type = "button";
  button.title = bookmarkLabel(node);
  button.setAttribute("aria-label", `Папка: ${bookmarkLabel(node)}`);
  button.setAttribute("aria-expanded", "false");

  const icon = document.createElement("span");
  icon.className = "bookmark-folder-icon";
  icon.setAttribute("aria-hidden", "true");

  const title = document.createElement("span");
  title.className = "bookmark-title";
  title.textContent = bookmarkLabel(node);

  const chevron = document.createElement("span");
  chevron.className = "bookmark-chevron";
  chevron.textContent = "▾";
  chevron.setAttribute("aria-hidden", "true");

  button.append(icon, title, chevron);
  folder.appendChild(button);
  wireBookmarkDrag(button, node, { allowInto: true });
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleBookmarkFolder(folder, node);
  });

  const stateId = bookmarkFolderStateId(node);
  if (openBookmarkFolders.has(stateId)) {
    folder.classList.add("is-open");
    button.setAttribute("aria-expanded", "true");
  }

  const menu = document.createElement("div");
  menu.className = "bookmark-menu";
  menu.dataset.menuId = stateId;
  menu.setAttribute("role", "menu");
  menu.addEventListener("scroll", () => {
    bookmarkMenuScroll.set(stateId, menu.scrollTop);
  }, { passive: true });
  wireBookmarkMenuDrop(menu, node);

  const children = Array.isArray(node.children) ? node.children : [];
  if (children.length === 0) {
    const empty = document.createElement("span");
    empty.className = "bookmark-menu-empty";
    empty.textContent = "Папка пуста";
    menu.appendChild(empty);
  } else {
    children.forEach((child) => {
      if (child.url) menu.appendChild(createBookmarkLink(child));
      else menu.appendChild(createBookmarkFolder(child));
    });
  }

  folder.appendChild(menu);
  const savedScrollTop = bookmarkMenuScroll.get(stateId);
  if (Number.isFinite(savedScrollTop)) {
    requestAnimationFrame(() => { menu.scrollTop = savedScrollTop; });
  }
  return folder;
}

async function renderBookmarksBar() {
  if (!els.bookmarksBar || !chrome.bookmarks) return;

  try {
    const tree = await bookmarksGetTree();
    const bookmarkBarRoot = getBookmarkBarRootFromTree(tree);
    const children = Array.isArray(bookmarkBarRoot?.children) ? bookmarkBarRoot.children : [];

    captureBookmarkMenuScroll();
    els.bookmarksBar.replaceChildren();
    els.bookmarksBar.dataset.rootId = bookmarkBarRoot?.id || "";
    els.bookmarksBar.dataset.realChildCount = String(children.length);
    children.forEach((node) => {
      if (node.url) els.bookmarksBar.appendChild(createBookmarkLink(node));
      else els.bookmarksBar.appendChild(createBookmarkFolder(node));
    });

    const otherBookmarks = makeOtherBookmarksNode(tree, bookmarkBarRoot);
    const otherFolder = createBookmarkFolder(otherBookmarks);
    otherFolder.classList.add("other-bookmarks-folder");
    els.bookmarksBar.appendChild(otherFolder);
    requestAnimationFrame(positionAllOpenTopLevelBookmarkMenus);
  } catch (error) {
    console.warn("Не удалось загрузить панель закладок:", error);
    els.bookmarksBar.replaceChildren();
  }
}

function wireBookmarksBarDropZone() {
  if (!els.bookmarksBar) return;
  els.bookmarksBar.addEventListener("dragover", (event) => {
    if (!draggedBookmark || event.target !== els.bookmarksBar) return;
    const parentId = els.bookmarksBar.dataset.rootId;
    if (!parentId) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    clearBookmarkDropIndicators();
    els.bookmarksBar.classList.add("bookmark-drop-into");
  });
  els.bookmarksBar.addEventListener("dragleave", (event) => {
    if (els.bookmarksBar.contains(event.relatedTarget)) return;
    els.bookmarksBar.classList.remove("bookmark-drop-into");
  });
  els.bookmarksBar.addEventListener("drop", async (event) => {
    if (!draggedBookmark || event.target !== els.bookmarksBar) return;
    const parentId = els.bookmarksBar.dataset.rootId;
    if (!parentId) return;
    event.preventDefault();
    els.bookmarksBar.classList.remove("bookmark-drop-into");
    const count = Number(els.bookmarksBar.dataset.realChildCount) || 0;
    await moveDraggedBookmark({ parentId, index: count });
    finishBookmarkDrag();
  });
}

let bookmarksRefreshTimer = null;
function scheduleBookmarksRefresh() {
  clearTimeout(bookmarksRefreshTimer);
  bookmarksRefreshTimer = setTimeout(() => refreshBookmarksUi(), 80);
}

function watchBookmarks() {
  if (!chrome.bookmarks) return;
  const events = [
    chrome.bookmarks.onCreated,
    chrome.bookmarks.onRemoved,
    chrome.bookmarks.onChanged,
    chrome.bookmarks.onMoved,
    chrome.bookmarks.onChildrenReordered,
    chrome.bookmarks.onImportEnded
  ];
  events.forEach((eventApi) => eventApi?.addListener(scheduleBookmarksRefresh));
}

function clearShortcutDropMarkers() {
  els.shortcutsBar?.querySelectorAll(".shortcut-drop-before, .shortcut-drop-after")
    .forEach((el) => el.classList.remove("shortcut-drop-before", "shortcut-drop-after"));
  els.shortcutsBar?.classList.remove("shortcut-drop-end");
}

function finishShortcutDrag() {
  shortcutClickLockUntil = Date.now() + 180;
  draggedShortcutIndex = null;
  clearShortcutDropMarkers();
  document.body.classList.remove("shortcut-drag-active");
  els.shortcutsBar?.querySelectorAll(".dragging").forEach((el) => el.classList.remove("dragging"));
}

function moveShortcutToInsertion(fromIndex, insertionIndex) {
  if (fromIndex === null || fromIndex < 0 || fromIndex >= settings.shortcuts.length) return false;
  let target = Math.max(0, Math.min(settings.shortcuts.length, insertionIndex));
  if (fromIndex < target) target -= 1;
  if (target === fromIndex) return false;

  const [moved] = settings.shortcuts.splice(fromIndex, 1);
  settings.shortcuts.splice(target, 0, moved);
  return true;
}

function renderShortcuts() {
  els.shortcutsBar.replaceChildren();
  settings.shortcuts.forEach((shortcut, index) => {
    const link = document.createElement("a");
    link.className = "shortcut-tile";
    link.href = shortcut.url;
    link.title = shortcut.name || shortcut.url;
    link.setAttribute("aria-label", shortcut.name || shortcut.url);
    link.draggable = true;
    link.dataset.index = String(index);

    const fallback = shortcut.name || new URL(shortcut.url).hostname;
    link.appendChild(makeFavicon(shortcut.url, "shortcut-favicon", fallback));

    link.addEventListener("click", (event) => {
      if (Date.now() < shortcutClickLockUntil) event.preventDefault();
    });

    link.addEventListener("dragstart", (event) => {
      draggedShortcutIndex = index;
      link.classList.add("dragging");
      document.body.classList.add("shortcut-drag-active");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", shortcut.id || String(index));
      }
    });

    link.addEventListener("dragend", finishShortcutDrag);

    link.addEventListener("dragover", (event) => {
      if (draggedShortcutIndex === null) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      clearShortcutDropMarkers();
      const rect = link.getBoundingClientRect();
      const mode = event.clientX < rect.left + rect.width / 2 ? "before" : "after";
      link.classList.add(`shortcut-drop-${mode}`);
    });

    link.addEventListener("dragleave", (event) => {
      if (!link.contains(event.relatedTarget)) {
        link.classList.remove("shortcut-drop-before", "shortcut-drop-after");
      }
    });

    link.addEventListener("drop", async (event) => {
      if (draggedShortcutIndex === null) return;
      event.preventDefault();
      event.stopPropagation();
      const fromIndex = draggedShortcutIndex;
      const rect = link.getBoundingClientRect();
      const after = event.clientX >= rect.left + rect.width / 2;
      const insertionIndex = index + (after ? 1 : 0);
      const changed = moveShortcutToInsertion(fromIndex, insertionIndex);
      finishShortcutDrag();
      if (changed) {
        await persistSettings();
        renderShortcuts();
        renderShortcutEditor();
      }
    });

    els.shortcutsBar.appendChild(link);
  });
}

function wireShortcutsBarDropZone() {
  if (!els.shortcutsBar || els.shortcutsBar.dataset.dropWired === "true") return;
  els.shortcutsBar.dataset.dropWired = "true";

  els.shortcutsBar.addEventListener("dragover", (event) => {
    if (draggedShortcutIndex === null || event.target !== els.shortcutsBar) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    clearShortcutDropMarkers();
    els.shortcutsBar.classList.add("shortcut-drop-end");
  });

  els.shortcutsBar.addEventListener("dragleave", (event) => {
    if (event.target === els.shortcutsBar && !els.shortcutsBar.contains(event.relatedTarget)) {
      els.shortcutsBar.classList.remove("shortcut-drop-end");
    }
  });

  els.shortcutsBar.addEventListener("drop", async (event) => {
    if (draggedShortcutIndex === null || event.target !== els.shortcutsBar) return;
    event.preventDefault();
    const fromIndex = draggedShortcutIndex;
    const changed = moveShortcutToInsertion(fromIndex, settings.shortcuts.length);
    finishShortcutDrag();
    if (changed) {
      await persistSettings();
      renderShortcuts();
      renderShortcutEditor();
    }
  });
}

function renderShortcutEditor() {
  els.shortcutList.replaceChildren();
  els.emptyShortcuts.hidden = settings.shortcuts.length > 0;

  settings.shortcuts.forEach((shortcut, index) => {
    const row = document.createElement("div");
    row.className = "shortcut-row";
    row.draggable = true;
    row.dataset.index = String(index);

    const handle = document.createElement("span");
    handle.className = "drag-handle";
    handle.textContent = "⋮⋮";
    handle.title = "Перетащить";

    const fallback = shortcut.name || safeHostname(shortcut.url);
    const favicon = makeFavicon(shortcut.url, "row-favicon", fallback);

    const nameInput = document.createElement("input");
    nameInput.className = "row-input";
    nameInput.type = "text";
    nameInput.maxLength = 50;
    nameInput.value = shortcut.name;
    nameInput.setAttribute("aria-label", "Название ярлыка");

    const urlInput = document.createElement("input");
    urlInput.className = "row-input url-input";
    urlInput.type = "text";
    urlInput.value = shortcut.url;
    urlInput.setAttribute("aria-label", "URL ярлыка");

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Удалить";

    nameInput.addEventListener("change", async () => {
      settings.shortcuts[index].name = nameInput.value.trim() || safeHostname(settings.shortcuts[index].url);
      await persistSettings();
      renderShortcuts();
    });

    urlInput.addEventListener("change", async () => {
      const normalized = normalizeUrl(urlInput.value);
      if (!normalized) {
        showShortcutError("Некорректный URL. Используй обычный http/https адрес.");
        urlInput.value = settings.shortcuts[index].url;
        return;
      }
      settings.shortcuts[index].url = normalized;
      urlInput.value = normalized;
      clearShortcutError();
      await persistSettings();
      renderShortcuts();
      renderShortcutEditor();
    });

    deleteButton.addEventListener("click", async () => {
      settings.shortcuts.splice(index, 1);
      await persistSettings();
      renderShortcuts();
      renderShortcutEditor();
    });

    row.addEventListener("dragstart", (event) => {
      if (event.target.matches("input, button")) {
        event.preventDefault();
        return;
      }
      draggedIndex = index;
      row.classList.add("dragging");
    });
    row.addEventListener("dragend", () => {
      draggedIndex = null;
      row.classList.remove("dragging");
    });
    row.addEventListener("dragover", (event) => event.preventDefault());
    row.addEventListener("drop", async (event) => {
      event.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;
      reorderShortcuts(draggedIndex, index);
      await persistSettings();
    });

    row.append(handle, favicon, nameInput, urlInput, deleteButton);
    els.shortcutList.appendChild(row);
  });
}

function reorderShortcuts(from, to) {
  const [moved] = settings.shortcuts.splice(from, 1);
  settings.shortcuts.splice(to, 0, moved);
  draggedIndex = null;
  renderShortcuts();
  renderShortcutEditor();
}

function safeHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "") || "Сайт";
  } catch {
    return "Сайт";
  }
}

function normalizeUrl(raw) {
  let value = raw.trim();
  if (!value) return null;
  if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)) value = `https://${value}`;

  try {
    const parsed = new URL(value);
    const allowed = ["http:", "https:"];
    if (!allowed.includes(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

function showShortcutError(message) {
  els.shortcutError.textContent = message;
}

function clearShortcutError() {
  els.shortcutError.textContent = "";
}

async function persistSettings() {
  await storageSet({ lounaSettings: settings });
  showSaved();
}

function queuePersist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => persistSettings(), 120);
}

function showSaved() {
  els.saveStatus.textContent = "Сохранено";
  clearTimeout(showSaved.timer);
  showSaved.timer = setTimeout(() => {
    els.saveStatus.textContent = "Настройки сохраняются автоматически";
  }, 1200);
}

function openSettings() {
  els.settingsOverlay.hidden = false;
  document.body.dataset.settingsOpen = "true";
  els.closeSettings.focus();
}

function closeSettings() {
  els.settingsOverlay.hidden = true;
  delete document.body.dataset.settingsOpen;
  els.settingsButton.focus();
}

function switchTab(targetId) {
  document.querySelectorAll(".tab-button").forEach((button) => {
    const active = button.dataset.tab === targetId;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === targetId);
  });
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("lounaNewTab", 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("backgrounds")) {
        db.createObjectStore("backgrounds");
      }
      if (!db.objectStoreNames.contains("carouselImages")) {
        db.createObjectStore("carouselImages", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveBackgroundBlob(blob) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction("backgrounds", "readwrite");
    tx.objectStore("backgrounds").put(blob, "custom");
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function getBackgroundBlob() {
  const db = await openDb();
  const result = await new Promise((resolve, reject) => {
    const tx = db.transaction("backgrounds", "readonly");
    const request = tx.objectStore("backgrounds").get("custom");
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return result;
}

async function deleteBackgroundBlob() {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction("backgrounds", "readwrite");
    tx.objectStore("backgrounds").delete("custom");
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function saveCarouselFiles(files) {
  const validFiles = Array.from(files || []).filter((file) => file?.type?.startsWith("image/"));
  if (!validFiles.length) return [];

  const db = await openDb();
  const records = validFiles.map((file) => ({
    id: crypto.randomUUID(),
    name: file.name || "Изображение",
    type: file.type,
    blob: file,
    createdAt: Date.now()
  }));

  await new Promise((resolve, reject) => {
    const tx = db.transaction("carouselImages", "readwrite");
    const store = tx.objectStore("carouselImages");
    records.forEach((record) => store.put(record));
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return records;
}

async function getCarouselRecord(id) {
  if (!id) return null;
  const db = await openDb();
  const result = await new Promise((resolve, reject) => {
    const tx = db.transaction("carouselImages", "readonly");
    const request = tx.objectStore("carouselImages").get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return result;
}

async function deleteCarouselRecord(id) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction("carouselImages", "readwrite");
    tx.objectStore("carouselImages").delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function clearCarouselRecords() {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction("carouselImages", "readwrite");
    tx.objectStore("carouselImages").clear();
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

function updateBottomShortcutLayout() {
  const actionWidth = els.bottomActions?.getBoundingClientRect().width || 42;
  const edge = 24;
  const gapToControls = 18;
  const symmetricalReserve = 2 * (edge + actionWidth + gapToControls);
  const viewportSafeWidth = Math.max(80, window.innerWidth - symmetricalReserve);
  const preferredWidth = Math.min(window.innerWidth * 0.82, 1500, viewportSafeWidth);

  document.documentElement.style.setProperty("--shortcut-safe-width", `${Math.floor(preferredWidth)}px`);

  const tileSize = Math.max(44, Number(settings.shortcutTileSize) || 54);
  const rowBottom = Math.max(8, 55 - tileSize / 2);
  document.documentElement.style.setProperty("--shortcut-row-bottom", `${rowBottom}px`);
}

function updateCarouselNavigationButton() {
  const ids = Array.isArray(settings.backgroundCarouselImageIds) ? settings.backgroundCarouselImageIds : [];
  const active = Boolean(settings.backgroundCarouselEnabled);
  const insufficient = ids.length < 2;

  if (els.prevCarouselImage) {
    els.prevCarouselImage.hidden = !active;
    els.prevCarouselImage.disabled = insufficient;
    els.prevCarouselImage.title = insufficient
      ? "Добавь минимум два изображения в карусель"
      : "Предыдущий фон";
  }

  if (els.nextCarouselImage) {
    els.nextCarouselImage.hidden = !active;
    els.nextCarouselImage.disabled = insufficient;
    els.nextCarouselImage.title = insufficient
      ? "Добавь минимум два изображения в карусель"
      : "Следующий фон";
  }

  updateBottomShortcutLayout();
}

function carouselIntervalMs() {
  const value = Math.max(1, Number(settings.backgroundCarouselInterval) || 1);
  const unit = settings.backgroundCarouselUnit || "minutes";
  const multiplier = unit === "hours" ? 3600000 : unit === "seconds" ? 1000 : 60000;
  return Math.max(unit === "seconds" ? 5000 : multiplier, value * multiplier);
}

function clearCarouselTimer() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
  carouselGeneration += 1;
}

function revokeActiveBackgroundObjectUrl() {
  if (activeBackgroundObjectUrl) {
    URL.revokeObjectURL(activeBackgroundObjectUrl);
    activeBackgroundObjectUrl = null;
  }
}

async function showCarouselImage(index, { persistState = true } = {}) {
  const ids = Array.isArray(settings.backgroundCarouselImageIds) ? settings.backgroundCarouselImageIds : [];
  if (!ids.length) return false;
  const generation = carouselGeneration;
  const normalizedIndex = ((index % ids.length) + ids.length) % ids.length;
  const record = await getCarouselRecord(ids[normalizedIndex]);
  if (generation !== carouselGeneration || !record?.blob) return false;

  carouselIndex = normalizedIndex;
  if (persistState) {
    storageSet({
      [CAROUSEL_STATE_KEY]: {
        currentId: ids[normalizedIndex],
        updatedAt: Date.now()
      }
    }).catch((error) => console.warn("Не удалось сохранить позицию карусели:", error));
  }

  const previousUrl = activeBackgroundObjectUrl;
  const nextUrl = URL.createObjectURL(record.blob);
  activeBackgroundObjectUrl = nextUrl;
  els.background.classList.add("is-switching");
  window.setTimeout(() => {
    if (generation !== carouselGeneration) {
      URL.revokeObjectURL(nextUrl);
      return;
    }
    els.background.style.backgroundImage = `url("${nextUrl}")`;
    requestAnimationFrame(() => els.background.classList.remove("is-switching"));
    if (previousUrl && previousUrl !== nextUrl) {
      window.setTimeout(() => URL.revokeObjectURL(previousUrl), 300);
    }
  }, 120);
  return true;
}

async function syncCarouselTimer({ keepIndex = true, persistCurrent = true } = {}) {
  clearCarouselTimer();
  const ids = Array.isArray(settings.backgroundCarouselImageIds) ? settings.backgroundCarouselImageIds : [];
  updateCarouselNavigationButton();
  if (!settings.backgroundCarouselEnabled || ids.length === 0) {
    carouselIndex = 0;
    await applyStoredBackground();
    return;
  }

  if (!keepIndex || carouselIndex >= ids.length) carouselIndex = 0;
  await showCarouselImage(carouselIndex, { persistState: persistCurrent });
  if (ids.length > 1) {
    carouselTimer = setInterval(() => {
      showCarouselImage((carouselIndex + 1) % ids.length).catch(console.warn);
    }, carouselIntervalMs());
  }
}

async function advanceCarouselManually() {
  const ids = Array.isArray(settings.backgroundCarouselImageIds) ? settings.backgroundCarouselImageIds : [];
  if (!settings.backgroundCarouselEnabled || ids.length < 2) return;

  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
  // Invalidate an in-flight delayed swap, then advance exactly one image.
  carouselGeneration += 1;
  await showCarouselImage((carouselIndex + 1) % ids.length);

  // Manual navigation restarts the interval so the selected image stays
  // on screen for one complete user-configured interval.
  carouselTimer = setInterval(() => {
    showCarouselImage((carouselIndex + 1) % ids.length).catch(console.warn);
  }, carouselIntervalMs());
}

async function retreatCarouselManually() {
  const ids = Array.isArray(settings.backgroundCarouselImageIds) ? settings.backgroundCarouselImageIds : [];
  if (!settings.backgroundCarouselEnabled || ids.length < 2) return;

  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
  carouselGeneration += 1;
  await showCarouselImage((carouselIndex - 1 + ids.length) % ids.length);

  carouselTimer = setInterval(() => {
    showCarouselImage((carouselIndex + 1) % ids.length).catch(console.warn);
  }, carouselIntervalMs());
}

function watchCarouselState() {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[CAROUSEL_STATE_KEY]) return;
    if (!settings.backgroundCarouselEnabled) return;

    const state = changes[CAROUSEL_STATE_KEY].newValue;
    const ids = Array.isArray(settings.backgroundCarouselImageIds) ? settings.backgroundCarouselImageIds : [];
    const targetIndex = ids.indexOf(state?.currentId);
    if (targetIndex < 0 || targetIndex === carouselIndex) return;

    clearCarouselTimer();
    showCarouselImage(targetIndex, { persistState: false })
      .then((shown) => {
        if (!shown) return;
        if (ids.length > 1) {
          carouselTimer = setInterval(() => {
            showCarouselImage((carouselIndex + 1) % ids.length).catch(console.warn);
          }, carouselIntervalMs());
        }
      })
      .catch((error) => console.warn("Не удалось синхронизировать карусель между вкладками:", error));
  });
}

async function renderBackgroundCarouselList() {
  if (!els.backgroundCarouselList) return;
  updateCarouselNavigationButton();
  carouselThumbUrls.forEach((url) => URL.revokeObjectURL(url));
  carouselThumbUrls = [];
  els.backgroundCarouselList.replaceChildren();

  const ids = Array.isArray(settings.backgroundCarouselImageIds) ? settings.backgroundCarouselImageIds : [];
  const validIds = [];

  for (const [index, id] of ids.entries()) {
    const record = await getCarouselRecord(id);
    if (!record?.blob) continue;
    validIds.push(id);

    const row = document.createElement("div");
    row.className = "carousel-image-row";

    const thumb = document.createElement("img");
    thumb.className = "carousel-thumb";
    thumb.alt = "";
    const thumbUrl = URL.createObjectURL(record.blob);
    carouselThumbUrls.push(thumbUrl);
    thumb.src = thumbUrl;

    const meta = document.createElement("div");
    meta.className = "carousel-image-meta";
    const name = document.createElement("strong");
    name.textContent = record.name || `Изображение ${index + 1}`;
    const order = document.createElement("span");
    order.textContent = `Кадр ${index + 1}`;
    meta.append(name, order);

    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.textContent = "Удалить";
    remove.addEventListener("click", async () => {
      await deleteCarouselRecord(id);
      settings.backgroundCarouselImageIds = settings.backgroundCarouselImageIds.filter((value) => value !== id);
      if (carouselIndex >= settings.backgroundCarouselImageIds.length) carouselIndex = 0;
      await persistSettings();
      await renderBackgroundCarouselList();
      await syncCarouselTimer({ keepIndex: false });
    });

    row.append(thumb, meta, remove);
    els.backgroundCarouselList.appendChild(row);
  }

  if (validIds.length !== ids.length) {
    settings.backgroundCarouselImageIds = validIds;
    await persistSettings();
  }
  els.emptyBackgroundCarousel.hidden = validIds.length > 0;
}

let activeBackgroundObjectUrl = null;

async function applyStoredBackground() {
  if (activeBackgroundObjectUrl) {
    URL.revokeObjectURL(activeBackgroundObjectUrl);
    activeBackgroundObjectUrl = null;
  }

  try {
    const blob = await getBackgroundBlob();
    if (blob) {
      activeBackgroundObjectUrl = URL.createObjectURL(blob);
      els.background.style.backgroundImage = `url("${activeBackgroundObjectUrl}")`;
    } else {
      els.background.style.backgroundImage = 'url("assets/default-background.png")';
    }
  } catch (error) {
    console.warn("Не удалось загрузить пользовательский фон:", error);
    els.background.style.backgroundImage = 'url("assets/default-background.png")';
  }
}

async function handleBackgroundFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  await saveBackgroundBlob(file);
  await applyStoredBackground();
  showSaved();
}

async function addShortcut() {
  const name = els.newShortcutName.value.trim();
  const url = normalizeUrl(els.newShortcutUrl.value);

  if (!url) {
    showShortcutError("Укажи корректный адрес сайта, например https://github.com");
    return;
  }

  clearShortcutError();
  settings.shortcuts.push({
    id: crypto.randomUUID(),
    name: name || safeHostname(url),
    url
  });

  els.newShortcutName.value = "";
  els.newShortcutUrl.value = "";
  await persistSettings();
  renderShortcuts();
  renderShortcutEditor();
}

async function init() {
  const stored = await storageGet(["lounaSettings", CAROUSEL_STATE_KEY]);
  settings = {
    ...DEFAULT_SETTINGS,
    ...(stored.lounaSettings || {}),
    shortcuts: Array.isArray(stored.lounaSettings?.shortcuts) ? stored.lounaSettings.shortcuts : [],
    backgroundCarouselImageIds: Array.isArray(stored.lounaSettings?.backgroundCarouselImageIds)
      ? stored.lounaSettings.backgroundCarouselImageIds
      : []
  };

  // v1.19 migration: retain custom legacy glow preference, but boost it for the new split controls.
  if (stored.lounaSettings && stored.lounaSettings.hoverGlow !== undefined) {
    if (stored.lounaSettings.bookmarkHoverGlow === undefined) {
      settings.bookmarkHoverGlow = Math.min(100, Number(stored.lounaSettings.hoverGlow) + 20);
    }
    if (stored.lounaSettings.shortcutHoverGlow === undefined) {
      settings.shortcutHoverGlow = Math.min(100, Number(stored.lounaSettings.hoverGlow) + 30);
    }
  }

  // v1.20 migration: split the old shared icon size into independent bookmark and shortcut sizes.
  if (stored.lounaSettings) {
    const legacyIconSize = Number(stored.lounaSettings.iconSize);
    if (stored.lounaSettings.bookmarkIconSize === undefined) {
      settings.bookmarkIconSize = Number.isFinite(legacyIconSize) ? legacyIconSize : DEFAULT_SETTINGS.bookmarkIconSize;
    }
    if (stored.lounaSettings.shortcutIconSize === undefined) {
      settings.shortcutIconSize = Number.isFinite(legacyIconSize)
        ? Math.max(14, Math.min(64, legacyIconSize + 5))
        : recommendedShortcutIconSize(settings.shortcutTileSize);
    }
  }

  const carouselIds = settings.backgroundCarouselImageIds;
  const persistedCarouselId = stored[CAROUSEL_STATE_KEY]?.currentId;
  const persistedCarouselIndex = carouselIds.indexOf(persistedCarouselId);
  const restoredCarouselPosition = persistedCarouselIndex >= 0;
  if (restoredCarouselPosition) carouselIndex = persistedCarouselIndex;

  applySettings();
  await renderBackgroundCarouselList();
  await syncCarouselTimer({ keepIndex: true, persistCurrent: !restoredCarouselPosition });
  await refreshBookmarksUi();
  watchBookmarks();
  watchCarouselState();
  wireBookmarksBarDropZone();
  wireShortcutsBarDropZone();
  updateBottomShortcutLayout();
  window.addEventListener("resize", updateBottomShortcutLayout, { passive: true });
  window.addEventListener("resize", () => requestAnimationFrame(positionAllOpenTopLevelBookmarkMenus), { passive: true });

  document.addEventListener("click", (event) => {
    if (draggedBookmark) return;
    if (!event.target.closest("#bookmarksBar")) {
      els.bookmarksBar.querySelectorAll(".bookmark-folder.is-open").forEach(closeBookmarkFolderTree);
    }
  });

  els.prevCarouselImage?.addEventListener("click", () => {
    retreatCarouselManually().catch((error) => console.warn("Не удалось переключить фон карусели назад:", error));
  });
  els.nextCarouselImage.addEventListener("click", () => {
    advanceCarouselManually().catch((error) => console.warn("Не удалось переключить фон карусели:", error));
  });
  els.settingsButton.addEventListener("click", openSettings);
  els.closeSettings.addEventListener("click", closeSettings);
  els.closeSettingsFooter.addEventListener("click", closeSettings);
  els.settingsOverlay.addEventListener("click", (event) => {
    if (event.target === els.settingsOverlay) closeSettings();
  });

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  els.backgroundFile.addEventListener("change", async () => {
    const [file] = els.backgroundFile.files;
    if (file?.type?.startsWith("image/")) {
      await saveBackgroundBlob(file);
      if (!settings.backgroundCarouselEnabled) await applyStoredBackground();
      showSaved();
    }
    els.backgroundFile.value = "";
  });

  els.resetBackground.addEventListener("click", async () => {
    await deleteBackgroundBlob();
    if (!settings.backgroundCarouselEnabled) await applyStoredBackground();
    showSaved();
  });

  els.backgroundCarouselEnabled.addEventListener("change", async () => {
    settings.backgroundCarouselEnabled = els.backgroundCarouselEnabled.checked;
    updateCarouselNavigationButton();
    await persistSettings();
    await syncCarouselTimer({ keepIndex: false });
  });

  els.backgroundCarouselFiles.addEventListener("change", async () => {
    const files = Array.from(els.backgroundCarouselFiles.files || []);
    els.backgroundCarouselError.textContent = "";
    try {
      const records = await saveCarouselFiles(files);
      if (records.length) {
        settings.backgroundCarouselImageIds.push(...records.map((record) => record.id));
        await persistSettings();
        await renderBackgroundCarouselList();
        if (settings.backgroundCarouselEnabled) await syncCarouselTimer({ keepIndex: false });
      }
    } catch (error) {
      els.backgroundCarouselError.textContent = `Не удалось добавить изображения: ${error.message}`;
    } finally {
      els.backgroundCarouselFiles.value = "";
    }
  });

  els.backgroundCarouselInterval.addEventListener("change", async () => {
    settings.backgroundCarouselInterval = Math.max(1, Number(els.backgroundCarouselInterval.value) || 1);
    els.backgroundCarouselInterval.value = String(settings.backgroundCarouselInterval);
    await persistSettings();
    if (settings.backgroundCarouselEnabled) await syncCarouselTimer();
  });

  els.backgroundCarouselUnit.addEventListener("change", async () => {
    settings.backgroundCarouselUnit = els.backgroundCarouselUnit.value;
    await persistSettings();
    if (settings.backgroundCarouselEnabled) await syncCarouselTimer();
  });

  els.clearBackgroundCarousel.addEventListener("click", async () => {
    await clearCarouselRecords();
    settings.backgroundCarouselImageIds = [];
    carouselIndex = 0;
    await storageSet({ [CAROUSEL_STATE_KEY]: { currentId: null, updatedAt: Date.now() } });
    await persistSettings();
    await renderBackgroundCarouselList();
    await syncCarouselTimer({ keepIndex: false });
  });

  els.backgroundMode.addEventListener("change", () => {
    settings.backgroundMode = els.backgroundMode.value;
    applySettings();
    queuePersist();
  });

  els.backgroundPosition.addEventListener("change", () => {
    settings.backgroundPosition = els.backgroundPosition.value;
    applySettings();
    queuePersist();
  });

  els.backgroundManualSize.addEventListener("input", () => {
    settings.backgroundManualSize = Number(els.backgroundManualSize.value);
    settings.backgroundMode = "manual";
    applySettings();
    queuePersist();
  });

  els.backgroundManualX.addEventListener("input", () => {
    settings.backgroundManualX = Number(els.backgroundManualX.value);
    settings.backgroundMode = "manual";
    applySettings();
    queuePersist();
  });

  els.backgroundManualY.addEventListener("input", () => {
    settings.backgroundManualY = Number(els.backgroundManualY.value);
    settings.backgroundMode = "manual";
    applySettings();
    queuePersist();
  });

  els.resetManualBackground.addEventListener("click", () => {
    settings.backgroundManualSize = 100;
    settings.backgroundManualX = 50;
    settings.backgroundManualY = 50;
    settings.backgroundMode = "manual";
    applySettings();
    queuePersist();
  });

  els.accentColor.addEventListener("input", () => {
    settings.accentColor = els.accentColor.value;
    applySettings();
    queuePersist();
  });

  els.fontFamily.addEventListener("change", () => {
    settings.fontFamily = els.fontFamily.value;
    applySettings();
    queuePersist();
  });

  els.fontSize.addEventListener("input", () => {
    settings.fontSize = Number(els.fontSize.value);
    applySettings();
    queuePersist();
  });

  els.letterSpacing.addEventListener("input", () => {
    settings.letterSpacing = Number(els.letterSpacing.value);
    applySettings();
    queuePersist();
  });

  els.panelOpacity.addEventListener("input", () => {
    settings.panelOpacity = Number(els.panelOpacity.value);
    applySettings();
    queuePersist();
  });

  els.bookmarkBorderWidth.addEventListener("input", () => {
    settings.bookmarkBorderWidth = Number(els.bookmarkBorderWidth.value);
    applySettings();
    queuePersist();
  });

  els.bookmarkBorderColor.addEventListener("input", () => {
    settings.bookmarkBorderColor = els.bookmarkBorderColor.value;
    applySettings();
    queuePersist();
  });

  els.bookmarkHoverGlow.addEventListener("input", () => {
    settings.bookmarkHoverGlow = Number(els.bookmarkHoverGlow.value);
    applySettings();
    queuePersist();
  });

  els.shortcutHoverGlow.addEventListener("input", () => {
    settings.shortcutHoverGlow = Number(els.shortcutHoverGlow.value);
    applySettings();
    queuePersist();
  });

  els.hoverGlowColor.addEventListener("input", () => {
    settings.hoverGlowColor = els.hoverGlowColor.value;
    applySettings();
    queuePersist();
  });

  els.shortcutBorderColor.addEventListener("input", () => {
    settings.shortcutBorderColor = els.shortcutBorderColor.value;
    applySettings();
    queuePersist();
  });

  els.bookmarkIconSize.addEventListener("input", () => {
    settings.bookmarkIconSize = Number(els.bookmarkIconSize.value);
    applySettings();
    queuePersist();
  });

  els.shortcutIconSize.addEventListener("input", () => {
    settings.shortcutIconSize = Number(els.shortcutIconSize.value);
    applySettings();
    queuePersist();
  });

  els.elementPadding.addEventListener("input", () => {
    settings.elementPadding = Number(els.elementPadding.value);
    applySettings();
    queuePersist();
  });

  els.shortcutTileSize.addEventListener("input", () => {
    settings.shortcutTileSize = Number(els.shortcutTileSize.value);
    settings.shortcutIconSize = recommendedShortcutIconSize(settings.shortcutTileSize);
    applySettings();
    queuePersist();
  });

  els.shortcutBorderWidth.addEventListener("input", () => {
    settings.shortcutBorderWidth = Number(els.shortcutBorderWidth.value);
    applySettings();
    queuePersist();
  });

  els.addShortcut.addEventListener("click", addShortcut);
  els.newShortcutUrl.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addShortcut();
  });

  els.addBookmark.addEventListener("click", addChromeBookmark);
  els.newBookmarkUrl.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addChromeBookmark();
  });
  els.addBookmarkFolder.addEventListener("click", addChromeBookmarkFolder);
  els.newBookmarkFolderName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addChromeBookmarkFolder();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.settingsOverlay.hidden) closeSettings();
  });
}

init().catch((error) => {
  console.error("Ошибка инициализации новой вкладки:", error);
});
