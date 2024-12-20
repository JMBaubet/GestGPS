import fs from 'fs'
import * as dotenv from 'dotenv'

dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY
const configFile = process.env.CONFIG_FILE
const fichier = `${dataDirectory}${configFile}`

let objet = {}

export const getTraceurs = () => {
  return new Promise((resolve, reject) => {
    try {
      objet = JSON.parse(fs.readFileSync(fichier))
      let traceurs = objet.traceurs.slice(0)
      traceurs.sort(function (a, b) {
        return a.nom < b.nom ? -1 : a.nom > b.nom ? 1 : 0
      })
      resolve(traceurs)
    } catch (e) {
      console.error(`getTraceurs Erreur : ${e}`)
      reject(e)
    }
  })
}

