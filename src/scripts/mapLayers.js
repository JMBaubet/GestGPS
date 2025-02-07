/**
 * 
 * @param {*} map 
 * @param {*} trace 
 */

const initCenterLon = import.meta.env.VITE_MAPBOX_INIT_CENTER_LON
const initCenterLat = import.meta.env.VITE_MAPBOX_INIT_CENTER_LAT


export const mapLoadLayers = (map, trace) => {
  // Chargement des données la trace
  map.on('style.load', () => {
    map.addSource('trace', {
      type: 'geojson',
      lineMetrics: true,
      data: {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': trace
        }
      }
    });

    // Création du Layer pour l'avancement de la visualisation de la trace
    map.addLayer({
      type: 'line',
      source: 'trace',
      id: 'animationTrace',
      paint: {
        'line-color': "rgba(23, 23, 0, 0)", // La couleur es donnée dans l'annimation
        'line-width': 12,
      },
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      }
    })

    // Creation du Layer de la trace 
    map.addLayer({
      type: 'line',
      source: 'trace',
      id: 'trace',
      paint: {
        'line-color': "rgba(255, 0, 0, 1)",
        'line-width': 6,
      },
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      }
    })

    // Création du point indiquant la position
    map.addSource('point', {
      'type': 'geojson',
      'data': { type: 'Point', coordinates: [initCenterLon, initCenterLat] }

    });

    map.addLayer({
      'id': 'hallo',
      'source': 'point',
      'type': 'circle',
      'paint': {
        'circle-radius': 12,
        'circle-color': 'rgba(218, 238, 1, 0.5)'
      }
    })
    map.addLayer({
      'id': 'point',
      'source': 'point',
      'type': 'circle',
      'paint': {
        'circle-radius': 6,
        'circle-color': 'yellow'
      }
    })

  }) // map.on
}

export const mapMaskSymbols = (map) => {
  map.on('idle', () => {
    map.style.stylesheet.layers.forEach(function (layer) {
      // console.table(layer.type)
      if (layer.type === 'symbol') {
        console.log(`layer.id`)
        map.setLayoutProperty(layer.id, "visibility", "none");
      }
    })
  })
}

export const mapAffSymbols = (map) => {
  map.on('load', () => {
    map.style.stylesheet.layers.forEach(function (layer) {
      // console.table(layer.type)
      if (layer.type === 'symbol') {
        map.setLayoutProperty(layer.id, "visibility", "visible");
      }
    })
  })
}


export const mapAdd3D = (map) => {
  // add map 3d terrain and sky layer and fog
  // Add some fog in the background
  map.on('load', () => {
    map.setFog({
      range: [5, 10],
      color: "grey",
      "horizon-blend": 0.2,
    });

    map.setLights([{
      "id": "sun_light",
      "type": "directional",
      "properties": {
        "color": "rgba(255.0, 0.0, 0.0, 1.0)",
        "intensity": 0.4,
        "direction": [200.0, 40.0],
        "cast-shadows": true,
        "shadow-intensity": 0.2
      }
    }]);

    // // Add a sky layer over the horizon
    map.addLayer({
      id: "sky",
      type: "sky",
      paint: {
        "sky-type": "atmosphere",
        "sky-atmosphere-color": "rgba(85, 151, 210, 0.5)",
      },
    });


    // Add terrain source, with slight exaggeration
    map.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.terrain-rgb",
      tileSize: 512,
      maxzoom: 14,
    });
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1 });
  })
}