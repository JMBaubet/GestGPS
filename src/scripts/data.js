/**
 * Promise de lecture des données diverses
 */
export const getEditeurUrl = (fileName, objetGpx) => {
  return new Promise((resolve, reject) => {

    let editeur = undefined
    let editeurId = undefined
    let nomTrace = undefined
    let urlOrigine = undefined
    try {
      // extraction du site d'édition de la trace
      const creator = objetGpx.gpx.$.creator
      switch (creator) {
        case "StravaGPX":
          editeur = "Strava"
          editeurId = 1
          break;
        case "Garmin Connect":
          editeur = "Garmin"
          editeurId = 2
          break;
        case "http://ridewithgps.com/":
          editeur = "RideWithGps"
          editeurId = 3
          break;
        case "Openrunner - https://www.openrunner.com":
          editeur = "openRunner"
          editeurId = 4
          break;
        default:
          const e = new Error(`Editeur ${creator} non traité !`)
          e.name = 'switchError'
          reject(e)
      }

      // extraction du nom de la trace dépend de l'editeur
      switch (editeurId) {
        case 1:   // Strava
        case 2:   // Garmin
        case 3:   // RideWithGps
          // Pour RideWithGPS le format route n'est pas compatible
          // L'objet contient objetGpx.gpx.rte[0]
          try {
            nomTrace = objetGpx.gpx.trk[0].name[0]
          }
          catch {
            codeRetour = codeRetour + 4
            const e = new Error("les fichiers routes sont incompatibles !")
            e.name = 'FormatError'
            throw e
          }
          break;
        case 4:   // OpenRunner le nom de la trace est précédé de son id 
          const nomLong = objetGpx.gpx.trk[0].name
          const tabNom = nomLong.toString().split("-")
          nomTrace = tabNom[0]
          break;
        default:
          const e = new Error(`EditeurId ${editeurId} inconnu !`)
          e.name = 'switchError'
          reject(e)
      }

      /** Extraction de l'URL dépend de l'editeur
       * - Pour Strava et RideWithGpx l'Url est dans les metadata
       * - Pour Garmin l'Id est dans le nom du fichier apres le prefixe COURSE_
       * - Pour OpenRunner l'Id est dans le nom du fichier sous la forme nom_du_parcours-xxxxx-Id-yyy.gpx
       */
      const myArray = fileName.split("\\")
      const nomFichier = myArray.slice(-1)
      //console.log(`Nom Fichier : ${nomFichier}`)
      switch (editeurId) {
        case 1: //Strava
        case 3: //RideWithGps
          urlOrigine = objetGpx.gpx.metadata[0].link[0].$.href
          break;
        case 2: //Garmin
          urlOrigine = 'https://connect.garmin.com/modern/course/' + nomFichier.toString().replace('COURSE_', '').replace('.gpx', '')
          break;
        case 4: //Openrunner
          const myArrayBis = nomFichier.toString().split("-")
          urlOrigine = 'https://www.openrunner.com/route-details/' + myArrayBis[1]
          break;
        default:
          const e = new Error(`EditeurId ${editeurId} inconnu !`)
          e.name = 'switchError'
          reject(e)
      }
      if (urlOrigine === undefined) {
        console.error(`La variable urlOrigine n'est pas déterminée !`)
        const e = new Error(`La variable urlOrigine n'est pas déterminée !`)
        e.name = 'VarUndefined'
        reject(e)
      }
      resolve({ editeur: editeur, editeurId: editeurId, nom: nomTrace, url: urlOrigine })
    } catch (e) {
      reject(e)
    }
  })
}
