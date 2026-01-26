import { BLOCK_PADDING_X_PX, BLOCK_PADDING_Y_PX } from '@/constants';
import { DataDeposition } from '@/types/data';
import { Filter, FilterItemState, FilterType } from '@/types/filter';
import 'leaflet/dist/leaflet.css';
import { useState, useCallback, useMemo } from 'react';
import { CircleMarker, LayerGroup, MapContainer, TileLayer } from 'react-leaflet';
import { CityTooltip } from './CityTooltip';
import { MapInvalidator } from './MapInvalidator';
import { MapZoom } from './MapZoom';
import { colors } from '@/config/colors';
import { type LeafletEventHandlerFnMap } from 'leaflet';

const zoomCoefficient = (zoom: number) => {
  return (Math.pow(zoom, 0.1) - 1) * 10;
};

const circleRadius = (value: number, zoom: number) => {
  if (value === 0) {
    return 0;
  }
  return Math.pow(value, 0.3) * 5 * zoomCoefficient(zoom);
};

interface BlockDepositionMapProps {
  data: DataDeposition[];
  onFilterChange: (filter: Filter) => void;
  filter: Filter;
  width: number;
  height: number;
}

export const BlockDepositionMap = ({
  data,
  onFilterChange,
  filter,
  width,
  height,
}: BlockDepositionMapProps) => {
  const center = { lat: 51.5074, lng: -0.1278 };

  const renderTooltip = (point: DataDeposition) => {
    return <CityTooltip city={point} onFilterChange={onFilterChange} filter={filter} />;
  };

  const [zoom, setZoom] = useState(5);
  const [hoveredPointId, setHoveredPointId] = useState<number | null>(null);

  const isSomethingSelected = filter.type !== FilterType.NONE;

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
        height: `${height - BLOCK_PADDING_Y_PX}px`,
        width: `${width - BLOCK_PADDING_X_PX}px`,
      }}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="z-40"
        // style={{ height: `${height}px`, width: `${width}px` }}
      >
        <MapInvalidator width={width} height={height} />
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
                    stroke: isHovered,
                    color: colors.default.text,
                  }}
                  className={`${isSomethingSelected ? colors.dimmed.fill : colors.default.fill} ${
                    colors.default.fillHover
                  } cursor-pointer transition-all`}
                  eventHandlers={eventHandlers}
                >
                  {renderTooltip(point)}
                </CircleMarker>
              )}
              {/* Active texts */}
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
};
