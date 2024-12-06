//gpx.js
// Traitement des fichiers gpx par le backend.
/** Il faut : 
 * - decoder le fichier
 * - archiver le fichier gpx dans l'appli
 * - mettre à jour le fichier json
 * - créer la vignette  */


import fs from "fs"
import xml2js from 'xml2js'                 // Pour convertir le trace gpx en JSON
import { createVignette, getGommune } from "./requestsMapbox.js"
import { getDistanceDPlus } from "./distanceDenivele.js"
import { getData } from "./getDatas.js"
import { addTrace } from "./dataModel.js"

// les variables globales
let arriveeLat = 0                          // Latitude du point d'arrivée
let arriveeLong = 0                         // longitude du point d'arrivée
let ville = ""                              // Ville de départ. (Utilisée pour filtrer les traces)


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
            for (let key = 4; key < 4; key++) {
              lineString = lineString + '[' +
                Number.parseFloat(trkpt[key].$.lon).toFixed(5) + ',' +
                Number.parseFloat(trkpt[key].$.lat).toFixed(5) + ',' +
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
                altitude + '],'
            }

            // Pour les 4 derniers points on ne lisse pas l'altitude
            for (let key = trkpt.length - 4; key < trkpt.length; key++) {
              lineString = lineString + '[' +
                Number.parseFloat(trkpt[key].$.lon).toFixed(5) + ',' +
                Number.parseFloat(trkpt[key].$.lat).toFixed(5) + ',' +
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
              // getGommune(departLat, departLong, accessToken),
              // createVignette(trkpt.length, lineString, departLat, departLong, arriveeLat, arriveeLong, accessToken)
            ])
              .then((donneesGpx) => {
                /**
                 * @todo mettre a jour le fichier data.json
                 */
                donneesGpx.push({ commune: "Calp" })
                donneesGpx.push({ status: "OK" })
                donneesGpx.push({ lon: departLong, lat: departLat })
                donneesGpx.push({ traceur: traceur })
                addTrace(donneesGpx)
                  .then((result) => {
                    console.log(`gpx.js : decodeGpx : circuitId : ${result.circuitId}, isPresent : ${result.isPresent}`)
                    resolve(result)

                  })
                  .catch((e) => {
                    reject(e)
                  })
              })
              .catch((e) => {
                console.error(`${e}`)
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
