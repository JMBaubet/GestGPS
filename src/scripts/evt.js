import fs from 'fs'
import * as dotenv from 'dotenv'


dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY
const fileEvt = process.env.FILE_EVT

/**
 * @desc Promesse qui retourne sous forme d'un objet JSON le fichier FILE_VISU
 * @param {*} id 
 * @returns {promises}
 */
export const getEvt = (id) => {
  return new Promise((resolve, reject) => {
    try {
      const buffer = JSON.parse(fs.readFileSync(dataDirectory + id + "\\" + fileEvt))
      resolve(buffer)
    } catch (err) {
      console.error(`getEvt Erreur : ${err}`)
      reject({ id: 9999, error: `Erreur lecture du fichier FILE_EVT !` })
    }
  })
}



export const saveEvt = (id, evt) => {
  return new Promise((resolve, reject) => {
    console.log(`Enregistrement du fichier evt : ${id}`)
    console.table(evt)

    fs.promises.writeFile(dataDirectory + id + "\\" + fileEvt, JSON.stringify(evt))
      .then(() => {
        resolve({ status: "OK" })
      })
      .catch((err) => {
        console.error(`Erreur archivage du fichier evt : ${err}`)
        reject({ id: "21??", error: `Erreur écriture de fichier !` })
      })
  })
}

