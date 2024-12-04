/**
 * Promise de calcul du denivelé et de la distance
 * 
 */
import haversine from 'haversine-distance'  // pour calculer la distance entre 2 points

export const getDistanceDPlus = (lineString) => {
  return new Promise((resolve, reject) => {
    try {
      const lineStringObjet = JSON.parse(lineString)
      let distance = 0
      let sommet = 0
      let distanceSommet = 0
      let denivele = 0
      for (let index = 0; index < lineStringObjet["geometry"]["coordinates"].length - 1; index++) {
        let [lon1, lat1, dev1] = lineStringObjet["geometry"]["coordinates"][index]
        let [lon2, lat2, dev2] = lineStringObjet["geometry"]["coordinates"][index + 1]
        distance = distance + haversine({ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2 })
        if (dev2 > dev1)
          denivele = denivele + dev2 - dev1
        if (dev1 > sommet) {
          sommet = dev1
          distanceSommet = distance
        }
      }
      distance = parseInt(distance) / 1000
      distanceSommet = parseInt(distanceSommet / 1000)
      resolve({ distance: distance, denivele: denivele, ptCulminant: sommet, distSommet: distanceSommet })
    }
    catch ({ e }) {
      reject(e)
    }
  })
}
