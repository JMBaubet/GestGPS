import fs from "fs/promises"
import * as dotenv from 'dotenv'
import { zpad } from "./utils.js"

dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY


/**
 * @desc Promesse qui archive dans un répertoire les données relatives à la trace GPS qui est importée. Ces données sont : 
 * - La vignette du tracé,
 * - le fichier lineString.json qui servira à la visualisation 3D.
 * @param {number} id Id du circuit 
 * @param {string} lineString Fichier Ligne pour mapbox
 * @returns {promises} 
 */
export const archiveDataCircuit = (id, lineString) => {
  return new Promise((resolve, reject) => {
    fs.access(dataDirectory, fs.constants.R_OK | fs.constants.W_OK)
      .then(() => {
        // Creation du nouveau dossier
        const newDirectory = `${dataDirectory}` + zpad(id, 6) + `\\`
        fs.mkdir(newDirectory)
          .then(() => {
            // Creation du fichier
            fs.writeFile(`${newDirectory}\\lineString.json`, JSON.stringify(lineString))
              .then(() => {
                fs.rename('./src/assets/tmp/vignette.png', newDirectory + `vignette.png`)
                  .then(() => {
                    resolve()
                  })
                  .catch((err) => {
                    console.error(`archiveDataCircuit : ${err}`)
                    reject({ id: 2074, error: "archiveDataCircuit de la vignette" })
                  })
              })
              .catch((err) => {
                console.error(`archiveDataCircuit : ${err}`)
                reject({ id: 2073, error: "archiveDataCircuit des données" })
              })
          })
          .catch((err) => {
            console.error(`archiveDataCircuit : ${err}`)
            reject({ id: 2072, error: "Création du dossier" })
          })
      })
      .catch((err) => {
        console.error(`archiveDataCircuit : ${err}`)
        reject({ id: 2071, error: "Access aux données" })
      })
  })
}

