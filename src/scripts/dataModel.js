/**
 * exploitation du fichier json dataModel
 */

import fs from 'fs'

const fichier = "./src/assets/dataModel.json"

let objet = {}


/**
 * 
 * @param {Array[{ distance: number, denivele: number, ptCulminant: number, distSommet: number },
 *              {editeur: string, editeurId: number, nom: string, url: string}
 *              {commune: string}, 
 *              {status: string},
 *              {long: number, lat: number}]} data 
 * @returns {promises<{status: <text>}>}
 */
export const addTrace = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const horodatage = new Date()

      objet = JSON.parse(fs.readFileSync(fichier))
      let sommet = { altitude: data[0].ptCulminant, km: data[0].distSommet }
      let circuit = {
        circuitId: 0,
        nom: data[1].nom,
        villeDepart: getIdCommune(data[2].commune),
        traceur: 0,
        editeur: data[1].editeurId,
        source: data[1].url,
        distance: data[0].distance,
        denivele: data[0].denivele,
        depart: data[4],
        sommet: sommet,
        isoDateTime: horodatage.toISOString()
      }

      const idTrace = addCircuit(circuit)

      // Il faut retourner l'Id du circuit créé , 
      // pour archiver la vignette et le fichier GEOjson
      fs.writeFileSync(fichier, JSON.stringify(objet))
      resolve({ idTrace: idTrace })
    } catch ({ e }) {
      console.error(`addTrace Erreur : ${e}`)
      reject(e)
    }
  })
}

/**
 * Retourne l'Id de la commune. 
 * Si la commune n'existe pas elle est ajoutée automatiquement
 * 
 * @param {string} commune 
 * @returns {number} 
 */
function getIdCommune(commune) {
  let key = 0
  console.log(`getCommune : ${commune}`)
  for (key = 0; key < objet.villes.length; key++) {
    //console.log(objet.villes[key])
    if (objet.villes[key] === commune) return key
  }
  objet.villes.push(commune)
  //fs.writeFileSync(fichier, JSON.stringify(objet))
  return key
}

/**
 * Retourne l'Id de l'organisateur. 
 * Si la commune n'existe pas elle est ajoutée automatiquement
 * 
 * @param {string} traceur 
 * @returns {number} 
 */
function getIdTraceur(traceur) {
  let key = 0
  for (key = 0; key < objet.traceurs.length; key++) {
    //console.log(objet.traceurs[key])
    if (objet.traceurs[key] === traceur) return key
  }
  objet.traceurs.push(traceur)
  //fs.writeFileSync(fichier, JSON.stringify(objet))
  return key
}

function addCircuit(circuit) {
  // On verifie grossièrement que le circuit n'est pas déja présent.
  console.log("addCircuit")

  let peutEtrePresent = false
  for (let key = 1; key < objet.circuits.length; key++) {
    if (circuit.nom === objet.circuits[key].nom) {
      return 0
    }
    if (circuit.url === objet.circuits[key].url) {
      return 0
    }

    // Si les coordonnées de départ sont trop eloignées on passe à l'occurence suivante
    else if ((parseInt(circuit.depart.lng * 100) !== parseInt(objet.circuits[key.depart.lng * 100])) ||
      (parseInt(circuit.depart.lat * 100) !== parseInt(objet.circuits[key.depart.lat * 100]))) continue
    // Si on a plus de 5 km d'écart sur la distance on passe à l'occurence suivante
    else if (Math.abs(circuit.distance - objet.circuits[key].distance) > 5) continue
    // Si le point culminant à plus de 10 m d'écart on passe à l'occurence suivante
    else if (Math.abs(circuit.sommet.altitude - objet.circuits[key].sommet.altitude) > 10) continue
    // Si le point culminant se situe à moins de 5 km d'écart on passe à l'occurence suivante
    else if (Math.abs(circuit.sommet.km - objet.circuits[key].sommet.km) > 5) continue
    else {
      peutEtrePresent = true
    }
  }
  if (peutEtrePresent === false) {
    circuit.circuitId = objet.circuits.length
    objet.circuits.push(circuit)
    return circuit.circuitId
  }
  else
    return 0
}
