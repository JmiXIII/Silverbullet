/* Paged Print — repeat table header rows across pages (Paged.js handler)
 * Part of Library/JmiXIII/PagedPrint — MIT License
 *
 * Tables stay in the normal flow at their position. When a table continues
 * on a new page, its header row is copied to the top of the continued
 * fragment BEFORE the page is measured, so its height is accounted for.
 * Works with <thead>, or with a first row made only of <th> cells.
 */
(function () {
  function headerOf(sourceTable) {
    var thead = sourceTable.querySelector(":scope > thead");
    if (thead) return thead;
    var first = sourceTable.querySelector("tr");
    if (first && first.children.length &&
        Array.prototype.every.call(first.children, function (c) { return c.nodeName === "TH"; })) {
      return first;
    }
    return null;
  }

  class PagedPrintRepeatTableHeaders extends Paged.Handler {
    renderNode(clone, node) {
      if (!clone || clone.nodeType !== 1 || clone.nodeName !== "TR") return;
      if (clone.closest("thead")) return;

      var table = clone.closest("table");
      if (!table || !table.hasAttribute("data-split-from")) return; // not a continued table
      if (table.querySelector(".pp-repeated-header")) return;        // already done on this page

      var source = node.closest("table");
      var header = source && headerOf(source);
      if (!header || header === node || header.contains(node)) return;

      var copy = header.cloneNode(true);
      if (copy.nodeName === "TR") {
        var t = document.createElement("thead");
        t.appendChild(copy);
        copy = t;
      }
      copy.removeAttribute("data-ref");
      copy.querySelectorAll("[data-ref]").forEach(function (e) { e.removeAttribute("data-ref"); });
      copy.classList.add("pp-repeated-header");
      table.insertBefore(copy, table.firstChild);
    }
  }

  Paged.registerHandlers(PagedPrintRepeatTableHeaders);
})();
