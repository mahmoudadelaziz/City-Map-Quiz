import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import type { MapBounds, QuizQuestion } from '@workspace/api-client-react';
import cairoRoadData from '../data/cairo-roads.json';
import alexandriaRoadData from '../data/alexandria-roads.json';

type RoadNetwork = {
  source: string;
  roads: Array<{
    type: string;
    points: number[][];
  }>;
};

type GeographicMapProps = {
  cityId: string;
  cityName: string;
  mapBounds: MapBounds;
  question?: QuizQuestion;
  variant?: 'quiz' | 'preview';
};

export const CAIRO_PREVIEW_BOUNDS: MapBounds = {
  north: 30.075,
  south: 30.02,
  east: 31.26,
  west: 31.2,
};

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 720;
const MAP_PADDING = 24;

const ROAD_LAYERS = [
  { type: 'u', casing: 1.8, surface: 0.9 },
  { type: 'r', casing: 2.6, surface: 1.45 },
  { type: 't', casing: 4.1, surface: 2.8 },
  { type: 's', casing: 6, surface: 4.3 },
  { type: 'p', casing: 8.5, surface: 6.5 },
];

const roadNetworks: Record<string, RoadNetwork> = {
  cairo: cairoRoadData,
  alexandria: alexandriaRoadData,
};

function mercatorY(latitude: number) {
  const radians = (latitude * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + radians / 2));
}

function projectCoordinates(
  longitude: number,
  latitude: number,
  bounds: MapBounds,
) {
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

function buildRoadPaths(network: RoadNetwork, bounds: MapBounds) {
  const paths = Object.fromEntries(
    ROAD_LAYERS.map(({ type }) => [type, '']),
  ) as Record<string, string>;

  for (const road of network.roads) {
    if (paths[road.type] === undefined || road.points.length < 2) continue;

    const points = road.points
      .map(([longitude, latitude]) => {
        if (longitude === undefined || latitude === undefined) return null;
        return projectCoordinates(longitude, latitude, bounds);
      })
      .filter((point): point is { x: number; y: number } => point !== null);

    if (points.length < 2) continue;
    paths[road.type] +=
      `M${points[0]!.x.toFixed(1)},${points[0]!.y.toFixed(1)}` +
      points
        .slice(1)
        .map((point) => `L${point.x.toFixed(1)},${point.y.toFixed(1)}`)
        .join('');
  }

  return paths;
}

export function GeographicMap({
  cityId,
  cityName,
  mapBounds,
  question,
  variant = 'quiz',
}: GeographicMapProps) {
  const network = roadNetworks[cityId];
  const roadPaths = useMemo(
    () => (network ? buildRoadPaths(network, mapBounds) : null),
    [network, mapBounds],
  );
  const target = question
    ? projectCoordinates(question.targetLng, question.targetLat, mapBounds)
    : null;

  if (!network || !roadPaths) {
    return (
      <div className="map-card map-unavailable" role="alert">
        Street map data is not available for {cityName} yet.
      </div>
    );
  }

  return (
    <div
      className={`map-card${variant === 'preview' ? ' map-card-preview' : ''}`}
      data-testid={`map-geographic-${question?.id ?? 'preview'}`}
    >
      <div className="map-topline">
        <span className="map-label">
          <MapPin size={12} /> REAL STREET MAP · {cityName}
        </span>
        <span className="map-north" aria-label="North is up">
          N
        </span>
      </div>

      <svg
        className="geographic-map"
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-label={
          question
            ? `Unlabeled OpenStreetMap street map of ${cityName} with a marker at the quiz location`
            : `Unlabeled OpenStreetMap street map of ${cityName}`
        }
      >
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#e9ebdf" />
        <g aria-hidden="true">
          {ROAD_LAYERS.map(({ type, casing, surface }) => (
            <g key={type}>
              <path
                className="map-road-casing"
                d={roadPaths[type]}
                strokeWidth={casing}
              />
              <path
                className="map-road"
                d={roadPaths[type]}
                strokeWidth={surface}
              />
            </g>
          ))}
        </g>
        {target && question && (
          <g transform={`translate(${target.x.toFixed(1)} ${target.y.toFixed(1)})`}>
            <circle
              className="map-target-pulse"
              r="19"
              fill="#d6765a"
              data-testid={`marker-target-${question.id}`}
            />
            <circle className="map-target-dot" r="8.5" />
          </g>
        )}
      </svg>

      <span className="map-scale">NORTH IS UP · STREET NAMES HIDDEN</span>
      <a
        className="map-attribution"
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
      >
        © OpenStreetMap contributors
      </a>
    </div>
  );
}