/*
 * Folder Image Gallery
 * Copyright (c) 2026 Unagi Tech Inc.
 * Released under the MIT License. See LICENSE.
 */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => FolderImageGalleryPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// src/images.ts
var IMAGE_EXT = /* @__PURE__ */ new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "svg",
  "avif"
]);
var WIKI_EMBED = /!\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;
var MD_IMAGE = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
function isImageExtension(ext) {
  return IMAGE_EXT.has(ext.toLowerCase().replace(/^\./, ""));
}
function imageRefsInMarkdown(text) {
  const out = [];
  for (const re of [WIKI_EMBED, MD_IMAGE]) {
    re.lastIndex = 0;
    let match;
    while (match = re.exec(text)) {
      let raw = match[1].trim();
      if (!raw || /^https?:/i.test(raw) || raw.startsWith("data:")) continue;
      raw = raw.replace(/^<|>$/g, "").split(/\s+"/)[0];
      try {
        raw = decodeURIComponent(raw);
      } catch (e) {
      }
      raw = raw.split("?")[0].split("#")[0].trim();
      if (raw) out.push(raw);
    }
  }
  return out;
}

// src/main.ts
var VIEW_TYPE = "folder-image-gallery";
var MAX_NOTES = 800;
var MAX_IMAGES = 600;
var DEFAULT_SETTINGS = {
  includeSubfolders: true,
  sort: "mtime"
};
var STRINGS = {
  en: {
    command: "Open image gallery for this folder",
    menu: "Open image gallery",
    noFolder: "No folder is selected. Right-click a folder, or open a note in it.",
    missing: "That folder is not in the vault.",
    empty: "No images in this folder.",
    loading: "Collecting images\u2026",
    count: (n, extra) => `${n} images${extra}`,
    capped: " (showing the first 600)",
    notesCapped: "Some notes were skipped (more than 800).",
    sub: "Include subfolders",
    sort_mtime: "Updated",
    sort_name: "Name",
    sort_note: "Note order",
    loose: "Image file in the folder (not linked from a note here)",
    sources: "In notes",
    open: "Open",
    settingSub: "Include subfolders",
    settingSubDesc: "When a gallery opens, also include folders inside the selected folder.",
    settingSort: "Sort",
    settingSortDesc: "Order used when a gallery opens. You can change it in the gallery tab."
  },
  ja: {
    command: "\u3053\u306E\u30D5\u30A9\u30EB\u30C0\u306E\u753B\u50CF\u30AE\u30E3\u30E9\u30EA\u30FC\u3092\u958B\u304F",
    menu: "\u753B\u50CF\u30AE\u30E3\u30E9\u30EA\u30FC\u3092\u958B\u304F",
    noFolder: "\u30D5\u30A9\u30EB\u30C0\u304C\u9078\u3070\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u30D5\u30A9\u30EB\u30C0\u3092\u53F3\u30AF\u30EA\u30C3\u30AF\u3059\u308B\u304B\u3001\u305D\u306E\u4E2D\u306E\u30CE\u30FC\u30C8\u3092\u958B\u3044\u3066\u304F\u3060\u3055\u3044\u3002",
    missing: "\u305D\u306E\u30D5\u30A9\u30EB\u30C0\u306F Vault \u306B\u3042\u308A\u307E\u305B\u3093\u3002",
    empty: "\u3053\u306E\u30D5\u30A9\u30EB\u30C0\u306B\u753B\u50CF\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    loading: "\u753B\u50CF\u3092\u96C6\u3081\u3066\u3044\u307E\u3059\u2026",
    count: (n, extra) => `${n} \u679A${extra}`,
    capped: "\uFF08\u5148\u982D 600 \u679A\u3092\u8868\u793A\uFF09",
    notesCapped: "\u30CE\u30FC\u30C8\u304C 800 \u3092\u8D85\u3048\u305F\u305F\u3081\u3001\u4E00\u90E8\u306F\u898B\u3066\u3044\u307E\u305B\u3093\u3002",
    sub: "\u30B5\u30D6\u30D5\u30A9\u30EB\u30C0\u3092\u542B\u3080",
    sort_mtime: "\u66F4\u65B0\u65E5\u6642",
    sort_name: "\u540D\u524D",
    sort_note: "\u30CE\u30FC\u30C8\u9806",
    loose: "\u30D5\u30A9\u30EB\u30C0\u5185\u306E\u753B\u50CF\u30D5\u30A1\u30A4\u30EB\uFF08\u3053\u306E\u7BC4\u56F2\u306E\u30CE\u30FC\u30C8\u304B\u3089\u306F\u30EA\u30F3\u30AF\u3055\u308C\u3066\u3044\u307E\u305B\u3093\uFF09",
    sources: "\u8CBC\u3089\u308C\u3066\u3044\u308B\u30CE\u30FC\u30C8",
    open: "\u958B\u304F",
    settingSub: "\u30B5\u30D6\u30D5\u30A9\u30EB\u30C0\u3092\u542B\u3080",
    settingSubDesc: "\u30AE\u30E3\u30E9\u30EA\u30FC\u3092\u958B\u3044\u305F\u3068\u304D\u3001\u9078\u3093\u3060\u30D5\u30A9\u30EB\u30C0\u306E\u4E2D\u306E\u30D5\u30A9\u30EB\u30C0\u3082\u542B\u3081\u307E\u3059\u3002",
    settingSort: "\u4E26\u3073\u9806",
    settingSortDesc: "\u30AE\u30E3\u30E9\u30EA\u30FC\u3092\u958B\u3044\u305F\u3068\u304D\u306E\u4E26\u3073\u9806\u3067\u3059\u3002\u30BF\u30D6\u306E\u4E2D\u3067\u3082\u5909\u3048\u3089\u308C\u307E\u3059\u3002"
  }
};
function lang() {
  const locale = typeof import_obsidian.moment.locale === "function" ? import_obsidian.moment.locale() : "en";
  return locale && locale.startsWith("ja") ? "ja" : "en";
}
function t(key) {
  const table = STRINGS[lang()];
  return table[key] !== void 0 ? table[key] : STRINGS.en[key];
}
function baseName(path, vaultName) {
  if (!path) return vaultName;
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}
var FolderImageGalleryPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.settings = { ...DEFAULT_SETTINGS };
  }
  async onload() {
    await this.loadSettings();
    this.registerView(VIEW_TYPE, (leaf) => new GalleryView(leaf, this));
    this.addCommand({
      id: "open-folder-gallery",
      name: t("command"),
      callback: () => {
        const folder = this.folderForCommand();
        if (!folder) {
          new import_obsidian.Notice(t("noFolder"));
          return;
        }
        void this.openGallery(folder);
      }
    });
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (!(file instanceof import_obsidian.TFolder)) return;
        menu.addItem((item) => {
          item.setTitle(t("menu")).setIcon("image").onClick(() => {
            void this.openGallery(file);
          });
        });
      })
    );
    this.addSettingTab(new GallerySettingTab(this.app, this));
  }
  async loadSettings() {
    const data = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...data != null ? data : {} };
    if (this.settings.sort !== "mtime" && this.settings.sort !== "name" && this.settings.sort !== "note") {
      this.settings.sort = "mtime";
    }
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  folderForCommand() {
    var _a, _b, _c, _d, _e;
    const active = (_b = (_a = document.activeElement) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, ".nav-folder-title, .nav-file-title");
    const selected = document.querySelector(".nav-folder-title.is-active, .nav-file-title.is-active");
    const path = (_c = active != null ? active : selected) == null ? void 0 : _c.getAttribute("data-path");
    if (path) {
      const abs = this.app.vault.getAbstractFileByPath(path);
      if (abs instanceof import_obsidian.TFolder) return abs;
      if (abs instanceof import_obsidian.TFile && abs.parent) return abs.parent;
    }
    return (_e = (_d = this.app.workspace.getActiveFile()) == null ? void 0 : _d.parent) != null ? _e : null;
  }
  async openGallery(folder) {
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.setViewState({
      type: VIEW_TYPE,
      active: true,
      state: {
        folderPath: folder.path,
        includeSubfolders: this.settings.includeSubfolders,
        sort: this.settings.sort
      }
    });
    await this.app.workspace.revealLeaf(leaf);
  }
};
var GalleryView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.folderPath = "";
    this.includeSubfolders = true;
    this.sort = "mtime";
    this.renderToken = 0;
  }
  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return baseName(this.folderPath, this.app.vault.getName());
  }
  getIcon() {
    return "image";
  }
  getState() {
    return {
      folderPath: this.folderPath,
      includeSubfolders: this.includeSubfolders,
      sort: this.sort
    };
  }
  async setState(state, result) {
    if (state && typeof state.folderPath === "string") this.folderPath = state.folderPath;
    if (state && typeof state.includeSubfolders === "boolean") this.includeSubfolders = state.includeSubfolders;
    if (state && (state.sort === "mtime" || state.sort === "name" || state.sort === "note")) this.sort = state.sort;
    await super.setState(state, result);
    this.refreshHeader();
    await this.render();
  }
  // The view header title is drawn when the view opens, before the folder is known,
  // so it shows the vault name. Set it to the folder name once the state arrives.
  refreshHeader() {
    const title = this.containerEl.querySelector(".view-header-title");
    if (title instanceof HTMLElement) title.setText(this.getDisplayText());
  }
  async onOpen() {
    this.contentEl.addClass("fig-root");
    await this.render();
  }
  async onClose() {
    this.contentEl.empty();
  }
  async render() {
    const token = ++this.renderToken;
    const content = this.contentEl;
    content.empty();
    content.addClass("fig-root");
    content.createEl("p", { text: t("loading"), cls: "fig-loading" });
    const folder = this.folderPath ? this.app.vault.getAbstractFileByPath(this.folderPath) : this.app.vault.getRoot();
    if (!(folder instanceof import_obsidian.TFolder)) {
      content.empty();
      content.createEl("p", { text: t("missing") });
      return;
    }
    const collected = await this.collect(folder);
    if (token !== this.renderToken) return;
    content.empty();
    content.addClass("fig-root");
    this.drawToolbar(content, collected.items.length, collected.cappedNotes, collected.cappedImages);
    if (collected.items.length === 0) {
      content.createEl("p", { text: t("empty") });
      return;
    }
    const grid = content.createEl("div", { cls: "fig-grid" });
    for (const item of collected.items) {
      this.drawCard(grid, item);
    }
  }
  drawToolbar(content, count, cappedNotes, cappedImages) {
    const bar = content.createEl("div", { cls: "fig-toolbar" });
    bar.createEl("div", { cls: "fig-title", text: this.folderPath || this.app.vault.getName() });
    const extra = (cappedImages ? t("capped") : "") + (cappedNotes ? " " + t("notesCapped") : "");
    bar.createEl("div", { cls: "fig-count", text: t("count")(count, extra) });
    const subLabel = bar.createEl("label", { cls: "fig-sub" });
    const checkbox = subLabel.createEl("input", { type: "checkbox" });
    checkbox.checked = this.includeSubfolders;
    subLabel.appendText(" " + t("sub"));
    checkbox.addEventListener("change", () => {
      this.includeSubfolders = checkbox.checked;
      this.app.workspace.requestSaveLayout();
      void this.render();
    });
    const select = bar.createEl("select", { cls: "fig-sort" });
    for (const key of ["mtime", "name", "note"]) {
      const option = select.createEl("option", { text: t(`sort_${key}`), value: key });
      if (key === this.sort) option.selected = true;
    }
    select.addEventListener("change", () => {
      const value = select.value;
      if (value === "mtime" || value === "name" || value === "note") this.sort = value;
      this.app.workspace.requestSaveLayout();
      void this.render();
    });
  }
  drawCard(grid, item) {
    const card = grid.createDiv({ cls: "fig-card" });
    const img = card.createEl("img", {
      attr: {
        src: this.app.vault.getResourcePath(item.file),
        alt: item.file.name,
        loading: "lazy"
      }
    });
    img.addEventListener("click", () => {
      const modal = new ZoomModal(this.app, item, (note) => {
        void this.app.workspace.getLeaf("tab").openFile(note);
      });
      modal.open();
    });
    const meta = card.createEl("div", { cls: "fig-meta" });
    meta.createEl("div", { cls: "fig-name", text: item.file.name });
    if (item.sources.length === 0) {
      meta.createEl("div", { cls: "fig-loose", text: t("loose") });
    } else {
      const list = meta.createEl("div", { cls: "fig-sources" });
      for (const source of item.sources) {
        const link = list.createEl("a", { text: source.note.path, href: "#" });
        link.addEventListener("click", (event) => {
          event.preventDefault();
          void this.app.workspace.getLeaf("tab").openFile(source.note);
        });
      }
    }
  }
  async collect(folder) {
    var _a, _b;
    const files = [];
    this.walk(folder, files);
    const byPath = /* @__PURE__ */ new Map();
    let noteCount = 0;
    let cappedNotes = false;
    const add = (file, source) => {
      let item = byPath.get(file.path);
      if (!item) {
        item = { file, sources: [] };
        byPath.set(file.path, item);
      }
      if (source && !item.sources.some((s) => s.note.path === source.note.path)) {
        item.sources.push(source);
      }
    };
    for (const file of files) {
      if (isImageExtension(file.extension)) add(file, null);
      if (file.extension.toLowerCase() !== "md") continue;
      noteCount++;
      if (noteCount > MAX_NOTES) {
        cappedNotes = true;
        continue;
      }
      const cache = this.app.metadataCache.getFileCache(file);
      const refs = [...(_a = cache == null ? void 0 : cache.embeds) != null ? _a : [], ...(_b = cache == null ? void 0 : cache.links) != null ? _b : []];
      refs.forEach((ref, index) => {
        const dest = this.resolveLink(file, ref.link);
        if (dest) add(dest, { note: file, index });
      });
      if (file.stat.size > 15e5) continue;
      try {
        const text = await this.app.vault.cachedRead(file);
        imageRefsInMarkdown(text).forEach((link, index) => {
          const dest = this.resolveLink(file, link);
          if (dest) add(dest, { note: file, index });
        });
      } catch (e) {
      }
    }
    let items = sortItems([...byPath.values()], this.sort);
    let cappedImages = false;
    if (items.length > MAX_IMAGES) {
      items = items.slice(0, MAX_IMAGES);
      cappedImages = true;
    }
    return { items, cappedNotes, cappedImages };
  }
  walk(folder, out) {
    for (const child of folder.children) {
      if (child instanceof import_obsidian.TFile) out.push(child);
      else if (this.includeSubfolders && child instanceof import_obsidian.TFolder) this.walk(child, out);
    }
  }
  resolveLink(source, link) {
    var _a, _b;
    const cleaned = link.trim();
    if (!cleaned || /^https?:/i.test(cleaned)) return null;
    const dest = this.app.metadataCache.getFirstLinkpathDest(cleaned, source.path);
    if (dest instanceof import_obsidian.TFile && isImageExtension(dest.extension)) return dest;
    const parent = (_b = (_a = source.parent) == null ? void 0 : _a.path) != null ? _b : "";
    const relative = cleaned.replace(/^\.\//, "");
    const joined = parent ? `${parent}/${relative}` : relative;
    const abs = this.app.vault.getAbstractFileByPath((0, import_obsidian.normalizePath)(joined));
    if (abs instanceof import_obsidian.TFile && isImageExtension(abs.extension)) return abs;
    return null;
  }
};
function sortItems(items, key) {
  const copy = items.slice();
  if (key === "name") {
    copy.sort((a, b) => a.file.name.localeCompare(b.file.name, "ja"));
    return copy;
  }
  if (key === "mtime") {
    copy.sort((a, b) => b.file.stat.mtime - a.file.stat.mtime);
    return copy;
  }
  copy.sort((a, b) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const aNote = (_b = (_a = a.sources[0]) == null ? void 0 : _a.note.path) != null ? _b : `\uFFFF${a.file.path}`;
    const bNote = (_d = (_c = b.sources[0]) == null ? void 0 : _c.note.path) != null ? _d : `\uFFFF${b.file.path}`;
    if (aNote !== bNote) return aNote.localeCompare(bNote, "ja");
    return ((_f = (_e = a.sources[0]) == null ? void 0 : _e.index) != null ? _f : 0) - ((_h = (_g = b.sources[0]) == null ? void 0 : _g.index) != null ? _h : 0);
  });
  return copy;
}
var ZoomModal = class extends import_obsidian.Modal {
  constructor(app, item, openNote) {
    super(app);
    this.item = item;
    this.openNote = openNote;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("fig-zoom");
    contentEl.createEl("img", {
      attr: { src: this.app.vault.getResourcePath(this.item.file), alt: this.item.file.name }
    });
    contentEl.createEl("div", { cls: "fig-zoom-path", text: this.item.file.path });
    const notes = contentEl.createEl("div", { cls: "fig-zoom-notes" });
    notes.createEl("div", { cls: "fig-zoom-label", text: t("sources") });
    if (this.item.sources.length === 0) {
      notes.createEl("div", { text: t("loose") });
      return;
    }
    for (const source of this.item.sources) {
      const link = notes.createEl("a", { text: source.note.path, href: "#" });
      link.addEventListener("click", (event) => {
        event.preventDefault();
        this.close();
        this.openNote(source.note);
      });
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};
var GallerySettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName(t("settingSub")).setDesc(t("settingSubDesc")).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.includeSubfolders).onChange(async (value) => {
        this.plugin.settings.includeSubfolders = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName(t("settingSort")).setDesc(t("settingSortDesc")).addDropdown(
      (dropdown) => dropdown.addOption("mtime", t("sort_mtime")).addOption("name", t("sort_name")).addOption("note", t("sort_note")).setValue(this.plugin.settings.sort).onChange(async (value) => {
        if (value === "mtime" || value === "name" || value === "note") {
          this.plugin.settings.sort = value;
          await this.plugin.saveSettings();
        }
      })
    );
  }
};
