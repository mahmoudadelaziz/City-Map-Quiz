import type { MapBounds } from '@workspace/api-client-react';

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 720;
const MAP_PADDING = 24;

export const ROAD_LAYERS = [
  { type: 'u', casing: 1.8, surface: 0.9 },
  { type: 'r', casing: 2.6, surface: 1.45 },
  { type: 't', casing: 4.1, surface: 2.8 },
  { type: 's', casing: 6, surface: 4.3 },
  { type: 'p', casing: 8.5, surface: 6.5 },
];

export type RoadNetwork = {
  roads: Array<{ type: string; points: number[][] }>;
};

export type MapContext = {
  roads: Array<{ type: string; name: string; points: number[][] }>;
  areas: Array<{ type: string; points: number[][] }>;
  waterways: Array<{ type: string; points: number[][] }>;
  coastlines: number[][][];
};

export type MapPoint = { x: number; y: number };
export type StreetLabel = {
  name: string;
  x: number;
  y: number;
  angle: number;
  width: number;
};

const LOCAL_LATITUDE_SPAN = 0.009;
const LOCAL_LONGITUDE_SPAN = 0.011;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function createRandomSection(
  cityBounds: MapBounds,
  target?: { lat: number; lng: number },
): MapBounds {
  const latitudeSpan = Math.min(
    LOCAL_LATITUDE_SPAN,
    cityBounds.north - cityBounds.south,
  );
  const longitudeSpan = Math.min(
    LOCAL_LONGITUDE_SPAN,
    cityBounds.east - cityBounds.west,
  );
  const mapCenterLat = (cityBounds.north + cityBounds.south) / 2;
  const mapCenterLng = (cityBounds.east + cityBounds.west) / 2;
  const referenceLat = target?.lat ?? mapCenterLat;
  const referenceLng = target?.lng ?? mapCenterLng;
  const maxLatShift = latitudeSpan * (target ? 0.14 : 0.24);
  const maxLngShift = longitudeSpan * (target ? 0.14 : 0.24);
  const minCenterLat = Math.max(
    cityBounds.south + latitudeSpan / 2,
    referenceLat - latitudeSpan * 0.4,
  );
  const maxCenterLat = Math.min(
    cityBounds.north - latitudeSpan / 2,
    referenceLat + latitudeSpan * 0.4,
  );
  const minCenterLng = Math.max(
    cityBounds.west + longitudeSpan / 2,
    referenceLng - longitudeSpan * 0.4,
  );
  const maxCenterLng = Math.min(
    cityBounds.east - longitudeSpan / 2,
    referenceLng + longitudeSpan * 0.4,
  );
  const centerLat = clamp(
    referenceLat + (Math.random() - 0.5) * 2 * maxLatShift,
    minCenterLat,
    maxCenterLat,
  );
  const centerLng = clamp(
    referenceLng + (Math.random() - 0.5) * 2 * maxLngShift,
    minCenterLng,
    maxCenterLng,
  );

  return {
    north: centerLat + latitudeSpan / 2,
    south: centerLat - latitudeSpan / 2,
    east: centerLng + longitudeSpan / 2,
    west: centerLng - longitudeSpan / 2,
  };
}

export function zoomSection(
  section: MapBounds,
  target: { lat: number; lng: number } | null,
  zoom: number,
): MapBounds {
  const latitudeSpan = (section.north - section.south) / zoom;
  const longitudeSpan = (section.east - section.west) / zoom;
  const centerLat = (section.north + section.south) / 2;
  const centerLng = (section.east + section.west) / 2;
  const anchorLat = target?.lat ?? centerLat;
  const anchorLng = target?.lng ?? centerLng;
  const zoomedCenterLat = anchorLat + (centerLat - anchorLat) / zoom;
  const zoomedCenterLng = anchorLng + (centerLng - anchorLng) / zoom;

  return {
    north: zoomedCenterLat + latitudeSpan / 2,
    south: zoomedCenterLat - latitudeSpan / 2,
    east: zoomedCenterLng + longitudeSpan / 2,
    west: zoomedCenterLng - longitudeSpan / 2,
  };
}

function mercatorY(latitude: number) {
  const radians = (latitude * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + radians / 2));
}

export function projectCoordinates(
  longitude: number,
  latitude: number,
  bounds: MapBounds,
): MapPoint {
  const west = (bounds.west * Math.PI) / 180;
  const east = (bounds.east * Math.PI) / 180;
  const north = mercatorY(bounds.north);
  const south = mercatorY(bounds.south);
  const longitudeRadians = (longitude * Math.PI) / 180;
  const scale = Math.min(
    (MAP_WIDTH - MAP_PADDING * 2) / (east - west),
    (MAP_HEIGHT - MAP_PADDING * 2) / (north - south),
  );
  const mapWidth = (east - west) * scale;
  const mapHeight = (north - south) * scale;

  return {
    x: (MAP_WIDTH - mapWidth) / 2 + (longitudeRadians - west) * scale,
    y:
      (MAP_HEIGHT - mapHeight) / 2 +
      (north - mercatorY(latitude)) * scale,
  };
}

function geometryIntersectsBounds(points: number[][], bounds: MapBounds) {
  if (points.length === 0) return false;
  const longitudes = points.map(([longitude]) => longitude ?? 0);
  const latitudes = points.map(([, latitude]) => latitude ?? 0);
  return (
    Math.min(...longitudes) <= bounds.east &&
    Math.max(...longitudes) >= bounds.west &&
    Math.min(...latitudes) <= bounds.north &&
    Math.max(...latitudes) >= bounds.south
  );
}

function pathFromPoints(
  points: number[][],
  bounds: MapBounds,
  close = false,
) {
  const projected = points
    .map(([longitude, latitude]) => {
      if (longitude === undefined || latitude === undefined) return null;
      return projectCoordinates(longitude, latitude, bounds);
    })
    .filter((point): point is MapPoint => point !== null);
  if (projected.length < 2) return '';
  return (
    `M${projected[0]!.x.toFixed(1)},${projected[0]!.y.toFixed(1)}` +
    projected
      .slice(1)
      .map((point) => `L${point.x.toFixed(1)},${point.y.toFixed(1)}`)
      .join('') +
    (close ? 'Z' : '')
  );
}

export function buildRoadPaths(network: RoadNetwork, bounds: MapBounds) {
  const paths = Object.fromEntries(
    ROAD_LAYERS.map(({ type }) => [type, '']),
  ) as Record<string, string>;

  for (const road of network.roads) {
    if (
      paths[road.type] === undefined ||
      road.points.length < 2 ||
      !geometryIntersectsBounds(road.points, bounds)
    ) {
      continue;
    }
    paths[road.type] += pathFromPoints(road.points, bounds);
  }

  return paths;
}

export function buildAreaPaths(
  context: MapContext,
  bounds: MapBounds,
  type: 'water' | 'garden',
) {
  return context.areas.flatMap((area, index) => {
    if (
      area.type !== type ||
      area.points.length < 4 ||
      !geometryIntersectsBounds(area.points, bounds)
    ) {
      return [];
    }
    const d = pathFromPoints(area.points, bounds, true);
    return d ? [{ id: `${type}-${index}`, d }] : [];
  });
}

export function buildLinePaths(
  features: Array<{ type: string; points: number[][] }>,
  bounds: MapBounds,
) {
  return features.flatMap((feature, index) => {
    if (
      feature.points.length < 2 ||
      !geometryIntersectsBounds(feature.points, bounds)
    ) {
      return [];
    }
    const d = pathFromPoints(feature.points, bounds);
    return d ? [{ id: `${feature.type}-${index}`, d }] : [];
  });
}

function sameCoordinate(a: number[], b: number[]) {
  return (
    Math.abs((a[0] ?? 0) - (b[0] ?? 0)) < 0.000002 &&
    Math.abs((a[1] ?? 0) - (b[1] ?? 0)) < 0.000002
  );
}

function stitchCoastlines(lines: number[][][]) {
  const remaining = lines
    .filter((line) => line.length >= 2)
    .map((line) => line.map((point) => [...point]));
  const chains: number[][][] = [];

  while (remaining.length > 0) {
    const chain = remaining.shift()!;
    let didJoin = true;
    while (didJoin) {
      didJoin = false;
      for (let index = 0; index < remaining.length; index += 1) {
        const segment = remaining[index]!;
        if (sameCoordinate(chain.at(-1)!, segment[0]!)) {
          chain.push(...segment.slice(1));
        } else if (sameCoordinate(chain.at(-1)!, segment.at(-1)!)) {
          chain.push(...segment.reverse().slice(1));
        } else if (sameCoordinate(chain[0]!, segment.at(-1)!)) {
          chain.unshift(...segment.slice(0, -1));
        } else if (sameCoordinate(chain[0]!, segment[0]!)) {
          chain.unshift(...segment.reverse().slice(0, -1));
        } else {
          continue;
        }
        remaining.splice(index, 1);
        didJoin = true;
        break;
      }
    }
    chains.push(chain);
  }

  return chains;
}

function lineIntersectsBounds(points: number[][], bounds: MapBounds) {
  for (let index = 1; index < points.length; index += 1) {
    const first = points[index - 1]!;
    const second = points[index]!;
    const minLongitude = Math.min(first[0]!, second[0]!);
    const maxLongitude = Math.max(first[0]!, second[0]!);
    const minLatitude = Math.min(first[1]!, second[1]!);
    const maxLatitude = Math.max(first[1]!, second[1]!);
    if (
      minLongitude <= bounds.east &&
      maxLongitude >= bounds.west &&
      minLatitude <= bounds.north &&
      maxLatitude >= bounds.south
    ) {
      return true;
    }
  }
  return false;
}

export function buildCoastlinePaths(
  context: MapContext,
  bounds: MapBounds,
) {
  const chains = stitchCoastlines(context.coastlines).filter((line) =>
    lineIntersectsBounds(line, bounds),
  );
  const paths = chains
    .map((line, index) => ({
      id: `coastline-${index}`,
      d: pathFromPoints(line, bounds),
    }))
    .filter(({ d }) => Boolean(d));
  const longest = [...chains].sort((a, b) => b.length - a.length)[0];

  if (!longest) return { paths, seaFillPath: '' };

  const westToEast =
    longest[0]![0]! <= longest.at(-1)![0]!
      ? longest
      : [...longest].reverse();
  const coastlinePath = pathFromPoints(westToEast, bounds);
  const westTop = projectCoordinates(bounds.west, bounds.north, bounds);
  const eastTop = projectCoordinates(bounds.east, bounds.north, bounds);

  return {
    paths,
    seaFillPath: coastlinePath
      ? `${coastlinePath}L${eastTop.x.toFixed(1)},-160L${westTop.x.toFixed(1)},-160Z`
      : '',
  };
}

function pointInsideBounds(point: number[], bounds: MapBounds) {
  const longitude = point[0];
  const latitude = point[1];
  return (
    longitude !== undefined &&
    latitude !== undefined &&
    longitude >= bounds.west &&
    longitude <= bounds.east &&
    latitude >= bounds.south &&
    latitude <= bounds.north
  );
}

function getLineMidpoint(points: MapPoint[]) {
  let totalLength = 0;
  const lengths = points.slice(1).map((point, index) => {
    const previous = points[index]!;
    const length = Math.hypot(point.x - previous.x, point.y - previous.y);
    totalLength += length;
    return length;
  });
  if (totalLength === 0) return null;

  let remaining = totalLength / 2;
  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index]!;
    if (remaining <= length) {
      const first = points[index]!;
      const second = points[index + 1]!;
      const fraction = length === 0 ? 0 : remaining / length;
      let angle = (Math.atan2(second.y - first.y, second.x - first.x) * 180) / Math.PI;
      if (angle > 90) angle -= 180;
      if (angle < -90) angle += 180;
      return {
        x: first.x + (second.x - first.x) * fraction,
        y: first.y + (second.y - first.y) * fraction,
        angle,
        length: totalLength,
      };
    }
    remaining -= length;
  }
  return null;
}

export function buildStreetLabels(
  context: MapContext,
  bounds: MapBounds,
): StreetLabel[] {
  const longestByName = new Map<
    string,
    { name: string; x: number; y: number; angle: number; length: number }
  >();

  for (const road of context.roads) {
    if (!road.name.trim()) continue;
    const fragments: MapPoint[][] = [];
    let currentFragment: MapPoint[] = [];

    for (const point of road.points) {
      if (pointInsideBounds(point, bounds)) {
        const [longitude, latitude] = point;
        if (longitude !== undefined && latitude !== undefined) {
          currentFragment.push(projectCoordinates(longitude, latitude, bounds));
        }
      } else if (currentFragment.length > 0) {
        fragments.push(currentFragment);
        currentFragment = [];
      }
    }
    if (currentFragment.length > 0) fragments.push(currentFragment);

    const best = fragments
      .map(getLineMidpoint)
      .filter(
        (
          label,
        ): label is NonNullable<ReturnType<typeof getLineMidpoint>> =>
          label !== null,
      )
      .sort((a, b) => b.length - a.length)[0];
    if (
      !best ||
      best.length < 48 ||
      best.x < MAP_PADDING + 8 ||
      best.x > MAP_WIDTH - MAP_PADDING - 8 ||
      best.y < MAP_PADDING + 25 ||
      best.y > MAP_HEIGHT - MAP_PADDING - 20
    ) {
      continue;
    }

    const existing = longestByName.get(road.name);
    if (!existing || best.length > existing.length) {
      longestByName.set(road.name, { name: road.name, ...best });
    }
  }

  const candidates = [...longestByName.values()].sort(
    (a, b) => b.length - a.length,
  );
  const labels: StreetLabel[] = [];
  for (const candidate of candidates) {
    const width = Math.min(candidate.name.length * 8.5, 260);
    const overlaps = labels.some(
      (label) =>
        Math.abs(candidate.x - label.x) <
          (width + label.width) / 2 + 8 &&
        Math.abs(candidate.y - label.y) < 24,
    );
    if (overlaps) continue;
    labels.push({ ...candidate, width });
    if (labels.length >= 24) break;
  }
  return labels;
}