export interface GeoPlace {
  id: string;
  label: string;
  line1: string;
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
}

export interface MapsService {
  searchPlaces(query: string): Promise<GeoPlace[]>;
  reverseGeocode(lat: number, lng: number): Promise<GeoPlace | null>;
}

const ADDIS_PLACES: GeoPlace[] = [
  {
    id: "bole",
    label: "Bole, Addis Ababa",
    line1: "Bole Road, near Edna Mall",
    city: "Addis Ababa",
    region: "Addis Ababa",
    country: "Ethiopia",
    lat: 8.989,
    lng: 38.791,
  },
  {
    id: "kazanchis",
    label: "Kazanchis, Addis Ababa",
    line1: "Ras Mekonnen Avenue",
    city: "Addis Ababa",
    region: "Addis Ababa",
    country: "Ethiopia",
    lat: 9.017,
    lng: 38.763,
  },
  {
    id: "old-airport",
    label: "Old Airport, Addis Ababa",
    line1: "Cape Verde Street",
    city: "Addis Ababa",
    region: "Addis Ababa",
    country: "Ethiopia",
    lat: 8.989,
    lng: 38.747,
  },
  {
    id: "sarbet",
    label: "Sarbet, Addis Ababa",
    line1: "Sarbet Roundabout",
    city: "Addis Ababa",
    region: "Addis Ababa",
    country: "Ethiopia",
    lat: 8.995,
    lng: 38.738,
  },
  {
    id: "cmc",
    label: "CMC, Addis Ababa",
    line1: "CMC Road",
    city: "Addis Ababa",
    region: "Addis Ababa",
    country: "Ethiopia",
    lat: 9.022,
    lng: 38.847,
  },
  {
    id: "gerji",
    label: "Gerji, Addis Ababa",
    line1: "Gerji Mebrat Hail",
    city: "Addis Ababa",
    region: "Addis Ababa",
    country: "Ethiopia",
    lat: 9.001,
    lng: 38.81,
  },
  {
    id: "piassa",
    label: "Piassa, Addis Ababa",
    line1: "Churchill Avenue",
    city: "Addis Ababa",
    region: "Addis Ababa",
    country: "Ethiopia",
    lat: 9.035,
    lng: 38.752,
  },
];

export class DemoMapsService implements MapsService {
  async searchPlaces(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return ADDIS_PLACES;
    return ADDIS_PLACES.filter(
      (place) =>
        place.label.toLowerCase().includes(q) ||
        place.line1.toLowerCase().includes(q),
    );
  }

  async reverseGeocode(lat: number, lng: number) {
    return (
      ADDIS_PLACES.slice()
        .sort((a, b) => {
          const da = (a.lat - lat) ** 2 + (a.lng - lng) ** 2;
          const db = (b.lat - lat) ** 2 + (b.lng - lng) ** 2;
          return da - db;
        })[0] ?? null
    );
  }
}

export class GoogleMapsService implements MapsService {
  constructor(private apiKey: string) {}

  async searchPlaces(query: string) {
    if (!this.apiKey) return new DemoMapsService().searchPlaces(query);
    return new DemoMapsService().searchPlaces(query);
  }

  async reverseGeocode(lat: number, lng: number) {
    return new DemoMapsService().reverseGeocode(lat, lng);
  }
}

export function createMapsService() {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (key) return new GoogleMapsService(key);
  return new DemoMapsService();
}

export const MAP_PLACES = ADDIS_PLACES;
