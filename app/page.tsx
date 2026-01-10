import MonthCalendar from "./components/MonthCalendar";
import { type CalendarEvent, fetchLeekduckEvents } from "./lib/leekduck";
import { shouldIgnoreEvent } from "./lib/ignore";

export const dynamic = "force-dynamic";

export default async function Home() {
  let events: CalendarEvent[] = [];
  try {
    events = await fetchLeekduckEvents();
  } catch (error) {
    console.error(error);
  }

  const visibleEvents = events.filter((event) => !shouldIgnoreEvent(event));

  return <MonthCalendar events={visibleEvents} />;
}
