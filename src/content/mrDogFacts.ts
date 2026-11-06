import { site } from "./site";

/**
 * Builds the compact, labelled plain-text facts block for Mr. Dog.
 * Sourced STRICTLY from site.ts.
 * Budget: <= 2,500 characters.
 */
export function buildMrDogFacts(): string {
  const brand = site.brand;
  const redRoom = site.redRoom;
  const diwali = site.diwali;

  const rrPartners = redRoom.partners.list.map((p) => `${p.role}: ${p.name}`).join("; ");
  const dPartners = diwali.partners.list.map((p) => p.name).join(", ");
  const pastNights = site.home.nights.list.slice(0, 5).join(", ");

  const facts = [
    `IDENTITY: ${brand.name} (${brand.legalName}), Nagpur. "Nagpur's Party People", creating an exclusive niche in Nagpur's party scene. Line: "${brand.line}". Instagram: ${brand.instagram}.`,
    `CAMPAIGN: ${brand.season.headline} Tagline: "${brand.season.tagline}".`,
    `PAST NIGHTS: ${pastNights}, etc. Latest: ${site.home.nights.latest.name} (${site.home.nights.latest.detail}).`,
    ``,
    `WORLD ONE — THE RED ROOM (PAST EVENT · HALLOWEEN):`,
    `- Status: PAST EVENT (took place Saturday 24 October 2026 at Millo, Civil Lines, Nagpur).`,
    `- Memory: "That night's done — and it was a scene! The Red Room has closed its doors. Thank you, Nagpur, for coming dressed to disturb."`,
    `- Headline DJ: DJ Monish (Afro-House / Club Anthems).`,
    `- Décor & Production: Rise India (Raise Your Expectations).`,
    `- Partners: ${rrPartners}.`,
    `- Entry / Price: Event concluded. Never quote prices for Red Room. Steering: direct guests to DHAMAAKA (7 Nov 2026).`,
    ``,
    `WORLD TWO — DHAMAAKA (UPCOMING · DIWALI 2026):`,
    `- Presenter: NO CTRL presents`,
    `- Title: DHAMAAKA — The Karan Johar Edition (दीपावली धमाका)`,
    `- Date: Saturday 7 November 2026`,
    `- Timings: 8:00 PM – 1:30 AM (Notice: "Gates close at 10:00 PM.")`,
    `- Venue: Hotel Centre Point, Nagpur`,
    `- Final Phase Rates: Stag ₹10,000 (₹5,000 cover) · Couple ₹8,000 (₹4,000 cover). Note: Couple rate is ₹8,000 per couple, not per person. Cover amounts are shown separately beneath the price and never added to ticket price.`,
    `- Availability: Only Final Phase Stag & Couple passes remain available. All other categories—including tables, VIP enclosures, and packages—are Sold Out. Enquiries are passes only.`,
    `- Layout: Tables D1–D9 and U1–U4, NO CTRL Lounge, stage, DJ booth, bars, entrances, fire exit. Reference only; all tables and packages are Sold Out.`,
    `- Headline Artist: Announcing soon on @underdogs_nagpur.`,
    `- Partners: ${dPartners}.`,
    ``,
    `BOOKING & ENQUIRIES:`,
    `- Instagram: https://instagram.com/underdogs_nagpur (@underdogs_nagpur).`,
    `- Phone lines: +91 90491 00002, +91 98231 77648, +91 72762 05656, +91 96891 93505.`,
    `- Policy: Informational site only; tickets and table enquiries via Instagram or official phones.`,
  ].join("\n");

  return facts;
}
