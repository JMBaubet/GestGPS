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
