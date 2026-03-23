import { CONFIG } from "./config.js";

window.MentalPanda = new (class MentalPanda {
	constructor() {
		this.config = CONFIG;
		this.pageCache = {};
		this.user = null;
		this.userLoadPromise = null;
		this.socket = null;
		this.socketConnectPromise = null;

		if (localStorage.getItem("token")) {
			this.userLoadPromise = this.loadUser();
		}
	}

	async loadUser() {
		const token = localStorage.getItem("token");
		if (!token) {
			this.user = null;
			this.disconnectSocket();
			return null;
		}

		try {
			const res = await this.fetch("/api/user");
			if (!res.ok) {
				localStorage.removeItem("token");
				this.user = null;
				this.disconnectSocket();
				return null;
			}

			const data = await res.json();
			this.user = data.user;
			return this.user;
		} catch {
			this.user = null;
			this.disconnectSocket();
			return null;
		}
	}

	async fetch(url, options = {}) {
		const token = localStorage.getItem("token");
		const headers = new Headers(options.headers || {});

		if (token) {
			headers.set("Authorization", token);
		}

		if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
			headers.set("Content-Type", "application/json");

			options.body = JSON.stringify(options.body);
		}

		return fetch(url, { ...options, headers });
	}

	async connectSocket() {
		const token = localStorage.getItem("token");
		if (!token) {
			return null;
		}

		if (this.socket?.connected) {
			return this.socket;
		}

		if (this.socketConnectPromise) {
			return this.socketConnectPromise;
		}

		if (!this.user) {
			if (this.userLoadPromise) {
				await this.userLoadPromise;
			} else {
				this.userLoadPromise = this.loadUser();
				await this.userLoadPromise;
			}
		}

		if (!this.user) {
			return null;
		}

		if (typeof window.loadSocketIO !== "function") {
			throw new Error("Socket.IO loader is not available.");
		}

		await window.loadSocketIO();

		if (typeof window.io !== "function") {
			throw new Error("Socket.IO client failed to load.");
		}

		this.socketConnectPromise = new Promise((resolve, reject) => {
			const socket = window.io({
				path: "/gateway",
				auth: { token },
				extraHeaders: { authorization: token }
			});

			const onConnect = () => {
				cleanup();
				this.socket = socket;
				resolve(socket);
			};

			const onConnectError = (error) => {
				cleanup();
				socket.disconnect();
				this.socket = null;
				reject(error);
			};

			const cleanup = () => {
				socket.off("connect", onConnect);
				socket.off("connect_error", onConnectError);
				this.socketConnectPromise = null;
			};

			socket.once("connect", onConnect);
			socket.once("connect_error", onConnectError);
		});

		return this.socketConnectPromise;
	}

	disconnectSocket() {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}

		this.socketConnectPromise = null;
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
		if (character === '@' || css.slice(i, i + 4) === ':root') {
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

async function ensureUserState() {
	if (window.MentalPanda.userLoadPromise) {
		await window.MentalPanda.userLoadPromise;
	} else if (localStorage.getItem("token")) {
		window.MentalPanda.userLoadPromise = window.MentalPanda.loadUser();
		await window.MentalPanda.userLoadPromise;
	}

	return window.MentalPanda.user;
}

async function resolveProtectedRoute(page) {
	const user = await ensureUserState();

	if (page.name === "Chat" && !user) {
		return window.MentalPanda.config.pages.find((route) => route.name === "Auth") || page;
	}

	if (page.name === "Auth" && user) {
		return window.MentalPanda.config.pages.find((route) => route.name === "Settings") || page;
	}

	return page;
}

async function loadPage(page) {
	page = await resolveProtectedRoute(page);
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

		window.history.pushState({}, "", page.paths?.[0] || "/");
		// window.history.replaceState({}, "", page.paths?.[0] || "/");
		document.title = page.title ?? `${page.name} - MentalPanda`;
		document.body.scrollTop = document.documentElement.scrollTop = 0;

	} catch (err) {
		console.error(err);
	}
}

// KEEP for old code
function loadPageByPath(path) {
	const pathname = fixPathname(path);

	const route = window.MentalPanda.config.pages.find((page) => {
		return page.paths && page.paths.includes(pathname);
	});

	if (!route) return;
	loadPage(route);
}

// new loading function
function loadPageByQueryOrPath() {
	// Check ?page=name query param first (set by backend redirect)
	const params = new URLSearchParams(window.location.search);
	const pageQuery = params.get("page");
	// console.log("pageQuery:", pageQuery); // check this in browser console


	if (pageQuery) {
		const route = window.MentalPanda.config.pages.find(
			(page) => page.name.toLowerCase() === pageQuery.toLowerCase()
		);
		if (route) {
			loadPage(route);
			return;
		}
	}

	// Fallback: match by pathname (e.g. /about)
	loadPageByPath(window.location.pathname);
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

document.addEventListener("DOMContentLoaded", async function () {
	const mainNavItems = document.getElementById("mainNavItems");

	window.MentalPanda.config.nav.forEach((entry) => {
		mainNavItems.appendChild(createNavLink(entry));
	});

	await ensureUserState();

	const accountBtn = document.getElementById("navbarUser") || document.getElementById("accountBtn");
	if (accountBtn) {
		accountBtn.addEventListener("click", () => {
			if (window.MentalPanda.user) {
				loadPageByPath("/settings");
			} else {
				loadPageByPath("/auth");
			}
		});
	}

	// loadPageByPath(window.location.pathname);
	loadPageByQueryOrPath();
});

window.loadPage = loadPage;
window.loadPageByPath = loadPageByPath;
