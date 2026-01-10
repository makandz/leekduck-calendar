const KNOWN_EVENT_TYPE_COLORS: Record<string, string> = {
  "community-day": "#7C3AED", // violet
  "event": "#2563EB", // blue
  "go-battle-league": "#0EA5E9", // sky
  "go-pass": "#14B8A6", // teal
  "max-battles": "#F97316", // orange
  "max-mondays": "#EA580C", // orange dark
  "pokemon-go-tour": "#E11D48", // rose
  "pokemon-spotlight-hour": "#F59E0B", // amber
  "pokestop-showcase": "#10B981", // emerald
  "raid-battles": "#DC2626", // red
  "raid-day": "#B91C1C", // red dark
  "raid-hour": "#EF4444", // red light
  "team-go-rocket": "#111827", // near-black
};

function hashStringToInt(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function eventTypeToColor(eventType?: string): string {
  if (!eventType) return "#334155"; // slate

  const normalized = eventType.trim().toLowerCase();
  const known = KNOWN_EVENT_TYPE_COLORS[normalized];
  if (known) return known;

  const hue = hashStringToInt(normalized) % 360;
  return `hsl(${hue} 70% 30%)`;
}

