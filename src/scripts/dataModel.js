/**
 * exploitation du fichier json dataModel
 */

import fs from 'fs'
import * as dotenv from 'dotenv'
import haversine from 'haversine-distance'  // pour calculer la distance entre 2 points
import { v6 as uuidv6 } from 'uuid'
import { zpad } from './utils.js'

dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY
const fichier = process.env.CONFIG_FILE

let peutEtrePresent = 0
let objet = {}

/**
 * 
 * @param {Array[{ distance: number, denivele: number, ptCulminant: number, distSommet: number },
 *              {editeur: string, editeurId: number, nom: string, url: string}
 *              {commune: string}, 
 *              {status: string},
 *              {long: number, lat: number},
 *              {traceur: string}]} newCircuit 
 * @returns {promises<{idTrace: <number>, isPresent: <boolean>}>}
 */
export const addCircuit2dataModel = (newCircuit) => {
  return new Promise((resolve, reject) => {
    fs.promises.readFile(fichier, { encoding: 'utf8' })
      .then((buffer, err) => {
        try {
          objet = JSON.parse(buffer.toString())
        } catch (err) {
          console.error(`addCircuit2dataModel : Erreur lecture JSON : ${err}`)
          reject({ id: 2068, error: `addCircuit2dataModel, json : ${err}` })
        }

        newCircuit.traceur = getIdTraceur(newCircuit.traceur, objet)
        newCircuit.villeDepart = getIdCommune(newCircuit.villeDepart, objet)


        for (let key = 0; key < objet.circuits.length; key++) {
          if (newCircuit.url === objet.circuits[key].url) {
            console.warn(`dataModel.js : addCircuit2dataModel : on a la même URL de trace`)
            return reject({ id: 2061, error: `Circuit déjà présent !` })
          }
          if (newCircuit.nom === objet.circuits[key].nom) {
            // console.warn(`dataModel.js : addCircuit() : on a le même nom de circuit`)
            peutEtrePresent = 1
            break;
          }
          // // Si les coordonnées de départ sont trop eloignées on passe à l'occurence suivante
          if (haversine({ lat: newCircuit.depart.lat, lon: newCircuit.depart.lon },
            { lat: objet.circuits[key].depart.lat, lon: objet.circuits[key].depart.lon }) > 250) {
            continue
          }
          // Si on a plus de 5 km d'écart sur la distance on passe à l'occurence suivante
          else if (Math.abs(newCircuit.distance - objet.circuits[key].distance) > 5) {
            // console.warn(`dataModel.js : addCircuit() : distances > 5 km, idCircuit : ${key}`)
            continue
          }
          // Si le point culminant à plus de 10 m d'écart on passe à l'occurence suivante
          else if (Math.abs(newCircuit.sommet.altitude - objet.circuits[key].sommet.altitude) > 10) {
            // console.warn(`dataModel.js : addCircuit() : D+  > 10 m, idCircuit : ${key}`)
            continue
          }
          // Si le point culminant se situe à moins de 5 km d'écart on passe à l'occurence suivante
          else if (Math.abs(newCircuit.sommet.km - objet.circuits[key].sommet.km) > 5) {
            // console.warn(`dataModel.js : addCircuit() : sommets  > 5 km, idCircuit : ${key}`)            console.log("distanceSommet")
            continue
          }
          else {
            peutEtrePresent = 2
            console.warn("Circuit probablement déja présent !")
            break;
          }

        }

        // On est prêt a insérer le nouveau circuit
        const circuitIndex = objet.indexCircuits + 1
        // console.log(`dataModel.js : addCircuit : circuitIndex = ${circuitIndex}`)
        newCircuit.circuitId = zpad(circuitIndex, 6)
        objet.circuits.push(newCircuit)
        objet.indexCircuits = circuitIndex

        // Il faut enregistrer l'objet dans dataModel.json
        fs.promises.writeFile(fichier, JSON.stringify(objet))
          .then(() => {
            resolve({ circuitId: circuitIndex, peutEtrePresent: peutEtrePresent })
          })
          .catch((err) => {
            console.error("addCircuit2dataModel: Erreur d'ecriture")
            reject({ id: 2067, error: `addCircuit2dataModel, Ecriture  dataModel.json : ${err}` })
          })
      })
      .catch((err) => { //Read fichier datModel.json
        console.error(`addCircuit2dataModel, erreur : ${err.message}`)
        reject({ id: 2069, error: `Erreur lecture dataModel.json : ${err}` })
      })
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
    if (objet.villes[key].nom === commune) {
      return objet.villes[key].id
    }
  }
  const id = uuidv6()
  objet.villes.push({ id: id, nom: commune })
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
  return id
}


