import { geoAzimuthalEqualArea, geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import type { MultiPolygon, Polygon } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land110m from "world-atlas/land-110m.json";
import land50m from "world-atlas/land-50m.json";
import type { Point } from "./flowers";

export interface TalkMap {
  name: string;
  left: number;
  top: number;
  width: number;
  height: number;
  viewBox: string;
  landPath: string;
  cropped: boolean;
  project: (lon: number, lat: number) => Point;
  holds: (lon: number, lat: number) => boolean;
}

function landOf(atlas: unknown): MultiPolygon {
  const topology = atlas as Topology<{ land: GeometryCollection }>;
  const earth = feature(topology, topology.objects.land) as unknown as { features: { geometry: MultiPolygon }[] };
  return {
    type: "MultiPolygon",
    coordinates: earth.features
      .flatMap((f) => f.geometry.coordinates)
      .filter((polygon) => Math.max(...polygon[0].map(([, lat]) => lat)) > -60),
  };
}

function outline(projection: GeoProjection, land: MultiPolygon, tolerance: number): string {
  let d = "";
  let last: Point = [NaN, NaN];
  const put = (command: string, x: number, y: number) => {
    d += `${command}${x.toFixed(1)} ${y.toFixed(1)}`;
    last = [x, y];
  };
  geoPath(projection, {
    beginPath() {},
    moveTo: (x, y) => put("M", x, y),
    lineTo: (x, y) => {
      if (Math.hypot(x - last[0], y - last[1]) >= tolerance) put("L", x, y);
    },
    closePath() {
      d += "Z";
    },
    arc() {},
  })(land);
  return d;
}

function frame(
  name: string,
  projection: GeoProjection,
  [[left, top], [right, bottom]]: [Point, Point],
  land: MultiPolygon,
  { inset = 0, tolerance = 0, cropped = false } = {},
): TalkMap {
  const width = Math.ceil(right - left);
  const height = Math.ceil(bottom - top);
  const project = (lon: number, lat: number) => projection([lon, lat]) as Point;
  return {
    name,
    left,
    top,
    width,
    height,
    viewBox: `${left.toFixed(1)} ${top.toFixed(1)} ${width} ${height}`,
    landPath: outline(projection, land, tolerance),
    cropped,
    project,
    holds: (lon, lat) => {
      const [x, y] = project(lon, lat);
      return x > left + inset && x < left + width - inset && y > top + inset && y < top + height - inset;
    },
  };
}

const earth = landOf(land110m);
const MARGIN = 3;
const natural = geoNaturalEarth1().fitWidth(1000, earth);
const [[x0, y0], [x1, y1]] = geoPath(natural).bounds(earth);

export const world = frame(
  "world",
  natural,
  [
    [x0 - MARGIN, y0 - MARGIN],
    [x1 + MARGIN, y1 + MARGIN],
  ],
  earth,
);

const [WEST, EAST, SOUTH, NORTH] = [-11, 24, 35, 60];
const edge = (from: Point, to: Point) =>
  Array.from({ length: 21 }, (_, i): Point => [from[0] + ((to[0] - from[0]) * i) / 20, from[1] + ((to[1] - from[1]) * i) / 20]);
const region: Polygon = {
  type: "Polygon",
  coordinates: [
    [
      ...edge([WEST, SOUTH], [WEST, NORTH]),
      ...edge([WEST, NORTH], [EAST, NORTH]),
      ...edge([EAST, NORTH], [EAST, SOUTH]),
      ...edge([EAST, SOUTH], [WEST, SOUTH]),
    ],
  ],
};
const laea = geoAzimuthalEqualArea().rotate([-10, -52]).fitWidth(340, region);
const bounds = geoPath(laea).bounds(region) as [Point, Point];
laea.clipExtent(bounds);

export const europe = frame("europe", laea, bounds, landOf(land50m), { inset: 12, tolerance: 1.5, cropped: true });
