export type PlaceType = 'town' | 'ward' | 'village_tract' | 'village';

// Where lat/lng came from. 'mimu' is a surveyed point from the MIMU Pcode
// list; the others are approximate points filled in by scripts/build-data.ts.
export type CoordSource = 'mimu' | 'boundary' | 'villages' | 'town';

export interface Place {
  id: number;
  type: PlaceType;
  pcode: string;
  name_eng: string;
  name_mmr: string | null;
  sr_pcode: string | null;
  sr_name: string | null;
  district_pcode: string | null;
  district_name: string | null;
  tsp_pcode: string | null;
  tsp_name: string | null;
  town_pcode: string | null;
  town_name: string | null;
  vt_pcode: string | null;
  vt_name: string | null;
  lat: number | null;
  lng: number | null;
  coord_source: CoordSource | null;
  postal_code: string | null;
  distance_km?: number;
}

export interface BatchItem {
  id: string | number;
  latitude: number;
  longitude: number;
}

export interface BatchResultItem extends BatchItem {
  matched_pcode?: string;
  matched_name_eng?: string;
  matched_name_mmr?: string;
  matched_type?: string;
  state_region?: string;
  township?: string;
  postal_code?: string;
  distance_km?: number;
  status: 'FOUND' | 'NOT_FOUND' | 'INVALID_COORDS';
}
