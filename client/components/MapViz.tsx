import React, { useEffect, useState, useRef } from 'react';
import { Map } from '../types/map';

interface MapVizProps {
  mapName: string;
  canvasRef: React.RefObject<HTMLDivElement>;
  position: { x: number; y: number; width: number; height: number };
}

const MapViz: React.FC<MapVizProps> = ({ mapName, canvasRef, position }) => {
  const [mapData, setMapData] = useState<Map | null>(null);
  const [cellColors, setCellColors] = useState<string[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchMapData() {
      const response = await fetch(`/api/getMapData/${mapName}`);
      const data = await response.json();
      setMapData(data);
    }

    fetchMapData();
  }, [mapName]);

  useEffect(() => {
    if (mapData && canvasRef.current && mapRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = canvasRef.current.style.backgroundImage.slice(5, -2);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const colors = mapData.map.map((_, index) => {
          const x = (index % mapData.width) / mapData.width * position.width + position.x;
          const y = Math.floor(index / mapData.width) / mapData.height * position.height + position.y;

          const pixelX = Math.floor(x / canvasRef.current!.clientWidth * img.width);
          const pixelY = Math.floor(y / canvasRef.current!.clientHeight * img.height);

          const pixel = ctx.getImageData(pixelX, pixelY, 1, 1).data;
          return `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
        });

        setCellColors(colors);
      };
    }
  }, [mapData, canvasRef, position]);

  return (
    <div ref={mapRef} className="p-2 rounded-md shadow-md h-full w-full flex flex-col">
      {mapData ? (
        <div className="flex-grow flex items-center justify-center overflow-hidden">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${mapData.width}, 1fr)`,
              gridTemplateRows: `repeat(${mapData.height}, 1fr)`,
              aspectRatio: `${mapData.width} / ${mapData.height}`,
              width: '100%',
              height: '100%',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            {mapData.map.map((value, index) => (
              <div
                key={index}
                className={`rounded-full ${
                  value === -1 ? 'opacity-30' : 'opacity-90'
                }`}
                style={{ backgroundColor: cellColors[index] || 'green' }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center">Loading the map...</div>
      )}
    </div>
  );
};

export default MapViz;
