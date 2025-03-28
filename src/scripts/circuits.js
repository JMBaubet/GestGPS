import fs from 'fs'
import * as dotenv from 'dotenv'
import { roundMax, roundMin } from './utils.js'
import { getIdVille, } from './villes.js'
import { getIdTraceur } from './traceurs.js'

dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY
const configFile = process.env.CONFIG_FILE

const fichier = `${configFile}`

let objet = {}

export const getCircuits = (param) => {
  return new Promise((resolve, reject) => {
    try {
      objet = JSON.parse(fs.readFileSync(fichier))
      // console.log(param.ville)
      filtreVilleDepart(objet.circuits, param.ville)
        .then((circuits) => {
          // console.table(circuits)
          filtreTraceur(circuits, param.traceur)
            .then((circuits) => {
              // console.table(circuits)
              // console.table(param.distances)
              filtreDistance(circuits, param.distances)
                .then((circuits) => {
                  filtreDenivele(circuits, param.deniveles)
                    .then((circuits) => {
                      resolve({
                        circuits: circuits.sort().reverse().slice((param.page - 1) * param.nombre, param.page * param.nombre),
                        totalCircuits: circuits.length
                      })
                    })
                    .catch((err) => {
                      console.error(`getCircuits - filtreDenivele : ${err}`)
                      reject(err)
                    })
                })
                .catch((err) => {
                  console.error(`getCircuits - filtreDistance : ${err}`)
                  reject(err)
                })
            })
            .catch((err) => {
              console.error(`getCircuits - filtreTraceur : ${err}`)
              reject(err)
            })
        })
        .catch((err) => {
          console.error(`getCircuits - filtreVilleDepart : ${err}`)
          reject(err)
        })

    } catch (e) {
      console.error(`getCircuits Erreur : ${e}`)
      reject(e)
    }
  })

}

export const getCircuit = (id) => {
  return new Promise((resolve, reject) => {
    try {
      objet = JSON.parse(fs.readFileSync(fichier))
      // console.log(id)
      filtreId(objet.circuits, id)
        .then((info) => {
          resolve({ circuit: info })
        })
        .catch((err) => {
          console.error(`getCircuits - fitreId : ${err}`)
          reject(err)
        })

    } catch (e) {
      console.error(`getCircuits Erreur : ${e}`)
      reject(e)
    }
  })

}


export const getLineString = (id) => {
  return new Promise((resolve, reject) => {
    try {
      const buffer = JSON.parse(fs.readFileSync(dataDirectory + id + "\\lineString.json"))
      resolve(buffer)
    } catch (err) {
      console.error(`getLineString Erreur : ${err}`)
      reject(err)
    }
  })
}


export const getcircuitsMinMax = () => {
  return new Promise((resolve, reject) => {
    try {
      objet = JSON.parse(fs.readFileSync(fichier))
      let denivMin = Math.min(...objet.circuits.map(element => element.denivele))
      let denivMax = Math.max(...objet.circuits.map(element => element.denivele))
      let distanceMin = Math.min(...objet.circuits.map(element => element.distance))
      let distanceMax = Math.max(...objet.circuits.map(element => element.distance))
      // On arrondit les métriques 
      denivMin = roundMin(denivMin)
      denivMax = roundMin(denivMax)
      distanceMin = roundMin(distanceMin)
      distanceMax = roundMin(distanceMax)
      resolve({
        denivMin: denivMin,
        denivMax: denivMax,
        distMin: distanceMin,
        distMax: distanceMax
      })
    } catch (e) {
      console.error(`circuit : getCircuitsMinMax Erreur : ${e}`)
      reject(e)
    }
  })
}


export const filtreId = (circuits, id) => {
  return new Promise((resolve, reject) => {
    // console.table(id)
    let circuit
    for (let i = 0; i < circuits.length; i++) {
      if (circuits[ i ].circuitId === id) {
        circuit = circuits[ i ]
      }
    }
    resolve(circuit)
  })
}




export const filtreVilleDepart = (circuits, ville) => {
  return new Promise((resolve, reject) => {
    let tmp = []
    if (ville !== " ") {
      getIdVille(ville)
        .then((idVille) => {
          for (let i = 0; i < circuits.length; i++) {
            if (circuits[ i ].villeDepart === idVille.id) {
              tmp.push(objet.circuits[ i ])
            }
          }
          // console.table(tmp)
          resolve(tmp)
        })
        .catch((err) => {
          reject(err)
        })

    } else {
      resolve(circuits)
    }
  })
}


export const filtreTraceur = (circuits, traceur) => {
  return new Promise((resolve, reject) => {
    let tmp = []
    if (traceur !== " ") {
      getIdTraceur(traceur)
        .then((idTraceur) => {
          for (let i = 0; i < circuits.length; i++) {
            if (circuits[ i ].traceur === idTraceur.id) {
              tmp.push(circuits[ i ])
            }
          }
          // console.table(tmp)
          resolve(tmp)
        })
        .catch((err) => {
          reject(err)
        })
    } else {
      resolve(circuits)
    }
  })
}

export const filtreDistance = (circuits, distances) => {
  return new Promise((resolve, reject) => {
    // console.table(distances)
    let dist = distances.split(',')
    // console.log(dist)
    let tmp = []
    for (let i = 0; i < circuits.length; i++) {
      if ((parseInt(circuits[ i ].distance) >= parseInt(dist[ 0 ])) && (parseInt(circuits[ i ].distance) <= parseInt(dist[ 1 ]))) {
        tmp.push(circuits[ i ])
      }
    }
    resolve(tmp)
  })
}

export const filtreDenivele = (circuits, deniveles) => {
  return new Promise((resolve, reject) => {
    // console.table(deniveles)
    let deniv = deniveles.split(',')
    // console.log(dist)
    let tmp = []
    for (let i = 0; i < circuits.length; i++) {
      if ((parseInt(circuits[ i ].denivele) >= parseInt(deniv[ 0 ])) && (parseInt(circuits[ i ].denivele) <= parseInt(deniv[ 1 ]))) {
        tmp.push(circuits[ i ])
      }
    }
    resolve(tmp)
  })
}

