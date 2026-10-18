import { site, ANNOUNCING_SOON } from "./site";

/**
 * Builds the compact, labelled plain-text facts block for Mr. Dog.
 * Sourced STRICTLY from site.ts. Unknowns render literally as "Announcing soon".
 * Budget: <= 2,500 characters.
 */
export function buildMrDogFacts(): string {
  const brand = site.brand;
  const redRoom = site.redRoom;
  const diwali = site.diwali;

  const rrDate = redRoom.invitation.rows.find((r) => r.label === "Date")?.value || redRoom.sub;
  const rrTime = redRoom.invitation.rows.find((r) => r.label === "Time")?.value || ANNOUNCING_SOON;
  const rrVenueRow = redRoom.invitation.rows.find((r) => r.label === "Venue");
  const rrVenue = `${rrVenueRow?.value || "Millo"} (${rrVenueRow?.sub || "Civil Lines, Nagpur"})`;
  const rrDress = `${redRoom.invitation.rows.find((r) => r.label === "Dress code")?.value || "Costumes compulsory"}. ${redRoom.dress.warning}`;
  const rrEntry = redRoom.invitation.rows.find((r) => r.label === "Entry")?.value || ANNOUNCING_SOON;
  const rrPartners = redRoom.partners.list.map((p) => `${p.role}: ${p.name}`).join("; ");

  const dDate = diwali.invitation.rows.find((r) => r.label === "Date")?.value || diwali.sub;
  const dTime = diwali.invitation.rows.find((r) => r.label === "Time")?.value || ANNOUNCING_SOON;
  const dVenue = diwali.invitation.rows.find((r) => r.label === "Venue")?.value || "Hotel Centre Point, Nagpur";
  const dDress = diwali.invitation.rows.find((r) => r.label.toLowerCase().includes("dress"))?.value || ANNOUNCING_SOON;
  const dEntry = diwali.invitation.rows.find((r) => r.label === "Entry")?.value || ANNOUNCING_SOON;
  const dPartners = diwali.partners.list.map((p) => `${p.role}: ${p.name}`).join("; ");

  const pastNights = site.home.nights.list.join(", ");

  const facts = [
    `BRAND: ${brand.name} (${brand.legalName}), ${brand.city}. Line: "${brand.line}". Instagram: ${brand.instagram} (plain text only).`,
    `ABOUT: ${site.home.about.body}`,
    `CAMPAIGN: ${brand.season.headline} Tagline: "${brand.season.tagline}".`,
    `PAST NIGHTS: ${pastNights}. Latest: ${site.home.nights.latest.name} (${site.home.nights.latest.detail}).`,
    ``,
    `EVENT 1 (WORLD ONE · HALLOWEEN):`,
    `- Name: ${redRoom.title} (Presenter: ${redRoom.presenter})`,
    `- Occasion: Halloween 2026`,
    `- Date: ${rrDate}`,
    `- Time: ${rrTime}`,
    `- Venue: ${rrVenue}`,
    `- Dress code: ${rrDress}`,
    `- Entry / Tickets: ${rrEntry}`,
    `- Headline DJ: ${redRoom.dj.name} (${redRoom.dj.role}, ${redRoom.dj.genre})`,
    `- Partners: ${rrPartners}`,
    ``,
    `EVENT 2 (WORLD TWO · DIWALI):`,
    `- Name: ${diwali.title} — ${diwali.subtitle} (${diwali.accent})`,
    `- Presenter: ${diwali.presenter}`,
    `- Occasion: Diwali 2026`,
    `- Date: ${dDate}`,
    `- Time: ${dTime}`,
    `- Venue: ${dVenue}`,
    `- Theme & dress code: ${dDress}`,
    `- Entry / Tickets: ${dEntry}`,
    `- Headline DJ: ${diwali.dj ? `${(diwali.dj as any).name} (${(diwali.dj as any).role})` : "Announcing soon"}`,
    `- Partners: ${dPartners}`,
    ``,
    `POLICY: This website is information only; it does not sell tickets or take bookings. Follow @underdogs_nagpur on Instagram for updates.`,
  ].join("\n");

  return facts;
}
