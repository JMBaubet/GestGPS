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

export const initEvt = (evts) => {
  console.log(`initEvt : ${evts}`)
  let tmp = []
  for (let i = 0; i < evts.length; i++) {
    tmp.push(evts[i].start)
    tmp.push(evts[i].end)
  }
  // Suppression des doublons
  listEvts = [...new Set(tmp)]
  // tri du tableau
  listEvts.sort((a, b) => a - b)
  console.table(listEvts)

  // On initialise les tableaux elements et pauses
  for (let evt = 0; evt < evts.length; evt++) {
    switch (evts[evt].type) {
      case "marker":
        elements[evts[evt].start] = []
        elements[evts[evt].end] = []
        break;
      case "pause":
        console.log(`On initialise pauses[${evts[evt].start}]`)
        pauses[evts[evt].start] = []
        break;
      case "flyTo":
        console.log(`On initialise flyToss[${evts[evt].start}]`)
        flyTos[evts[evt].start] = []
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
    switch (evts[i].type) {
      case "marker":
        // console.log(`On traite  ${evt[i].start}`)
        elements[evts[i].start].push(evts[i])
        // console.log(`On traite  ${evt[i].end}`)
        elements[evts[i].end].push(evts[i])
        break;

      case "pause":
        // pauses[evts[i].start] = (evts[i])
        break;

      case "flyTo":
        flyTos[evts[i].start] = evts[i]
        break;
      case "info":
        break;
      default:
        console.warn(`type evenement inconnu :${evts[i].type}`)
    }

  }

  console.table(flyTos)
}



export const traiteEvt = (map, evt, avancement) => {
  let pause = false
  let flyTo = 0
  // console.log(`traiteEvt : ${avancement}`)
  if (avancement === listEvts[indexEvt]) {
    console.log(`On traite ${listEvts[indexEvt]}`)

    // Traitement des markers

    if (typeof (elements[listEvts[indexEvt]]) !== "undefined") {
      console.log(`Nombre de marker à traiter pour cette occurence : ${elements[listEvts[indexEvt]].length}`)
      for (let nbr = 0; nbr < elements[listEvts[indexEvt]].length; nbr++) {
        let indexMarker = elements[listEvts[indexEvt]][nbr].id

        if (elements[listEvts[indexEvt]][nbr].start === listEvts[indexEvt]) {
          console.log(`on traite le lancement du marker ${elements[listEvts[indexEvt]][nbr].id}`)

          div[indexMarker] = document.createElement('div');
          div[indexMarker].id = evt[indexMarker].marker.id
          div[indexMarker].style.backgroundImage = `${urlSvg}${evt[indexMarker].marker.fichier})`
          div[indexMarker].style.width = `${evt[indexMarker].marker.taille}px`
          div[indexMarker].style.height = `${evt[indexMarker].marker.taille}px`
          // markers[elements[listEvts[indexEvt]][nbr].id].style.zIndex = 101
          div[indexMarker].style.backgroundSize = '100%';

          const offset = -evt[indexMarker].marker.taille / 2
          markers[indexMarker] = new mapboxgl.Marker({ element: div[indexMarker], offset: [0, offset] })
            .setLngLat(evt[indexMarker].marker.coord)
            .addTo(map);

        } else {
          console.log(`on efface un marker`)
          markers[indexMarker].remove()
        }
      }
    } // Fin de traitement des marker

    // Traitement de la pause   
    if (typeof (pauses[listEvts[indexEvt]]) !== "undefined") {
      console.log(`On traite la pause`)
      pause = true
    }

    // Traitement du flyTo   
    if (typeof (flyTos[listEvts[indexEvt]]) !== "undefined") {
      console.log(`On traite un flyTo`)
      pause = true
      flyTo = listEvts[indexEvt]

    }

    indexEvt++
  }
  return ({ pause: pause, flyTo: flyTo })
}


export const flyToEvt = (map, evt) => {
  console.log(`fonction flyToEvt : ${evt}`)
  console.log(flyTos[evt].flyTo.zoom)
  console.log(flyTos[evt].flyTo.pitch)
  console.log(flyTos[evt].flyTo.cap)
  console.log(flyTos[evt].flyTo.duree)
  console.table(flyTos[evt].flyTo.coord)

  // Il faut sauvegarger la position de la caméra pour la restituer a la fin
  camera = map.getFreeCameraOptions();

  const position = camera.position;
  const altitude = position.alt;
  const center = map.getCenter();

  // Sauvegardez ces valeurs comme vous le souhaitez, par exemple :
  const savedCameraState = {
    position: [center.lng, center.lat],
    altitude: altitude,
    pitch: map.getPitch(),
    bearing: map.getBearing(),
    zoom: map.getZoom()
  };

  // On fait le flyTo
  map.once('moveend', async () => {
    map.flyTo({
      center: flyTos[evt].flyTo.coord,
      bearing: flyTos[evt].flyTo.cap,
      zoom: flyTos[evt].flyTo.zoom,
      pitch: flyTos[evt].flyTo.pitch,
      duration: flyTos[evt].flyTo.duree * 1000
    })
  });


  // On remet la camera à sa place. On a peu être une dificulte ici pour faire la reprise proprement.

}
