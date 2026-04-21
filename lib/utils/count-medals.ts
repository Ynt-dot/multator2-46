export interface MedalCountResult {
  gold: number
  silver: number
  bronze: number
}

export function countMedals(medals: { medal_type: string }[]): MedalCountResult {
  return {
    gold: medals.filter(m => m.medal_type === 'gold').length,
    silver: medals.filter(m => m.medal_type === 'silver').length,
    bronze: medals.filter(m => m.medal_type === 'bronze').length,
  }
}
