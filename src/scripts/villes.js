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