import { tmpdir } from 'os'
import * as dotenv from 'dotenv'
import QRCode from 'qrcode'



/**
 * Promise de lecture des données diverses
 */
export const getEditeurUrl = (fileName, objetGpx) => {
  return new Promise((resolve, reject) => {
    const tmpDirectory = process.env.TMP_DIRECTORY
    const qrcodeFile = process.env.FILE_QRCODE

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
          console.error(`getEditeurUrl : Editeur ${creator} non traité !`)
          reject({ id: 2041, error: `Editeur ${creator} non traité !` })
      }

      // extraction du nom de la trace dépend de l'editeur
      switch (editeurId) {
        case 1:   // Strava
        case 2:   // Garmin
        case 3:   // RideWithGps
          nomTrace = objetGpx.gpx.trk[ 0 ].name[ 0 ]
          break;
        case 4:   // OpenRunner le nom de la trace est précédé de son id 
          const nomLong = objetGpx.gpx.trk[ 0 ].name
          const tabNom = nomLong.toString().split("-")
          nomTrace = tabNom[ 0 ]
          break;
        default:
          console.error(`getEditeurUrl : EditeurId ${editeurId} inconnu !`)
          reject({ id: 2044, error: `EditeurId ${editeurId}  inconnu !` })
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
          urlOrigine = objetGpx.gpx.metadata[ 0 ].link[ 0 ].$.href
          break;
        case 2: //Garmin
          urlOrigine = 'https://connect.garmin.com/modern/course/' + nomFichier.toString().replace('COURSE_', '').replace('.gpx', '')
          break;
        case 4: //Openrunner
          const myArrayBis = nomFichier.toString().split("-")
          urlOrigine = 'https://www.openrunner.com/route-details/' + myArrayBis[ 1 ]
          break;
        default:
          console.error(`getEditeurUrl : EditeurId ${editeurId} inconnu !`)
          reject({ id: 2044, error: `EditeurId ${editeurId}  inconnu !` })
      }
      if (urlOrigine === undefined) {
        console.error(`getEditeurUrl : URL d'origine indéterminée !`)
        reject({ id: 2043, error: `URL d'origine indéterminée !` })
      }

      // On génère le QRCode
      // console.log(tmpDirectory, qrcodeFile)
      QRCode.toFile(
        `${tmpDirectory}${qrcodeFile}`,
        // "E:/Loisirs/GestGps/src/assets/tmp/qrCode.png",
        urlOrigine,
        {
          errorCorrectionLevel: "H",
          width: 512,
          color: {
            dark: "#212121"
          }
        },
        function (err) {
          if (err) {
            console.error(`${err}`)
            reject({ id: 999, error: `Génération QRCode` })
          } else {
            resolve({ editeur: editeur, editeurId: editeurId, nom: nomTrace, url: urlOrigine })
          }
        }
      )

    } catch (err) {
      console.error(`getEditeurUrl : ${err}`)
      reject({ id: 2049, error: `Catch : ${err} sur getEditeurURL !` })
    }
  })
}
