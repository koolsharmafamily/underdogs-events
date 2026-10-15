import React from "react";
import type { Metadata } from "next";
import { EventsView } from "@/sections/events/EventsView";

export const metadata: Metadata = {
  title: "Events · Underdogs",
  description: "Two Worlds. Two Celebrations. One Unforgettable Season.",
};

export default function EventsPage() {
  return <EventsView />;
}
