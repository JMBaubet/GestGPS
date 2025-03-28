import fs from 'fs'
import * as dotenv from 'dotenv'

dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY
const configFile = process.env.CONFIG_FILE
const fichier = `${configFile}`

let objet = {}


export const getVilles = () => {
  return new Promise((resolve, reject) => {
    try {
      objet = JSON.parse(fs.readFileSync(fichier))
      let villes = objet.villes.slice(0)
      villes.sort(function (a, b) {
        return a.nom < b.nom ? -1 : a.nom > b.nom ? 1 : 0
      })
      resolve(villes)
    } catch (e) {
      console.error(`getVilles Erreur : ${e}`)
      reject(e)
    }
  })
}

// export const getIdVille = (villecherchee) => {
//   return new Promise((resolve, reject) => {
//     try {
//       //console.log(`On reccherche l'id de ${villecherchee}`)
//       objet = JSON.parse(fs.readFileSync(fichier))
//       //console.log(`dans ${objet.villes}`)
//       for (let id = 0; id < objet.villes.length; id++) {
//         // console.log(objet.villes[id])
//         if (objet.villes[ id ] === villecherchee) {
//           // console.log(`on retourne ${id}`)
//           resolve({ id: id })
//           break
//         }
//       }
//       const e = new Error(`Ville ${villecherchee} non trouvée !`)
//       e.name = 'searchErreur'
//       reject(e)
//     } catch (e) {
//       console.error(`getVilles Erreur : ${e}`)
//       reject(e)
//     }
//   })
// }

export const getIdVille = (villecherchee) => {
  return new Promise((resolve, reject) => {
    try {
      //console.log(`On reccherche l'id de ${villecherchee}`)
      objet = JSON.parse(fs.readFileSync(fichier))
      //console.log(`dans ${objet.villes}`)
      for (let id = 0; id < objet.villes.length; id++) {
        // console.log(objet.villes[id])
        if (objet.villes[ id ].nom === villecherchee) {
          // console.log(`on retourne ${id}`)
          resolve({ id: objet.villes[ id ].id })
          break
        }
      }
      const e = new Error(`Ville ${villecherchee} non trouvée !`)
      e.name = 'searchErreur'
      reject(e)
    } catch (e) {
      console.error(`getIDVille Erreur : ${e}`)
      reject(e)
    }
  })
}


export const getVille = (id) => {
  return new Promise((resolve, reject) => {
    try {
      // console.log(`On reccherche la ville de "${id}"`)
      objet = JSON.parse(fs.readFileSync(fichier))
      //console.log(`dans ${objet.villes}`)
      for (let i = 0; i < objet.villes.length; i++) {
        // console.log(`${objet.villes[ i ].id}, ${id}`)
        if (objet.villes[ i ].id === id) {
          // console.log(`on retourne ${id}`)
          resolve({ ville: objet.villes[ i ].nom })
          break
        }
      }
      const e = new Error(`Ville ${id} non trouvée !`)
      e.name = 'searchErreur'
      reject(e)
    } catch (e) {
      console.error(`getVille Erreur : ${e}`)
      reject(e)
    }
  })
}
