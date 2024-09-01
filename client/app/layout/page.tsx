'use client'

import Canvas from '../../components/Canvas'

export default function LayoutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="text-4xl">
        LayoutPage
      </div>
      <div className="mt-8">
        <h2 className="text-2xl mb-4">Map Data:</h2>
        <div className='flex max-h-screen'>
          <Canvas mapNames={['plusledmap.json', 'crossledmap.json']} />
        </div>
      </div>
    </main>
  );
}
