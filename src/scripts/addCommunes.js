import { zpad } from "../scripts/utils.js"
import { getCommune } from "./requestsMapbox.js"


let visu = []

/**
 * @desc Promesse qui ajoute le nom des communes traversées dans le fichier visu.json.
 *        Il faut : 
 *          - Récupérer les données du fichier
 *          - Faire des requettes à mapbox pour avoir le nom de la commune de tous les points
 *          - Enregistrer le fichier visu ms à jour
 * @param {*} id du fichier visu 
 * @returns {promises} OK, ou NOK avec la cuase de l'échec
 */

export const addCommunes = (param) => {
  return new Promise((resolve, reject) => {

    const accessToken = import.meta.env.VITE_MAPBOX_TOKEN
    const deltaCommunes = 2 ** parseInt(import.meta.env.VITE_COMMUNES_DELTA)

    const tmpDirectory = import.meta.env.VITE_TMP_DIRECTORY
    const fileVisu = import.meta.env.VITE_FILE_VISU


    console.log(`AddCommunes.js : ${param}`)

    let urlVisu = `http://localhost:4000/api/visu/` + zpad(param, 6)
    let reponse

    fetch(urlVisu, { method: 'GET', signal: AbortSignal.timeout(4000) })
      .then((rep) => {
        return rep.json()
      })
      .then(async (visuJson) => {
        // On recopie les données du fichier json dans le tableau visu
        visu = visuJson.slice()
        let longueur = visu.length
        console.log(`longueur du tableau visu : ${longueur}`)
        console.log(`Delta : ${deltaCommunes}`)

        // On récupère la commune du point 0
        reponse = await getCommune(visu[ 0 ].lookAt[ 1 ], visu[ 0 ].lookAt[ 0 ], accessToken).catch((err) => {
          console.err(err)
          reject(err)
        })

        visu[ 0 ].commune = reponse.commune
        console.log(`Commune point 0 : ${visu[ 0 ].commune} `)

        let pt1 = 0
        let delta = deltaCommunes
        let newCommune = ""
        let cont = true

        while (cont) {
          if (pt1 + delta < longueur) {
            let pt2 = pt1 + delta
            if (typeof (visu[ pt2 ].commune) === "undefined") { // On vérifie si on ne connait pas déjà ce point
              reponse = await getCommune(visu[ pt2 ].lookAt[ 1 ], visu[ pt2 ].lookAt[ 0 ], accessToken).catch((err) => {
                console.err(err)
                reject(err)
              })
              newCommune = reponse.commune
            } else {
              newCommune = visu[ pt2 ].commune
            }
            // console.log(`newCommune : ${newCommune}`)
            if (newCommune === visu[ pt1 ].commune) { // Nous n'avons pas de changement de commune entre les deux points
              for (let i = 1; i <= delta; i++) {
                visu[ pt1 + i ].commune = newCommune
              }
              pt1 = pt1 + delta
              delta = 16
            } else {
              console.log(`Les communes sont différentes. Delta : ${delta}`)
              if (delta > 1) {
                delta = delta / 2
              } else {
                visu[ pt1 + 1 ].commune = newCommune
                delta = 16
                pt1 = pt1 + 1
              }
            }
            console.log(`commune du point ${pt2} : ${newCommune} `)
          } else { // On arrive à la fin de la trace
            console.log(`on arrive à la fin. Delta : ${delta}`)
            if (delta > 1) {
              delta = delta / 2
              console.log(`Delta : ${delta}`)
            } else {
              cont = false
            }
          }
        }

        console.log(`Fin de la boucle`)
        for (let index = 0; index < visu.length; index++) {
          console.log(`commune de ${index} : ${visu[ index ].commune}`)
        }

        // Le tableau visu est mis à jour avec les communes. Il faut l'enregistrer
        let url = `http://localhost:4000/api/visu/` + zpad(param, 6)

        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=UTF-8'
          },
          body: JSON.stringify({ visu: visu }),
          signal: AbortSignal.timeout(4000)
        })
          .then((rep) => {
            return rep.json()
          })
          .then((json) => {
            // On lit le 
          })
          .catch((err) => {
            console.error(`Erreur JsonTrace : ${err}`)
          })


      })
      .catch((err) => {
        console.error(`Erreur addCommunes: ${err}`)
        reject({ id: 9999, error: `Catch : ${err} sur addCommunes !` })
      })

  })
}