function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function emergencyScore(hospital, severity, department) {
  const severityWeight = { low: 1, moderate: 2, high: 3, critical: 4 }[severity] || 2;
  const deptMatch = hospital.types?.join(' ').toLowerCase().includes(department.toLowerCase()) ? 1.3 : 1;
  const rating = hospital.rating || 3.5;
  const distancePenalty = Math.max(1, hospital.distanceKm / 2);
  return Number(((severityWeight * rating * deptMatch) / distancePenalty).toFixed(2));
}

async function getRouteEtaMinutes(fromLat, fromLng, toLat, toLng, fallbackMinutes) {
  try {
    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
    const routeRes = await fetch(routeUrl);
    if (!routeRes.ok) return fallbackMinutes;
    const routeData = await routeRes.json();
    const seconds = routeData?.routes?.[0]?.duration;
    if (!seconds) return fallbackMinutes;
    return Math.max(4, Math.round(seconds / 60));
  } catch {
    return fallbackMinutes;
  }
}

export async function recommendHospitals({ lat, lng, department, severity }) {
  const key = process.env.GOOGLE_MAPS_API_KEY;

  if (!key) {
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node(around:12000,${lat},${lng})["amenity"="hospital"];
        way(around:12000,${lat},${lng})["amenity"="hospital"];
        node(around:12000,${lat},${lng})["healthcare"="hospital"];
      );
      out center tags 20;
    `;
    const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: overpassQuery
    });
    const overpassData = await overpassRes.json();

    const mappedOsm = (overpassData.elements || [])
      .map((e) => {
        const hLat = e.lat ?? e.center?.lat;
        const hLng = e.lon ?? e.center?.lon;
        if (!hLat || !hLng) return null;
        const distanceKm = Number(haversineKm(lat, lng, hLat, hLng).toFixed(1));
        return {
          id: `${e.type}-${e.id}`,
          name: e.tags?.name || 'Nearby Hospital',
          rating: 4.0,
          distanceKm,
          etaMinutes: Math.max(5, Math.round(distanceKm * 4)),
          address: e.tags?.['addr:full'] || e.tags?.['addr:street'] || 'Address unavailable',
          phone: e.tags?.phone || e.tags?.['contact:phone'] || '',
          specialization: department,
          emergencySuitability: 0,
          types: [e.tags?.amenity || e.tags?.healthcare || 'hospital'],
          lat: hLat,
          lng: hLng
        };
      })
      .filter(Boolean)
      .slice(0, 10);

    await Promise.all(
      mappedOsm.map(async (hospital) => {
        hospital.etaMinutes = await getRouteEtaMinutes(
          lat,
          lng,
          hospital.lat,
          hospital.lng,
          hospital.etaMinutes
        );
      })
    );

    for (const hospital of mappedOsm) {
      hospital.emergencySuitability = emergencyScore(hospital, severity, department);
    }

    mappedOsm.sort((a, b) => b.emergencySuitability - a.emergencySuitability);
    const hospitals = mappedOsm.map(({ types, ...rest }) => rest);
    return { bestHospitalId: hospitals[0]?.id || '', hospitals };
  }

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=hospital&key=${key}`;
  const response = await fetch(url);
  const data = await response.json();

  const mapped = (data.results || []).slice(0, 8).map((h) => {
    const hLat = h.geometry?.location?.lat;
    const hLng = h.geometry?.location?.lng;
    const distanceKm = Number(haversineKm(lat, lng, hLat, hLng).toFixed(1));
    return {
      id: h.place_id,
      name: h.name,
      rating: h.rating || 3.8,
      distanceKm,
      etaMinutes: Math.max(4, Math.round(distanceKm * 3.5)),
      address: h.vicinity || 'Address unavailable',
      phone: '',
      specialization: department,
      emergencySuitability: 0,
      lat: hLat,
      lng: hLng,
      types: h.types || []
    };
  });

  await Promise.all(
    mapped.map(async (hospital) => {
      hospital.etaMinutes = await getRouteEtaMinutes(
        lat,
        lng,
        hospital.lat,
        hospital.lng,
        hospital.etaMinutes
      );
    })
  );

  for (const hospital of mapped) {
    hospital.emergencySuitability = emergencyScore(hospital, severity, department);
  }

  mapped.sort((a, b) => b.emergencySuitability - a.emergencySuitability);
  const hospitals = mapped.map(({ types, ...rest }) => rest);

  return { bestHospitalId: hospitals[0]?.id || '', hospitals };
}
