export function computeLP(papers12mo: number, meanCitedness: number): number {
  return Math.round(papers12mo * (1 + Math.min(meanCitedness, 20) / 10));
}

export function computeMovement(prevRank: number | undefined, currRank: number): number | null {
  return prevRank === undefined ? null : prevRank - currRank;
}
