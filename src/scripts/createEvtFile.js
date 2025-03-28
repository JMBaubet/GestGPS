import * as dotenv from 'dotenv'
import fs from "fs/promises"

const tmpDirectory = process.env.TMP_DIRECTORY
const fileEvt = process.env.FILE_EVT
let evt = []

export const createEvtFile = (lineString) => {
  return new Promise((resolve, reject) => {
    // On sauvegarde le ficheir vide evt.json dans le dossier tmp
    fs.writeFile(tmpDirectory + "\\" + fileEvt, JSON.stringify(evt))
      .then(() => {
        resolve({ status: "OK" })
      })
      .catch((err) => {
        console.error(`createEvtFile: ${err}.`)
        reject({ id: 9999, error: `Enregistrement du fichier ${fileEvt} !` })
      })
  })
}
