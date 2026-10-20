import type { Metadata } from "next";
import { site } from "@/content/site";
import { redRoomFontVariables, diwaliFontVariables } from "@/theme/fonts";
import { EventsView } from "@/sections/events/EventsView";

export const metadata: Metadata = {
  title: site.events.meta.title,
  description: site.events.meta.description,
  alternates: { canonical: "/events" },
};

export default function EventsPage() {
  return (
    <div className={`${redRoomFontVariables} ${diwaliFontVariables}`}>
      <EventsView />
    </div>
  );
}
