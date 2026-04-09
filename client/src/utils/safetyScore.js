export const WEIGHTS = {
  crime: 0.35,
  lighting: 0.25,
  crowd: 0.20,
  weather: 0.10,
  community: 0.10
};

export const getScoreColor = (score) => {
  if (score >= 70) return '#22C55E';
  if (score >= 40) return '#FF6B00';
  return '#EF4444';
};

export const getScoreLabel = (score) => {
  if (score >= 70) return 'Safe';
  if (score >= 40) return 'Medium';
  return 'Risky';
};

export const getScoreBg = (score) => {
  if (score >= 70) return '#dcfce7';
  if (score >= 40) return '#fff7ed';
  return '#fef2f2';
};
