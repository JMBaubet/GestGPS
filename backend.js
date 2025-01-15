import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import * as dotenv from 'dotenv'
import os from 'os'
import fs from 'fs'
import path from 'path'

import { decodeTraceGpx } from './src/scripts/gpx.js'
import { getTraceurs } from './src/scripts/traceurs.js'
import { getVilles } from './src/scripts/villes.js'
import { getCircuits, getcircuitsMinMax } from './src/scripts/circuits.js'

const app = express()
dotenv.config()
const port = process.env.PORT

// Configuration de cors pour autoriser les requette
// Depuis localhost:3000 le front end
const allowedOrigins = ['http://localhost:3000'];
const options = cors.CorsOptions = {
  origin: allowedOrigins
};
app.use(cors(options))
app.use(morgan('tiny'))

const directory = os.homedir() + "\\downloads"

//definition des points de terminaison

// Test :
// - de la présence du serveur
// - de fichiers *.gpx dans ~/Downloads
// - de fichiers *.fit dans ~/Downloads (Pour la version 3)
app.get('/api/isRunning/', (req, res) => {
  fs.promises.readdir(directory)
    .then(filesDir => {
      const gpxFiles = filesDir.filter(el => path.extname(el) === '.gpx')
      const fitFiles = filesDir.filter(el => path.extname(el) === '.fit')
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send({ gpx: `${gpxFiles.length}`, fit: `${fitFiles.length}` })
    })
    .catch(err => {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 1000, error: `${directory} indisponible !` })
    })

})

// Obtention de la liste des fichiers *.gpx présents dans downloads.
app.get('/api/GpxFiles/', (req, res) => {
  fs.promises.readdir(directory)
    .then(filesDir => {
      const gpxFiles = filesDir.filter(el => path.extname(el) === '.gpx')
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(gpxFiles)
    })
    .catch(err => {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 1001, error: `Le dossier ${directory} n'a pas été trouvé !` })
    })
})


// Traitement d'un fichier gpx
app.post('/api/GpxFile/:fileName/:traceur', (req, res) => {
  //console.log(`backend.js : Traceur sélectionné : ${req.params.traceur}`)
  decodeTraceGpx(`${directory}\\${req.params.fileName}`, `${req.params.traceur}`)
    .then(retour => {
      console.log(`backend.js : Retour de la promise : ${retour.circuitId}, ${retour.peutEtrePresent}`)

      res.setHeader('Content-Type', 'application/json')
      res.status(200)
      if (retour.circuitId === 0) {
        res.send({ gpx: "Present" })
      } else if (retour.isPresent) {
        res.send({ gpx: "Semblable" })
      } else {
        res.send({ gpx: "OK" })
      }
    })
    .catch(err => {
      console.error(`backend.js : ${err.id}`)
      res.setHeader('Content-Type', 'application/json');
      //res.status(500).send({ id: 1010, error: `Le fichier ${req.params.fileName} n'a pas pu être traité !` })
      res.status(500).send(err)
    })
})

// récupération des circuits à afficher
app.get('/api/circuits/:page/:nombre/:ville?', (req, res) => {
  getCircuits(req.params.page, req.params.nombre)
    // app.get('/api/circuits/:page/:nombre/:ville?', (req, res) => {
    //   getCircuits(req.params.page, req.params.nombre, req.params.ville)
    .then(data => {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(data)
    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 1020, error: `Les circuits ne peuvent être récupérés !` })
    })
})

// récupération des min max 
app.get('/api/circuitsMinMax/', (req, res) => {
  getcircuitsMinMax()
    .then(data => {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(data)
    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 1050, error: `Les min & Max ne peuvent être récupérés !` })
    })
})


// Obtension de la liste des traceurs connus dans dataModel.json
app.get('/api/traceurs/', (req, res) => {
  getTraceurs()
    .then(listeTraceurs => {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(listeTraceurs)
    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 1030, error: `La liste des traceurs ne peut être récupérée !` })
    })
})

// Obtension de la liste des villes de départ connus dans dataModel.json
app.get('/api/villes/', (req, res) => {
  getVilles()
    .then(listeVilles => {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(listeVilles)
    })
    .catch(err => {
      console.error(`Erreur : ${err}`)
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send({ id: 1040, error: `La liste des villes de départ ne peut être récupérée !` })
    })
})

//Définition de 2 points de terminaison pour test
//réponse OK
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send("Hello world")
})
// Réponse Erreur sur le serveur
app.get('/err', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(500).send({ id: 9999, error: `Une erreur s'est produite sur le serveur !` })
})

app.all('*', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(404).send({ id: 404, error: '404! Page not found' });
});

/************************ 
 * Lancement du serveur *
 ************************/
app.listen(port, () => {
  console.log(`le back-end est lancé sur http://localhost:${port}`)
})
