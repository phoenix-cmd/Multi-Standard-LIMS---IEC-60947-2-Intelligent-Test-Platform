import { MCCB_COMPONENTS } from '../digital-twin/ComponentRegistry';

// Returns an interpolated explosion offset for each component
// explosionFactor: 0 = fully assembled, 1 = fully exploded
export function getExplodedPosition(
  componentId: string,
  explosionFactor: number
): [number, number, number] {
  const comp = MCCB_COMPONENTS[componentId];
  if (!comp) return [0, 0, 0];

  const [bx, by, bz] = comp.position;
  const [ex, ey, ez] = comp.explosionVector;
  const scale = explosionFactor * 3.0; // max offset = 3× explosion vector

  return [bx + ex * scale, by + ey * scale, bz + ez * scale];
}
