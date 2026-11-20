/*
 * Folder Image Gallery
 * Copyright (c) 2026 Unagi Tech Inc.
 * Released under the MIT License. See LICENSE.
 */

const IMAGE_EXT = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "svg",
  "avif",
]);

const WIKI_EMBED = /!\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;
const MD_IMAGE = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

export function isImageExtension(ext: string): boolean {
  return IMAGE_EXT.has(ext.toLowerCase().replace(/^\./, ""));
}

/** Image targets written in a note. https links are left out. */
export function imageRefsInMarkdown(text: string): string[] {
  const out: string[] = [];
  for (const re of [WIKI_EMBED, MD_IMAGE]) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text))) {
      let raw = match[1].trim();
      if (!raw || /^https?:/i.test(raw) || raw.startsWith("data:")) continue;
      raw = raw.replace(/^<|>$/g, "").split(/\s+"/)[0];
      try {
        raw = decodeURIComponent(raw);
      } catch {
        /* keep the raw path */
      }
      raw = raw.split("?")[0].split("#")[0].trim();
      if (raw) out.push(raw);
    }
  }
  return out;
}
