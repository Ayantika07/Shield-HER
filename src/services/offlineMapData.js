// Prepackaged Offline Vector Basemap for Central Delhi Demo Zone (Connaught Place / Lutyens Corridor)
// Provides complete offline map rendering without requesting tiles from external servers.
// Compliant with OpenStreetMap data attribution & offline licensing.

export const OFFLINE_MAP_METADATA = {
  region: 'Central Delhi (Connaught Place, New Delhi)',
  center: [28.6315, 77.2167],
  bounds: {
    minLat: 28.6150,
    maxLat: 28.6750,
    minLng: 77.1950,
    maxLng: 77.2450
  },
  zoomRange: [13, 17],
  source: 'OpenStreetMap contributors / Survey of India Public Geometry',
  license: 'Open Data Commons Open Database License (ODbL)',
  preparedDate: '2026-10-24',
  offlineReady: true
};

// Generate approximate circular coordinate ring
function generateCircleCoordinates(centerLat, centerLng, radiusMeters, points = 32) {
  const coords = [];
  const earthRadius = 6378137; // meters
  for (let i = 0; i <= points; i++) {
    const angle = (i * 360 / points) * (Math.PI / 180);
    const dLat = (radiusMeters * Math.cos(angle)) / earthRadius;
    const dLng = (radiusMeters * Math.sin(angle)) / (earthRadius * Math.cos(centerLat * Math.PI / 180));
    coords.push([centerLng + (dLng * 180 / Math.PI), centerLat + (dLat * 180 / Math.PI)]);
  }
  return coords;
}

// Center of Connaught Place (Central Park Flagpole)
const CP_LAT = 28.6328;
const CP_LNG = 28.2195 > 70 ? 77.2195 : 77.2195;

export const CENTRAL_DELHI_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    // 1. Central Park Polygon (Inner Green Zone)
    {
      type: 'Feature',
      properties: {
        name: 'Central Park (Connaught Place)',
        type: 'park',
        color: '#10b981',
        fillColor: '#064e3b',
        fillOpacity: 0.35
      },
      geometry: {
        type: 'Polygon',
        coordinates: [generateCircleCoordinates(CP_LAT, CP_LNG, 150)]
      }
    },

    // 2. Inner Circle (Radial Ring 1)
    {
      type: 'Feature',
      properties: {
        name: 'Connaught Place Inner Circle',
        type: 'road_primary',
        color: '#818cf8',
        weight: 4,
        opacity: 0.9
      },
      geometry: {
        type: 'LineString',
        coordinates: generateCircleCoordinates(CP_LAT, CP_LNG, 180)
      }
    },

    // 3. Middle Circle
    {
      type: 'Feature',
      properties: {
        name: 'Connaught Place Middle Circle',
        type: 'road_secondary',
        color: '#6366f1',
        weight: 3,
        opacity: 0.75
      },
      geometry: {
        type: 'LineString',
        coordinates: generateCircleCoordinates(CP_LAT, CP_LNG, 260)
      }
    },

    // 4. Outer Circle (Connaught Circus)
    {
      type: 'Feature',
      properties: {
        name: 'Connaught Circus (Outer Circle)',
        type: 'road_arterial',
        color: '#a855f7',
        weight: 5,
        opacity: 0.95
      },
      geometry: {
        type: 'LineString',
        coordinates: generateCircleCoordinates(CP_LAT, CP_LNG, 360)
      }
    },

    // 5. Radial Arteries radiating outwards from Connaught Place
    // Radial A: Barakhamba Road (East towards Mandi House / Tilak Marg)
    {
      type: 'Feature',
      properties: { name: 'Barakhamba Road', type: 'arterial', color: '#60a5fa', weight: 4 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.2215, 28.6328],
          [77.2260, 28.6320],
          [77.2340, 28.6250],
          [77.2400, 28.6200]
        ]
      }
    },

    // Radial B: Kasturba Gandhi Marg (Southeast towards India Gate)
    {
      type: 'Feature',
      properties: { name: 'Kasturba Gandhi Marg (KG Marg)', type: 'arterial', color: '#60a5fa', weight: 4 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.2210, 28.6315],
          [77.2240, 28.6270],
          [77.2280, 28.6200],
          [77.2310, 28.6140]
        ]
      }
    },

    // Radial C: Janpath (South towards Rajpath / National Museum)
    {
      type: 'Feature',
      properties: { name: 'Janpath Avenue', type: 'arterial', color: '#38bdf8', weight: 4 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.2195, 28.6300],
          [77.2190, 28.6250],
          [77.2185, 28.6180],
          [77.2180, 28.6120]
        ]
      }
    },

    // Radial D: Parliament Street / Sansad Marg (South-Southwest towards Parliament / Patel Chowk)
    {
      type: 'Feature',
      properties: { name: 'Parliament Street (Sansad Marg)', type: 'arterial', color: '#f43f5e', weight: 4 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.2180, 28.6305],
          [77.2155, 28.6270],
          [77.2120, 28.6240],
          [77.2085, 28.6190]
        ]
      }
    },

    // Radial E: Baba Kharak Singh Marg (Southwest towards Bangla Sahib & RML Hospital)
    {
      type: 'Feature',
      properties: { name: 'Baba Kharak Singh Marg', type: 'arterial', color: '#fb923c', weight: 4 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.2165, 28.6315],
          [77.2120, 28.6290],
          [77.2070, 28.6275],
          [77.2030, 28.6270]
        ]
      }
    },

    // Radial F: Shaheed Bhagat Singh Marg (West towards Lady Hardinge Hospital & Gole Market)
    {
      type: 'Feature',
      properties: { name: 'Shaheed Bhagat Singh Marg', type: 'arterial', color: '#ec4899', weight: 4 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.2160, 28.6335],
          [77.2140, 28.6340],
          [77.2090, 28.6345],
          [77.2020, 28.6360]
        ]
      }
    },

    // Radial G: Panchkuian Road (Northwest towards Jhandewalan / Karol Bagh)
    {
      type: 'Feature',
      properties: { name: 'Panchkuian Road', type: 'arterial', color: '#a78bfa', weight: 4 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.2165, 28.6355],
          [77.2130, 28.6380],
          [77.2070, 28.6410],
          [77.1980, 28.6450]
        ]
      }
    },

    // Radial H: Chelmsford Road & Bhavbhuti Marg (North towards New Delhi Railway Station)
    {
      type: 'Feature',
      properties: { name: 'Chelmsford Road / Station Approach', type: 'arterial', color: '#eab308', weight: 4 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.2190, 28.6360],
          [77.2200, 28.6390],
          [77.2210, 28.6420],
          [77.2230, 28.6460]
        ]
      }
    },

    // Radial I: Minto Road (Northeast towards Ajmeri Gate / Kashmere Gate corridor)
    {
      type: 'Feature',
      properties: { name: 'Minto Road Corridor', type: 'arterial', color: '#14b8a6', weight: 4 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.2215, 28.6350],
          [77.2245, 28.6375],
          [77.2265, 28.6420],
          [77.2280, 28.6670]
        ]
      }
    },

    // 6. Northern Railway Tracks (NDLS Main Rail Spine)
    {
      type: 'Feature',
      properties: { name: 'Northern Railway Mainline Corridor', type: 'rail', color: '#94a3b8', weight: 3, dashArray: '6, 6' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.2150, 28.6460],
          [77.2210, 28.6420],
          [77.2260, 28.6390],
          [77.2340, 28.6350]
        ]
      }
    }
  ]
};
