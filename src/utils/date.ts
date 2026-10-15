export function getDaysToGo(targetDateStr: string): number | null {
  try {
    const target = new Date(targetDateStr);
    const now = new Date();
    // Normalize to midnight
    const targetMid = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = targetMid.getTime() - nowMid.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : null;
  } catch {
    return null;
  }
}
