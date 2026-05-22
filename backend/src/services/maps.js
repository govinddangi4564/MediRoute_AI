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

function validLatLng(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

function fallbackHospitals(lat, lng, department, severity) {
  const base = [
    {
      id: 'fallback-1',
      name: 'City Emergency Hospital',
      rating: 4.4,
      distanceKm: 1.8,
      etaMinutes: 8,
      address: 'Main Road, Nearby',
      phone: '',
      specialization: department,
      emergencySuitability: 0,
      lat: lat + 0.008,
      lng: lng + 0.008,
      types: ['hospital', 'emergency']
    },
    {
      id: 'fallback-2',
      name: 'Care Plus Multi-Speciality',
      rating: 4.2,
      distanceKm: 3.1,
      etaMinutes: 13,
      address: 'Community Center Area',
      phone: '',
      specialization: department,
      emergencySuitability: 0,
      lat: lat - 0.009,
      lng: lng + 0.006,
      types: ['hospital']
    },
    {
      id: 'fallback-3',
      name: 'District General Hospital',
      rating: 4.0,
      distanceKm: 4.7,
      etaMinutes: 18,
      address: 'District Hospital Zone',
      phone: '',
      specialization: department,
      emergencySuitability: 0,
      lat: lat + 0.012,
      lng: lng - 0.01,
      types: ['hospital', 'general']
    }
  ];

  for (const hospital of base) {
    hospital.emergencySuitability = emergencyScore(hospital, severity, department);
  }

  base.sort((a, b) => b.emergencySuitability - a.emergencySuitability);
  const hospitals = base.map(({ types, ...rest }) => rest);
  return { bestHospitalId: hospitals[0]?.id || '', hospitals };
}

async function getRouteEtaMinutes(fromLat, fromLng, toLat, toLng, fallbackMinutes) {
  try {
    if (!validLatLng(fromLat, fromLng) || !validLatLng(toLat, toLng)) return fallbackMinutes;
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
  if (!validLatLng(lat, lng)) {
    return fallbackHospitals(28.6139, 77.209, department, severity);
  }

  const key = process.env.GOOGLE_MAPS_API_KEY;

  if (!key) {
    try {
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
      if (!overpassRes.ok) {
        return fallbackHospitals(lat, lng, department, severity);
      }

      const contentType = overpassRes.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return fallbackHospitals(lat, lng, department, severity);
      }

      const overpassData = await overpassRes.json();
      const mappedOsm = (overpassData.elements || [])
        .map((e) => {
          const hLat = e.lat ?? e.center?.lat;
          const hLng = e.lon ?? e.center?.lon;
          if (!validLatLng(hLat, hLng)) return null;
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

      if (!mappedOsm.length) {
        return fallbackHospitals(lat, lng, department, severity);
      }

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
    } catch {
      return fallbackHospitals(lat, lng, department, severity);
    }
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=hospital&key=${key}`;
    const response = await fetch(url);
    if (!response.ok) return fallbackHospitals(lat, lng, department, severity);
    const data = await response.json();

    const mapped = (data.results || []).slice(0, 8).map((h) => {
      const hLat = h.geometry?.location?.lat;
      const hLng = h.geometry?.location?.lng;
      if (!validLatLng(hLat, hLng)) return null;
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
    }).filter(Boolean);

    if (!mapped.length) return fallbackHospitals(lat, lng, department, severity);

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
  } catch {
    return fallbackHospitals(lat, lng, department, severity);
  }
}
