import fs from 'fs'
const fichier = "./src/assets/dataModel.json"
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
    } catch ({ e }) {
      console.error(`getTraceurs Erreur : ${e}`)
      reject(e)
    }
  })
}

