/** Whole days from today (local time) to an ISO date (YYYY-MM-DD); null once it has passed. */
export function getDaysToGo(isoDate: string): number | null {
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return null
  const target = new Date(y, m - 1, d)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000)
  return days >= 0 ? days : null
}
