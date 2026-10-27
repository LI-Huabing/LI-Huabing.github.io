export const LEAF_ASPECTS = [0.454, 0.445, 0.476, 0.437, 0.517, 0.471, 0.592];

export const leafSrc = (leaf: number) => `/images/leaf-${leaf}.webp`;
export const leafSize = (leaf: number) => ({ width: Math.round(120 * LEAF_ASPECTS[leaf]), height: 120 });

const YEAR = 365.25 * 24 * 3600 * 1000;

export const leafFor = (date: Date) => {
  const age = Math.min(1, Math.max(0, (Date.now() - date.getTime()) / (3 * YEAR)));
  return Math.round((1 - age) * (LEAF_ASPECTS.length - 1));
};
