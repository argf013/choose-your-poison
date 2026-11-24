/**
 * Builds a static map image (OpenStreetMap tiles + center pin) from
 * "lat, lng" text, as a PNG data URL. Returns null if it can't be built
 * (manual text location, offline, tile load failure...).
 */

const TILE = 256;
const cache = new Map<string, Promise<string | null>>();

export function parseCoords(text?: string): { lat: number; lng: number } | null {
  if (!text) return null;
  const m = text.trim().match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lng = parseFloat(m[2]);
  if (Math.abs(lat) > 85 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

function loadTile(z: number, x: number, y: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => reject(new Error("tile timeout")), 7000);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("tile error"));
    };
    img.src = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  });
}

async function render(lat: number, lng: number, w: number, h: number, zoom: number) {
  const n = 2 ** zoom;
  const latRad = (lat * Math.PI) / 180;
  const xf = ((lng + 180) / 360) * n;
  const yf = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;

  const tx0 = Math.floor(xf - w / 2 / TILE);
  const tx1 = Math.floor(xf + w / 2 / TILE);
  const ty0 = Math.floor(yf - h / 2 / TILE);
  const ty1 = Math.floor(yf + h / 2 / TILE);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  const originX = xf * TILE - w / 2;
  const originY = yf * TILE - h / 2;

  const jobs: Promise<void>[] = [];
  for (let x = tx0; x <= tx1; x++) {
    for (let y = ty0; y <= ty1; y++) {
      if (y < 0 || y >= n) continue;
      const wrappedX = ((x % n) + n) % n;
      jobs.push(
        loadTile(zoom, wrappedX, y).then((img) => {
          ctx.drawImage(img, x * TILE - originX, y * TILE - originY);
        })
      );
    }
  }
  await Promise.all(jobs);

  // Center pin: black dot with white ring so it survives dithering
  const cx = w / 2;
  const cy = h / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 13, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // Thin border
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);

  return canvas.toDataURL("image/png");
}

export function getStaticMapDataUrl(
  locationText?: string,
  w = 384,
  h = 200,
  zoom = 16
): Promise<string | null> {
  const c = parseCoords(locationText);
  if (!c) return Promise.resolve(null);
  const key = `${c.lat},${c.lng},${w},${h},${zoom}`;
  let p = cache.get(key);
  if (!p) {
    p = render(c.lat, c.lng, w, h, zoom).catch(() => null);
    cache.set(key, p);
    // don't keep failures cached so a retry can succeed
    p.then((r) => {
      if (!r) cache.delete(key);
    });
  }
  return p;
}
