import React, { useEffect } from 'react';
import { Map } from '../types/map';

interface MapVizProps {
  mapName: string;
}

const MapViz: React.FC<MapVizProps> = ({ mapName }: MapVizProps) => {

  const [mapData, setMapData] = React.useState<Map | null>()

  useEffect(() => {
    async function fetchMapData() {
      const response = await fetch(`/api/getMapData/${mapName}`)
      const data = await response.json()
      setMapData(data)
    }

    fetchMapData()
  },
    [mapName]
  );

  return (
    <div className="bg-gray-200 p-2 rounded-md shadow-md">
      {
        mapData ? (
          <div className="grid" style={{ gridTemplateColumns: `repeat(${mapData.width}, 1fr)` }}>
            {mapData.map.map((value, index) => (
              <div
                key={index}
                className={`w-1 h-1 ${value === -1 ? 'bg-green-300 opacity-30' : 'bg-green-300 opacity-90'}`}
              />
            ))}
          </div>
        ) : (<>Loading the map...</>)
      }
    </div>
  );
}

export default MapViz;
