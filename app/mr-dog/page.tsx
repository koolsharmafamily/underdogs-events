import type { Metadata } from "next";
import { MrDogView } from "@/sections/mrdog/MrDogView";

export const metadata: Metadata = {
  title: "Mr. Dog — AI Concierge | Underdogs Events",
  description:
    "Chat with Mr. Dog, official AI concierge for Underdogs Events Nagpur. Get answers on passes, dress codes, secret doors, music curation, and invitations.",
  alternates: { canonical: "/mr-dog" },
  openGraph: {
    title: "Mr. Dog — AI Concierge | Underdogs Events",
    description:
      "Chat with Mr. Dog, official AI concierge for Underdogs Events Nagpur.",
    url: "/mr-dog",
    siteName: "Underdogs Events",
    locale: "en_IN",
    type: "website",
  },
};

export default function MrDogPage() {
  return <MrDogView />;
}
