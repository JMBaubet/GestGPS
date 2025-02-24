import fs from 'fs'
import * as dotenv from 'dotenv'
import * as turf from '@turf/turf'
import { ca } from 'vuetify/locale'
import { promises } from 'dns'


dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY
const fileTrace = process.env.FILE_TRACE
const fileTrace100m = process.env.FILE_TRACE_PLUS_100_M
const fileCamera = process.env.FILE_CAMERA
const fileAltitude = process.env.FILE_ALTITUDE
const fileVisu = process.env.FILE_VISU

export const genere100mFile = (id) => {
  return new Promise((resolve, reject) => {
    const longueurSegment = 0.1 // Distance en km
    let json = {}
    let coords = []
    try {
      json = JSON.parse(fs.readFileSync(dataDirectory + id + "\\" + fileTrace))
      // newJson.push(json.geometry.coordinates[0])
      // console.table(newJson)
    } catch (e) {
      console.error(`genere100File Erreur : ${e}`)
      reject({ id: 2111, error: `Erreur lecture du fichier lineString !` })
    }
    console.log(`Nombre de points : ${json.geometry.coordinates.length}`)

    for (let key = 0; key < json.geometry.coordinates.length; key++) {
      coords[key] = [json.geometry.coordinates[key][0], json.geometry.coordinates[key][1]]
    }
    const chunk = turf.lineChunk(turf.lineString(coords), 0.1).features
    console.log(chunk.length)
    for (let key = 0; key < chunk.length; key++) {
      console.table(chunk[key].geometry.coordinates)
    }
  })
}

/**
 * @desc Promesse qui a partir du fichier FILE_TRACE crée les fichiers :
 *        - FILE_TRACE_PLUS_100_M
 *        - FILE_CAMERA
 * @param {*} id 
 * @returns {promises}
 */
export const genere3DFiles = (id) => {
  return new Promise((resolve, reject) => {
    const longueurSegment = 0.1 // Distance en km
    let json = {}
    let newJson = []
    let cameraPoints = []
    let altitudes = []
    let indexJson = 0

    let nbSegment = 0
    let denivele = 0

    try {
      json = JSON.parse(fs.readFileSync(dataDirectory + id + "\\" + fileTrace))
      newJson.push(json.geometry.coordinates[0])
      // console.table(newJson)
    } catch (e) {
      console.error(`gnereCameraFile Erreur : ${e}`)
      reject({ id: 2111, error: `Erreur lecture du fichier lineString !` })
    }
    console.log(`Nombre de points : ${json.geometry.coordinates.length}`)

    // On initialise le tableau altitude avec le premier objet
    altitudes.push({
      altitude: json.geometry.coordinates[0][2],
      altitudeSmooth: json.geometry.coordinates[0][3],
      pente: 0,
      denivele: denivele
    })

    // On intègre le premier du km 0 pour la caméra
    cameraPoints[0] = { start: false, point: [json.geometry.coordinates[0][0], json.geometry.coordinates[0][1]], cap: 0 }

    while (indexJson < json.geometry.coordinates.length) {
      // console.log(`Boucle pricipale ${indexJson}, ${json.geometry.coordinates.length}`)
      let distanceAtteinte = false
      let segment = []
      let pente = 0

      segment.push(newJson[newJson.length - 1])
      // console.table(segment)

      while ((!distanceAtteinte)) {
        let distanceSegment
        let altitudeAbs
        let altitudeSmooth
        indexJson++
        try {
          segment.push(json.geometry.coordinates[indexJson])
          newJson.push(json.geometry.coordinates[indexJson])
          distanceSegment = parseFloat(turf.length(turf.lineString(segment)).toFixed(4))
          // Calcul du dénivelé 
          // console.log(`${json.geometry.coordinates[indexJson - 1][3]}, ${json.geometry.coordinates[indexJson][3]}`)
          if (json.geometry.coordinates[indexJson][3] > json.geometry.coordinates[indexJson - 1][3]) {
            // console.log(`${denivele}`)
            denivele = denivele + json.geometry.coordinates[indexJson][3] - json.geometry.coordinates[indexJson - 1][3]

          }

          // console.log(`longueur segment : ${distanceSegment}, Nb points : ${segment.length}`)
        } catch (e) {
          if (indexJson !== json.geometry.coordinates.length) {
            console.error(`Erreur calcul segment : ${e}`)
            reject({ id: 2115, error: `Erreur dans les calculs !` })
          }
          break
        }
        // console.log(distanceSegment)
        if (distanceSegment === longueurSegment) { // On a déja un point à la distance voulue
          // console.warn(`Point à 100m`)
          distanceAtteinte = true
          cameraPoints[nbSegment + 1] = { start: false, point: segment[segment.length - 1], cap: 0 }

          pente = json.geometry.coordinates[indexJson][3] - altitudes[nbSegment].altitudeSmooth
          altitudes.push({
            altitude: json.geometry.coordinates[indexJson][2],
            altitudeSmooth: json.geometry.coordinates[indexJson][3],
            pente: pente,
            denivele: denivele
          })

          newJson.push(segment[segment.length - 1])
          indexJson--

        } else if (distanceSegment > longueurSegment) { // On a dépassé la distance voulue
          // console.log(`Occurence  ${nbSegment}`)

          // On supprime le point qui est au delà de la longueur max du segment 
          distanceAtteinte = true
          newJson.pop()
          // On va calculer le nouveau point qui fermera le segment à la bonne longueur
          // Pour cela nous allons :
          // - Calculer le cap entre les deux derniers points du segment
          // - Supprimer le dernier point du segment pour calculer la distance en cours
          // - determiner le nouveau point en ajoutant la distance restante vers le cap

          let cap = turf.bearing(segment[segment.length - 2], segment[segment.length - 1])
          // console.log(`Cap calculé : ${cap}`)
          let newPoint

          altitudeAbs = segment[segment.length - 2][2] +
            ((segment[segment.length - 1][2] - segment[segment.length - 2][2]) *
              turf.distance(segment[segment.length - 1], segment[segment.length - 2]) /
              longueurSegment)

          altitudeSmooth = segment[segment.length - 2][3] +
            ((segment[segment.length - 1][3] - segment[segment.length - 2][3]) *
              turf.distance(segment[segment.length - 1], segment[segment.length - 2]) /
              longueurSegment)

          // Calcul de la pente
          // console.table(altitudes)
          // console.log(altitudeSmooth)
          pente = (altitudeAbs - altitudes[nbSegment].altitude)
          // console.log(pente)

          altitudes.push({
            altitude: json.geometry.coordinates[indexJson][2],
            altitudeSmooth: json.geometry.coordinates[indexJson][3],
            pente: pente,
            denivele: denivele
          })


          if (segment.length === 2) {
            newPoint = turf.destination(
              segment[0],
              longueurSegment,
              cap
            )
          } else {
            segment.pop()
            newPoint = turf.destination(
              segment[segment.length - 1],
              longueurSegment - parseFloat(turf.length(turf.lineString(segment)).toFixed(4)),
              cap)
          }
          // console.table(newPoint.geometry.coordinates)

          // newPoint.geometry.coordinates.push(altitudeAbs)
          // newPoint.geometry.coordinates.push(altitudeSmooth)
          // console.table(newPoint.geometry.coordinates)
          cameraPoints[nbSegment + 1] = { start: false, point: newPoint.geometry.coordinates, cap: 0 }
          newJson.push(newPoint.geometry.coordinates)
          indexJson--

        }
      }
      nbSegment++
    }
    // console.table(newJson)
    // console.log("sortie")
    console.log(`Nombre de segment : ${nbSegment + 1}`)

    // On insère le point d'arrivée
    cameraPoints.push({ start: false, point: [json.geometry.coordinates[json.geometry.coordinates.length - 1][0], json.geometry.coordinates[json.geometry.coordinates.length - 1][1]], cap: 0 })
    console.log(`Nombre de points camera : ${cameraPoints.length}`)

    // On calcul l'angle de vision pour la caméra tous les 100m
    // pour avoir une vue dans la direction de la trace

    for (let nbSegment = 0; nbSegment < cameraPoints.length - 15; nbSegment++) {

      cameraPoints[nbSegment].cap = parseInt(turf.bearing(cameraPoints[nbSegment].point, cameraPoints[nbSegment + 15].point))
      console.log(`Occurence : ${nbSegment},  - cap : ${cameraPoints[nbSegment].cap}`)
    }

    let fin = 15
    for (let nbSegment = cameraPoints.length - 15; nbSegment < cameraPoints.length; nbSegment++) {
      // console.log(`Occurence : ${occ},  - cap : ${cameraPoints[nbSegment].cap}`)
      cameraPoints[nbSegment].cap = parseInt(turf.bearing(cameraPoints[nbSegment].point, cameraPoints[nbSegment + fin - 1].point))
      fin--
      // console.log(`Occurence : ${occ},  - cap : ${cameraPoints[nbSegment].cap}`)
    }
    cameraPoints[cameraPoints.length - 1].cap = cameraPoints[cameraPoints.length - 2].cap
    // console.table(cameraPoints)

    // On crée le nouveau fichier LineString100m.json a partir du nouveau tableau
    indexJson = 0
    let lineString100m = '{"type": "Feature","geometry": {"type": "LineString","coordinates":['
    while (indexJson < newJson.length - 1) {
      lineString100m = lineString100m + `[${newJson[indexJson]}],`
      indexJson++
    }
    lineString100m = lineString100m.slice(0, -1); // On supprime la dernière virgule
    lineString100m = lineString100m + ']},"properties": {}}'


    // On sauvegarde les données dans des fichiers
    fs.promises.access(dataDirectory + id, fs.promises.constants.R_OK | fs.promises.constants.W_OK)
      .then(() => {
        fs.promises.writeFile(dataDirectory + id + "\\" + fileCamera, JSON.stringify(cameraPoints))
          .then(() => {
            fs.promises.writeFile(dataDirectory + id + "\\" + fileTrace100m, lineString100m)
              .then(() => {
                fs.promises.writeFile(dataDirectory + id + "\\" + fileAltitude, JSON.stringify(altitudes))
                  .then(() => {
                    resolve({ status: "OK" })
                  })
                  .catch((err) => {
                    console.error(`Erreur archivage du fichier altitude : ${err}`)
                    reject({ id: "21??", error: `Erreur écriture du fichier altitude !` })
                  })

                  .catch((err) => {
                    console.error(`Erreur archivage du fichier camera : ${err}`)
                    reject({ id: 2112, error: `Erreur écriture du fichier lineString100m !` })
                  })
              })
              .catch((err) => {
                console.error(`Erreur archivage du fichier camera : ${err}`)
                reject({ id: 2113, error: `Erreur écriture du fichier camera !` })
              })
          })
          .catch((err) => {
            console.error(`Erreur accès dossier: ${err}`)
            reject({ id: 2114, error: `Erreur d'accès au dossier data !` })
          })

      })

  })
}

/**
 * @desc Promesse qui retourne sous forme d'un objet JSON le fichier FILE_TRACE_PLUS_100_M
 * @param {*} id 
 * @returns {promises}
 */
export const getTrace100m = (id) => {
  return new Promise((resolve, reject) => {
    try {
      const buffer = JSON.parse(fs.readFileSync(dataDirectory + id + "\\" + fileTrace100m))
      resolve(buffer)
    } catch (err) {
      console.error(`getLineString100m Erreur : ${err}`)
      reject({ id: 2116, error: `Erreur lecture du fichier FILE_TRACE_100_M !` })
    }
  })

}

/**
 * @desc Promesse qui retourne sous forme d'un objet JSON le fichier FILE_CAMERA
 * @param {*} id 
 * @returns {promises}
 */
export const getCamera = (id) => {
  return new Promise((resolve, reject) => {
    try {
      const bufferCamera = JSON.parse(fs.readFileSync(dataDirectory + id + "\\" + fileCamera))
      resolve(bufferCamera)
    } catch (err) {
      console.error(`getCamera Erreur : ${err}`)
      reject({ id: 2115, error: `Erreur lecture du fichier FILE_CAMERA !` })
    }
  })
}



/**
 * @desc Promesse qui retourne sous forme d'un objet JSON le fichier FILE_VISU
 * @param {*} id 
 * @returns {promises}
 */
export const getVisu = (id) => {
  return new Promise((resolve, reject) => {
    try {
      const bufferVisu = JSON.parse(fs.readFileSync(dataDirectory + id + "\\" + fileVisu))
      resolve(bufferVisu)
    } catch (err) {
      console.error(`getVIsu Erreur : ${err}`)
      reject({ id: 9999, error: `Erreur lecture du fichier FILE_VISU !` })
    }
  })
}
