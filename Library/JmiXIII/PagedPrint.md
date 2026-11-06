---
name: Library/JmiXIII/PagedPrint
tags: meta/library
description: "Print any page as a professional, paginated PDF: running header with logo, title and front matter fields, footer with page X / Y, status watermark, repeated table headers. Powered by Paged.js, fully client-side."
files:
- paged-print.css
- paged-print-tables.js
- paged-print-open.js
- paged-print-pagedjs-0.4.3.js
---
# Paged Print

Print the current page as a **professional, paginated document** — designed for controlled documents (quality management systems, procedures, work instructions…), but useful for any page.

Command: **`Paged Print: Print document (PDF)`** — key `Ctrl-Alt-q`.

## Features
* **Running header** on every page: optional logo, document title, and a block of front matter fields of your choice (reference, status, date…).
* **Running footer**: a note (e.g. “Uncontrolled copy when printed”), print date, and **Page X / Y**.
* **Watermark** driven by the document status (e.g. `status: draft` → “DRAFT”).
* **Tables stay in the flow** and their **header row is repeated** on every page they continue on.
* **Portrait or landscape**, per document, from the front matter.
* **Front matter whitelist**: only the fields you list are printed; everything else stays private.
* **Nothing is written to the space**: the print view is built in memory as a self-contained HTML page (CSS, Paged.js, logo and images embedded). Works for read-only visitors, on read-only pages and offline.
* Emoji are printed in colour.
* No server-side tool (no Pandoc, no shell): layout by [Paged.js](https://pagedjs.org) 0.4.3, bundled.

## Usage
1. Open a page and run **Paged Print: Print document (PDF)**.
2. A new tab opens with a page-by-page preview (allow pop-ups for your SilverBullet site).
3. Click **Print / PDF** → destination **Save as PDF** → **untick “Headers and footers”** in the browser print dialog.

Recommended browser: Chrome or Edge (Chromium).

## Front matter
```yaml
---
title: Hazardous waste management     # shown in the header (else first # heading, else page name)
id: PROC-042                          # any field listed in `header` is printed
status: draft                         # triggers a watermark if listed in `watermarks`
orientation: landscape                # portrait (default) or landscape
---
```
Field names are configurable (see `fields`), so you can use e.g. `titre`, `statut`, `orientation: paysage`.

If the first `#` heading of the page is identical to the title, it is not repeated in the body (`hideFirstH1`).
The content of HTML comments `<!-- … -->` is removed from the print.

## Configuration
All keys are optional. Put this in your [[CONFIG]] page:

```lua
config.set("pagedPrint", {
  -- front matter field names used by the command
  fields = { title = "title", status = "status", orientation = "orientation" },
  landscapeValues = { "landscape" },        -- orientation values meaning landscape
  pageSize = "A4",                          -- any CSS page size: "A4", "letter", "A3"…

  -- header block, right of the title (repeated on every page)
  header = {
    { field = "id",     label = "Ref." },
    { field = "status", label = "Status" },
  },
  -- optional table at the top of page 1 ({} = none)
  infoTable = {},

  logo = nil,                               -- e.g. "Assets/logo.png" (png, jpg, svg, webp, gif)
  extraCss = nil,                           -- e.g. "Assets/my-print.css" or a list of paths
  css = nil,                                -- replace the base stylesheet entirely

  footerNote = "Uncontrolled copy when printed",
  printedOnLabel = "Printed on",
  pageLabel = "Page",
  watermarks = { draft = "DRAFT" },         -- lower-case status value -> watermark text
  fileName = "{id} - {title}",              -- suggested PDF name; {field} placeholders
  hideFirstH1 = true,

  lang = "en",                              -- <html lang>
  locale = "en-GB",                         -- print date format
  toolbarButton = "Print / PDF",
  toolbarHint = "Destination: Save as PDF — untick “Headers and footers”",
})
```

### Styling
The base stylesheet uses CSS variables. Create your own stylesheet (anywhere in your space, **outside** `Library/` so updates never overwrite it), reference it with `extraCss`, and override what you need:

```css
:root {
  --pp-primary: #0a3d62;
  --pp-accent: #f2a900;
  --pp-font: Georgia, serif;
}
```
Do not declare `@page { size: … }` in your stylesheet: the page size is set by the command.

### Example: quality documents
Front matter of a controlled document:
```yaml
---
title: Hazardous waste management
id: PROC-042
site: [Plant A, Plant B]
issue_date: "2026-11-06"
issued_by: J. Smith
status: draft
orientation: landscape
---
```
Configuration:
```lua
config.set("pagedPrint", {
  header = {
    { field = "id",         label = "Ref." },
    { field = "site",       label = "Sites" },
    { field = "issue_date", label = "Issued on" },
    { field = "issued_by",  label = "Issued by" },
    { field = "status",     label = "Status" },
  },
  logo = "Assets/logo.png",
  extraCss = "Assets/print-branding.css",
  footerNote = "Uncontrolled copy when printed",
  printedOnLabel = "Printed on",
  watermarks = { draft = "DRAFT", obsolete = "OBSOLETE" },
  fileName = "{id} - {issue_date} - {title}",
  lang = "en", locale = "en-GB",
  toolbarButton = "Print / PDF",
  toolbarHint = "Destination: Save as PDF — untick “Headers and footers”",
})
```
`title`, `status` and `orientation` are read from the default field names. If your documents use other names (or another language), map them with `fields` and `landscapeValues`, e.g. `fields = { title = "titre", status = "statut" }`, `landscapeValues = { "paysage" }`. Every label can be translated too (`lang = "fr", locale = "fr-FR"`…).

## Files
* `paged-print.css` — base print layout.
* `paged-print-tables.js` — repeats table header rows across pages.
* `paged-print-open.js` — opens the print view without writing to the space.
* `paged-print-pagedjs-0.4.3.js` — [Paged.js](https://pagedjs.org) 0.4.3, MIT License, see https://gitlab.coko.foundation/pagedjs/pagedjs, unmodified.

## Implementation

```space-lua
-- Paged Print ---------------------------------------------------------
local BASE = "Library/JmiXIII/"

local DEFAULTS = {
  css = BASE .. "paged-print.css",
  pageSize = "A4",
  fields = { title = "title", status = "status", orientation = "orientation" },
  landscapeValues = { "landscape" },
  header = {
    { field = "id", label = "Ref." },
    { field = "status", label = "Status" },
  },
  infoTable = {},
  footerNote = "Uncontrolled copy when printed",
  printedOnLabel = "Printed on",
  pageLabel = "Page",
  watermarks = { draft = "DRAFT" },
  fileName = "{id} - {title}",
  hideFirstH1 = true,
  lang = "en",
  locale = "en-GB",
  toolbarButton = "Print / PDF",
  toolbarHint = "Destination: Save as PDF — untick “Headers and footers”",
}

local MIMES = {
  png = "image/png", jpg = "image/jpeg", jpeg = "image/jpeg", gif = "image/gif",
  svg = "image/svg+xml", webp = "image/webp", css = "text/css", js = "text/javascript",
}

local function opt(cfg, key)
  local v = cfg[key]
  if v == nil then return DEFAULTS[key] end
  return v
end

local function fieldName(cfg, key)
  local f = cfg.fields
  if f and f[key] then return f[key] end
  return DEFAULTS.fields[key]
end

-- HTML escape
local function esc(s)
  s = tostring(s)
  s = s:gsub("&", "&amp;")
  s = s:gsub("<", "&lt;")
  s = s:gsub(">", "&gt;")
  s = s:gsub('"', "&quot;")
  return s
end

-- Quoted string for CSS or JS
local function quoted(s)
  s = tostring(s)
  s = s:gsub("\\", "\\\\")
  s = s:gsub('"', '\\"')
  s = s:gsub("\r?\n", " ")
  s = s:gsub("</", "<\\/")
  return '"' .. s .. '"'
end

-- Text value of a front matter field (lists joined with commas)
local function value(fm, field)
  local v = fm[field]
  if v == nil then return "" end
  if type(v) == "table" then
    local parts = {}
    for _, x in ipairs(v) do table.insert(parts, tostring(x)) end
    return table.concat(parts, ", ")
  end
  return tostring(v)
end

local function rows(fm, list)
  local html = ""
  for _, e in ipairs(list or {}) do
    html = html .. "<tr><th>" .. esc(e.label or e.field) .. "</th><td>"
      .. esc(value(fm, e.field)) .. "</td></tr>"
  end
  return html
end

-- Removes empty table rows and SilverBullet-specific rows (<meta core.table …>)
local function cleanRows(html)
  return (html:gsub("(<tr[^>]*>.-</tr>)", function(row)
    if row:find("core%.table") then return "" end
    local txt = row:gsub("<[^>]+>", "")
    txt = txt:gsub("&nbsp;", "")
    txt = txt:gsub("%s", "")
    if txt == "" then return "" end
    return row
  end))
end

-- Space file -> data URL (embedded in the page: no later request)
local function dataUrl(path)
  local ext = (path:match("%.(%w+)$") or ""):lower()
  return "data:" .. (MIMES[ext] or "application/octet-stream") .. ";base64,"
    .. encoding.base64Encode(space.readFile(path))
end

local function asList(v)
  if v == nil then return {} end
  if type(v) == "table" then return v end
  return { v }
end

command.define {
  name = "Paged Print: Print document (PDF)",
  key = "Ctrl-Alt-q",
  run = function()
    pcall(editor.save) -- silently fails in read-only mode
    local cfg = config.get("pagedPrint") or {}
    local fs = system.getURLPrefix() .. ".fs/"
    local helpers = js.importFromSpace(BASE .. "paged-print-open.js")

    local text = editor.getText()
    local fm = (index.extractFrontmatter(text)).frontmatter or {}
    local pageName = editor.getCurrentPage()

    -- Body without front matter and HTML comments
    local body = text:gsub("^%-%-%-\r?\n.-\r?\n%-%-%-[ \t]*\r?\n", "", 1)
    body = body:gsub("<!%-%-.-%-%->", "")

    -- Title: front matter > first # heading > page name
    local h1 = body:match("^#%s+([^\r\n]+)") or body:match("\n#%s+([^\r\n]+)")
    local title = tostring(fm[fieldName(cfg, "title")] or h1 or pageName:match("([^/]+)$"))

    -- Markdown -> HTML (transclusions and Lua directives expanded)
    local html = markdown.markdownToHtml(body, { expand = true })
    html = cleanRows(html)
    html = html:gsub("<meta[^>]*>", "")
    if opt(cfg, "hideFirstH1") and h1 and string.trim(h1) == string.trim(title) then
      html = html:gsub("<h1[^>]*>.-</h1>", "", 1)
    end
    -- Embed space images (fallback: absolute link)
    html = html:gsub('src="/?%.fs/([^"]+)"', function(p)
      local ok, d = pcall(function() return dataUrl(helpers.decodePath(p)) end)
      if ok and d then return 'src="' .. d .. '"' end
      return 'src="' .. fs .. p .. '"'
    end)

    -- Suggested PDF file name
    local fileName = opt(cfg, "fileName"):gsub("{([%w_]+)}", function(k)
      if k == "title" or k == fieldName(cfg, "title") then return title end
      return value(fm, k)
    end)
    fileName = fileName:gsub('[\\/:%*%?"<>|]', "-")
    fileName = fileName:gsub("%s+%-%s+%-%s+", " - ") -- empty field
    fileName = fileName:gsub("^%s*%-%s*", "")
    fileName = fileName:gsub("%s*%-%s*$", "")

    -- Document-dependent styles (page size is ONLY declared here)
    local orientation = "portrait"
    local o = value(fm, fieldName(cfg, "orientation")):lower()
    for _, v in ipairs(opt(cfg, "landscapeValues") or {}) do
      if o == tostring(v):lower() then orientation = "landscape" end
    end
    local docStyle = "@page { size: " .. opt(cfg, "pageSize") .. " " .. orientation .. "; }\n"
      .. ":root { --pp-page-label: " .. quoted(opt(cfg, "pageLabel")) .. "; }\n"
    local bodyClass = ""
    local watermark = (opt(cfg, "watermarks") or {})[value(fm, fieldName(cfg, "status")):lower()]
    if watermark then
      docStyle = docStyle .. ":root { --pp-watermark: " .. quoted(watermark) .. "; }\n"
      bodyClass = "pp-watermark"
    end

    -- Stylesheets: base (or replacement) + extra
    local links = '<link rel="stylesheet" href="' .. dataUrl(opt(cfg, "css")) .. '">\n'
    for _, p in ipairs(asList(cfg.extraCss)) do
      links = links .. '<link rel="stylesheet" href="' .. dataUrl(p) .. '">\n'
    end

    -- Header
    local logoCell = ""
    if cfg.logo then
      logoCell = '<td class="pp-logo"><img src="' .. dataUrl(cfg.logo) .. '" alt="logo"></td>'
    end
    local infoRows = rows(fm, opt(cfg, "header"))
    local infoCell = ""
    if infoRows ~= "" then
      infoCell = '<td class="pp-info"><table>' .. infoRows .. "</table></td>"
    end
    local infoTable = rows(fm, opt(cfg, "infoTable"))
    if infoTable ~= "" then
      infoTable = '<table class="pp-info-table">' .. infoTable .. "</table>"
    end
    local note = ""
    if opt(cfg, "footerNote") and opt(cfg, "footerNote") ~= "" then
      note = '<span class="pp-note">' .. esc(opt(cfg, "footerNote")) .. "</span><br>"
    end

    local page = [[
<!DOCTYPE html>
<html lang="]] .. esc(opt(cfg, "lang")) .. [[">
<head>
<meta charset="UTF-8">
<title>]] .. esc(fileName) .. [[</title>
<style>
/* declared BEFORE the stylesheets on purpose (Paged.js) */
]] .. docStyle .. [[
</style>
]] .. links .. [[
<script>
window.PagedConfig = {
  after: function () {
    var bar = document.createElement("div");
    bar.className = "pp-toolbar";
    var btn = document.createElement("button");
    btn.textContent = ]] .. quoted(opt(cfg, "toolbarButton")) .. [[;
    btn.onclick = function () { window.print(); };
    var hint = document.createElement("span");
    hint.textContent = ]] .. quoted(opt(cfg, "toolbarHint")) .. [[;
    bar.appendChild(btn);
    bar.appendChild(hint);
    document.body.appendChild(bar);
  }
};
</script>
<script src="]] .. dataUrl(BASE .. "paged-print-pagedjs-0.4.3.js") .. [["></script>
<script src="]] .. dataUrl(BASE .. "paged-print-tables.js") .. [["></script>
</head>
<body class="]] .. bodyClass .. [[">
<div class="pp-header">
  <table class="pp-header-grid"><tr>
    ]] .. logoCell .. [[
    <td class="pp-title">]] .. esc(title) .. [[</td>
    ]] .. infoCell .. [[
  </tr></table>
</div>
<div class="pp-footer">
  ]] .. note .. esc(opt(cfg, "printedOnLabel")) .. [[ <span id="pp-date"></span>
</div>
]] .. infoTable .. [[
<div class="pp-content">
]] .. html .. [[
</div>
<script>
document.getElementById("pp-date").textContent = new Date().toLocaleDateString(]] .. quoted(opt(cfg, "locale")) .. [[);
</script>
</body>
</html>
]]

    if helpers.openHtml(page) then
      editor.flashNotification("Print view opened in a new tab")
    else
      editor.flashNotification("Tab blocked: allow pop-ups for this site, then run the command again", "error")
    end
  end
}
```
