import { join } from "path";
import { promises as fs } from "fs";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { mapName: string } }
) {
  const mapName = params.mapName;
  try {
    const path = join(process.cwd(), '..', 'server', 'assets', 'maps', mapName);
    const fileContent = await fs.readFile(path, 'utf-8');
    const mapData = JSON.parse(fileContent);

    return new Response(JSON.stringify(mapData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response('Error', { status: 500 });
  }
}

