import type { TalkMap } from "./talk-map";

export type Point = [number, number];

type Curve = (t: number) => { point: Point; tangent: Point };

function quadratic(p0: Point, c: Point, p1: Point): Curve {
  return (t) => {
    const u = 1 - t;
    return {
      point: [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]],
      tangent: [2 * u * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0]), 2 * u * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1])],
    };
  };
}

function taper(curve: Curve, base: number, tip: number, steps = 24): string {
  const left: string[] = [], right: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const { point: [x, y], tangent: [dx, dy] } = curve(t);
    const half = (base + (tip - base) * t) / 2 / (Math.hypot(dx, dy) || 1);
    left.push(`${(x - dy * half).toFixed(2)} ${(y + dx * half).toFixed(2)}`);
    right.push(`${(x + dy * half).toFixed(2)} ${(y - dx * half).toFixed(2)}`);
  }
  return `M${left.join(" L")} L${right.reverse().join(" L")}Z`;
}

export const FLOWER_RADIUS = 20;

export interface Flower<T> {
  talks: T[];
  root: Point;
  at: Point;
  stem: string;
  petals: number[];
}

interface Located {
  city: string;
  lat: number;
  lon: number;
}

const REACHES = [8, 11, 15, 20, 26, 33, 41, 50, 60, 72];
const DIRECTIONS = 32;

const STRETCH = 30;
const UPRIGHT = 6;
const AIR = 1.5;
const CROWDING = 6;
const OUTSIDE = 50;

const LEAF = 4.5;
const ALONG_LEAF = [5, 11, 17];
const STEM = 0.8;
const CITY = 2.5;

type Circle = { at: Point; r: number };
interface Spot {
  at: Point;
  petals: number[];
  circles: Circle[];
  own: number;
}

export function growFlowers<T extends Located>(talks: T[], map: TalkMap): Flower<T>[] {
  const groups: T[][] = [];
  for (const t of talks) {
    const same = groups.find(([g]) => g.city === t.city && Math.abs(g.lat - t.lat) < 1 && Math.abs(g.lon - t.lon) < 1);
    if (same) same.push(t);
    else groups.push([t]);
  }

  const cities = groups.map((group) => {
    const root = map.project(group[0].lon, group[0].lat);
    return { talks: group, root, spots: spots(root, group.length, map) };
  });

  const chosen = cities.map((c) => c.spots.reduce((a, b) => (b.own < a.own ? b : a)));
  const cost = (i: number, s: Spot) => chosen.reduce((sum, other, j) => (j === i ? sum : sum + crowding(s.circles, other.circles)), s.own);
  for (let moved = true; moved; ) {
    moved = false;
    cities.forEach((c, i) => {
      let best = chosen[i], lowest = cost(i, best);
      for (const s of c.spots) {
        const here = cost(i, s);
        if (here < lowest - 1e-9) [best, lowest] = [s, here];
      }
      if (best !== chosen[i]) [chosen[i], moved] = [best, true];
    });
  }

  return cities.map((c, i) => ({
    talks: c.talks,
    root: c.root,
    at: chosen[i].at,
    stem: outline(c.root, chosen[i].at),
    petals: chosen[i].petals,
  }));
}

function spots(root: Point, count: number, map: TalkMap): Spot[] {
  return REACHES.flatMap((reach) =>
    Array.from({ length: DIRECTIONS }, (_, k): Spot => {
      const a = (k / DIRECTIONS) * 2 * Math.PI;
      const at: Point = [root[0] + Math.sin(a) * reach, root[1] - Math.cos(a) * reach];
      const petals = petalTurns(root, at, count);
      const leaves = petals.flatMap((turn) => ALONG_LEAF.map((d) => ({ at: step(at, turn, d), r: LEAF })));
      const links = Math.ceil(reach / 3);
      const stem = Array.from({ length: links }, (_, i) => ({ at: along(root, at, (i + 1) / links).point, r: STEM }));
      const outside = leaves.filter(({ at: [x, y] }) => x < map.left || x > map.left + map.width || y < map.top || y > map.top + map.height).length;
      const own = reach + (reach * reach) / STRETCH + (UPRIGHT * (1 - Math.cos(a))) / 2 + OUTSIDE * outside;
      return { at, petals, circles: [...leaves, ...stem, { at: root, r: CITY }], own };
    }),
  );
}

function crowding(a: Circle[], b: Circle[]): number {
  let sum = 0;
  for (const p of a) {
    for (const q of b) {
      const short = p.r + q.r + AIR - Math.hypot(p.at[0] - q.at[0], p.at[1] - q.at[1]);
      if (short > 0) sum += CROWDING * short * short;
    }
  }
  return sum;
}

const FAN = 60;
const LEAN = 12;
function petalTurns(root: Point, at: Point, count: number): number[] {
  const [dx, dy] = along(root, at, 1).tangent;
  const heading = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  return Array.from({ length: count }, (_, k) => heading + (count === 1 ? LEAN / 2 : LEAN) + (k - (count - 1) / 2) * FAN);
}

function along(root: Point, at: Point, t: number) {
  const bow = 0.12;
  const c: Point = [(root[0] + at[0]) / 2 - (at[1] - root[1]) * bow, (root[1] + at[1]) / 2 + (at[0] - root[0]) * bow];
  return quadratic(root, c, at)(t);
}

const outline = (root: Point, at: Point) => taper((t) => along(root, at, t), 1.3, 0.5);

const LIFT = { many: 9.75, single: 6.45 };
export const liftOf = (flower: Flower<unknown>) => (flower.talks.length === 1 ? LIFT.single : LIFT.many);
const LEAF_CENTRE = 1.25;
const REACH = { fine: 15, coarse: 22 };
const SIDES = 24;
export const HIT_BOX = FLOWER_RADIUS + REACH.coarse;

export function hitAreas<T>(flowers: Flower<T>[]) {
  const centres = flowers.map((f) =>
    f.petals.map((turn) => step(f.at, turn, liftOf(f) + LEAF_CENTRE)),
  );
  const all = centres.flat();
  const area = (c: Point, reach: number) =>
    all.reduce(
      (poly, other) => (other !== c && Math.hypot(other[0] - c[0], other[1] - c[1]) < 2 * reach ? closer(poly, c, other) : poly),
      Array.from({ length: SIDES }, (_, n): Point => {
        const a = (n / SIDES) * 2 * Math.PI;
        return [c[0] + Math.cos(a) * reach, c[1] + Math.sin(a) * reach];
      }),
    );
  const css = (at: Point, poly: Point[]) =>
    `polygon(${poly.map((p) => p.map((v, i) => `${(((v - at[i] + HIT_BOX) / (2 * HIT_BOX)) * 100).toFixed(1)}%`).join(" ")).join(", ")})`;
  return flowers.map((f, i) => centres[i].map((c) => ({ fine: css(f.at, area(c, REACH.fine)), coarse: css(f.at, area(c, REACH.coarse)) })));
}

function closer(poly: Point[], own: Point, other: Point): Point[] {
  const d: Point = [other[0] - own[0], other[1] - own[1]];
  const m: Point = [(own[0] + other[0]) / 2, (own[1] + other[1]) / 2];
  const side = (p: Point) => (p[0] - m[0]) * d[0] + (p[1] - m[1]) * d[1];
  return poly.flatMap((p, i) => {
    const q = poly[(i + 1) % poly.length];
    const [sp, sq] = [side(p), side(q)];
    const out: Point[] = sp <= 0 ? [p] : [];
    if (sp * sq < 0) {
      const t = sp / (sp - sq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
    return out;
  });
}

function step(from: Point, turn: number, d: number): Point {
  const r = (turn * Math.PI) / 180;
  return [from[0] + Math.sin(r) * d, from[1] - Math.cos(r) * d];
}
