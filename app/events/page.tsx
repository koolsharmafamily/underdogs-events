import type { Metadata } from "next";
import { site } from "@/content/site";
import { EventsView } from "@/sections/events/EventsView";

export const metadata: Metadata = {
  title: site.events.meta.title,
  description: site.events.meta.description,
  alternates: { canonical: "/events" },
};

export default function EventsPage() {
  return <EventsView />;
}
