import fs from 'fs'
import * as dotenv from 'dotenv'

dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY
const configFile = process.env.CONFIG_FILE

const fichier = `${dataDirectory}${configFile}`

let objet = {}

export const getCircuits = () => {
  return new Promise((resolve, reject) => {
    try {
      objet = JSON.parse(fs.readFileSync(fichier))
      resolve({ circuits: objet.circuits.sort().reverse(), totalCircuits: objet.circuits.length })
    } catch ({ e }) {
      console.error(`getCircuits Erreur : ${e}`)
      reject(e)
    }
  })
}