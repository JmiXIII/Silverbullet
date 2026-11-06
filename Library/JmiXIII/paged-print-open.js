// Paged Print — browser helpers
// Part of Library/JmiXIII/PagedPrint — MIT License
//
// Opens the generated HTML in a new tab WITHOUT writing anything to the space,
// so printing works for read-only visitors, on read-only pages and offline.
export function openHtml(html) {
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const win = window.open(url, "_blank");
  // free memory after 10 minutes (the opened tab keeps its content)
  setTimeout(() => URL.revokeObjectURL(url), 10 * 60 * 1000);
  return win ? true : false;
}

// Decodes a URL path (%20, accents…) into a space file name
export function decodePath(path) {
  try { return decodeURIComponent(path); } catch (e) { return path; }
}
