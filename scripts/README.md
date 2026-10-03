# ToolCanvas Scripts

## Shared Partials Sync

Because this site does not use a framework, the global header, footer, and common `<head>` tags are managed via partials.

**How it works:**
The partials live in the `/partials/` folder.
In every `.html` file, these blocks are wrapped in marker comments:
- `<!-- HEAD-COMMON:START -->` ... `<!-- HEAD-COMMON:END -->`
- `<!-- HEADER:START -->` ... `<!-- HEADER:END -->`
- `<!-- FOOTER:START -->` ... `<!-- FOOTER:END -->`

### Usage

Before you deploy (or after editing any file in `/partials/`), run the sync script from the project root:

```bash
node scripts/sync-shared.mjs
```

This will safely replace the content inside the markers across all HTML files with the master content from the partials, without touching your page-specific tags (like `<title>`, `<meta>`, or main page content).

### CI / Pre-deploy Check

You can run the script with the `--check` flag to ensure no files were manually edited out of sync:

```bash
node scripts/sync-shared.mjs --check
```
If any file is out of sync, the script exits with an error. This is perfect for CI pipelines.
