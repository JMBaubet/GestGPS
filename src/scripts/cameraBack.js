import fs, { promises } from 'fs'
import * as dotenv from 'dotenv'
import * as turf from '@turf/turf'

// dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY
const filePositionsCamera = process.env.FILE_POSITIONS_CAMERA



export const savePositionsCamera = (id, positions) => {
  return new Promise((resolve, reject) => {
    console.log(`Enregistrement du fichier poistionsCamera : ${id}`)
    console.table(positions)

    fs.promises.writeFile(dataDirectory + id + "\\" + filePositionsCamera, JSON.stringify(positions))
      .then(() => {
        resolve({ status: "OK" })
      })
      .catch((err) => {
        console.error(`Erreur archivage du fichier positionsCamera : ${err}`)
        reject({ id: "21??", error: `Erreur écriture de fichier !` })
      })
  })
}


export const getPositionsCamera = (id) => {
  return new Promise((resolve, reject) => {
    console.log(`récupération du fichier positionsCamera : ${id}`)
    let json
    // console.table(positions)
    try {
      json = JSON.parse(fs.readFileSync(dataDirectory + id + "\\" + filePositionsCamera))
    } catch (e) {
      console.error(`genere100File Erreur : ${e}`)
      reject({ id: 2111, error: `Erreur lecture du fichier lineString !` })
    }
    // On prépare le nouveau fichier
    let camera = []
    let index = 0
    let longueurSegment
    let debutSegment = 0
    let positionCameraDebut
    let positionCameraFin
    let positionCameraLongueur
    let lookAtDebut
    let lookAtFin
    let lookAtLongueur
    let altitudeDebut
    let altitudeFin

    // console.log(json.length)
    // console.table(json)
    // console.log(`longueurSegment : ${json[0].longueur}`)
    while (index < json.length - 1) {
      // console.log(`index : ${index}`)
      longueurSegment = json[debutSegment].longueur
      positionCameraDebut = json[debutSegment].positionCamera
      positionCameraFin = json[debutSegment + longueurSegment].positionCamera
      lookAtDebut = json[debutSegment].lookAtPoint
      lookAtFin = json[debutSegment + longueurSegment].lookAtPoint
      altitudeDebut = json[debutSegment].altitude
      altitudeFin = json[debutSegment + longueurSegment].altitude
      positionCameraLongueur = turf.distance(positionCameraDebut, positionCameraFin)
      lookAtLongueur = turf.distance(lookAtDebut, lookAtFin)
      for (let i = index; i < longueurSegment + debutSegment; i++) {
        console.log(`i : ${i}`)
        camera[i] = {
          start: debutSegment,
          lg: longueurSegment,
          positionCameraDebut: positionCameraDebut,
          positionCameraFin: positionCameraFin,
          positionCameraLongueur: positionCameraLongueur,
          lookAtDebut: lookAtDebut,
          lookAtFin: lookAtFin,
          lookAtLongueur: lookAtLongueur,
          altitudeDebut: altitudeDebut,
          altitudeFin: altitudeFin
        }
        index++
      }
      debutSegment = index
    }
    resolve({ camera })
  })
}

