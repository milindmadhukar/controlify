import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import MapViz from './MapViz';
import bg from '../public/bg.jpg';

interface MapPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ServerMessage {
  pixelInfo: PixelInfo[];
  currentFrame?: string;
}

interface PixelInfo {
  mapName: string;
  ledCount: number;
  pixelData: string[];
}

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [mapPositions, setMapPositions] = useState<MapPosition[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [serverMessage, setServerMessage] = useState<ServerMessage | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const updateCanvasSize = (imageAspectRatio: number) => {
    if (canvasRef.current) {
      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.8;

      let width = maxWidth;
      let height = width / imageAspectRatio;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * imageAspectRatio;
      }

      setCanvasSize({ width, height });
    }
  };

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8069/ws');

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      const data: ServerMessage = JSON.parse(event.data);
      setServerMessage(data);
      // Set background image
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
    };

    setSocket(ws);

    // HACK: Maybe send message on every update
    const stop = setInterval(() => {
      ws.send(JSON.stringify({
        x: 10,
        y: 12,
        width: 30,
        height: 34,
      }
      ));
    }, 1000);

    return () => {
      // Stop
      clearInterval(stop);
      ws.close();
    };
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = bg.src;
    img.onload = () => {
      setBackgroundImage(bg.src);
      updateCanvasSize(img.width / img.height);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (backgroundImage) {
        const img = new Image();
        img.src = backgroundImage;
        img.onload = () => updateCanvasSize(img.width / img.height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [backgroundImage]);

  // TODO: Re-enable this

  useEffect(() => {
    if (serverMessage && canvasSize.width > 0 && canvasSize.height > 0) {
      setMapPositions(serverMessage.pixelInfo.map((_, index) => ({
        x: (index % 2) * (canvasSize.width / 2),
        y: Math.floor(index / 2) * (canvasSize.height / 2),
        width: canvasSize.width / 2,
        height: canvasSize.height / 2,
      })));
    }
  }, [serverMessage, canvasSize]);

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
      <div
        ref={canvasRef}
        className="relative border border-gray-300"
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
            width: '100%',
            height: '100%',
          }}
        />
        {serverMessage ? (serverMessage?.pixelInfo.map((pixelInfo, index) => (
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
              mapName={pixelInfo.mapName}
              canvasRef={canvasRef}
              position={mapPositions[index]}
            />
          </Rnd>
        ))) : <>Loading...</>}
      </div>
    </div>
  );
};

export default Canvas;
