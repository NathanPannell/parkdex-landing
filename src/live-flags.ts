import { layoutFlagPins, renderFlagPin, weatherForDays, type FlagSpot } from './flag-art';

type LiveFlag = { parkId: string; flagSeed: string; since: string };

const DAY_MS = 24 * 60 * 60 * 1000;

/** Plants the flags flying right now on the homepage park map. */
export async function plantLiveFlags(map: SVGSVGElement, fetchFlags: typeof fetch = fetch): Promise<number> {
  const layer = map.querySelector<SVGGElement>('.dots__flags');
  if (!layer) return 0;
  const response = await fetchFlags('/api/flags', { headers: { Accept: 'application/json' } });
  if (!response.ok) return 0;
  const { flags, serverTime } = await response.json() as { flags: LiveFlag[]; serverTime: string };
  const now = Date.parse(serverTime);
  const spots = flags.flatMap((flag): FlagSpot[] => {
    // Flags on parks outside BC, or newer than src/parks.json, have no dot to stand on.
    const dot = map.querySelector<SVGCircleElement>(`circle[data-park="${CSS.escape(flag.parkId)}"]`);
    if (!dot) return [];
    const days = Math.floor(Math.max(0, now - Date.parse(flag.since)) / DAY_MS);
    return [{ x: Number(dot.getAttribute('cx')), y: Number(dot.getAttribute('cy')), seed: flag.flagSeed, weather: weatherForDays(days) }];
  });
  if (!spots.length) return 0;
  // Every value in the markup is generated from validated seeds and numbers, never from user text.
  const { width, height } = map.viewBox.baseVal;
  layer.innerHTML = layoutFlagPins(spots, width, height).map(renderFlagPin).join('');
  const label = map.getAttribute('aria-label');
  if (label) map.setAttribute('aria-label', `${label}, with ${spots.length} ${spots.length === 1 ? 'flag' : 'flags'} flying now`);
  return spots.length;
}

/** Waits until the map is nearly on screen, so a visit that never scrolls there asks for nothing. */
export function plantLiveFlagsWhenVisible(map: SVGSVGElement): void {
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    // A failed request leaves the map with its parks and no flags.
    plantLiveFlags(map).catch(() => undefined);
  }, { rootMargin: '600px 0px' });
  observer.observe(map);
}
