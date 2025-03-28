import fs from 'fs'
import * as dotenv from 'dotenv'

dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY
const configFile = process.env.CONFIG_FILE
const fichier = `${configFile}`

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



export const getIdTraceur = (traceurcherchee) => {
  return new Promise((resolve, reject) => {
    try {
      // console.log(`On recherche l'id de <${traceurcherchee}>`)
      objet = JSON.parse(fs.readFileSync(fichier))
      // console.table(`dans ${objet.traceurs}`)
      for (let id = 0; id < objet.traceurs.length; id++) {
        // console.log(objet.traceurs[ id ])
        if (objet.traceurs[ id ].nom === traceurcherchee) {
          // console.log(`on retourne ${objet.traceurs[ id ].id}`)
          resolve({ id: objet.traceurs[ id ].id })
          break
        }
      }
      const e = new Error(`Traceur ${traceurcherchee} non trouvée !`)
      e.name = 'searchErreur'
      reject(e)
    } catch (e) {
      console.error(`getTraceur Erreur : ${e}`)
      reject(e)
    }
  })
}


export const getTraceur = (id) => {
  return new Promise((resolve, reject) => {
    try {
      // console.log(`On recherche le traceur de "${id}"`)
      objet = JSON.parse(fs.readFileSync(fichier))
      //console.log(`dans ${objet.traceurs}`)
      for (let i = 0; i < objet.traceurs.length; i++) {
        // console.log(`${objet.traceurs[ i ].id}, ${id}`)
        if (objet.traceurs[ i ].id === id) {
          // console.log(`on retourne ${id}`)
          resolve({ traceur: objet.traceurs[ i ].nom })
          break
        }
      }
      const e = new Error(`Traceur ${id} non trouvée !`)
      e.name = 'searchErreur'
      reject(e)
    } catch (e) {
      console.error(`getTraceur Erreur : ${e}`)
      reject(e)
    }
  })
}
