import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import MapViz from './MapViz';

interface Map {
  n: string;
  width: number;
  height: number;
  map: number[];
}

interface CanvasProps {
  mapNames: string[];
}

const Canvas: React.FC<CanvasProps> = ({ mapNames }: CanvasProps) => {
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.8;
        
        let width = maxWidth;
        let height = (width * heightRatio) / widthRatio;

        if (height > maxHeight) {
          height = maxHeight;
          width = (height * widthRatio) / heightRatio;
        }

        setCanvasSize({ width, height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [aspectRatio]);

  return (
    <div className="flex flex-col items-center w-full p-4">
      <div className="mb-4">
        <label htmlFor="aspectRatio" className="mr-2">Aspect Ratio:</label>
        <input
          id="aspectRatio"
          type="text"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
      <div
        ref={canvasRef}
        className="relative bg-gray-100 border border-gray-300"
        style={{ width: `${canvasSize.width}px`, height: `${canvasSize.height}px` }}
      >
        {mapNames.map((mapName, index) => (
          <Rnd
            key={index}
            default={{
              x: 0,
              y: 0,
              width: 200,
              height: 200,
            }}
            minWidth={10}
            minHeight={10}
            bounds="parent"
          >
            <MapViz mapName={mapName} />
          </Rnd>
        ))}
      </div>
    </div>
  );
};

export default Canvas;
