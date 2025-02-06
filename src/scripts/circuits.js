import fs from 'fs'
import * as dotenv from 'dotenv'
import { roundMax, roundMin } from './utils.js'
import { getIdVille } from './villes.js'

dotenv.config()
const dataDirectory = process.env.DATA_DIRECTORY
const configFile = process.env.CONFIG_FILE

const fichier = `${configFile}`

let objet = {}

export const getCircuits = (page, nombre) => {
  return new Promise((resolve, reject) => {
    try {
      objet = JSON.parse(fs.readFileSync(fichier))
      resolve({
        circuits: objet.circuits.sort().reverse().slice((page - 1) * nombre, page * nombre),
        totalCircuits: objet.circuits.length
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
