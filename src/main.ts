/*
 * Folder Image Gallery
 * Copyright (c) 2026 Unagi Tech Inc.
 * Released under the MIT License. See LICENSE.
 */

import {
  ItemView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  TFolder,
  WorkspaceLeaf,
  moment,
  normalizePath,
  type ViewStateResult,
} from "obsidian";
import { imageRefsInMarkdown, isImageExtension } from "./images";

const VIEW_TYPE = "folder-image-gallery";
const MAX_NOTES = 800;
const MAX_IMAGES = 600;

type SortKey = "mtime" | "name" | "note";

interface SourceNote {
  note: TFile;
  index: number;
}

interface GalleryItem {
  file: TFile;
  sources: SourceNote[];
}

interface GalleryState {
  folderPath: string;
  includeSubfolders: boolean;
  sort: SortKey;
}

interface GallerySettings {
  includeSubfolders: boolean;
  sort: SortKey;
}

const DEFAULT_SETTINGS: GallerySettings = {
  includeSubfolders: true,
  sort: "mtime",
};

const STRINGS = {
  en: {
    command: "Open image gallery for this folder",
    menu: "Open image gallery",
    noFolder: "No folder is selected. Right-click a folder, or open a note in it.",
    missing: "That folder is not in the vault.",
    empty: "No images in this folder.",
    loading: "Collecting images…",
    count: (n: number, extra: string) => `${n} images${extra}`,
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
    settingSortDesc: "Order used when a gallery opens. You can change it in the gallery tab.",
  },
  ja: {
    command: "このフォルダの画像ギャラリーを開く",
    menu: "画像ギャラリーを開く",
    noFolder: "フォルダが選ばれていません。フォルダを右クリックするか、その中のノートを開いてください。",
    missing: "そのフォルダは Vault にありません。",
    empty: "このフォルダに画像はありません。",
    loading: "画像を集めています…",
    count: (n: number, extra: string) => `${n} 枚${extra}`,
    capped: "（先頭 600 枚を表示）",
    notesCapped: "ノートが 800 を超えたため、一部は見ていません。",
    sub: "サブフォルダを含む",
    sort_mtime: "更新日時",
    sort_name: "名前",
    sort_note: "ノート順",
    loose: "フォルダ内の画像ファイル（この範囲のノートからはリンクされていません）",
    sources: "貼られているノート",
    open: "開く",
    settingSub: "サブフォルダを含む",
    settingSubDesc: "ギャラリーを開いたとき、選んだフォルダの中のフォルダも含めます。",
    settingSort: "並び順",
    settingSortDesc: "ギャラリーを開いたときの並び順です。タブの中でも変えられます。",
  },
} as const;

type Lang = "en" | "ja";

function lang(): Lang {
  const locale = typeof moment.locale === "function" ? moment.locale() : "en";
  return locale && locale.startsWith("ja") ? "ja" : "en";
}

function t<K extends keyof (typeof STRINGS)["en"]>(key: K): (typeof STRINGS)["en"][K] {
  const table = STRINGS[lang()];
  return (table[key] !== undefined ? table[key] : STRINGS.en[key]) as (typeof STRINGS)["en"][K];
}

function baseName(path: string, vaultName: string): string {
  if (!path) return vaultName;
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

export default class FolderImageGalleryPlugin extends Plugin {
  settings: GallerySettings = { ...DEFAULT_SETTINGS };

  async onload() {
    await this.loadSettings();
    this.registerView(VIEW_TYPE, (leaf) => new GalleryView(leaf, this));

    this.addCommand({
      id: "open-folder-gallery",
      name: t("command"),
      callback: () => {
        const folder = this.folderForCommand();
        if (!folder) {
          new Notice(t("noFolder"));
          return;
        }
        void this.openGallery(folder);
      },
    });

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (!(file instanceof TFolder)) return;
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
    const data = (await this.loadData()) as Partial<GallerySettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...(data ?? {}) };
    if (this.settings.sort !== "mtime" && this.settings.sort !== "name" && this.settings.sort !== "note") {
      this.settings.sort = "mtime";
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  folderForCommand(): TFolder | null {
    const active = document.activeElement?.closest?.(".nav-folder-title, .nav-file-title") as HTMLElement | null;
    const selected = document.querySelector(".nav-folder-title.is-active, .nav-file-title.is-active") as HTMLElement | null;
    const path = (active ?? selected)?.getAttribute("data-path");
    if (path) {
      const abs = this.app.vault.getAbstractFileByPath(path);
      if (abs instanceof TFolder) return abs;
      if (abs instanceof TFile && abs.parent) return abs.parent;
    }
    return this.app.workspace.getActiveFile()?.parent ?? null;
  }

  async openGallery(folder: TFolder) {
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.setViewState({
      type: VIEW_TYPE,
      active: true,
      state: {
        folderPath: folder.path,
        includeSubfolders: this.settings.includeSubfolders,
        sort: this.settings.sort,
      },
    });
    await this.app.workspace.revealLeaf(leaf);
  }
}

class GalleryView extends ItemView {
  private folderPath = "";
  private includeSubfolders = true;
  private sort: SortKey = "mtime";
  private renderToken = 0;

  constructor(leaf: WorkspaceLeaf, private plugin: FolderImageGalleryPlugin) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE;
  }

  getDisplayText(): string {
    return baseName(this.folderPath, this.app.vault.getName());
  }

  getIcon(): string {
    return "image";
  }

  getState(): Record<string, unknown> {
    return {
      folderPath: this.folderPath,
      includeSubfolders: this.includeSubfolders,
      sort: this.sort,
    };
  }

  async setState(state: GalleryState, result: ViewStateResult) {
    if (state && typeof state.folderPath === "string") this.folderPath = state.folderPath;
    if (state && typeof state.includeSubfolders === "boolean") this.includeSubfolders = state.includeSubfolders;
    if (state && (state.sort === "mtime" || state.sort === "name" || state.sort === "note")) this.sort = state.sort;
    await super.setState(state, result);
    this.refreshHeader();
    await this.render();
  }

  // The view header title is drawn when the view opens, before the folder is known,
  // so it shows the vault name. Set it to the folder name once the state arrives.
  private refreshHeader() {
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

  private async render() {
    const token = ++this.renderToken;
    const content = this.contentEl;
    content.empty();
    content.addClass("fig-root");
    content.createEl("p", { text: t("loading"), cls: "fig-loading" });

    const folder = this.folderPath
      ? this.app.vault.getAbstractFileByPath(this.folderPath)
      : this.app.vault.getRoot();
    if (!(folder instanceof TFolder)) {
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

  private drawToolbar(content: HTMLElement, count: number, cappedNotes: boolean, cappedImages: boolean) {
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
    for (const key of ["mtime", "name", "note"] as const) {
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

  private drawCard(grid: HTMLElement, item: GalleryItem) {
    const card = grid.createDiv({ cls: "fig-card" });
    const img = card.createEl("img", {
      attr: {
        src: this.app.vault.getResourcePath(item.file),
        alt: item.file.name,
        loading: "lazy",
      },
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

  private async collect(folder: TFolder): Promise<{ items: GalleryItem[]; cappedNotes: boolean; cappedImages: boolean }> {
    const files: TFile[] = [];
    this.walk(folder, files);
    const byPath = new Map<string, GalleryItem>();
    let noteCount = 0;
    let cappedNotes = false;

    const add = (file: TFile, source: SourceNote | null) => {
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
      const refs = [...(cache?.embeds ?? []), ...(cache?.links ?? [])];
      refs.forEach((ref, index) => {
        const dest = this.resolveLink(file, ref.link);
        if (dest) add(dest, { note: file, index });
      });
      if (file.stat.size > 1_500_000) continue;
      try {
        const text = await this.app.vault.cachedRead(file);
        imageRefsInMarkdown(text).forEach((link, index) => {
          const dest = this.resolveLink(file, link);
          if (dest) add(dest, { note: file, index });
        });
      } catch {
        /* unreadable note */
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

  private walk(folder: TFolder, out: TFile[]) {
    for (const child of folder.children) {
      if (child instanceof TFile) out.push(child);
      else if (this.includeSubfolders && child instanceof TFolder) this.walk(child, out);
    }
  }

  private resolveLink(source: TFile, link: string): TFile | null {
    const cleaned = link.trim();
    if (!cleaned || /^https?:/i.test(cleaned)) return null;
    const dest = this.app.metadataCache.getFirstLinkpathDest(cleaned, source.path);
    if (dest instanceof TFile && isImageExtension(dest.extension)) return dest;
    const parent = source.parent?.path ?? "";
    const relative = cleaned.replace(/^\.\//, "");
    const joined = parent ? `${parent}/${relative}` : relative;
    const abs = this.app.vault.getAbstractFileByPath(normalizePath(joined));
    if (abs instanceof TFile && isImageExtension(abs.extension)) return abs;
    return null;
  }
}

function sortItems(items: GalleryItem[], key: SortKey): GalleryItem[] {
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
    const aNote = a.sources[0]?.note.path ?? `\uffff${a.file.path}`;
    const bNote = b.sources[0]?.note.path ?? `\uffff${b.file.path}`;
    if (aNote !== bNote) return aNote.localeCompare(bNote, "ja");
    return (a.sources[0]?.index ?? 0) - (b.sources[0]?.index ?? 0);
  });
  return copy;
}

class ZoomModal extends Modal {
  constructor(
    app: ConstructorParameters<typeof Modal>[0],
    private item: GalleryItem,
    private openNote: (file: TFile) => void
  ) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("fig-zoom");
    contentEl.createEl("img", {
      attr: { src: this.app.vault.getResourcePath(this.item.file), alt: this.item.file.name },
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
}

class GallerySettingTab extends PluginSettingTab {
  constructor(app: ConstructorParameters<typeof PluginSettingTab>[0], private plugin: FolderImageGalleryPlugin) {
    super(app, plugin);
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl)
      .setName(t("settingSub"))
      .setDesc(t("settingSubDesc"))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.includeSubfolders).onChange(async (value) => {
          this.plugin.settings.includeSubfolders = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(t("settingSort"))
      .setDesc(t("settingSortDesc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("mtime", t("sort_mtime"))
          .addOption("name", t("sort_name"))
          .addOption("note", t("sort_note"))
          .setValue(this.plugin.settings.sort)
          .onChange(async (value) => {
            if (value === "mtime" || value === "name" || value === "note") {
              this.plugin.settings.sort = value;
              await this.plugin.saveSettings();
            }
          })
      );
  }
}
