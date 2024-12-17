import fs from 'fs'
const fichier = "./src/assets/dataModel.json"
let objet = {}


export const getVilles = () => {
  return new Promise((resolve, reject) => {
    try {
      objet = JSON.parse(fs.readFileSync(fichier))
      resolve(objet.villes.sort())
    } catch ({ e }) {
      console.error(`getVilles Erreur : ${e}`)
      reject(e)
    }
  })
}

export const getIdVille = (villecherchee) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(`On reccherche l'id de ${villecherchee}`)
      objet = JSON.parse(fs.readFileSync(fichier))
      console.log(`dans ${objet.villes}`)
      for (let id = 0; id < objet.villes.length; id++) {
        console.log(objet.villes[id])
        if (objet.villes[id] === villecherchee) {
          console.log(`on retourne ${id}`)
          resolve({ id: id })
          break
        }
      }
      const e = new Error(`Ville ${villecherchee} non trouvée !`)
      e.name = 'searchErreur'
      reject(e)
    } catch ({ e }) {
      console.error(`getVilles Erreur : ${e}`)
      reject(e)
    }
  })
}