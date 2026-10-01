import { useEffect, useMemo, useState } from 'react';
import { MapPin, Minus, Plus, RotateCcw } from 'lucide-react';
import type { MapBounds, QuizQuestion } from '@workspace/api-client-react';
import cairoRoadData from '../data/cairo-roads.json';
import alexandriaRoadData from '../data/alexandria-roads.json';
import cairoMapContextData from '../data/cairo-map-context.json';
import alexandriaMapContextData from '../data/alexandria-map-context.json';
import {
  buildAreaPaths,
  buildCoastlinePaths,
  buildLinePaths,
  buildRoadPaths,
  buildMapLabels,
  createRandomSection,
  MAP_HEIGHT,
  MAP_WIDTH,
  projectCoordinates,
  ROAD_LAYERS,
  zoomSection,
  type MapContext,
  type RoadNetwork,
} from './geographic-map-utils';

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

const roadNetworks: Record<string, RoadNetwork> = {
  cairo: cairoRoadData,
  alexandria: alexandriaRoadData,
};

const mapContexts: Record<string, MapContext> = {
  cairo: cairoMapContextData,
  alexandria: alexandriaMapContextData,
};

export function GeographicMap({
  cityId,
  cityName,
  mapBounds,
  question,
  variant = 'quiz',
}: GeographicMapProps) {
  const network = roadNetworks[cityId];
  const context = mapContexts[cityId];
  const questionKey = question?.id ?? 'preview';
  const [zoom, setZoom] = useState(1);
  const targetLocation = useMemo(
    () =>
      question
        ? { lat: question.targetLat, lng: question.targetLng }
        : null,
    [question?.id, question?.targetLat, question?.targetLng],
  );
  useEffect(() => {
    setZoom(1);
  }, [cityId, questionKey]);
  const localBounds = useMemo(
    () => createRandomSection(mapBounds, targetLocation ?? undefined),
    [cityId, mapBounds, questionKey, targetLocation],
  );
  const viewBounds = useMemo(
    () => zoomSection(localBounds, targetLocation, zoom),
    [localBounds, targetLocation, zoom],
  );
  const roadPaths = useMemo(
    () => (network ? buildRoadPaths(network, viewBounds) : null),
    [network, viewBounds],
  );
  const waterAreas = useMemo(
    () => (context ? buildAreaPaths(context, viewBounds, 'water') : []),
    [context, viewBounds],
  );
  const gardenAreas = useMemo(
    () => (context ? buildAreaPaths(context, viewBounds, 'garden') : []),
    [context, viewBounds],
  );
  const waterways = useMemo(
    () => (context ? buildLinePaths(context.waterways, viewBounds) : []),
    [context, viewBounds],
  );
  const coastlines = useMemo(
    () =>
      context
        ? buildCoastlinePaths(context, viewBounds)
        : { paths: [], seaFillPath: '' },
    [context, viewBounds],
  );
  const mapLabels = useMemo(
    () =>
      question && context && targetLocation
        ? buildMapLabels(
            context,
            viewBounds,
            targetLocation,
            question.kind,
            question.options.map((option) => option.label),
          )
        : [],
    [
      context,
      question?.id,
      question?.kind,
      question?.options,
      targetLocation,
      viewBounds,
    ],
  );
  const target = question
    ? projectCoordinates(question.targetLng, question.targetLat, viewBounds)
    : null;

  if (!network || !context || !roadPaths) {
    return (
      <div className="map-card map-unavailable" role="alert">
        Map data is not available for {cityName} yet.
      </div>
    );
  }

  const showContextLabels = Boolean(question);
  const handleZoomIn = () => setZoom((current) => Math.min(current + 0.5, 4));
  const handleZoomOut = () => setZoom((current) => Math.max(current - 0.5, 1));

  return (
    <div
      className={`map-card${variant === 'preview' ? ' map-card-preview' : ''}`}
      data-testid={`map-geographic-${question?.id ?? 'preview'}`}
      data-street-names={showContextLabels ? 'shown' : 'hidden'}
      data-landmark-names={showContextLabels ? 'shown' : 'hidden'}
    >
      <div className="map-topline">
        <span className="map-label">
          <MapPin size={12} /> REAL STREET MAP · {cityName}
        </span>
        <span className="map-north" aria-label="North is up">
          N
        </span>
      </div>
      <div className="map-legend" aria-label="Map colors">
        <span><i className="map-legend-water" /> Water</span>
        <span><i className="map-legend-garden" /> Gardens</span>
      </div>
      {question && variant !== 'preview' && (
        <div className="map-zoom-controls" role="group" aria-label="Map zoom controls">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            data-testid="button-map-zoom-out"
          >
            <Minus size={15} />
          </button>
          <span className="map-zoom-level" aria-live="polite">
            {zoom.toFixed(1).replace(/\.0$/, '')}×
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={handleZoomIn}
            disabled={zoom >= 4}
            data-testid="button-map-zoom-in"
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            aria-label="Reset map zoom"
            onClick={() => setZoom(1)}
            disabled={zoom === 1}
            data-testid="button-map-zoom-reset"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      )}

      <svg
        className="geographic-map"
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-label={
          question
            ? `Random local OpenStreetMap section of ${cityName} with nearby street and landmark names; answer choices are not labeled`
            : `Random local OpenStreetMap street section of ${cityName}`
        }
      >
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#e9ebdf" />
        {coastlines.seaFillPath && (
          <path className="map-area-water" d={coastlines.seaFillPath} />
        )}
        {waterAreas.map((area) => (
          <path key={area.id} className="map-area-water" d={area.d} />
        ))}
        {gardenAreas.map((area) => (
          <path key={area.id} className="map-area-garden" d={area.d} />
        ))}
        {waterways.map((waterway) => (
          <path key={waterway.id} className="map-waterway" d={waterway.d} />
        ))}
        {coastlines.paths.map((coastline) => (
          <path key={coastline.id} className="map-coastline" d={coastline.d} />
        ))}
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
        {showContextLabels && mapLabels.length > 0 && (
          <g className="map-context-labels" aria-hidden="true">
            {mapLabels.map((label, index) => (
              <text
                key={label.id}
                data-testid={`map-label-${label.kind}-${index}`}
                className={
                  label.kind === 'landmark'
                    ? 'map-landmark-label'
                    : 'map-street-label'
                }
                x={label.x.toFixed(1)}
                y={label.y.toFixed(1)}
                textAnchor="middle"
                transform={`rotate(${label.angle.toFixed(1)} ${label.x.toFixed(1)} ${label.y.toFixed(1)})`}
              >
                {label.name}
              </text>
            ))}
          </g>
        )}
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

      <span className="map-scale">
        {variant === 'preview'
          ? 'RANDOM LOCAL SECTION'
          : 'LOCAL STREET + LANDMARK NAMES'}
      </span>
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