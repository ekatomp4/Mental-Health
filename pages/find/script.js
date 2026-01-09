async function queryOverpass(lat, lng) {
  const radius = 20000; // 20km — REQUIRED for real data

  const query = `
    [out:json][timeout:25];
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
    out center tags;
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




async function findNearbyTherapyOffices() {
  if (!navigator.geolocation) {
    throw new Error("Geolocation not supported");
  }

  const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });

  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  return await queryOverpass(lat, lng);
}



findNearbyTherapyOffices()
  .then(results => {
    console.log(results);
  })
  .catch(error => {
    console.error(error);
  });

window.findNearbyTherapyOffices = findNearbyTherapyOffices;