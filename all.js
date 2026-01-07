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

async function loadPage(page) {
  const container = pageContainerElements[page.name];

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
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `${page.pagePath}/styles.css`;
      link.dataset.page = page.name;
      document.head.appendChild(link);
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
