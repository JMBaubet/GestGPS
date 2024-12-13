/**
 * Cette fonction retourne une chaine qui format le nombre n sur len caractères
 *  exemple : zpad(10, 6) => 000010
 *            zpad(12.87, 8) =>  00012.87
 * @param {number} n 
 * @param {number} len 
 * @returns 
 */
export function zpad(n, len) {
  return 0..toFixed(len).slice(2, -n.toString().length) + n.toString();
}

