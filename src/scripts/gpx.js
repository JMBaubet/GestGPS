//gpx.js
// Traitement des fichiers gpx par le backend.
/** Il faut : 
 * - decoder le fichier
 * - archiver le fichier gpx dans l'appli
 * - mettre à jour le fichier json
 * - créer la vignette  */


import fs from "fs"
import xml2js from 'xml2js'                 // Pour convertir le trace gpx en JSON
import haversine from 'haversine-distance'  // pour calculer la distance entre 2 points
import polyline from '@mapbox/polyline'     // Pour encoder l'URL pour la générationde la vignette
import isPng from 'is-png'                  // Pour vérifier que la vignette est correctement générée


// les variables globales
let departLat = 0                           // Latitude du point de départ
let departLong = 0                          // longitude du point de départ
let arriveeLat = 0                          // Latitude du point d'arrivée
let arriveeLong = 0                         // longitude du point d'arrivée
let ville = ""                              // Ville de départ. (Utilisée pour filtrer les traces)


// Tuto Promises : https://www.youtube.com/watch?v=05mKXSdkCJg



/**
 * Promises de génération de l'image static MapBox
 */
const createVignette = (fichierEncode) => {
  return new Promise((resolve, reject) => {
    /**  Génération de la vignette :
    * l'URL est de la forme :  
    - https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/  //streets-V12 étant le fond de carte
    - pin-s-d+00FF00(-122.46589,37.77343),  //pin-s pour afficher le point de départ avec la lettre D, la couleur et les coordonnées (lon, lat)
    - pin-s-racetrack+f00(-122.42816,37.75965), // pins-s pour afficher le point d'arrivée avec un drapeau, ma couleur et les coordonnées (lon, lat)
    - path-5+00838F-0.9(********** chaine encodée *********) // la trace avec la largeur, la couleur et l'opacité, puis les coordonnées
    - /auto/500x300@2x?access_token=???      // Les coordonnées sont calculés automatiquement, la taille de la vignette, puis notre token
    -   --output nom du fichier ?
    */
   
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
    const accessToken = process.env.VITE_MAPBOX_TOKEN                             // Le token d'accès à mapbox

    
    // On prépare l'URL
    let urlVignette = `https://api.mapbox.com/styles/v1/mapbox/${vignetteFondCarte}/static/`
    urlVignette = urlVignette + `path-${vignetteTackWidth}+${vignetteTrackCouleur}-${vignetteTrackOpacite}(${fichierEncode})`
    urlVignette = urlVignette + `,pin-s-${vignetteIconDepartSymbol}+${vignetteIconDepartCouleur}(${departLong},${departLat})`
    urlVignette = urlVignette + `,pin-s-${vignetteIconArriveeSymbol}+${vignetteIconArriveeCouleur}(${arriveeLong},${arriveeLat})`
    urlVignette = urlVignette + `/auto/${vignetteLargeur}x${vignetteHauteur}@2x?access_token=${accessToken}`
    // Il faut encoder l'URL pour passer les catactères spéciaux qui  peuvent être présent dans fichierEncode
    const urlEncode = encodeURI(urlVignette)
    //console.log(urlEncode)

    fetch(urlEncode, {method:'GET', signal: AbortSignal.timeout(5000)})
    // On attend la réponse du serveur MapBox
    .then(response => {
        if (!response.ok) {
          throw new Error(`Erreur http, Status code: ${response.status}`);
        }
        // L'image PNG est normalement retounée dans le body sous un buffer
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
            throw new Error(`La vignette n'a pas pu être enregistrée. Cause : ${err}`);
          } else {
            resolve()
          }
        })
      } else {
        throw new Error(`L'image n'est pas un PNG`);
      }
    })
    .catch(error => {
      reject(error);
    });
  })
}

export async function decodeGpx(fichier) {
  /**
   * Le code retour vaut 0 si tout s'est bien passé sinon :
   *  un bit est monté pour indiquer le type d'erreur:
   * - 0x0000 0001 : site d'origine inconnu.
   * - 0x0000 0010 : Erreur dans l'extraction du lien d'origine
   * - 0x0000 0100 : Format Route RideWithGpx incompatible
   */

  // definition des variables pour mise à jour du fichier data.json
  let codeRetour = 0
  let creator = ""        // Identification du logiciel d'édition de la trace gpx
  let editeurId = 0       // Id de l'éditeur gpx
  let editeur = ""        // Nom de l'diteur gpx

  let url = ""            // Url de la trace d'origine (dépend de l'éditeur)
  let nom = ""            // Nom de la trace
  let organisation = ""   // Organisation créatrice de la trace (VCVE, Emotion-Bike, JMB...)
  let latMin = 0          // Extrminté Nord de la trace
  let latMax = 0          // Extémité Sud de la trace
  let longMin = 0         // Extrémité Ouest de la trace
  let longMax = 0         // Extrémité Est de la trace
  let distance = 0        // Distance en m de la trace
  let denivele = 0        // Dénivelé positif de la trace

  const accessToken = process.env.VITE_MAPBOX_TOKEN  

  console.log(fichier) 

  let objectGpx = 0

  // Transformation du fichier gpx en objet javascript
  try {
    const parser = new xml2js.Parser()
    const data =  await fs.promises.readFile(fichier)
    const jsonGpx = await parser.parseStringPromise(data)
    objectGpx = JSON.parse(JSON.stringify(jsonGpx))
  
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
        const e = new Error(`Editeur ${creator} non traité !`)
        e.name = 'switchError'
        throw e
    } 
  }
  catch({name, message}) {
    //console.error(`${name}, ${message}`)
    return `${name}, ${message}`   
  }


  /** 
   * extraction du nom de la trace  depend de l'editeur
   */
  switch(editeurId) {
    case 1:   // Strava
    case 2:   // Garmin
    case 3:   // RideWithGps
      // Pour RideWithGPS le format route n'est pas compatible
      // L'objet contient objectGpx.gpx.rte[0]
      try {
        nom = objectGpx.gpx.trk[0].name
      }
      catch{
        codeRetour = codeRetour + 4
        const e = new Error("les fichiers routes sont incompatibles !")
        e.name ='FormatError'
        throw e
      }
    break;
    case 4:   // OpenRunner le nom de la trace est précdé de son id 
      const nomLong = objectGpx.gpx.trk[0].name
      const tabNom = nomLong.toString().split("-")
      nom = tabNom[0]
    break;
  }


  /** Extraction de l'URL dépend de l'editeur
   * - Pour Strava et RideWithGpx l'Url est dans les metadata
   * - Pour Garmin l'Id est dans le nom du fichier apres le prefixe COURSE_
   * - Pour OpenRunner l'Id est dans le nom du fichier sous la forme nom_du_parcours-xxxxx-Id-yyy.gpx
   */
  try {
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
      /**
       * @todo Généré une erreur Pour O et default
       */
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

    arriveeLat = Number.parseFloat(trkpt[trkpt.length-1].$.lat).toFixed(5)
    arriveeLong = Number.parseFloat(trkpt[trkpt.length-1].$.lon).toFixed(5)

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
    createVignette(traceEncodee)
    .then (() => {
      console.log('OK')
    })
    .catch((err) => {
      console.error(err)
    })




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
  } catch({name, message}) {
      console.error(`${name}, ${message}`)
    return `${name}, ${message}`   
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


