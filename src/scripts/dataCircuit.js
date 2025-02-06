import fs from "fs/promises"
import * as dotenv from 'dotenv'
import { zpad } from "./utils.js"

dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY
const tmpDirectory = process.env.TMP_DIRECTORY


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
            fs.writeFile(`${newDirectory}\\lineString.json`, lineString)
              .then(() => {
                fs.rename(tmpDirectory + 'vignette.png', newDirectory + `vignette.png`)
                  .then(() => {
                    resolve()
                  })
                  .catch((err) => {
                    console.error(`archiveDataCircuit : ${err}`)
                    reject({ id: 2074, error: "Archive de la vignette" })
                  })
              })
              .catch((err) => {
                console.error(`archiveDataCircuit : ${err}`)
                reject({ id: 2073, error: "Archivage des données" })
              })
          })
          .catch((err) => {
            console.error(`archiveDataCircuit : ${err}`)
            reject({ id: 2072, error: "Erreur création du dossier" })
          })
      })
      .catch((err) => {
        console.error(`archiveDataCircuit : ${err}`)
        reject({ id: 2071, error: "Pas d'acces au dossier DATA_DIRECTORY !" })
      })
  })
}



/**
 * @desc Promesse qui supprime le répertoire de données relatives à une trace GPS.
 * @param {number} id Id du circuit 
 * @returns {promises} 
 */
export const delDataCircuit = (id) => {
  return new Promise((resolve, reject) => {
    const directory = `${dataDirectory}` + zpad(id, 6) + `\\`
    // console.warn(directory)
    fs.access(directory, fs.constants.R_OK | fs.constants.W_OK)
      .then(() => {
        fs.rm(directory, { recursive: true })
          .then(() => {
            resolve()
          })
          .catch((err) => {
            console.error(`delDataCircuit : le dossier n'a pas été effacé : ${err}`)
            reject({ id: 2077, error: `Le dossier n'a pas été effacé !` })
          })
      })
      .catch((err) => {
        console.error(`delDataCircuit : le dossier n'a pas été trouvé : ${err}`)
        reject({ id: 2078, error: `Le dossier n'a pas été trouvé !` })
      })
  })
}
