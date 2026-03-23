

//  Helpers 

function distanceBetweenPoints(lat1, lng1, lat2, lng2) {
  const R = 3959; // miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const lat1Rad = lat1 * (Math.PI / 180);
  const lat2Rad = lat2 * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function setStatus(msg) {
  document.getElementById("search-status").textContent = msg;
}

function setSpinner(visible) {
  document.getElementById("spinner").style.display = visible ? "flex" : "none";
}


//  Zip → Lat/Lng via Nominatim

async function geocodeZip(zip, city, state) {
  // Build the best query we can from whatever the user gave us
  let q = zip || "";
  if (city) q += (q ? ", " : "") + city;
  if (state) q += (q ? ", " : "") + state;
  q += ", USA";

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=us`;

  const res = await fetch(url, {
    headers: { "Accept-Language": "en" }
  });

  if (!res.ok) throw new Error("Geocoding request failed.");

  const data = await res.json();
  if (!data.length) throw new Error(`Could not find a location for "${q}". Please check your zip code.`);

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name
  };
}


// Build Overpass Query by Care Type 

function buildOverpassQuery(lat, lng, careType) {
  const radius = 20000; // 20 km

  // Tag sets for each care type
  const tagSets = {
    therapist: [
      `node["healthcare"="psychologist"]`,
      `node["office"="therapist"]`,
      `node["office"="psychologist"]`,
      `way["healthcare"="psychologist"]`,
      `way["office"="therapist"]`,
      `way["office"="psychologist"]`,
    ],
    clinic: [
      `node["amenity"="clinic"]`,
      `node["healthcare"="clinic"]`,
      `way["amenity"="clinic"]`,
      `way["healthcare"="clinic"]`,
    ],
    mental_health: [
      `node["healthcare"="mental_health"]`,
      `node["amenity"="mental_health"]`,
      `way["healthcare"="mental_health"]`,
      `way["amenity"="mental_health"]`,
    ],
    any: [
      `node["healthcare"="mental_health"]`,
      `node["healthcare"="psychologist"]`,
      `node["office"="therapist"]`,
      `node["office"="psychologist"]`,
      `node["amenity"="clinic"]`,
      `way["healthcare"="mental_health"]`,
      `way["healthcare"="psychologist"]`,
      `way["office"="therapist"]`,
      `way["office"="psychologist"]`,
      `way["amenity"="clinic"]`,
    ]
  };

  const selected = tagSets[careType] || tagSets["any"];
  const lines = selected.map(tag => `  ${tag}(around:${radius},${lat},${lng});`).join("\n");

  return `
[out:json][timeout:100];
(
${lines}
);
out center tags 20;
  `.trim();
}


//  Query Overpass 

async function queryOverpass(lat, lng, careType) {
  const query = buildOverpassQuery(lat, lng, careType);

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: query
  });

  if (!res.ok) throw new Error("Could not reach the provider database. Please try again.");

  const data = await res.json();
  if (!data.elements?.length) return [];

  return data.elements
    .map(el => {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      if (elLat == null || elLng == null) return null;

      const tags = el.tags || {};

      // Pick the best label for care type
      const careLabel =
        tags.healthcare === "mental_health" ? "Mental Health Center" :
        tags.healthcare === "psychologist" ? "Psychologist" :
        tags.office === "therapist" ? "Therapist" :
        tags.office === "psychologist" ? "Psychologist" :
        tags.amenity === "clinic" ? "Clinic" :
        "Mental Health Provider";

      return {
        name: tags.name || "Unnamed Provider",
        careLabel,
        phone: tags.phone || tags["contact:phone"] || null,
        website: tags.website || tags["contact:website"] || null,
        address: [
          tags["addr:housenumber"],
          tags["addr:street"],
          tags["addr:city"],
          tags["addr:state"],
          tags["addr:postcode"]
        ].filter(Boolean).join(" ") || null,
        lat: elLat,
        lng: elLng,
        distance: distanceBetweenPoints(lat, lng, elLat, elLng)
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance);
}


//  Render Results 

function renderResults(results) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!results.length) {
    resultsDiv.innerHTML = `
      <div class="col-12 text-center text-muted py-4">
        <i class="bi bi-emoji-frown fs-2 d-block mb-2"></i>
        No providers found within 12 miles. Try a nearby zip code or broaden your search type.
      </div>`;
    return;
  }

  results.forEach(r => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`;

    const phoneLine = r.phone
      ? `<p class="card-text mb-1">
           <i class="bi bi-telephone-fill text-success me-1"></i>
           <a href="tel:${r.phone.replace(/\D/g, '')}" class="text-decoration-none">${r.phone}</a>
         </p>`
      : "";

    const addressLine = r.address
      ? `<p class="card-text mb-1 text-muted small">
           <i class="bi bi-geo-alt-fill me-1"></i>${r.address}
         </p>`
      : "";

    const websiteBtn = r.website
      ? `<a href="${r.website}" target="_blank" rel="noopener" class="btn btn-outline-success btn-sm me-2">
           <i class="bi bi-globe me-1"></i>Website
         </a>`
      : "";

    resultsDiv.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm border-0 rounded-4" style="background-color:#e8f5ee;">
          <div class="card-body d-flex flex-column justify-content-between">
            <div>
              <span class="badge bg-success mb-2">${r.careLabel}</span>
              <h5 class="card-title fw-bold text-success">${r.name}</h5>
              ${addressLine}
              ${phoneLine}
              <p class="card-text text-muted small mt-1">
                <i class="bi bi-signpost-2-fill me-1"></i>${r.distance.toFixed(1)} miles away
              </p>
            </div>
            <div class="mt-3">
              ${websiteBtn}
              <a href="${mapsUrl}" target="_blank" rel="noopener" class="btn btn-outline-primary btn-sm">
                <i class="bi bi-map me-1"></i>View on Map
              </a>
            </div>
          </div>
        </div>
      </div>`;
  });
}


// Main: Form Submit Handler

document.getElementById("provider-search-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const zip      = document.getElementById("search-zip").value.trim();
  const city     = document.getElementById("search-city").value.trim();
  const state    = document.getElementById("search-state").value;
  const careType = document.getElementById("search-care-type").value;

  // Need at least a zip or city+state
  if (!zip && !(city && state)) {
    setStatus("Please enter a zip code, or both a city and state.");
    return;
  }

  setStatus("Looking up your location…");
  setSpinner(true);
  document.getElementById("results").innerHTML = "";

  try {
    const { lat, lng } = await geocodeZip(zip, city, state);

    setStatus("Searching for providers near you…");

    const results = await queryOverpass(lat, lng, careType);

    setSpinner(false);
    setStatus(results.length
      ? `Found ${results.length} provider${results.length !== 1 ? "s" : ""} near you.`
      : "");

    renderResults(results);

  } catch (err) {
    setSpinner(false);
    setStatus(`⚠️ ${err.message}`);
    console.error(err);
  }
});





/*async function queryOverpass(lat, lng) {
  const radius = 20000; // 20km — REQUIRED for real data

  const query = `
    [out:json][timeout:100];
    (
      node["healthcare"="mental_health"](around:${radius},${lat},${lng});
      node["healthcare"="psychologist"](around:${radius},${lat},${lng});
      node["office"="therapist"](around:${radius},${lat},${lng});
      node["office"="psychologist"](around:${radius},${lat},${lng});
      node["amenity"="clinic"](around:${radius},${lat},${lng});

      way["healthcare"="mental_health"](around:${radius},${lat},${lng});
      way["healthcare"="psychologist"](around:${radius},${lat},${lng});
      way["office"="therapist"](around:${radius},${lat},${lng});
      way["office"="psychologist"](around:${radius},${lat},${lng});
      way["amenity"="clinic"](around:${radius},${lat},${lng});
    );
    out center tags 10;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: query
  });

  if (!response.ok) {
    throw new Error("Overpass request failed");
  }

  const data = await response.json();

  if (!data.elements || !data.elements.length) {
    return [];
  }

  return normalizeOverpassResults(data.elements, lat, lng);
}

function normalizeOverpassResults(elements, userLat, userLng) {
  return elements
    .map(el => {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (lat == null || lng == null) return null;

      return {
        name: el.tags?.name || "Unnamed therapy office",
        lat,
        lng,
        distance: distanceBetweenPoints(userLat, userLng, lat, lng)
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance);
}

function distanceBetweenPoints(lat1, lng1, lat2, lng2) {
  const R = 3959; // miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const lat1Rad = lat1 * (Math.PI / 180);
  const lat2Rad = lat2 * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
    Math.cos(lat2Rad) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


/* this is a comment {
    "name": "Independence Urgent Care",
    "lat": 41.3982374,
    "lng": -81.6604112,
    "distance": 3.891448867966036
}


const resultsDiv = document.getElementById("results");
function loadResults(results) {
  resultsDiv.innerHTML = "";

  if (!results.length) {
    resultsDiv.textContent = "No nearby therapists found.";
    return;
  }

  results.forEach(r => {
    const div = document.createElement("div");
    const p = document.createElement("p");
    div.classList.add("result");
    p.textContent = `${r.name} — ${r.distance.toFixed(1)} miles away`;
    const link = document.createElement("a");
    link.href = `https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`;
    link.textContent = "View on Google Maps";
    div.appendChild(p);
    div.appendChild(link);
    resultsDiv.appendChild(div);
  });
}


async function findNearbyTherapyOffices() {

  try {
    document.body.style.cursor = "wait";

    console.log("Finding nearby therapy offices...");

    if (!navigator.geolocation) {
      throw new Error("Geolocation not supported");
    }

    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const overpassResults = await queryOverpass(lat, lng);

    console.log(overpassResults);

    loadResults(overpassResults);

    document.body.style.cursor = "default";

    return overpassResults;
  } catch (error) {
    console.error(error);
    alert(`An error occurred while finding nearby therapy offices. ${error.message}`);
    document.body.style.cursor = "default";
  }
}



// findNearbyTherapyOffices()
//   .then(results => {
//     console.log(results);
//   })
//   .catch(error => {
//     console.error(error);
//   });

window.findNearbyTherapyOffices = findNearbyTherapyOffices;


 /* Not working for some reason - Mobile devices - Mack for mobile view to call 988 if "danger"
    filtered.forEach(t => {
        resultsDiv.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm border-0 rounded-4" style="background-color: #e8f0f8;">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <h5 class="card-title fw-bold text-primary">${t.name}</h5>
                        <p class="card-text mb-1">
                            <i class="bi bi-geo-alt-fill"></i> ${t.city}, ${t.zip}
                        </p>
                        <p class="card-text mb-3">
                            <i class="bi bi-telephone-fill"></i>
                            <a href="tel:${t.phone.replace(/\D/g, '')}" class="phone-link">
                                ${t.phone}
                            </a>
                        </p>
                        <a href="${t.link}" class="btn btn-outline-primary mt-auto">Contact</a>
                    </div>
                </div>
            </div>
        `;
    });
}

    else {
        filtered.forEach(t => {
        resultsDiv.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm border-0 rounded-4" style="background-color: #e8f0f8;">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <h5 class="card-title fw-bold text-primary">${t.name}</h5>
                        <p class="card-text mb-1"><i class="bi bi-geo-alt-fill"></i> ${t.city}, ${t.zip}</p>
                        <p class="card-text mb-3"><i class="bi bi-telephone-fill"></i> ${t.phone}</p>
                        <a href="${t.link}" class="btn btn-outline-primary mt-auto">Contact</a>
                    </div>
                </div>
            </div>
        `;
    });
    } 
    */