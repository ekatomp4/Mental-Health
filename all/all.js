import CONFIG from "../CONFIG.js";

// loaders

function insertNav() {
	const nav = document.createElement("nav");
	nav.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div class="container">
            <a class="navbar-brand fw-bold" href="#">MentalPanda</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="mainNav">
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li class="nav-item"><a class="nav-link" onclick="routeTo('home')">Home</a></li>
                    <li class="nav-item"><a class="nav-link" onclick="routeTo('blogs')">Blogs</a></li>
                    <li class="nav-item"><a class="nav-link" onclick="routeTo('about')">About</a></li>
                </ul>
            </div>
        </div>
    </nav>
    `;
	document.body.prepend(nav);
}

function insertAll() {
	var link = document.createElement("link");
	link.rel = "stylesheet";
	link.type = "text/css";
	link.href = "../../all/all.css";
	document.getElementsByTagName("head")[0].appendChild(link);
}

function injectBootstrap() {
	// css
	const BSLink = document.createElement("link");
	BSLink.rel = "stylesheet";
	BSLink.type = "text/css";
	BSLink.href =
		"https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
	document.getElementsByTagName("head")[0].appendChild(BSLink);
	// script
	const BSScript = document.createElement("script");
	BSScript.src =
		"https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js";
	document.getElementsByTagName("body")[0].appendChild(BSScript);
}

// MAIN LOADER

function loadFonts() {
	const LINKS = CONFIG.LINKS;

	LINKS.forEach((link) => {
		const LINK = document.createElement("link");

		for (const [key, value] of Object.entries(link)) {
			LINK[key] = value;
		}

		document.getElementsByTagName("head")[0].appendChild(LINK);
	});
}

function insertLoader() {
	const loaderDiv = document.createElement("div");
	loaderDiv.id = "loader";

	const loaderStyle = document.createElement("style");
	loaderStyle.innerHTML = `
    #loader {
        transition: all 0.5s ease-in-out;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: white;
        z-index: 9999;
        pointer-events: none;
    }
    .hidden {
        pointer-events: none;
        opacity: 0;
    }
    `;

	document.body.prepend(loaderDiv);
	document.head.appendChild(loaderStyle);
}

function loadPage() {
	insertLoader();

	try {
		insertNav();

		loadFonts();

		injectBootstrap();

		insertAll();
	} catch (error) {
		throw `Error loading loader module: ${error}`;
	}

	console.log("loaded");

	const loaderDiv = document.getElementById("loader");
	setTimeout(() => {
		loaderDiv.classList.add("hidden");
	}, 100);
	setTimeout(() => {
		loaderDiv.remove();
	}, 5000);
}

loadPage();

// ROUTER

let currentRoute =
	window.location.pathname.split("/").pop().replace(".html", "") || "index";
console.log("Current route:", currentRoute);

const PATHS = CONFIG.PATHS;
window.routeTo = (name) => {
	if (name === "index") {
		name = "home";
	}

	if (!PATHS.includes(name)) {
		throw new Error(`Route ${name} does not exist`);
	}

	if (name === currentRoute) {
		console.log(`Route ${name} already loaded`);
		return;
	}

	const resolvedPath = `../../pages/${name}`;
	window.location.replace(resolvedPath);
};
