import { DataDeposition } from '@/types/data';
import { Filter, FilterItemState, FilterType } from '@/types/filter';
import 'leaflet/dist/leaflet.css';
import { memo, useState, useCallback, useMemo } from 'react';
import { CircleMarker, LayerGroup, MapContainer, TileLayer } from 'react-leaflet';
import { CityTooltip } from './CityTooltip';
import { MapInvalidator } from './MapInvalidator';
import { MapZoom } from './MapZoom';
import { colors } from '@/config/colors';
import { type LatLngBoundsExpression, type LeafletEventHandlerFnMap } from 'leaflet';
import { useScreenSize } from '@/utils/useScreenSize';

const zoomCoefficient = (zoom: number) => {
  return (Math.pow(zoom, 0.1) - 1) * 10;
};

const circleRadius = (value: number, zoom: number) => {
  if (value === 0) return 0;
  return Math.pow(value, 0.3) * 5 * zoomCoefficient(zoom);
};

// Latitude beyond this is Mercator distortion with no data in it; the bound
// also stops the view drifting off the top or bottom of the world.
const WORLD_BOUNDS: LatLngBoundsExpression = [
  [-85, -180],
  [85, 180],
];

const MIN_ZOOM = 4;
const DEFAULT_ZOOM = 5;

interface BlockDepositionMapProps {
  data: DataDeposition[];
  onFilterChange: (filter: Filter) => void;
  filter: Filter;
  width: number;
  height: number;
}

export const BlockDepositionMap = memo(
  ({ data, onFilterChange, filter, width, height }: BlockDepositionMapProps) => {
    const { blockPadding } = useScreenSize();
    const center = { lat: 50, lng: 10 };

    const [zoom, setZoom] = useState(DEFAULT_ZOOM);
    const [hoveredPointId, setHoveredPointId] = useState<number | null>(null);

    // Calculate effective dimensions - ensure they don't exceed passed height/width
    const effectiveWidth = Math.max(0, width - blockPadding.x);
    // The minimum lives in LAYOUT.minMapBlockHeight; a second floor here would
    // render a map taller than the block that clips it.
    const effectiveHeight = Math.max(0, height - blockPadding.y);

    const isSomethingSelected = filter.type !== FilterType.NONE;

    const renderTooltip = useCallback(
      (point: DataDeposition) => (
        <CityTooltip city={point} onFilterChange={onFilterChange} filter={filter} />
      ),
      [onFilterChange, filter]
    );

    const createEventHandlers = useCallback(
      (pointId: number): LeafletEventHandlerFnMap => ({
        mouseover: () => setHoveredPointId(pointId),
        mouseout: () => setHoveredPointId(null),
      }),
      []
    );

    const sortedData = useMemo<DataDeposition[]>(() => {
      return [...data].sort((a, b) => {
        return b.noTextsActive + b.noTextsInactive - (a.noTextsActive + a.noTextsInactive);
      });
    }, [data]);

    return (
      <div
        className="bg-white overflow-hidden z-40"
        style={{
          height: effectiveHeight,
          width: effectiveWidth,
        }}
      >
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={zoom}
          minZoom={MIN_ZOOM}
          // Tiles repeat forever horizontally, but a CircleMarker is drawn only
          // at its literal longitude. Panning past the date line therefore lands
          // on a copy of the world with no circles on it. worldCopyJump moves the
          // view back onto the primary copy, so the depositions stay visible.
          worldCopyJump
          maxBounds={WORLD_BOUNDS}
          maxBoundsViscosity={0.5}
          className="z-40 h-full w-full"
        >
          <MapInvalidator width={effectiveWidth} height={effectiveHeight} />
          <MapZoom onZoomEnd={setZoom} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {sortedData.map((point) => {
            const textsAll = point.noTextsActive + point.noTextsInactive;
            const institutes = point.institutes;

            const isHovered = hoveredPointId === point.id;
            const hoverScale = isHovered ? 1.1 : 1;

            const radiusAll = circleRadius(textsAll, zoom) * hoverScale;
            const radiusActive = circleRadius(point.noTextsActive, zoom) * hoverScale;

            const isSelected = institutes.some(
              (institute) => institute.state === FilterItemState.SELECTED
            );

            const activeStroke = isSelected ? colors.primary.stroke : 'stroke-transparent';
            // Leaflet writes pathOptions.color into the SVG stroke attribute, so it must
            // be a CSS colour, never a class. The stroke stays palette-driven by riding
            // on className instead; a CSS rule overrides the attribute Leaflet sets.
            const allStroke = isHovered ? colors.default.stroke : 'stroke-transparent';
            const activeFill = isSelected ? colors.primary.fill : colors.active.fill;
            const activeFillHover = isSelected ? colors.primary.fillHover : colors.active.fillHover;

            const eventHandlers = createEventHandlers(point.id);

            return (
              <LayerGroup key={point.id}>
                {radiusAll > 0 && radiusAll !== radiusActive && (
                  <CircleMarker
                    center={[point.x, point.y]}
                    radius={radiusAll}
                    pathOptions={{
                      weight: isHovered ? 3 : 2,
                      fillOpacity: isHovered ? 0.6 : 0.4,
                      opacity: isHovered ? 0.9 : 0.75,
                      stroke: true,
                    }}
                    className={`${isSomethingSelected ? colors.dimmed.fill : colors.default.fill} ${
                      colors.default.fillHover
                    } ${allStroke} cursor-pointer transition-all`}
                    eventHandlers={eventHandlers}
                  >
                    {renderTooltip(point)}
                  </CircleMarker>
                )}
                {radiusActive > 0 && isSomethingSelected && (
                  <CircleMarker
                    center={[point.x, point.y]}
                    radius={radiusActive}
                    className={`${activeFill} ${activeFillHover} ${activeStroke} cursor-pointer transition-all`}
                    pathOptions={{
                      weight: isHovered ? 2 : 0,
                      fillOpacity: isHovered ? 0.7 : 0.5,
                      opacity: isHovered ? 0.9 : 0.75,
                      fill: true,
                    }}
                    eventHandlers={eventHandlers}
                  >
                    {renderTooltip(point)}
                  </CircleMarker>
                )}
              </LayerGroup>
            );
          })}
        </MapContainer>
      </div>
    );
  }
);
