/**
 * Promises de génération de l'image static MapBox
 */
import fs from "fs"
import polyline from '@mapbox/polyline'     // Pour encoder l'URL pour la génération de la vignette
import isPng from 'is-png'                  // Pour vérifier que la vignette est correctement générée
import simplify from 'simplify-geojson'     // Pour réduire la taille de l'URL


/**  Génération de la vignette :
 * l'URL est de la forme :  
 - https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/  //streets-V12 étant le fond de carte
 - pin-s-d+00FF00(-122.46589,37.77343),  //pin-s pour afficher le point de départ avec la lettre D, la couleur et les coordonnées (lon, lat)
 - pin-s-racetrack+f00(-122.42816,37.75965), // pins-s pour afficher le point d'arrivée avec un drapeau, ma couleur et les coordonnées (lon, lat)
 - path-5+00838F-0.9(********** chaine encodée *********) // la trace avec la largeur, la couleur et l'opacité, puis les coordonnées
 - /auto/500x300@2x?access_token=???      // Les coordonnées sont calculées automatiquement, la taille de la vignette, puis notre token
 -   --output nom du fichier ?
*/
export const createVignette = (nbPts, lineString, departLat, departLong, arriveeLat, arriveeLong, accessToken) => {
  return new Promise((resolve, reject) => {
    // Lecture des paramètres de génération de la vignette
    const vignetteLargeur = process.env.VIGNETTE_LARGEUR                          // Largeur en pixel
    const vignetteHauteur = process.env.VIGNETTE_HAUTEUR                          // Hauteur en pixel
    const vignetteFondCarte = process.env.VIGNETTE_FOND_DE_CARTE                  // Style du fond de carte 
    const vignetteIconDepartSymbol = process.env.VIGNETTE_ICON_DEPART_SYMBOL      // Icon du point de départ
    const vignetteIconDepartCouleur = process.env.VIGNETTE_ICON_DEPART_COULEUR    // Couleur de l'icon de départ
    const vignetteIconArriveeSymbol = process.env.VIGNETTE_ICON_ARRIVEE_SYMBOL    // Icon du point d'arrivée
    const vignetteIconArriveeCouleur = process.env.VIGNETTE_ICON_ARRIVEE_COULEUR  // Couleur de l'icon d'arrivée
    const vignetteTackWidth = process.env.VIGNETTE_TRACK_WIDTH                    // Epaisseur de la trace en pixel   
    const vignetteTrackCouleur = process.env.VIGNETTE_TRACK_COULEUR               // Couleur de la trace dur 3 digits
    const vignetteTrackOpacite = process.env.VIGNETTE_TRACK_OPACITE               // Opacité de la trace

    const tmpDirectory = process.env.TMP_DIRECTORY

    // On optimise le nombre de points pour ne pas dépasser 8Ko sur l'URL 
    // Si nombre de point > 4000 tolérance de simplify = 0.0005
    // sinon si nombre de point > 1500 tolérance de simplify = 0.0001
    // Sinon pas besoin de simplifier
    let minimized = ""
    if (nbPts > 4000)
      minimized = simplify(JSON.parse(lineString), 0.0005)
    else if (nbPts > 1500)
      minimized = simplify(JSON.parse(lineString), 0.0001)
    else
      minimized = JSON.parse(lineString)

    // Dans mapbox il y-a un bug si deux points consécutifs ont la même lattitude ou longitude
    // On balaye l'objet json pour éliminer le second point
    for (let index = 0; index < minimized["geometry"]["coordinates"].length - 1; index++) {
      let [x1, y1] = minimized["geometry"]["coordinates"][index]
      let [x2, y2] = minimized["geometry"]["coordinates"][index + 1]
      if ((x1 === x2) || (y1 === y2)) {
        minimized["geometry"]["coordinates"].splice(index--, 1)
      }
    }

    // On encode l'objet json pour réduite la taillde l'URL
    const lineStringEncodee = polyline.fromGeoJSON(minimized)

    // On prépare l'URL
    let urlVignette = `https://api.mapbox.com/styles/v1/mapbox/${vignetteFondCarte}/static/`
    urlVignette = urlVignette + `path-${vignetteTackWidth}+${vignetteTrackCouleur}-${vignetteTrackOpacite}(${lineStringEncodee})`
    urlVignette = urlVignette + `,pin-s-${vignetteIconDepartSymbol}+${vignetteIconDepartCouleur}(${departLong},${departLat})`
    urlVignette = urlVignette + `,pin-s-${vignetteIconArriveeSymbol}+${vignetteIconArriveeCouleur}(${arriveeLong},${arriveeLat})`
    urlVignette = urlVignette + `/auto/${vignetteLargeur}x${vignetteHauteur}@2x?access_token=${accessToken}`

    // Il faut encoder l'URL pour passer les catactères spéciaux qui  peuvent être présent dans fichierEncode
    const urlEncode = encodeURI(urlVignette)

    // On vérifie avant de lancer la requete que l'URL n'est pas trop longue
    if (urlEncode.length > 8100) {
      console.error(`MapBox : createVignette : URL trop longue !`)
      reject({ id: 2024, error: "URL trop longue !" })
    }
    fetch(urlEncode, { method: 'GET', signal: AbortSignal.timeout(5000) })
      // On attend la réponse du serveur MapBox 
      .then(repHttp => {
        if (!repHttp.ok) {
          switch (repHttp.status) {
            case 401: // Err dans le token
              console.error(`MapBox: Erreur Token sur createVignette !`)
              reject({ id: 2025, error: "Erreur Token !" })
              break;
            case 422: // Err dans le coordonnées
              repHttp.json().then(reponse => {
                if ((reponse.message.indexOf("marker") !== -1) || (reponse.message.indexOf("Symbol") !== -1)) {
                  console.error(`MapBox: Erreur de Marker sur createVignette !`)
                  reject({ id: 2028, error: "Erreur de marker !" })
                } else {
                  console.error(`MapBox: Erreur de coordonnées sur createVignette !`)
                  reject({ id: 2026, error: "Erreur de coordonnées !" })
                }
              })
              break;
            default:
              console.error(`MapBox: createVignette : Code erreur http ${repHttp.status}`)
              reject({ id: 2027, error: `Erreur http ${repHttp.status} !` })
          }
        } else {
          // L'image PNG est normalement retounée dans le body sous forme d'un buffer
          repHttp.arrayBuffer()
            .then(imageBuffer => {
              // On teste si on a une image png dans le buffer
              // Si un problème s'est produit c'est un text qui est dans le body
              if (isPng(new Uint8Array(imageBuffer))) {
                // The 'imageBuffer' now contains the binary data of the image.
                fs.promises.writeFile(tmpDirectory + 'vignette.png', Buffer.from(imageBuffer))
                  .then(() => {
                    resolve({ status: "OK" })
                  })
                  .catch((err) => {
                    console.error(`Mapbox : createVignette : ${err}.`)
                    reject({ id: 2032, error: "Enregistrement de la vignette !" })
                  })
              } else {
                console.error(`Mapbox : createVignette : Le format attendu n'est pas un png !`)
                reject({ id: 2029, error: "Le format attendu n'est pas un png !" })
              }
            })
            .catch((err) => {
              console.error(`MapBox: createVignette : ${err}`)
              reject({ id: 2034, error: "Traitement image !" })

            })
        }
      })
      .catch(err => {
        if (`${err}`.includes("Timeout")) {          // On traite l’erreur du fetch (Time Out)
          console.log(`MapBox : createVignette : TimeOut !`)
          reject({ id: 2031, error: "TimeOut mapbox !" })
        } else {
          console.error(`MapBox : createVignette : ${err}`)
          reject({ id: 2033, error: "Erreur fetch vers mapbox !" })
        }
      })
  })
}


/**
 * @typedef returnCommune
 * @type {object}
 * @property {String} commune
 */

/**
 * Cette fonction retourne un nom de commune en fonction des coordonnées géograpiques données. 
 * @param {number} lat - La latitude du point en décimale
 * @param {number} long - La longitude du point en décimale
 * @param {string} accessToken - Le token pour MapBox
 * @returns {Promise<returnCommune>} - le nom de la commune
 */
export const getCommune = (lat, long, accessToken) => {
  return new Promise((resolve, reject) => {
    const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${long}&latitude=${lat}&access_token=${accessToken}`
    //console.log(url)
    fetch(url, { method: 'GET', signal: AbortSignal.timeout(1000) })
      .then((repHttp) => { // On a recu
        if (repHttp.ok)
          repHttp.json()
            .then((repJson) => {
              if (repJson.features.length !== 0) {
                const commune = repJson.features.find(feature => feature.properties.feature_type === "place").properties.name
                resolve({ commune: commune })
              } else {
                console.error(`MapBox: getCommune : La commune de départ n'a pas pu être trouvée !`)
                reject({ id: 2009, error: "Commune de départ introuvable !" })
              }
            })
            .catch((err) => {
              console.error(`MapBox: getCommune : ${err}`)
              reject({ id: 2002, error: "Problème format JSON !" })
            })

        else {
          switch (repHttp.status) {
            case 401: // Err dans le token
              console.error(`MapBox: Erreur Token sur getCommune !`)
              reject({ id: 2005, error: "Erreur Token !" })
              break;
            case 422: // Err dans le coordonnées
              console.error(`MapBox: Erreur de coordonnées sur getCommune !`)
              reject({ id: 2006, error: "Erreur de coordonnées !" })
              break;
            default:
              console.error(`MapBox: getCommune : Code erreur http ${repHttp.status}`)
              reject({ id: 2007, error: `Erreur http ${repHttp.status} !` })
          }
        }
      })
      .catch((err) => {
        if (`${err}`.includes("Timeout")) {          // On traite l’erreur du fetch (Time Out)
          console.error(`MapBox : getCommune : TimeOut !`)
          reject({ id: 2001, error: "TimeOut mapbox !" })
        } else {
          console.error(`MapBox : getCommune : ${err}`)
          reject({ id: 2003, error: "Erreur fetch vers mapbox!" })
        }

      })
  })
}
