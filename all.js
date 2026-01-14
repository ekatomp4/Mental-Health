import { CONFIG } from "./config.js";

window.MentalPanda = new (class MentalPanda {
  constructor() {
    this.config = CONFIG;
    this.pageCache = {};
  }
})();

function fixPathname(pathname) {
  if (pathname.endsWith("/") && pathname !== "/") return pathname.slice(0, -1);

  return pathname;
}

const app = document.getElementById("app");

const pageContainerElements = {};
const pageLoaded = {}; // tracks whether page was already fetched

for (const page of CONFIG.pages) {
  const el = document.createElement("div");
  el.id = "page-" + page.name;
  el.classList.add("hidden");

  pageContainerElements[page.name] = el;
  pageLoaded[page.name] = false;

  // append underneath app as sibling
  app.parentNode.insertBefore(el, app.nextSibling);
}

function hideAllPages() {
  for (const name in pageContainerElements) {
    pageContainerElements[name].classList.add("hidden");
  }
}

function disableAllPageStyles(except) {
  document
    .querySelectorAll('link[data-page]')
    .forEach(link => {
      if (link.dataset.page === except) return;
      link.disabled = true;
    });
}

function enablePageStyles(pageName) {
  document
    .querySelectorAll(`link[data-page="${pageName}"]`)
    .forEach(link => {
      link.disabled = false;
    });
}

function prependCSS(css, prefix) {
  // Remove comments
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');

  const result = [];
  let i = 0;

  while (i < css.length) {
    // Skip whitespace
    if (/\s/.test(css[i])) {
      i++;
      continue;
    }

    // Check for @media or @keyframes or other at-rules
    const character = css.slice(i, i + 1);
    if (character=== '@' || css.slice(i, i + 4) === ':root') {
      // Find the full media block
      const start = i;
      let braceCount = 0;
      let j = css.indexOf('{', i);
      braceCount++;
      j++;

      while (braceCount > 0 && j < css.length) {
        if (css[j] === '{') braceCount++;
        if (css[j] === '}') braceCount--;
        j++;
      }

      const mediaBlock = css.slice(start, j);
      // Split into header and inner content
      const headerEnd = mediaBlock.indexOf('{');
      const header = mediaBlock.slice(0, headerEnd + 1);
      const inner = mediaBlock.slice(headerEnd + 1, -1);
      const innerPrefixed = prependCSS(inner, prefix);
      result.push(`${header}\n${innerPrefixed}\n}`);
      i = j;
      continue;
    }

    // Otherwise, parse normal selector block
    const nextOpen = css.indexOf('{', i);
    if (nextOpen === -1) break;
    const nextClose = findMatchingBrace(css, nextOpen);
    if (nextClose === -1) break;

    const selectorText = css.slice(i, nextOpen).trim();
    const bodyText = css.slice(nextOpen + 1, nextClose).trim();

    const selectors = selectorText
      .split(',')
      .map(sel => sel.trim())
      .filter(Boolean)
      .map(sel => `${prefix} ${sel}`)
      .join(', ');

    result.push(`${selectors} { ${bodyText} }`);

    i = nextClose + 1;
  }

  return result.join('\n');
}

/**
 * Find matching closing brace for a given opening brace index
 * @param {string} str
 * @param {number} start
 * @returns {number} index of matching }
 */
function findMatchingBrace(str, start) {
  let count = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === '{') count++;
    if (str[i] === '}') count--;
    if (count === 0) return i;
  }
  return -1;
}

async function loadPage(page) {
  const container = pageContainerElements[page.name];

  // enablePageStyles(page.name);
  // disableAllPageStyles(page.name);

  // page already loaded → just show it
  if (pageLoaded[page.name]) {
    hideAllPages();
    container.classList.remove("hidden");

    window.history.replaceState({}, "", page.paths?.[0] || "/");
    document.title = page.title ?? `${page.name} - MentalPanda`;
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    return;
  }
  
  try {
    console.log(`Loading page ${page.name}`);
    const res = await fetch(`${page.pagePath}/index.html`);
    const html = await res.text();

    hideAllPages();

    // inject HTML once
    container.innerHTML = html;
    container.classList.remove("hidden");

    // inject CSS once
    if (page.hasCss) {
      try {
        const res = await fetch(`${page.pagePath}/styles.css`);
        if (!res.ok) throw new Error(`Failed to fetch CSS: ${page.pagePath}/styles.css`);

        const cssText = await res.text();

        // Optionally scope it to the page container
        const scopedCSS = prependCSS(cssText, `#page-${page.name}`);

        const style = document.createElement("style");
        style.dataset.page = page.name;
        style.textContent = scopedCSS;

        // prepend to head so it has higher priority
        document.head.prepend(style);
      } catch (err) {
        console.error(err);
      }
    }

    // inject JS once
    if (page.hasJs) {
      // DO NOT LINK, THE CACHING WILL NOT RUN IT TWICE
      const filePath = `${page.pagePath}/script.js`;
      const js = await fetch(filePath).then(r => r.text());

      const script = document.createElement("script");
      script.type = "module";
      script.dataset.page = page.name;
      script.textContent = js;

      container.appendChild(script);
    }

    pageLoaded[page.name] = true;

    window.history.replaceState({}, "", page.paths?.[0] || "/");
    document.title = page.title ?? `${page.name} - MentalPanda`;
    document.body.scrollTop = document.documentElement.scrollTop = 0;

  } catch (err) {
    console.error(err);
  }
}

function loadPageByPath(path) {
  const pathname = fixPathname(path);

  const route = window.MentalPanda.config.pages.find((page) => {
    return page.paths && page.paths.includes(pathname);
  });

  if (!route) return;
  loadPage(route);
}
window.loadPageByPath = loadPageByPath;

function createNavLink(entry) {
  const li = document.createElement("li");
  li.className = "nav-item";

  const a = document.createElement("a");
  a.className = "nav-link";
  a.textContent = entry.label;
  a.href = entry.to;

  a.addEventListener("click", function (e) {
    e.preventDefault();
    loadPageByPath(entry.to);
  });

  li.appendChild(a);
  return li;
}

document.addEventListener("DOMContentLoaded", function () {
  const mainNavItems = document.getElementById("mainNavItems");

  window.MentalPanda.config.nav.forEach((entry) => {
    mainNavItems.appendChild(createNavLink(entry));
  });

  loadPageByPath(window.location.pathname);
});

window.loadPage = loadPage;
window.loadPageByPath = loadPageByPath;