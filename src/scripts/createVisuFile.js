import * as turf from '@turf/turf'
import * as dotenv from 'dotenv'
import fs from "fs/promises"


const tmpDirectory = process.env.TMP_DIRECTORY
const fileVisu = process.env.FILE_VISU

export const createVisuFile = (lineString) => {
  return new Promise((resolve, reject) => {
    // console.log(`createCameraFile`)

    const lineStringObjet = JSON.parse(lineString)
    // console.table(lineStringObjet[ "geometry" ][ "coordinates" ])

    const longueur = turf.length(turf.lineString(lineStringObjet[ "geometry" ][ "coordinates" ])).toFixed(2)
    let pointsCamera = []
    // console.log(`Longeur : ${longueur}`)
    pointsCamera.push([ lineStringObjet[ "geometry" ][ "coordinates" ][ 0 ][ 0 ], lineStringObjet[ "geometry" ][ "coordinates" ][ 0 ][ 1 ] ])
    let pas = 0.1 // Valeur en Km (100m)
    while (pas < longueur) {
      let point = turf.along(turf.lineString(lineStringObjet[ "geometry" ][ "coordinates" ]), pas)
      // console.table(point["geometry"]["coordinates"])
      pointsCamera.push(turf.truncate(turf.point(point[ "geometry" ][ "coordinates" ]), { precision: 5 })[ "geometry" ][ "coordinates" ])
      pas += 0.1
    }
    pointsCamera.push([ lineStringObjet[ "geometry" ][ "coordinates" ][ lineStringObjet[ "geometry" ][ "coordinates" ].length - 1 ][ 0 ],
    lineStringObjet[ "geometry" ][ "coordinates" ][ lineStringObjet[ "geometry" ][ "coordinates" ].length - 1 ][ 1 ] ])
    //console.table(pointsCamera)

    // On calcul l'angle de vision pour la caméra tous les 100m
    // On vise le cap sur 1500m pour lisser les changements de cap
    // pour avoir une vue dans la direction de la trace 

    for (let nbSegment = 0; nbSegment < pointsCamera.length - 15; nbSegment++) {

      pointsCamera[ nbSegment ].cap = parseInt(turf.bearing(
        [ pointsCamera[ nbSegment ][ 0 ], pointsCamera[ nbSegment ][ 1 ] ],
        [ pointsCamera[ nbSegment + 15 ][ 0 ], pointsCamera[ nbSegment + 15 ][ 1 ] ]
      ))
      // console.log(`Occurence : ${nbSegment},  - cap : ${pointsCamera[nbSegment].cap}`)
    }

    // On traite le 15 derniers 100m 
    let fin = 15
    for (let nbSegment = pointsCamera.length - 15; nbSegment < pointsCamera.length; nbSegment++) {
      // console.log(`Occurence : ${occ},  - cap : ${pointsCamera[nbSegment].cap}`)
      pointsCamera[ nbSegment ].cap = parseInt(turf.bearing(
        [ pointsCamera[ nbSegment ][ 0 ], pointsCamera[ nbSegment ][ 1 ] ],
        [ pointsCamera[ nbSegment + fin - 1 ][ 0 ], pointsCamera[ nbSegment + fin - 1 ][ 1 ] ]
      ))
      fin--
      // console.log(`Occurence : ${occ},  - cap : ${pointsCamera[nbSegment].cap}`)
    }
    // Pour le point d'arrivée on garde le cap du point précédent
    pointsCamera[ pointsCamera.length - 1 ].cap = pointsCamera[ pointsCamera.length - 2 ].cap
    // console.table(pointsCamera)

    //-------------------------------
    // Traitement de l'altimétrie
    //-------------------------------
    // Sur tous les 100 m on calcule l'altitude arrondie à 0.1 m soit 0.1% de précision
    // Algorithme : On prend les point un par un.
    // Si on depasse le pas de 100 on prend le point précédent et on fait une règle de 3 entre les deux points
    let pointsAltitude = []
    let altPrecedente = 0
    let altCourante = 0
    let distance = 0.1
    let avancement = []  // Tableau qui permet de calculer la distance de la trace en fonction de l'avancement
    console.log(`On traite l'altimétrie: Longueur de la trace : ${lineStringObjet[ "geometry" ][ "coordinates" ].length}`)

    avancement.push(
      [ lineStringObjet[ "geometry" ][ "coordinates" ][ 0 ][ 0 ],
      lineStringObjet[ "geometry" ][ "coordinates" ][ 0 ][ 1 ] ]
    )

    pointsAltitude.push(lineStringObjet[ "geometry" ][ "coordinates" ][ 0 ][ 2 ])
    console.table(avancement)
    for (let index = 1; index < lineStringObjet[ "geometry" ][ "coordinates" ].length; index++) {
      avancement.push(
        [ lineStringObjet[ "geometry" ][ "coordinates" ][ index ][ 0 ],
        lineStringObjet[ "geometry" ][ "coordinates" ][ index ][ 1 ] ]
      )
      // console.table(avancement)
      console.log(`Avancement : ${turf.length(turf.lineString(avancement))}`)
      if (turf.length(turf.lineString(avancement)) > distance) {
        console.log(`On traite un nouveau point`)
        // On lit les altitudes courante et précédente
        altCourante = lineStringObjet[ "geometry" ][ "coordinates" ][ index ][ 2 ]
        altPrecedente = lineStringObjet[ "geometry" ][ "coordinates" ][ index - 1 ][ 2 ]
        if (altCourante === altPrecedente) {
          pointsAltitude.push = altCourante.toFixed(1)
        } else { // Nous n'avons pas la meme alt. On calcule les distances entre les points
          let point = turf.along(turf.lineString(lineStringObjet[ "geometry" ][ "coordinates" ]), distance)
          let pointPrecedent = turf.point([ lineStringObjet[ "geometry" ][ "coordinates" ][ index - 1 ][ 0 ],
          lineStringObjet[ "geometry" ][ "coordinates" ][ index - 1 ][ 1 ] ])
          let pointSuivant = turf.point([ lineStringObjet[ "geometry" ][ "coordinates" ][ index ][ 0 ],
          lineStringObjet[ "geometry" ][ "coordinates" ][ index ][ 1 ] ])
          let distanceAvant = turf.distance(pointPrecedent, point)
          let distanceApres = turf.distance(pointSuivant, point)
          let altCalculee = ((altCourante - altPrecedente) * (distanceAvant / (distanceApres + distanceApres))) + altPrecedente
          pointsAltitude.push = altCalculee.toFixed(1)
        }
        distance += 0.1

        console.log(`avancement : ${distance}`)
      }

    }

    // On crée le tableau visu avec l'ensemble des champs
    let visu = []
    for (let index = 0; index < pointsCamera.length; index++) {
      visu.push({
        ref: false,
        start: 0,
        longueur: 0,
        lookAt: [ pointsCamera[ index ][ 0 ].toFixed(5), pointsCamera[ index ][ 1 ].toFixed(5) ],
        cap: pointsCamera[ index ].cap,
        zoom: 16,
        pitch: 60,
        positionCamera: [],
        altitudeCamera: 0,
        altitude: pointsAltitude[ index ]
      })
    }
    // console.table(visu)

    // On sauvegarde des données dans le fichier visu.json dans le dossier tmp
    fs.writeFile(tmpDirectory + "\\" + fileVisu, JSON.stringify(visu))
      .then(() => {
        resolve({ status: "OK" })
      })
      .catch((err) => {
        console.error(`CreateVisuFile: ${err}.`)
        reject({ id: 9999, error: `Enregistrement du fichier ${fileVisu} !` })
      })
  })
}
