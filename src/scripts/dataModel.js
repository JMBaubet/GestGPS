/**
 * exploitation du fichier json dataModel
 */

import fs from 'fs'
import * as dotenv from 'dotenv'
import { zpad } from './utils.js'
import { v6 as uuidv6 } from 'uuid'

dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY
const configFile = process.env.CONFIG_FILE

const fichier = `${dataDirectory}${configFile}`
let objet = {}


/**
 * 
 * @param {Array[{ distance: number, denivele: number, ptCulminant: number, distSommet: number },
 *              {editeur: string, editeurId: number, nom: string, url: string}
 *              {commune: string}, 
 *              {status: string},
 *              {long: number, lat: number},
 *              {traceur: string}]} data 
 * @returns {promises<{idTrace: <number>, isPresent: <boolena>}>}
 */
export const addTrace = (data) => {
  return new Promise((resolve, reject) => {
    let buffer
    try {
      //console.log(fichier)
      buffer = fs.readFileSync(fichier)
    } catch (err) {
      if (err.code === 'ENOENT') {
        //console.error('File not found!');
        const e = new Error(`${fichier}`)
        e.name = 'File not Found'
        reject(e)
      } else {
        throw err;
      }
    }

    try {
      objet = JSON.parse(buffer)
      let sommet = { altitude: data[0].ptCulminant, km: data[0].distSommet }
      const horodatage = new Date()
      let circuit = {
        circuitId: 0,
        nom: data[1].nom,
        villeDepart: getIdCommune(data[2].commune),
        traceur: getIdTraceur(data[5].traceur),
        editeur: data[1].editeurId,
        url: data[1].url,
        distance: data[0].distance,
        denivele: data[0].denivele,
        depart: data[4],
        sommet: sommet,
        isoDateTime: horodatage.toISOString()
      }
      console.log(`dataModel.js : addTrace() : avant appel de addCircuit`)
      const retourAddCircuit = addCircuit(circuit)
      console.log(`dataModel.js : addTrace() : après appel de addCircuit`)

      // Il faut retourner l'Id du circuit créé , 

      if (retourAddCircuit.circuitId !== 0) {
        fs.writeFileSync(fichier, JSON.stringify(objet))
        // Il faut  archiver la vignette et le fichier GEOjson
      }
      resolve(retourAddCircuit)
    } catch ({ e }) {
      console.error(`dataModel.js : addTrace() : Erreur : ${e}`)
      reject(e)
    }
  })
}

/**
 * Retourne l'Id de la commune. 
 * Si la commune n'existe pas elle est ajoutée automatiquement
 * 
 * @param {string} commune 
 * @returns {string} 
 */
function getIdCommune(commune) {
  let key = 0
  console.log(`dataModel.js : getIdCommune : ${commune}`)
  for (key = 0; key < objet.villes.length; key++) {
    console.log(objet.villes[key].nom)
    if (objet.villes[key].nom === commune) {
      return objet.villes[key].id
    }
  }
  const id = uuidv6()
  objet.villes.push({ id: id, nom: commune })
  //fs.writeFileSync(fichier, JSON.stringify(objet))
  return id
}

/**
 * Retourne l'Id du traceur . 
 * Si le traceur n'existe pas il est ajouté automatiquement
 * 
 * @param {string} traceur 
 * @returns {string} 
 */
function getIdTraceur(traceur) {
  let key = 0
  for (key = 0; key < objet.traceurs.length; key++) {
    //console.log(objet.traceurs[key])
    if (objet.traceurs[key].nom === traceur)
      return objet.traceurs[key].id
  }
  const id = uuidv6()
  objet.traceurs.push({ id: id, nom: traceur })
  //fs.writeFileSync(fichier, JSON.stringify(objet))
  return id
}

function addCircuit(circuit) {
  // On verifie grossièrement que le circuit n'est pas déja présent.
  console.log("dataModel.js : addCircuit")

  let isPresent = false
  for (let key = 1; key < objet.circuits.length; key++) {
    if (circuit.nom === objet.circuits[key].nom) {
      // console.warn(`dataModel.js : addCircuit() : on a le même nom de circuit`)
      return { circuitId: 0, isPresent: true }
    }
    if (circuit.url === objet.circuits[key].url) {
      // console.warn(`dataModel.js : addCircuit() : on a la même URL de trace`)
      return { circuitId: 0, isPresent: true }
    }
    // // Si les coordonnées de départ sont trop eloignées on passe à l'occurence suivante
    else if ((Math.round(circuit.depart.lon * 100) !== Math.round(objet.circuits[key].depart.lon * 100)) ||
      (Math.round(circuit.depart.lat * 100) !== Math.round(objet.circuits[key].depart.lat * 100))) {
      // console.warn(`dataModel.js : addCircuit() : departs éloignés, idCircuit : ${key}`)
      continue
    }
    // Si on a plus de 5 km d'écart sur la distance on passe à l'occurence suivante
    else if (Math.abs(circuit.distance - objet.circuits[key].distance) > 5) {
      // console.warn(`dataModel.js : addCircuit() : distances > 5 km, idCircuit : ${key}`)
      continue
    }
    // Si le point culminant à plus de 10 m d'écart on passe à l'occurence suivante
    else if (Math.abs(circuit.sommet.altitude - objet.circuits[key].sommet.altitude) > 10) {
      // console.warn(`dataModel.js : addCircuit() : D+  > 10 m, idCircuit : ${key}`)
      continue
    }
    // Si le point culminant se situe à moins de 5 km d'écart on passe à l'occurence suivante
    else if (Math.abs(circuit.sommet.km - objet.circuits[key].sommet.km) > 5) {
      // console.warn(`dataModel.js : addCircuit() : sommets  > 5 km, idCircuit : ${key}`)
      continue
    }
    else {
      isPresent = true
      console.warn("Circuit probablement déja présent !")
    }
  }
  const circuitId = objet.circuits.length
  console.log(`dataModel.js : addCircuit : circuitId = ${circuitId}`)
  circuit.circuitId = zpad(circuitId, 6)
  objet.circuits.push(circuit)
  return { circuitId: circuitId, isPresent: isPresent }
}
