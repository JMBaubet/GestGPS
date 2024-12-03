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
import simplify from 'simplify-geojson'     // Pour réduire la taille de l'URL


// les variables globales
let arriveeLat = 0                          // Latitude du point d'arrivée
let arriveeLong = 0                         // longitude du point d'arrivée
let ville = ""                              // Ville de départ. (Utilisée pour filtrer les traces)


// Tuto Promises : https://www.youtube.com/watch?v=05mKXSdkCJg

/**
 * Promise de lecture des données diverses
 */
const getData = (fileName, objetGpx) => {
  return new Promise((resolve, reject) => {
    
    let editeur = undefined
    let editeurId = undefined
    let nomTrace = undefined
    let urlOrigine = undefined
    try {
      // extraction du site d'édition de la trace
      const creator = objetGpx.gpx.$.creator
      switch(creator) {
        case "StravaGPX" : 
          editeur = "Strava"
          editeurId = 1 
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
          reject(e) 
      } 

      // extraction du nom de la trace dépend de l'editeur
      switch(editeurId) {
        case 1:   // Strava
        case 2:   // Garmin
        case 3:   // RideWithGps
          // Pour RideWithGPS le format route n'est pas compatible
          // L'objet contient objetGpx.gpx.rte[0]
          try {
            nomTrace = objetGpx.gpx.trk[0].name
          }
          catch{
            codeRetour = codeRetour + 4
            const e = new Error("les fichiers routes sont incompatibles !")
            e.name ='FormatError'
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
      switch(editeurId) {
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
      resolve({editeur: editeur, editeurId: editeurId, nom: nomTrace, url: urlOrigine})
    } catch({e}) {
      reject(e)
    }
  })
}




/**
 * Promise de calcul du denivelé et de la distance
 * 
 */
const getDistanceDPlus = (lineString) => {
  return new Promise((resolve, reject) => {
    try {      
      const lineStringObjet = JSON.parse(lineString)
      let distance = 0
      let sommet = 0
      let distanceSommet = 0
      let denivele = 0
      for (let index = 0; index <  lineStringObjet["geometry"]["coordinates"].length - 1; index ++)  {
        let [lon1, lat1, dev1] = lineStringObjet["geometry"]["coordinates"][index]
        let [lon2, lat2, dev2] = lineStringObjet["geometry"]["coordinates"][index  + 1]
        distance = distance + haversine({lat : lat1, lon: lon1}, {lat : lat2, lon: lon2})
        if (dev2 > dev1)
          denivele = denivele + dev2 - dev1
        if (dev1 > sommet) {
          sommet = dev1
          distanceSommet = distance
        }
      }
      distance = parseInt(distance)/1000
      distanceSommet = parseInt(distanceSommet/1000)
      resolve({distance: distance, denivele: denivele, ptCulminant: sommet, distSommet: distanceSommet})
    }
    catch({e}) {
      reject(e)
    }
  })
}


/** 
 * Promise d'obtention de la commune de départ 
 */
const getGommune = (lat, long, accessToken) => {
  return new Promise((resolve, reject) => {
      const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${long}&latitude=${lat}&access_token=${accessToken}`
      fetch(url, {method:'GET', signal: AbortSignal.timeout(1000)})
      .then(repHttp => {
          if (repHttp.ok)
              return repHttp.json()
          else {
              const e = new Error(`getCommune, Réponse status: ${repHttp.status}`)
              e.name = 'httpError'
              throw e
          }
      })
      .then((repJson) =>{
          const commune = repJson.features.find(feature => feature.properties.feature_type === "place").properties.name
          /**
           * @todo : Faire un test avec une erreur dans le json
           */
          resolve({commune: commune})
      })
      .catch(error => [
          reject(error)
      ])
  })
}


/**
 * Promises de génération de l'image static MapBox
 */
const createVignette = (nbPts, lineString, departLat, departLong, arriveeLat, arriveeLong, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
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
      
      // On optimise le nombre de points pour ne pas dépasser 8Ko sur l'URL 
      // Si nombre de point > 4000 tolérance de simplify = 0.0005
      // sinon si nombre de point > 1500 tolérance de simplify = 0.0001
      // Sinon pas besoin de simplifier
      let minimized = ""
      if (nbPts > 4000) 
        minimized = simplify(JSON.parse(lineString), 0.0005)
      else if (nbPts > 1500 )
        minimized = simplify(JSON.parse(lineString), 0.0001)
      else  
        minimized = JSON.parse(lineString)

      // Dans mapbox il y-a un bug si deux points consécutifs ont la même lattitude ou longitude
      // On balaye l'objet json pour éliminer le second point
      for (let index = 0; index <  minimized["geometry"]["coordinates"].length - 1; index ++)  {
        let [x1, y1] = minimized["geometry"]["coordinates"][index]
        let [x2, y2] = minimized["geometry"]["coordinates"][index  + 1]
        if ((x1 === x2) || (y1 === y2 )) {
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
      if(urlEncode.length > 8100) {
        const e = new Error(`L'URL pour la vignette est trop longue ${urlEncode.length} !`)
        e.name = 'urlToLong'
        throw e
      }

      fetch(urlEncode, {method:'GET', signal: AbortSignal.timeout(5000)})
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
              resolve({status: "OK"})
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



export async function decodeGpx(fichier) {

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
  let trkpt = 0
  let objetGpx = 0
  let lineString = ""
  let departLat = ""
  let departLong = ""
  let arriveeLat = ""
  let arriveeLong = ""
  
  const accessToken = process.env.VITE_MAPBOX_TOKEN  

  try {
    // Transformation du fichier gpx en objet javascript
    const parser = new xml2js.Parser()
    const data =  await fs.promises.readFile(fichier)
    objetGpx = await parser.parseStringPromise(data)
     
    // extraction des points de passage
    trkpt = objetGpx.gpx.trk[0].trkseg[0].trkpt 
  } 
  catch({name, message}) {
    //console.error(`${name}, ${message}`)
    return `${name}, ${message}`   
  }

  try {
    // Création du JSON lineString avec l'altitude lissée sur 9 points
    //console.log(trkpt.length)
    let nbPts = 0
    lineString = '{"type": "Feature","geometry": {"type": "LineString","coordinates":['
    // Pour les 4 premiers point on ne corrige pas l'altitude
    for(let key = 4; key < 4; key++) {
      lineString = lineString + '[' + 
                  Number.parseFloat(trkpt[key].$.lon).toFixed(5) + ',' + 
                  Number.parseFloat(trkpt[key].$.lat).toFixed(5) + ',' +
                  parseInt(trkpt[key].ele) + '],'
    }

    // Pour les points intermédiares on lisse l'altitude
    for(let key = 4; key < trkpt.length - 4; key++) {
      let altitude = parseInt((
        parseInt(trkpt[key-4].ele) + parseInt(trkpt[key-3].ele) + parseInt(trkpt[key-2].ele) + 
        parseInt(trkpt[key-1].ele) + parseInt(trkpt[key].ele) + parseInt(trkpt[key+1].ele) + 
        parseInt(trkpt[key+2].ele) + parseInt(trkpt[key+3].ele) + parseInt(trkpt[key+4].ele)
      )/9)

      lineString = lineString + '[' + 
                  Number.parseFloat(trkpt[key].$.lon).toFixed(5) + ',' + 
                  Number.parseFloat(trkpt[key].$.lat).toFixed(5) + ',' +
                  altitude + '],'
    }

    // Pour les 4 derniers points on ne lisse pas l'altitude
    for(let key = trkpt.length - 4; key < trkpt.length; key++) {
      lineString = lineString + '[' + 
                  Number.parseFloat(trkpt[key].$.lon).toFixed(5) + ',' + 
                  Number.parseFloat(trkpt[key].$.lat).toFixed(5) + ',' +
                  parseInt(trkpt[key].ele) + '],'
    }


    lineString = lineString.slice(0, -1); // On supprime la dernière virgule
    lineString = lineString + ']},"properties": {}}'

    // Extracttion des coordonnées de départ et d'arrivée
    departLat = Number.parseFloat(trkpt[0].$.lat).toFixed(5)
    departLong = Number.parseFloat(trkpt[0].$.lon).toFixed(5)
    arriveeLat = Number.parseFloat(trkpt[trkpt.length-1].$.lat).toFixed(5)
    arriveeLong = Number.parseFloat(trkpt[trkpt.length-1].$.lon).toFixed(5)
  } 
  catch({name, message}) {
    //console.error(`${name}, ${message}`)
    return `${name}, ${message}`   
  }


  /**
   * Lancemeent de promesse
   */

  // Promise.all([
  //   createVignette(trkpt.length, lineString, departLat, departLong, arriveeLat, arriveeLong, accessToken),
  //   getGommune(departLat, departLong, accessToken),
  //   getDistanceDPlus(lineString),
  //   getData(fichier, objetGpx)
  // ])
  // .then((results) => {

  // })
  // .catch((e) => [
  //   console.error(`${e}`)
  // ])

  //  createVignette(trkpt.length, lineString, departLat, departLong, arriveeLat, arriveeLong, accessToken)
  // .then((retour) => {
  //   console.log(`Vignette : ${retour.status}`)
  // })
  // .catch((err) => {
  //   console.error(`${err}`)
  // })

  // getGommune(departLat, departLong, accessToken)
  // .then((retour) => {
  //   console.log(`Ville : ${retour.commune}`)
  // })
  // .catch((err) => {
  //   console.error(err)
  // })

  //  getDistanceDPlus(lineString)
  // .then((retour) => {
  //   console.log(`Distance : ${retour.distance} km, D+ : ${retour.denivele} m, Point culminant : ${retour.ptCulminant} m, à ${retour.distSommet} km`)
  // })
  // .catch((err) => {
  //   console.error(err)
  // })

   getData(fichier, objetGpx)
  .then((data) => {
    console.log(`Editeur : ${data.editeur}`)
    console.log(`editeurId : ${data.editeurId}`)
    console.log(`Nom : ${data.nom}`)
    console.log(`URL : ${data.url}`)
  })
  .catch((error) => {
    console.error(`Erreur de la promesse getData : ${error}`)
  })

}
