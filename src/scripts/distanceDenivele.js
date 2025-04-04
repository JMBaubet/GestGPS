import haversine from 'haversine-distance'  // pour calculer la distance entre 2 points

/**
 * @typedef distanceDPlus
 * @type {object}
 * @property {number} distance
 * @property {number} denivele
 * @property {number} sommet
 * @property {number} distSommet
 */

/**
 * @desc A partir de la chaîne lineString, cette fonction retourne 
 * - la distance de la trace, le dénivelé positif,
 * - le sommet le plus haut et la distance à laquelle il se situe. 
 * @param {string} lineString 
 * 
 * @returns {Promise<distanceDPlus>}
 */
export const getDistanceDPlus = (lineString) => {
  return new Promise((resolve, reject) => {
    try {
      const lineStringObjet = JSON.parse(lineString)
      let distance = 0
      let sommet = 0
      let distanceSommet = 0
      let denivele = 0
      for (let index = 0; index < lineStringObjet["geometry"]["coordinates"].length - 1; index++) {
        let [lon1, lat1, dev1, alt1] = lineStringObjet["geometry"]["coordinates"][index]
        //console.log(`${lon1}, ${lat1}, ${dev1}, ${alt1} `)
        let [lon2, lat2, dev2, alt2] = lineStringObjet["geometry"]["coordinates"][index + 1]
        distance = distance + haversine({ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2 })
        if (dev2 > dev1) {
          denivele = denivele + dev2 - dev1
        }
        if (parseInt(alt1) > sommet) {
          sommet = parseInt(alt1)
          distanceSommet = distance
        }
      }
      distance = Number.parseFloat(distance / 1000).toFixed(2)
      distanceSommet = Number.parseFloat(distanceSommet / 1000).toFixed(2)
      resolve({ distance: distance, denivele: denivele, sommet: sommet, distSommet: distanceSommet })
    }
    catch (err) {
      console.error(`distanceDenivele: getDistanceDPlus: erreur: ${err} `)
      reject({ id: 2059, error: `getDistanceDPlus : ${err} !` })
    }
  })
}

