# Folder Image Gallery

**Unagi Tech Inc.（株式会社うなぎテック）** · MIT License

English | [日本語](README.ja.md)

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20us-e11982?logo=ko-fi&logoColor=white)](https://ko-fi.com/unagitech)

An Obsidian plugin that shows the images in a folder as a gallery.

Besides the image files in the folder, it also shows images that the folder's notes embed or link to. Images are shown even when the files live somewhere else, such as an attachments folder. A duplicate image is shown only once.

## Features

- **Open from a folder**: right-click a folder in the file explorer and choose **Open image gallery**. The gallery opens in a new tab.
- **Open from a command**: use the command **Open image gallery for this folder**. It uses the folder selected in the file explorer, or the folder of the open note.
- **Images from notes, too**: image files in the folder and images embedded or linked in its notes are shown together.
- **Subfolders on or off**: choose in the gallery tab whether to include subfolders.
- **Zoom and jump to notes**: click a thumbnail to enlarge it. Each image lists the notes that use it. Click one to open that note.
- **Sorting**: sort by updated time, name, or note order.
- **Supports English and Japanese**: follows Obsidian's language setting.

## Settings

| Setting | Default | What it does |
|---|---|---|
| Include subfolders | On | When a gallery opens, also include images in folders inside the selected folder. |
| Sort | Updated | Order used when a gallery opens. You can also change it in the gallery tab. |

## Install

**From Community plugins**

1. **Settings → Community plugins → Browse**
2. Search for **Folder Image Gallery** and select **Install**, then **Enable**.

**Manually**

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/UnagiTechLab/folder-image-gallery/releases/latest).
2. Put them in `<your vault>/.obsidian/plugins/folder-image-gallery/`.
3. **Settings → Community plugins**: select the reload button next to **Installed plugins**, then enable **Folder Image Gallery**.

## Good to know

- Up to 800 notes are read, and up to 600 images are shown.
- Notes larger than 1.5 MB are not scanned for image links in the text. The link information Obsidian already has is still used.
- On a phone, open the gallery from the command. The file explorer menu may not be available, depending on the app.

## Privacy

This plugin makes no network requests and collects no data. It only works with notes and images in your vault.

## License

[MIT](LICENSE) — Copyright (c) 2026 Unagi Tech Inc.

Keep the copyright notice when you modify or redistribute.

## Disclaimer

This plugin is provided "as is", as stated in the [license](LICENSE). Keep backups of your vault. Unagi Tech Inc. is not liable for any loss of data or other damage arising from its use.

This is an independently developed plugin. It is not made, endorsed or supported by Obsidian (Dynalist Inc.).

## Support

Tips are optional (Ko-fi). They help us keep shipping and maintaining free tools.

[![Support on Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/unagitech)

## Links

- Lab org: [UnagiTechLab](https://github.com/UnagiTechLab)
- Company: [unagi.tech](https://www.unagi.tech)
- Bug reports and requests: [Issues](https://github.com/UnagiTechLab/folder-image-gallery/issues)
