import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    async function fetchMapData() {
      const response = await fetch(`/api/getMapData/${mapName}`);
      const data = await response.json();
      setMapData(data);
    }

    fetchMapData();
  }, [mapName]);

  const updateColors = useCallback(() => {
    if (mapData && canvasRef.current && mapRef.current && imgRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = imgRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

      const colors = mapData.map.map((value, index) => {
        if (value === -1) return 'transparent';

        const x = (index % mapData.width) / mapData.width * position.width + position.x;
        const y = Math.floor(index / mapData.width) / mapData.height * position.height + position.y;

        const pixelX = Math.floor(x / canvasRef.current!.clientWidth * img.naturalWidth);
        const pixelY = Math.floor(y / canvasRef.current!.clientHeight * img.naturalHeight);

        const pixel = ctx.getImageData(pixelX, pixelY, 1, 1).data;
        return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      });

      setCellColors(colors);
    }
  }, [mapData, canvasRef, position]);

  useEffect(() => {
    if (mapData && canvasRef.current) {
      if (!imgRef.current) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        // Try to get the background image URL
        const bgImageStyle = window.getComputedStyle(canvasRef.current.firstElementChild as Element).backgroundImage;
        const bgImageUrl = bgImageStyle.replace(/url\(['"]?(.+?)['"]?\)/, '$1');
        
        img.src = bgImageUrl;
        img.onload = () => {
          imgRef.current = img;
          updateColors();
        };
      } else {
        updateColors();
      }
    }
  }, [mapData, canvasRef, position, updateColors]);

  return (
    <div ref={mapRef} className="bg-transparent p-2 rounded-md shadow-md h-full w-full flex flex-col">
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
                className="rounded-full"
                style={{
                  backgroundColor: cellColors[index] || 'transparent',
                  opacity: value === -1 ? 0 : 1,
                }}
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
