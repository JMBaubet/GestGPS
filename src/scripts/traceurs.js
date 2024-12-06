import fs from 'fs'
const fichier = "./src/assets/dataModel.json"
let objet = {}


export const getTraceurs = () => {
  return new Promise((resolve, reject) => {
    try {
      objet = JSON.parse(fs.readFileSync(fichier))
      resolve(objet.traceurs)
    } catch ({ e }) {
      console.error(`getTraceurs Erreur : ${e}`)
      reject(e)
    }
  })
}

