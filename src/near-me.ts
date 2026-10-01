import './fan-page.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as maplibregl from 'maplibre-gl';
import badgeData from './badges.json';

// OpenFreeMap's Positron style is a quiet, low-detail basemap that needs no key.
maplibregl.setWorkerUrl(`${location.origin}/maplibre/maplibre-gl-worker.mjs`);

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
const status = document.querySelector<HTMLParagraphElement>('#near-me-status')!;
const badges = badgeData.badges.filter((badge) => Number.isFinite(badge.lat) && Number.isFinite(badge.lng));

const bounds = new maplibregl.LngLatBounds();
badges.forEach((badge) => bounds.extend([badge.lng, badge.lat]));

const map = new maplibregl.Map({
  container: 'near-me-map',
  style: STYLE_URL,
  bounds,
  fitBoundsOptions: { padding: 60 },
  attributionControl: { compact: true },
  cooperativeGestures: false,
});
map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

function markerFor(badge: (typeof badges)[number]): maplibregl.Marker {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = 'near-me__pin';
  element.dataset.rarity = badge.rarity;
  element.setAttribute('aria-label', `${badge.name}, ${badge.rarity} badge`);
  element.style.backgroundImage = `url(/badges/${badge.scene}.webp)`;
  const popup = new maplibregl.Popup({ offset: 22, closeButton: false, maxWidth: '280px' }).setDOMContent(popupContent(badge));
  return new maplibregl.Marker({ element }).setLngLat([badge.lng, badge.lat]).setPopup(popup).addTo(map);
}

function popupContent(badge: (typeof badges)[number]): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'near-me__popup';
  wrapper.dataset.rarity = badge.rarity;
  const chip = document.createElement('span');
  chip.className = 'badge-chip';
  chip.textContent = badge.rarity;
  const name = document.createElement('strong');
  name.textContent = badge.name;
  const blurb = document.createElement('p');
  blurb.textContent = badge.blurb;
  const link = document.createElement('a');
  link.href = `/badges/#${badge.id}`;
  link.textContent = 'About this badge';
  wrapper.append(chip, name, blurb, link);
  return wrapper;
}

const markers = new Map(badges.map((badge) => [badge.id, markerFor(badge)]));

// A link such as /near-me/#<park id> opens on that park instead of the visitor.
function showLinkedPark(): boolean {
  const marker = markers.get(decodeURIComponent(location.hash.slice(1)));
  if (!marker) return false;
  map.jumpTo({ center: marker.getLngLat(), zoom: 13 });
  if (!marker.getPopup()?.isOpen()) marker.togglePopup();
  return true;
}
window.addEventListener('hashchange', showLinkedPark);

if (!showLinkedPark()) {
  const geolocate = new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: false }, fitBoundsOptions: { maxZoom: 13 }, trackUserLocation: false });
  map.addControl(geolocate, 'top-right');
  geolocate.on('error', () => { status.textContent = 'Location is off, so the map shows every badge park instead.'; });
  map.on('load', () => {
    if ('geolocation' in navigator) geolocate.trigger();
  });
}
