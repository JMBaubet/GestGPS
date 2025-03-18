import mapboxgl from 'mapbox-gl';


const urlSvg = import.meta.env.VITE_URL_SVG

let listEvts = []
let elements = [] // pour les marker uniquement
let indexEvt = 0
let div = []
let markers = []
let pauses = []
let flyTos = []
let camera
let savedCameraState


export const resetEtvs = () => {
  markers.length = 0
  pauses.length = 0
  flyTos.length = 0

}

export const resetIndexEvt = () => {
  indexEvt = 0
}



export const initEvt = (evts) => {
  markers.length = 0
  pauses.length = 0
  flyTos.length = 0
  // console.log(`initEvt : ${evts}`)
  let tmp = []
  for (let i = 0; i < evts.length; i++) {
    tmp.push(evts[ i ].start)
    tmp.push(evts[ i ].end)
  }
  // Suppression des doublons
  listEvts = [ ...new Set(tmp) ]
  // tri du tableau
  listEvts.sort((a, b) => a - b)
  // console.table(listEvts)

  // On initialise les tableaux elements et pauses
  for (let evt = 0; evt < evts.length; evt++) {
    switch (evts[ evt ].type) {
      case "marker":
        elements[ evts[ evt ].start ] = []
        elements[ evts[ evt ].end ] = []
        break;
      case "pause":
        // console.log(`On initialise pauses[${evts[evt].start}]`)
        pauses[ evts[ evt ].start ] = []
        break;
      case "flyTo":
        // console.log(`On initialise flyToss[${evts[evt].start}]`)
        flyTos[ evts[ evt ].start ] = []
        break;
    }
  }
  // On initialise les tableaux elements et pauses
  // for (let i = 0; i < listEvts.length; i++) {

  //   elements[listEvts[i]] = []
  // }
  // console.log('Début Tableau elements')
  // console.table(elements)
  // console.table(pauses)
  // console.table(flyTos)
  // console.log('Fin Tableau elements')


  // On met à jour le tableau elements
  for (let i = 0; i < evts.length; i++) {
    switch (evts[ i ].type) {
      case "marker":
        // console.log(`On traite  ${evt[i].start}`)
        elements[ evts[ i ].start ].push(evts[ i ])
        // console.log(`On traite  ${evt[i].end}`)
        elements[ evts[ i ].end ].push(evts[ i ])
        break;

      case "pause":
        // pauses[evts[i].start] = (evts[i])
        break;

      case "flyTo":
        flyTos[ evts[ i ].start ] = evts[ i ]
        break;
      case "info":
        break;
      default:
        console.warn(`type evenement inconnu :${evts[ i ].type}`)
    }

  }

  // console.table(flyTos)
}



export const traiteEvt = (map, evt, avancement) => {
  let pause = false
  let flyTo = 0

  console.log(`traiteEvt : ${typeof (avancement)}, ${indexEvt}`)

  if (avancement === listEvts[ indexEvt ]) {
    console.log(`On traite ${listEvts[ indexEvt ]}`)

    // Traitement des markers

    if (typeof (elements[ listEvts[ indexEvt ] ]) !== "undefined") {
      console.log(`Nombre de marker à traiter pour cette occurence : ${elements[ listEvts[ indexEvt ] ].length}`)
      for (let nbr = 0; nbr < elements[ listEvts[ indexEvt ] ].length; nbr++) {
        let indexMarker = elements[ listEvts[ indexEvt ] ][ nbr ].id

        if (elements[ listEvts[ indexEvt ] ][ nbr ].start === listEvts[ indexEvt ]) {
          console.log(`on traite le lancement du marker ${elements[ listEvts[ indexEvt ] ][ nbr ].id}`)
          console.table(evt[ indexMarker ])

          div[ indexMarker ] = document.createElement('div');
          div[ indexMarker ].id = evt[ indexMarker ].marker.id
          div[ indexMarker ].style.backgroundImage = `${urlSvg}${evt[ indexMarker ].marker.fichier})`
          div[ indexMarker ].style.width = `${evt[ indexMarker ].marker.taille}px`
          div[ indexMarker ].style.height = `${evt[ indexMarker ].marker.taille}px`
          // markers[elements[listEvts[indexEvt]][nbr].id].style.zIndex = 101
          div[ indexMarker ].style.backgroundSize = '100%';

          const offset = -evt[ indexMarker ].marker.taille / 2
          markers[ indexMarker ] = new mapboxgl.Marker({ element: div[ indexMarker ], offset: [ 60, -20 ] })
            .setLngLat(evt[ indexMarker ].marker.coord)
            .addTo(map);

        } else {
          // console.log(`on efface un marker`)
          markers[ indexMarker ].remove()
        }
      }
    } // Fin de traitement des marker

    // Traitement de la pause   
    if (typeof (pauses[ listEvts[ indexEvt ] ]) !== "undefined") {
      // console.log(`On traite la pause`)
      pause = true
    }

    // Traitement du flyTo   
    if (typeof (flyTos[ listEvts[ indexEvt ] ]) !== "undefined") {
      // console.log(`On traite un flyTo`)
      pause = true
      flyTo = listEvts[ indexEvt ]
    }
    indexEvt++
  }
  return ({ pause: pause, flyTo: flyTo })
}


export const flyToEvt = (map, evt) => {
  // console.log(`fonction flyToEvt : ${evt}`)
  // console.log(flyTos[evt].flyTo.zoom)
  // console.log(flyTos[evt].flyTo.pitch)
  // console.log(flyTos[evt].flyTo.cap)
  // console.log(flyTos[evt].flyTo.duree)
  // console.table(flyTos[evt].flyTo.coord)

  // Il faut sauvegarger la position de la caméra pour la restituer a la fin
  map.once('moveend', async () => {
    // console.log("Lecture du positionnement de la camera")
    camera = map.getFreeCameraOptions();
    let position
    let altitude
    let center

    position = camera.position;
    altitude = position.alt;
    center = map.getCenter();
    // console.table(center)


    // Sauvegardez ces valeurs comme vous le souhaitez, par exemple :
    savedCameraState = {
      position: [ center.lng, center.lat ],
      altitude: altitude,
      pitch: map.getPitch(),
      bearing: map.getBearing(),
      zoom: map.getZoom()
    };
  })
  // On fait le flyTo
  // console.log("Lancement du FlyTo")
  map.once('moveend', async () => {
    map.flyTo({
      center: flyTos[ evt ].flyTo.coord,
      bearing: flyTos[ evt ].flyTo.cap,
      zoom: flyTos[ evt ].flyTo.zoom,
      pitch: flyTos[ evt ].flyTo.pitch,
      duration: flyTos[ evt ].flyTo.duree * 1000
    })
  });
  // console.log("Fin du lLancement du FlyTo")

  return (true)
}


// On remet la camera à sa place. On a peu être une dificulte ici pour faire la reprise proprement.

export const endFlyToEvt = (map, evt) => {
  // console.log(`fonction endFlyToEvt`)
  //On attend un clic sur le bouton reprise pour retourner la ou nous en étions avant le flyTo
  document.getElementById('reprise').addEventListener('click', () => {
    // console.log(`On lance le flyTo pour une durée de ${flyTos[evt].flyTo.duree / 2} sec.`)
    // console.log(`center: ${savedCameraState.position}`)
    // console.log(`bearing: ${savedCameraState.bearing}`)
    // console.log(`zoom: ${savedCameraState.zoom}`)
    // console.log(`pitch: ${savedCameraState.pitch}`)
    // console.log(`duration: ${flyTos[evt].flyTo.duree}`)
    map.flyTo({
      center: savedCameraState.position,
      bearing: savedCameraState.bearing,
      zoom: savedCameraState.zoom,
      pitch: savedCameraState.pitch,
      duration: flyTos[ evt ].flyTo.duree * 500
    })

  });
  return (true)
}