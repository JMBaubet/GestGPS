//gpx.js

import fs from "fs"
import xml2js from 'xml2js'
import haversine from 'haversine-distance' // pour calculer la distance entre 2 points
import polyline from '@mapbox/polyline'

// Tuto Promises : https://www.youtube.com/watch?v=05mKXSdkCJg

// Traitement des fichiers gpx par le backend.
/** Il faut : 
 * - decoder le fichier
 * - archiver le fichier gpx dans l'appli
 * - mettre à jour le fichier json
 * - créer la vignette  */


export async function decodeGpx(fichier) {
  /**
   * Le code retour vaut 0 si tout s'est bien passé sinon :
   *  un bit est monté pour indiquer le type d'erreur:
   * - 0x0000 0001 : site d'origin inconnu.
   * - 0x0000 0010 : Erreur dans l'extraction du lien d'origine
   * - 0x0000 0100 : Format Route RideWithGpx incompatible
   */

  // definition des variables pour mise à jour du fichier data.json
  let codeRetour = 0
  let creator = ""
  let editeurId = 0
  let editeur = ""
  let ville = ""
  let url = ""
  let nom = ""
  let organisation = ""
  let departLat = 0
  let departLong = 0
  let latMin = 0
  let latMax = 0
  let longMin = 0
  let longMax = 0
  let distance = 0
  let denivele = 0

  const accessToken = process.env.VITE_MAPBOX_TOKEN

  console.log(fichier) 
  try {
    const parser = new xml2js.Parser()
    const data =  await fs.promises.readFile(fichier)
    const jsonGpx = await parser.parseStringPromise(data)
    const objectGpx = JSON.parse(JSON.stringify(jsonGpx))

    // extraction du site d'édition de la trace
    const creator = objectGpx.gpx.$.creator
    switch(creator) {
      case "StravaGPX" : 
        editeurId = 1 
        editeur = "Strava"
        break ;
      case "Garmin Connect" :
        editeur = "Garmin"
        editeurId =  2
        break ;
      case "http://ridewithgps.com/" :
        editeur = "RideWithGps"
        editeurId =  3         
        break ;
      case "Openrunner - https://www.openrunner.com" :
        editeur = "openRunner"
        editeurId = 4
        break;
      default:
        editeurId = 0 
        editeur = creator 
        codeRetour = codeRetour + 1   
      } 

    // extrcation du nom de la trace  
    
    switch(editeurId) {
      case 1:
      case 2:
      case 3:
        // Pour RideWithGPS le format route n'est pas compatible
        try {
          nom = objectGpx.gpx.trk[0].name
        }
        catch{
          codeRetour = codeRetour + 4
          throw new ErreurFormatRideWithGps("Route", "Incompatible");
        }
      break;
      case 4:
        const nomLong = objectGpx.gpx.trk[0].name
        const tabNom = nomLong.toString().split("-")
        nom = tabNom[0]
      break;
    }

    /** Extrcation de l'URL dépend de l'editeur
     * - Pour Strava et RideWithGpx l'Url est dans les metadata
     * - Pour Garmin l'Id est dans le nom du fichier apres le prefixe COURSE_
     * - Pour OpenRunner l'Id est dans le nom du fichier sous la forme nom_du_parcours-xxxxx-Id-yyy.gpx
     */

    const myArray = fichier.split("\\")
    const nomFichier = myArray.slice(-1)
    //console.log(`Nom Fichier : ${nomFichier}`)
    switch(editeurId) {
      case 1: //Strava
      case 3: //RideWithGps
        url = objectGpx.gpx.metadata[0].link[0].$.href        
      break;
      case 2: //Garmin
        url = 'https://connect.garmin.com/modern/course/' + nomFichier.toString().replace('COURSE_', '').replace('.gpx', '')
      break;
      case 4: //Openrunner
        const myArrayBis = nomFichier.toString().split("-")
        url = 'https://www.openrunner.com/route-details/' + myArrayBis[1]
      break;
      case 0:
        null // pour ne pas générer une nouvelle erreur 
      break;
      default:
        codeRetour = codeRetour + 2
    }
    console.log(`URL : ${url}`)

    
    /** extraction des points pour  :
     * - avoir les coordonées de départ. Ceci permetra d'avoir la ville de départ
     * - Calculer le rectangle qui contient la trace
     * - calculer la distance
     * - calculer le dénivelé
    */
    const trkpt = objectGpx.gpx.trk[0].trkseg[0].trkpt 
    
    // Extracttion des coordonées de départ
    departLat = Number.parseFloat(trkpt[0].$.lat).toFixed(5)
    departLong = Number.parseFloat(trkpt[0].$.lon).toFixed(5)

    const arriveeLat = Number.parseFloat(trkpt[trkpt.length-1].$.lat).toFixed(5)
    const arriveeLong = Number.parseFloat(trkpt[trkpt.length-1].$.lon).toFixed(5)

    latMin = trkpt[0].$.lat
    latMax = trkpt[0].$.lat
    longMin = trkpt[0].$.lon
    longMax = trkpt[0].$.lon
  
    let lat
    let long
    let ele
    for(var key in trkpt) {
      lat = trkpt[key].$.lat
      long = trkpt[key].$.lon
      ele = trkpt[key].ele
      lat < latMin ? latMin = lat:null
      lat > latMin ? latMax = lat:null
      long < longMin ? longMin = long:null
      long > longMax ? longMax = long:null
    }

    // Calcul de la distance et du dénivelé
    let trace = '{"type": "Feature","geometry": {"type": "LineString","coordinates":['
    for(let key = 0; key < trkpt.length - 1; key = key + 3) {
      const ptA = {lat : trkpt[key].$.lat, lon: trkpt[key].$.lon}
      const ptB = {lat : trkpt[key + 1].$.lat, lon: trkpt[key + 1].$.lon}

      distance = distance + haversine(ptA, ptB)

      if (parseInt(trkpt[key + 1].ele) > parseInt(trkpt[key].ele)) {
        denivele = denivele + parseInt(trkpt[key  +1 ].ele) - parseInt(trkpt[key].ele)
      }
      if ((Number.parseFloat(trkpt[key].$.lon).toFixed(5) !== Number.parseFloat(trkpt[key + 3].$.lon).toFixed(5)) && 
         (Number.parseFloat(trkpt[key].$.lat).toFixed(5) !== Number.parseFloat(trkpt[key + 3].$.lat).toFixed(5)) ) {
        trace = trace + '[' + Number.parseFloat(trkpt[key].$.lon).toFixed(5) + ',' + Number.parseFloat(trkpt[key].$.lat).toFixed(5) + '],'
      }
    }
    trace = trace.slice(0, -1);
    trace = trace + ']},"properties": {}}'

    console.log(trkpt.length)
    const traceEncodee = polyline.fromGeoJSON(JSON.parse(trace))

    /**  Génération de la vignette :
     * l'URL est de la forme :  
     - https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/  //streets-V12 étant le fond de carte
     - pin-s-d+00FF00(-122.46589,37.77343),  //pin-s pour afficher le point de départ avec la lettre D, la couleur et les coordonnées (lon, lat)
     - pin-s-racetrack+f00(-122.42816,37.75965), // pins-s pour afficher le point d'arrivée avec un drapeau, ma couleur et les coordonnées (lon, lat)
     - path-5+00838F-0.9(********** chaine encodée *********) // la trace avec la largeur, la couleur et l'opacité, puis les coordonnées
     - /auto/500x300@2x?access_token=???      // Les coordonnées sont calculés automatiquement, la taille de la vignette, puis notre token
     -   --output nom du fichier ?
     */

    // Lecture des paramètres du ficheir .env
    const vignetteLargeur = process.env.VIGNETTE_LARGEUR
    const vignetteHauteur = process.env.VIGNETTE_HAUTEUR
    const vignetteFondCarte = process.env.VIGNETTE_FOND_DE_CARTE
    const vignetteIconDepartSymbol = process.env.VIGNETTE_ICON_DEPART_SYMBOL
    const vignetteIconDepartCouleur = process.env.VIGNETTE_ICON_DEPART_COULEUR
    const vignetteIconArriveeSymbol = process.env.VIGNETTE_ICON_ARRIVEE_SYMBOL 
    const vignetteIconArriveeCouleur = process.env.VIGNETTE_ICON_ARRIVEE_COULEUR
    const vignetteTackWidth = process.env.VIGNETTE_TRACK_WIDTH
    const vignetteTrackCouleur = process.env.VIGNETTE_TRACK_COULEUR
    const vignetteTrackOpacite = process.env.VIGNETTE_TRACK_OPACITE 
    
    let urlVignette = `https://api.mapbox.com/styles/v1/mapbox/${vignetteFondCarte}/static/`
    urlVignette = urlVignette + `path-${vignetteTackWidth}+${vignetteTrackCouleur}-${vignetteTrackOpacite}(${traceEncodee})`
    urlVignette = urlVignette + `,pin-s-${vignetteIconDepartSymbol}+${vignetteIconDepartCouleur}(${departLong},${departLat})`
    urlVignette = urlVignette + `,pin-s-${vignetteIconArriveeSymbol}+${vignetteIconArriveeCouleur}(${arriveeLong},${arriveeLat})`
    urlVignette = urlVignette + `/auto/${vignetteLargeur}x${vignetteHauteur}@2x?access_token=${accessToken}`

    const urlEncode = encodeURI(urlVignette)
    console.log(urlEncode)

    console.log(urlEncode.length)

    let image = await fetch(url, {method:'GET', signal: AbortSignal.timeout(5000)})
    .then((rep, err) => {
      // console.log(`Réponse MapBox : ${rep.status} : ${rep.ok}, ${rep.statusText}`)
      if (rep.ok)
        return rep
      // voir https://byby.dev/js-fetch-get-response-body
      else {
        // si rep KO on passe le N° d'err et le text
        throw `${rep.status}, ${rep.statusText}` 
      }
    })
    .then((rep, err) => {
      return rep
      
    })

    console.log(image)


    // Obtention de la ville  
    url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${long}&latitude=${lat}&access_token=${accessToken}`
    
    ville = await fetch(url, {method:'GET', signal: AbortSignal.timeout(1000)})
    .then((rep, err) => {
      // console.log(`Réponse MapBox : ${rep.status} : ${rep.ok}, ${rep.statusText}`)
      if (rep.ok)
        return rep.json()
      else {
        // si rep KO on passe le N° d'err et le text
        throw `${rep.status}, ${rep.statusText}` 
      }
    })
    .then((rep, err) => {
      const city = rep.features.find(feature => feature.properties.feature_type === "place").properties.name
      //console.log(`Ville : ${city}`)
      return city
      
    })



  //console.dir(`${editeur}, ${nom}, ${distance}, ${denivele}, ${ville}`)
    


    
    
    

    return codeRetour
  } catch(error) {
    return error.message    
  }
}


/************************************
* Obtention de la commune de départ *
* voir https://docs.mapbox.com/playground/geocoding/?longitude=2.813454204212036&latitude=48.86380768349139&searchType=reverse
************************************/
async function getCommuneDepart(lat, long, accessToken) {
  const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${long}&latitude=${lat}&access_token=${accessToken}`
  await fetch(url, {method:'GET', signal: AbortSignal.timeout(1000)})
  .then((rep, err) => {
    // console.log(`Réponse MapBox : ${rep.status} : ${rep.ok}, ${rep.statusText}`)
    if (rep.ok)
      return rep.json()
    else {
      // si rep KO on passe le N° d'err et le text
      throw `${rep.status}, ${rep.statusText}` 
    }
  })
  .then((rep, err) => {
    const city = rep.features.find(feature => feature.properties.feature_type === "place").properties.name
    console.log(`Ville : ${city}`)
    return city
    
  })

  .catch(err => {
    //traitement des erreurs
    console.error(`Erreur mapbox : ${err}`)
  })
}


