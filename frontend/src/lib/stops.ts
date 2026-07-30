import type { LocationHistoryResponse } from "@/types";

export interface Stop {
  latitude: number;
  longitude: number;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  pointCount: number;
}

function haversineMeters(a: LocationHistoryResponse, b: LocationHistoryResponse): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Agrupa pontos consecutivos que ficaram dentro de `radiusMeters` uns dos outros,
 * tratando o grupo como uma "parada" quando o intervalo entre o primeiro e o
 * último ponto do grupo passa de `minDwellMinutes`. Espera os pontos já
 * ordenados do mais antigo para o mais recente.
 */
export function computeStops(
  points: LocationHistoryResponse[],
  radiusMeters = 150,
  minDwellMinutes = 10,
): Stop[] {
  const stops: Stop[] = [];
  let clusterStart = 0;

  for (let i = 1; i <= points.length; i++) {
    const stillWithinRadius =
      i < points.length && haversineMeters(points[clusterStart], points[i]) <= radiusMeters;

    if (!stillWithinRadius) {
      const cluster = points.slice(clusterStart, i);
      if (cluster.length >= 2) {
        const first = cluster[0];
        const last = cluster[cluster.length - 1];
        const durationMs = new Date(last.capturedAt).getTime() - new Date(first.capturedAt).getTime();
        if (durationMs >= minDwellMinutes * 60_000) {
          stops.push({
            latitude: cluster.reduce((sum, p) => sum + p.latitude, 0) / cluster.length,
            longitude: cluster.reduce((sum, p) => sum + p.longitude, 0) / cluster.length,
            startedAt: first.capturedAt,
            endedAt: last.capturedAt,
            durationMs,
            pointCount: cluster.length,
          });
        }
      }
      clusterStart = i;
    }
  }

  return stops.sort((a, b) => b.durationMs - a.durationMs);
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}
