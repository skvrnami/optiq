import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
interface MapZoomProps {
  onZoomEnd: (zoom: number) => void;
}
export const MapZoom: React.FC<MapZoomProps> = ({ onZoomEnd }) => {
  const map = useMap();

  useEffect(() => {
    const handleZoomEnd = () => {
      onZoomEnd(map.getZoom());
    };

    map.on('zoomend', handleZoomEnd);

    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, onZoomEnd]);

  return null;
};
