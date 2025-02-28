import mapboxgl from 'mapbox-gl';

const urlSvg = import.meta.env.VITE_URL_SVG

let listEvts = []
let elements = []
let indexEvt = 0
let div = []
let markers = []

export const initEvt = (evt) => {
  console.log(`initEvt : ${evt}`)
  let tmp = []
  for (let i = 0; i < evt.length; i++) {
    tmp.push(evt[i].start)
    tmp.push(evt[i].end)
  }
  // Suppression des doublons
  listEvts = [...new Set(tmp)]
  // tri du tableau
  listEvts.sort((a, b) => a - b)
  console.table(listEvts)

  // On initialise le tableau elements
  for (let i = 0; i < listEvts.length; i++) {
    elements[listEvts[i]] = []
  }
  console.log('Début Tableau elements')
  console.table(elements)
  console.log('Fin Tableau elements')


  // On met à jour le tableau elements
  for (let i = 0; i < evt.length; i++) {
    switch (evt[i].type) {
      case "marker":
        // console.log(`On traite  ${evt[i].start}`)
        elements[evt[i].start].push(evt[i])
        // console.log(`On traite  ${evt[i].end}`)
        elements[evt[i].end].push(evt[i])
        break;

      case "flyBy":
      case "pause":
      case "info":
        break;
      default:
        console.warn(`type evenement inconnu :${evt[i].type}`)
    }

  }

  // console.table(elements)
}



export const traiteEvt = (map, evt, avancement) => {
  // console.log(`traiteEvt : ${avancement}`)
  if (avancement === listEvts[indexEvt]) {
    console.log(`On traite ${listEvts[indexEvt]}`)

    // Traitement des markers
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

    indexEvt++
  }
}
