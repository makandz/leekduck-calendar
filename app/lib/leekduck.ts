import { z } from "zod";

export const LEEKDUCK_EVENTS_URL =
  "https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/events.json";

const LeekduckEventSchema = z
  .object({
    eventID: z.string(),
    name: z.string(),
    eventType: z.string().optional(),
    heading: z.string().optional(),
    link: z.string(),
    image: z.string().optional(),
    start: z.string(),
    end: z.string(),
  })
  .passthrough();

const LeekduckEventsSchema = z.array(LeekduckEventSchema);

export type CalendarEvent = {
  id: string;
  title: string;
  eventType?: string;
  heading?: string;
  href: string;
  imageUrl?: string;
  start: Date;
  end: Date;
};

function toDateOrThrow(value: string, context: string): Date {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    throw new Error(`Invalid date for ${context}: ${value}`);
  }
  return date;
}

export async function fetchLeekduckEvents(): Promise<CalendarEvent[]> {
  const response = await fetch(LEEKDUCK_EVENTS_URL, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch events: ${response.status} ${response.statusText}`,
    );
  }

  const json = await response.json();
  const parsed = LeekduckEventsSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Failed to parse events response");
  }

  return parsed.data.map((event) => ({
    id: event.eventID,
    title: event.name,
    eventType: event.eventType,
    heading: event.heading,
    href: event.link,
    imageUrl: event.image,
    start: toDateOrThrow(event.start, `${event.eventID}.start`),
    end: toDateOrThrow(event.end, `${event.eventID}.end`),
  }));
}
