import fs from "fs"
import xml2js from 'xml2js'                 // Pour convertir le trace gpx en JSON
import * as dotenv from 'dotenv'
import { createVignette, getCommune } from "./requestsMapbox.js"
import { getDistanceDPlus } from "./distanceDenivele.js"
import { getEditeurUrl } from "./data.js"
import { addCircuit2dataModel, delCircuit2DataModel } from "./dataModel.js"
import { archiveDataCircuit } from "./dataCircuit.js"
import { createVisuFile } from "./createVisuFile.js"

dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY


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
    let editeurId = 0       // Id de l'éditeur gpx

    let trkpt = 0
    let lineString = ""
    let departLat = ""
    let departLong = ""
    let arriveeLat = ""
    let arriveeLong = ""

    const accessToken = process.env.VITE_MAPBOX_TOKEN

    const parser = new xml2js.Parser()

    // Transformation du fichier gpx en objet javascript
    fs.promises.readFile(fichier, 'utf8')
      .then((rep, err) => {
        parser.parseStringPromise(rep)
          .then((objetGpx) => {
            // On verifie que l'on n'a pas un fichier de type Route
            if (typeof (objetGpx.gpx.rte) === "object") {
              console.error(`decodeTraceGpx :  Fichier type route imcompatible !`)
              reject({ id: 2104, error: `Fichier de type route incompatible !` })
            }

            // On verifie que l'élévation est bien présente dans le fichier gpx
            // Dans le cas de karoo ce n'est pas le cas
            if (typeof (objetGpx.gpx.trk[0].trkseg[0].trkpt[0].ele) === "undefined") {
              console.error(`decodeTraceGpx :  Fichier gpx imcompatible !`)
              reject({ id: 2103, error: `Fichier incompatible !` })
            }

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
              createVignette(trkpt.length, lineString, departLat, departLong, arriveeLat, arriveeLong, accessToken),
              // Il faut insérer la génération du fichier camera.json
              // Comme pour la vignette, on le crée dans assts/tmp
              // Il sera mis dans le dossier définitif dans la fonction archiveDataCircuit
              createVisuFile(lineString)
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

                // console.log(donneesGpx)

                addCircuit2dataModel(donneesGpx)
                  .then((result) => {
                    archiveDataCircuit(result.circuitId, lineString)
                      .then(() => {
                        resolve(result)
                      })
                      .catch((err) => {
                        // Dans ce cas il faut supprimer le circuit dans dataModel.json
                        delCircuit2DataModel(result.circuitId)
                          .then(() => {
                            reject(err)
                          })
                          .catch((err) => {
                            reject(err)
                          })
                      })
                  })
                  .catch((err) => {
                    reject(err)
                  })

              })
              .catch((err) => {
                console.error(`Erreur Promise.all`)
                reject(err)
              })

          })
          .catch((err) => {
            console.error(`decodeTraceGpx : ${err}`)
            reject({ id: 2102, error: `Erreur XML dans le fichier !` })
          })
      })
      .catch((err) => {
        console.error(`decodeTraceGpx : ${err}`)
        reject({ id: 2101, error: `Erreur lecture fichier !` })
      })

  })
}



