import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
interface MapInvalidatorProps {
  width: number;
  height: number;
}
export const MapInvalidator: React.FC<MapInvalidatorProps> = ({ width, height }) => {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
  }, [map, width, height]);

  return null;
};
