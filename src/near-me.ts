import './fan-page.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as maplibregl from 'maplibre-gl';
import parkData from './parks.json';

// Every park in the production catalogue, from src/parks.json (`npm run sync-parks`).
// OpenFreeMap's Positron style is a quiet, low-detail basemap that needs no key.
maplibregl.setWorkerUrl(`${location.origin}/maplibre/maplibre-gl-worker.mjs`);

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
const CATEGORY_LABEL: Record<string, string> = {
  national: 'National park',
  municipal: 'Municipal park',
  regional: 'Regional park',
  provincial: 'Provincial park',
  community: 'Community park',
};
const status = document.querySelector<HTMLParagraphElement>('#near-me-status')!;
const parks = parkData.parks;
const parksById = new Map(parks.map((park) => [park.id, park]));

const bounds = new maplibregl.LngLatBounds();
parks.forEach((park) => bounds.extend([park.lng, park.lat]));

const map = new maplibregl.Map({
  container: 'near-me-map',
  style: STYLE_URL,
  bounds,
  fitBoundsOptions: { padding: 60 },
  attributionControl: { compact: true },
  cooperativeGestures: false,
});
map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

function popupContent(park: (typeof parks)[number]): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'near-me__popup';
  const meta = document.createElement('p');
  meta.className = 'near-me__meta';
  meta.textContent = [CATEGORY_LABEL[park.category] ?? 'Park', park.region].filter(Boolean).join(' · ');
  const name = document.createElement('strong');
  name.textContent = park.name;
  const blurb = document.createElement('p');
  blurb.textContent = 'Get inside the boundary to plant your flag here.';
  const link = document.createElement('a');
  link.href = '/#get';
  link.textContent = 'Get the beta';
  wrapper.append(meta, name, blurb, link);
  return wrapper;
}

const popup = new maplibregl.Popup({ offset: 12, closeButton: false, maxWidth: '280px' });
function openPark(park: (typeof parks)[number]) {
  popup.setLngLat([park.lng, park.lat]).setDOMContent(popupContent(park)).addTo(map);
}

map.on('load', () => {
  map.addSource('parks', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: parks.map((park) => ({ type: 'Feature', properties: { id: park.id, category: park.category }, geometry: { type: 'Point', coordinates: [park.lng, park.lat] } })),
    },
  });
  map.addLayer({
    id: 'parks',
    type: 'circle',
    source: 'parks',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 4, 10, 7, 14, 11],
      'circle-color': ['match', ['get', 'category'], 'national', '#154634', 'provincial', '#1c5b43', 'regional', '#3fa46a', '#ff5a1f'],
      'circle-stroke-color': '#14231c',
      'circle-stroke-width': 2,
    },
  });
  map.on('click', 'parks', (event) => {
    const park = parksById.get(String(event.features?.[0]?.properties?.id));
    if (park) openPark(park);
  });
  map.on('mouseenter', 'parks', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'parks', () => { map.getCanvas().style.cursor = ''; });
  showLinkedPark();
});

// A link such as /near-me/#<park id> opens on that park instead of the visitor.
function showLinkedPark(): boolean {
  const park = parksById.get(decodeURIComponent(location.hash.slice(1)));
  if (!park) return false;
  map.jumpTo({ center: [park.lng, park.lat], zoom: 13 });
  openPark(park);
  return true;
}
window.addEventListener('hashchange', showLinkedPark);

if (!parksById.has(decodeURIComponent(location.hash.slice(1)))) {
  const geolocate = new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: false }, fitBoundsOptions: { maxZoom: 12 }, trackUserLocation: false });
  map.addControl(geolocate, 'top-right');
  geolocate.on('error', () => { status.textContent = 'Location is off, so the map shows every park instead.'; });
  map.on('load', () => {
    if ('geolocation' in navigator) geolocate.trigger();
  });
}
