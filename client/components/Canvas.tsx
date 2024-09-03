import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import MapViz from './MapViz';
import bg from '../public/bg.jpg'

interface CanvasProps {
  mapNames: string[];
}

interface MapPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

const Canvas: React.FC<CanvasProps> = ({ mapNames }) => {
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [mapPositions, setMapPositions] = useState<MapPosition[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  useEffect(() => {
    // Load a background image (you can replace this with your own image URL)
    setBackgroundImage(bg.src);
  }, []);

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

  useEffect(() => {
    setMapPositions(mapNames.map((_, index) => ({
      x: (index % 2) * (canvasSize.width / 2),
      y: Math.floor(index / 2) * (canvasSize.height / 2),
      width: canvasSize.width / 2,
      height: canvasSize.height / 2,
    })));
  }, [mapNames, canvasSize]);

  const handleResize = (index: number, e: MouseEvent | TouchEvent, direction: any, ref: HTMLElement, delta: any, position: { x: number; y: number }) => {
    let { width: refwidth, height: refheight } = ref.style;

    let width = parseFloat(refwidth);
    let height = parseFloat(refheight);

    if (['topRight', 'bottomRight', 'bottomLeft', 'topLeft'].includes(direction)) {
      const aspectRatio = mapPositions[index].width / mapPositions[index].height;
      if (direction === 'topLeft' || direction === 'bottomLeft') {
        width = height * aspectRatio;
      } else {
        height = width / aspectRatio;
      }
    }

    setMapPositions(prev => {
      const newPositions = [...prev];
      newPositions[index] = {
        x: position.x,
        y: position.y,
        width: width,
        height: height,
      };
      return newPositions;
    });
  };

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
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >        {mapNames.map((mapName, index) => (
        <Rnd
          key={index}
          size={{ width: mapPositions[index]?.width || 0, height: mapPositions[index]?.height || 0 }}
          position={{ x: mapPositions[index]?.x || 0, y: mapPositions[index]?.y || 0 }}
          onDragStop={(e, d) => {
            setMapPositions(prev => {
              const newPositions = [...prev];
              newPositions[index] = { ...newPositions[index], x: d.x, y: d.y };
              return newPositions;
            });
          }}
          onResize={(e, direction, ref, delta, position) => handleResize(index, e, direction, ref, delta, position)}
          minWidth={100}
          minHeight={100}
          bounds="parent"
          enableResizing={{
            top: true,
            right: true,
            bottom: true,
            left: true,
            topRight: true,
            bottomRight: true,
            bottomLeft: true,
            topLeft: true,
          }}
        >
          <MapViz
            mapName={mapName}
            canvasRef={canvasRef}
            position={mapPositions[index]}
          />
        </Rnd>
      ))}
      </div>
    </div>
  );
};

export default Canvas;
