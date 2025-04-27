import { BLOCK_PADDING_X_PX, BLOCK_PADDING_Y_PX } from '@/constants';
import { DataDeposition } from '@/types/data';
import { Filter, FilterItemState, FilterType } from '@/types/filter';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import { CircleMarker, LayerGroup, MapContainer, TileLayer } from 'react-leaflet';
import { CityTooltip } from './CityTooltip';
import { MapInvalidator } from './MapInvalidator';
import { MapZoom } from './MapZoom';
import { colors } from '@/config/colors';

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

  const isSomethingSelected = filter.type !== FilterType.NONE;

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
        {data.map((point) => {
          const textsAll = point.noTextsActive + point.noTextsInactive;
          const institutes = point.institutes;

          const radiusAll = circleRadius(textsAll, zoom);
          const radiusActive = circleRadius(point.noTextsActive, zoom);

          const isSelected = institutes.some(
            (institute) => institute.state === FilterItemState.SELECTED
          );

          const activeStroke = isSelected ? colors.primary.stroke : 'stroke-transparent';
          const activeFill = isSelected ? colors.primary.fill : colors.active.fill;
          const activeFillHover = isSelected ? colors.primary.fillHover : colors.active.fillHover;

          return (
            <LayerGroup key={point.id}>
              {/* All texts */}
              {radiusAll > 0 && radiusAll !== radiusActive && (
                <CircleMarker
                  center={[point.x, point.y]}
                  radius={radiusAll}
                  pathOptions={{
                    weight: 2,
                    fillOpacity: 0.4,
                    opacity: 0.75,
                    stroke: false,
                    color: 'white',
                  }}
                  className={`${isSomethingSelected ? colors.dimmed.fill : colors.default.fill} ${
                    colors.default.fillHover
                  }`}
                  // eventHandlers={{
                  //   click: () => handlePointClick(point),
                  // }}
                >
                  {renderTooltip(point)}
                </CircleMarker>
              )}
              {/* Active texts */}
              {radiusActive > 0 && isSomethingSelected && (
                <CircleMarker
                  center={[point.x, point.y]}
                  radius={radiusActive}
                  className={`${activeFill} ${activeFillHover} ${activeStroke}`}
                  pathOptions={{
                    weight: 0,
                    fillOpacity: 0.5,

                    opacity: 0.5,
                    fill: true,
                  }}
                  // eventHandlers={{
                  //   click: () => handlePointClick(point),
                  // }}
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
