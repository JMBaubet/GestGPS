import fs from 'fs/promises'
import * as dotenv from 'dotenv'

// dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY
const filePositionsCamera = process.env.FILE_POSITIONS_CAMERA



export const savePositionsCamera = (id, positions) => {
  return new Promise((resolve, reject) => {
    console.log(`Enregistrement du fichier poistionsCamera : ${id}`)
    // console.table(positions)

    fs.writeFile(dataDirectory + id + "\\" + filePositionsCamera, JSON.stringify(positions))
      .then(() => {
        resolve({ status: "OK" })
      })
      .catch((err) => {
        console.error(`Erreur archivage du fichier positionsCamera : ${err}`)
        reject({ id: "21??", error: `Erreur écriture de fichier !` })
      })
  })
}