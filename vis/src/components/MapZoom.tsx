import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
interface MapZoomProps {
  onZoomEnd: (zoom: number) => void;
}
export const MapZoom: React.FC<MapZoomProps> = ({ onZoomEnd }) => {
  const map = useMap();

  useEffect(() => {
    map.on('zoomend', () => {
      onZoomEnd(map.getZoom());
    });
  }, [map, onZoomEnd]);

  return null;
};
