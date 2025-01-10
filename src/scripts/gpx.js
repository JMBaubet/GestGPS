import fs from "fs"
import xml2js from 'xml2js'                 // Pour convertir le trace gpx en JSON
import * as dotenv from 'dotenv'
import { createVignette, getCommune } from "./requestsMapbox.js"
import { getDistanceDPlus } from "./distanceDenivele.js"
import { getEditeurUrl } from "./data.js"
import { addCircuit2dataModel } from "./dataModel.js"
import { archiveDataCircuit } from "./archiveDataCircuit.js"

dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY

// les variables globales
let arriveeLat = 0                          // Latitude du point d'arrivée
let arriveeLong = 0                         // longitude du point d'arrivée
let ville = ""                              // Ville de départ. (Utilisée pour filtrer les traces)


/**
 * Promesse qui extrait les principales informations d'une trace gpx. 
 * - La distance, le dénivelé Positif, la ville de départ, le logiciel d'édition, l'URL du fichier... 
 * - Ces informations sont archivées dans le fichier dataModel.json.
 * @param {string} fichier Nom du fichier en obsolu
 * @param {string} traceur Nom de la personne ou de l'association qui a créé la trace gpx
 * @returns {promises}
 */
export const decodeTraceGpx = (fichier, traceur) => {
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
      .then((rep, err) => {
        parser.parseStringPromise(rep)
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
            return objetGpx
          })
          .then((objetGpx) => {
            /**
             * Lancement des promesses
             */
            Promise.all([
              getDistanceDPlus(lineString),
              getEditeurUrl(fichier, objetGpx),
              getCommune(departLat, departLong, accessToken),
              createVignette(trkpt.length, lineString, departLat, departLong, arriveeLat, arriveeLong, accessToken)
            ])

              .then((retPromesses) => {
                // console.log("Les promesses sont toutes OK")
                const horodatage = new Date()
                let donneesGpx = {
                  circuitId: "",
                  nom: retPromesses[1].nom,
                  villeDepart: retPromesses[2].commune,
                  traceur: traceur,
                  editeurId: retPromesses[1].editeurId,
                  url: retPromesses[1].url,
                  distance: retPromesses[0].distance,
                  denivele: retPromesses[0].denivele,
                  depart: {
                    lon: departLong,
                    lat: departLat
                  },
                  sommet: {
                    altitude: retPromesses[0].sommet,
                    km: retPromesses[0].distSommet
                  },
                  isoDateTime: horodatage.toISOString()
                }

                //console.log(donneesGpx)

                addCircuit2dataModel(donneesGpx)
                  .then((result) => {
                    archiveDataCircuit(result.circuitId, lineString)
                      .then(() => {
                        resolve(result)
                      })
                      .catch((err) => {
                        reject(err)
                      })
                  })
                  .catch((err) => {
                    console.error(`catch addCircuit2dataModel : ${err.error}`)
                    reject(err)
                  })

              })
              .catch((err) => {
                console.error(`catch parser : ${err}`)
                reject(err)
              })

          })
          .catch((err) => {
            console.error(`catch parser : ${err}`)
            reject(err)
          })
      })
      .catch((err) => {
        console.error(`catch readFile: ${err}`)
        reject(err)
      })

  })
}



