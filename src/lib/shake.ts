/**
 * Herkent een schudbeweging uit een meting van de versnellingsmeter.
 * Een stilliggende telefoon meet ongeveer 1 g (de zwaartekracht). Normaal
 * vasthouden blijft daar dicht bij; pas hard schudden komt boven deze grens.
 */
export const SHAKE_THRESHOLD_G = 2.2;

/** Minimale tijd tussen twee schudbewegingen, zodat één keer schudden één actie is. */
export const SHAKE_COOLDOWN_MS = 1000;

export function isShake(x: number, y: number, z: number): boolean {
  return Math.sqrt(x * x + y * y + z * z) > SHAKE_THRESHOLD_G;
}
