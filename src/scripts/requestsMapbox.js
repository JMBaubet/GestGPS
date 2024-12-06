/**
 * Promises de génération de l'image static MapBox
 */
import fs from "fs"
import polyline from '@mapbox/polyline'     // Pour encoder l'URL pour la générationde la vignette
import isPng from 'is-png'                  // Pour vérifier que la vignette est correctement générée
import simplify from 'simplify-geojson'     // Pour réduire la taille de l'URL


/**  Génération de la vignette :
 * l'URL est de la forme :  
 - https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/  //streets-V12 étant le fond de carte
 - pin-s-d+00FF00(-122.46589,37.77343),  //pin-s pour afficher le point de départ avec la lettre D, la couleur et les coordonnées (lon, lat)
 - pin-s-racetrack+f00(-122.42816,37.75965), // pins-s pour afficher le point d'arrivée avec un drapeau, ma couleur et les coordonnées (lon, lat)
 - path-5+00838F-0.9(********** chaine encodée *********) // la trace avec la largeur, la couleur et l'opacité, puis les coordonnées
 - /auto/500x300@2x?access_token=???      // Les coordonnées sont calculés automatiquement, la taille de la vignette, puis notre token
 -   --output nom du fichier ?
*/
export const createVignette = (nbPts, lineString, departLat, departLong, arriveeLat, arriveeLong, accessToken) => {
  return new Promise((resolve, reject) => {
    try {

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

      //console.log(urlVignette)
      const urlEncode = encodeURI(urlVignette)

      // On vérifie avant de lancer la requete que l'URL n'est pas trop longue
      if (urlEncode.length > 8100) {
        const e = new Error(`L'URL pour la vignette est trop longue ${urlEncode.length} !`)
        e.name = 'urlToLong'
        throw e
      }

      fetch(urlEncode, { method: 'GET', signal: AbortSignal.timeout(5000) })
        // On attend la réponse du serveur MapBox 
        .then(response => {
          if (!response.ok) {
            const e = new Error(`Status code: ${response.status}`);
            e.name = "myHttpError"
            throw e
          }
          // L'image PNG est normalement retounée dans le body sous forme d'un buffer
          return response.arrayBuffer();
        })
        .then(imageBuffer => {
          // On teste si on a une image png dans le buffer
          // Si un problème s'est produit c'est un text qui est dans le body
          if (isPng(new Uint8Array(imageBuffer))) {
            // The 'imageBuffer' now contains the binary data of the image.
            // On enregistre le fichier png
            fs.writeFile('./src/assets/tmp/vignette.png', Buffer.from(imageBuffer), err => {
              if (err) {
                reject(err)
              } else {
                resolve({ status: "OK" })
              }
            })
          } else {
            const e = new Error(`L'image n'est pas un PNG`);
            e.name = "myPngError"
            throw e
          }
        })
        .catch(error => {
          reject(error);
        })
    } catch (e) {
      reject(e)
    }
  })
}

/** 
 * Promise d'obtention la commune de départ 
 */
export const getGommune = (lat, long, accessToken) => {
  return new Promise((resolve, reject) => {
    const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${long}&latitude=${lat}&access_token=${accessToken}`
    fetch(url, { method: 'GET', signal: AbortSignal.timeout(1000) })
      .then(repHttp => {
        if (repHttp.ok)
          return repHttp.json()
        else {
          const e = new Error(`getCommune, Réponse status: ${repHttp.status}`)
          e.name = 'httpError'
          throw e
        }
      })
      .then((repJson) => {
        const commune = repJson.features.find(feature => feature.properties.feature_type === "place").properties.name
        /**
         * @todo : Faire un test avec une erreur dans le json
         */
        resolve({ commune: commune })
      })
      .catch(error => [
        reject(error)
      ])
  })
}
