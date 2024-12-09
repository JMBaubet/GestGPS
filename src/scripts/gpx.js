//gpx.js
// Traitement des fichiers gpx par le backend.
/** Il faut : 
 * - decoder le fichier
 * - archiver le fichier gpx dans l'appli
 * - mettre à jour le fichier json
 * - créer la vignette  */


import fs from "fs"
import xml2js from 'xml2js'                 // Pour convertir le trace gpx en JSON
import * as dotenv from 'dotenv'
import { createVignette, getGommune } from "./requestsMapbox.js"
import { getDistanceDPlus } from "./distanceDenivele.js"
import { getData } from "./getDatas.js"
import { addTrace } from "./dataModel.js"
import { zpad } from "./utils.js"

dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY

// les variables globales
let arriveeLat = 0                          // Latitude du point d'arrivée
let arriveeLong = 0                         // longitude du point d'arrivée
let ville = ""                              // Ville de départ. (Utilisée pour filtrer les traces)


function archivage(id, lineString) {
  console.log(`gpx.js : archivage : id : ${id}`)
  // On crée le repertoire d'archivage DATA_DIRECTORY
  // voir https://www.geeksforgeeks.org/how-to-create-a-directory-using-node-js/#using-nodejs-fsmkdir
  try {
    fs.accessSync(dataDirectory)
  } catch {
    console.log('On va créer le dossier')
    const rep = fs.mkdirSync(dataDirectory, { recursive: true })
    if (rep === undefined) {
      console.error(`gpx.js : archivage : impossible de créer le dossier : ${dataDirectory}`)
      return false
    }
  }
  try {
    fs.chmodSync(dataDirectory, 0o770)
  } catch (err) {
    console.error(`gpx.js : archivage : impossible de faire une chmod sur le dossier : ${dataDirectory}`)
    return false
  }

  const newDirectory = `${dataDirectory}` + zpad(id, 6) + `\\`
  try {
    fs.accessSync(newDirectory)
  } catch {
    console.log('On va créer le dossier')
    const rep = fs.mkdirSync(newDirectory, { recursive: true })
    if (rep === undefined) {
      console.error(`gpx.js : archivage : impossible de créer le dossier : ${newDirectory}`)
      return false
    }
  }
  try {
    fs.chmodSync(newDirectory, 0o770)
  } catch (err) {
    console.error(`gpx.js : archivage : impossible de faire une chmod sur le dossier : ${newDirectory}`)
    return false
  }
  try {
    fs.writeFileSync(newDirectory + `lineString.json`, JSON.stringify(lineString));
  } catch (err) {
    console.error(`gpx.js : archivage : impossible d'enregistrer le fichier lineString`)
    return false
  }

  // On range la vignette dans le dossier
  try {
    fs.renameSync('./src/assets/tmp/vignette.png', newDirectory + `vignette.png`)
  } catch (err) {
    console.error(`gpx.js : archivage : impossible d'enregistrer la vignette`)
    return false
  }
  return true
}



/**
 * decodeGpx
 * @param {string} fichier 
 * @param {string} traceur 
 * @returns promise 
 */
export const decodeGpx = (fichier, traceur) => {
  return new Promise((resolve, reject) => {

    // definition des variables pour mise à jour du fichier data.json
    let codeRetour = 0
    let creator = ""        // Identification du logiciel d'édition de la trace gpx
    let editeurId = 0       // Id de l'éditeur gpx
    let editeur = ""        // Nom de l'diteur gpx

    let url = ""            // Url de la trace d'origine (dépend de l'éditeur)
    let nom = ""            // Nom de la trace
    let organisation = ""   // Organisation créatrice de la trace (VCVE, Emotion-Bike, JMB...)
    let latMin = 0          // Extrminté Nord de la trace
    let latMax = 0          // Extémité Sud de la trace
    let longMin = 0         // Extrémité Ouest de la trace
    let longMax = 0         // Extrémité Est de la trace
    let distance = 0        // Distance en m de la trace
    let denivele = 0        // Dénivelé positif de la trace
    let trkpt = 0
    let objetGpx = 0
    let lineString = ""
    let departLat = ""
    let departLong = ""
    let arriveeLat = ""
    let arriveeLong = ""

    const accessToken = process.env.VITE_MAPBOX_TOKEN

    // Transformation du fichier gpx en objet javascript
    const parser = new xml2js.Parser()
    fs.promises.readFile(fichier)
      .then((data) => {
        parser.parseStringPromise(data)
          .then((objetGpx) => {
            // extraction des points de passage
            trkpt = objetGpx.gpx.trk[0].trkseg[0].trkpt


            // Création du JSON lineString avec l'altitude lissée sur 9 points
            //console.log(trkpt.length)
            let nbPts = 0
            lineString = '{"type": "Feature","geometry": {"type": "LineString","coordinates":['
            // Pour les 4 premiers point on ne corrige pas l'altitude
            for (let key = 0; key < 4; key++) {
              lineString = lineString + '[' +
                Number.parseFloat(trkpt[key].$.lon).toFixed(5) + ',' +
                Number.parseFloat(trkpt[key].$.lat).toFixed(5) + ',' +
                parseInt(trkpt[key].ele) + ',' +
                parseInt(trkpt[key].ele) + '],'
            }

            // Pour les points intermédiares on lisse l'altitude
            for (let key = 4; key < trkpt.length - 4; key++) {
              let altitude = parseInt((
                parseInt(trkpt[key - 4].ele) + parseInt(trkpt[key - 3].ele) + parseInt(trkpt[key - 2].ele) +
                parseInt(trkpt[key - 1].ele) + parseInt(trkpt[key].ele) + parseInt(trkpt[key + 1].ele) +
                parseInt(trkpt[key + 2].ele) + parseInt(trkpt[key + 3].ele) + parseInt(trkpt[key + 4].ele)
              ) / 9)

              lineString = lineString + '[' +
                Number.parseFloat(trkpt[key].$.lon).toFixed(5) + ',' +
                Number.parseFloat(trkpt[key].$.lat).toFixed(5) + ',' +
                altitude + ',' +
                parseInt(trkpt[key].ele) + '],'
            }

            // Pour les 4 derniers points on ne lisse pas l'altitude
            for (let key = trkpt.length - 4; key < trkpt.length; key++) {
              lineString = lineString + '[' +
                Number.parseFloat(trkpt[key].$.lon).toFixed(5) + ',' +
                Number.parseFloat(trkpt[key].$.lat).toFixed(5) + ',' +
                parseInt(trkpt[key].ele) + ',' +
                parseInt(trkpt[key].ele) + '],'
            }

            lineString = lineString.slice(0, -1); // On supprime la dernière virgule
            lineString = lineString + ']},"properties": {}}'

            // Extracttion des coordonnées de départ et d'arrivée pour la création de la vignette
            departLat = Number.parseFloat(trkpt[0].$.lat).toFixed(5)
            departLong = Number.parseFloat(trkpt[0].$.lon).toFixed(5)
            arriveeLat = Number.parseFloat(trkpt[trkpt.length - 1].$.lat).toFixed(5)
            arriveeLong = Number.parseFloat(trkpt[trkpt.length - 1].$.lon).toFixed(5)



            /**
             * Lancemeent des promesses
             */
            Promise.all([
              getDistanceDPlus(lineString),
              getData(fichier, objetGpx),
              getGommune(departLat, departLong, accessToken),
              createVignette(trkpt.length, lineString, departLat, departLong, arriveeLat, arriveeLong, accessToken)
            ])
              .then((donneesGpx) => {
                /**
                 * @todo mettre a jour le fichier data.json
                 */
                donneesGpx.push({ lon: departLong, lat: departLat })
                donneesGpx.push({ traceur: traceur })
                addTrace(donneesGpx)
                  .then((result) => {
                    console.log(`gpx.js : decodeGpx : circuitId : ${result.circuitId}, isPresent : ${result.isPresent}`)
                    archivage(result.circuitId, lineString)
                    resolve(result)

                  })
                  .catch((e) => {
                    reject(e)
                  })
              })
              .catch((e) => {
                console.error(`gpx.js : decodeGpx : Promises.all Erreur : ${e}`)
                reject(e)
              })
          })
      })
      .catch((e) => {
        console.log(`${e}`)
        reject(e)
      })
  })
}
